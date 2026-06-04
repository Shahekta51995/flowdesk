import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Customer from "@/models/Customer";
import { queryStarRocks } from "@/lib/starrocks";

export async function GET() {
  try {
    await connectDB();

    const results = [];

    // ── BENCHMARK 1: Revenue by status ──
    const mongoStart1 = Date.now();
    await Payment.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    const mongoTime1 = Date.now() - mongoStart1;

    const starrocksResult1 = await queryStarRocks(`
      SELECT status, SUM(amount) as total, COUNT(*) as count
      FROM payments
      GROUP BY status
      ORDER BY total DESC
    `);

    results.push({
      query:        "Revenue by payment status",
      description:  "GROUP BY status, SUM(amount), COUNT(*)",
      mongodb_ms:   mongoTime1,
      starrocks_ms: starrocksResult1.timeMs,
      speedup:      +(mongoTime1 / Math.max(starrocksResult1.timeMs, 1)).toFixed(1),
    });

    // ── BENCHMARK 2: Monthly revenue trend ──
    const mongoStart2 = Date.now();
    await Payment.aggregate([
      { $match: { status: { $in: ["SETTLED", "CAPTURED"] } } },
      { $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const mongoTime2 = Date.now() - mongoStart2;

    const starrocksResult2 = await queryStarRocks(`
      SELECT
        MONTH(created_at) as month,
        YEAR(created_at)  as year,
        SUM(amount)       as revenue,
        COUNT(*)          as transactions
      FROM payments
      WHERE status IN ('SETTLED', 'CAPTURED')
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year, month
    `);

    results.push({
      query:        "Monthly revenue trend",
      description:  "GROUP BY month/year, SUM(amount) where SETTLED/CAPTURED",
      mongodb_ms:   mongoTime2,
      starrocks_ms: starrocksResult2.timeMs,
      speedup:      +(mongoTime2 / Math.max(starrocksResult2.timeMs, 1)).toFixed(1),
    });

    // ── BENCHMARK 3: Top customers by spend ──
    const mongoStart3 = Date.now();
    await Payment.aggregate([
      { $group: { _id: "$client", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    const mongoTime3 = Date.now() - mongoStart3;

    const starrocksResult3 = await queryStarRocks(`
      SELECT client, SUM(amount) as total, COUNT(*) as count
      FROM payments
      GROUP BY client
      ORDER BY total DESC
      LIMIT 5
    `);

    results.push({
      query:        "Top clients by revenue",
      description:  "GROUP BY client, SUM(amount), TOP 5",
      mongodb_ms:   mongoTime3,
      starrocks_ms: starrocksResult3.timeMs,
      speedup:      +(mongoTime3 / Math.max(starrocksResult3.timeMs, 1)).toFixed(1),
    });

    // ── BENCHMARK 4: Industry analytics ──
    const mongoStart4 = Date.now();
    await Customer.aggregate([
      { $group: {
        _id: "$industry",
        customers: { $sum: 1 },
        totalSpend: { $sum: "$totalSpend" }
      }},
      { $sort: { totalSpend: -1 } }
    ]);
    const mongoTime4 = Date.now() - mongoStart4;

    const starrocksResult4 = await queryStarRocks(`
      SELECT industry, COUNT(*) as customers, SUM(total_spend) as total_spend
      FROM customers
      GROUP BY industry
      ORDER BY total_spend DESC
    `);

    results.push({
      query:        "Revenue by industry",
      description:  "GROUP BY industry, SUM(total_spend), COUNT(*)",
      mongodb_ms:   mongoTime4,
      starrocks_ms: starrocksResult4.timeMs,
      speedup:      +(mongoTime4 / Math.max(starrocksResult4.timeMs, 1)).toFixed(1),
    });

    // Calculate averages
    const avgMongo     = Math.round(results.reduce((a, r) => a + r.mongodb_ms, 0)     / results.length);
    const avgStarRocks = Math.round(results.reduce((a, r) => a + r.starrocks_ms, 0)   / results.length);
    const avgSpeedup   = +(results.reduce((a, r) => a + r.speedup, 0) / results.length).toFixed(1);

    return NextResponse.json({
      success: true,
      benchmarks: results,
      summary: {
        avg_mongodb_ms:     avgMongo,
        avg_starrocks_ms:   avgStarRocks,
        avg_speedup:        avgSpeedup,
        total_queries_run:  results.length,
        measured_at:        new Date().toISOString(),
      },
      note: "All timings are REAL measurements from live databases on this machine.",
    });

  } catch (error: any) {
    console.error("Benchmark error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}