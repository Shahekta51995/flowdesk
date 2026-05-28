import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Customer from "@/models/Customer";

export async function GET() {
  try {
    await connectDB();

    const now       = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Run all queries in parallel
    const [
      totalRevenueResult,
      lastMonthRevenueResult,
      totalTransactions,
      lastMonthTransactions,
      activeClients,
      lastMonthClients,
      failedToday,
      lastMonthFailed,
      recentPayments,
      monthlyRevenue,
    ] = await Promise.all([

      // Total revenue (SETTLED + CAPTURED)
      Payment.aggregate([
        { $match: { status: { $in: ["SETTLED", "CAPTURED"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Last month revenue
      Payment.aggregate([
        { $match: { status: { $in: ["SETTLED", "CAPTURED"] }, createdAt: { $lt: now, $gte: lastMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Total transactions
      Payment.countDocuments(),

      // Last month transactions
      Payment.countDocuments({ createdAt: { $gte: lastMonth, $lt: now } }),

      // Active clients
      Customer.countDocuments({ status: "ACTIVE" }),

      // Last month active clients
      Customer.countDocuments({ status: "ACTIVE", createdAt: { $lt: now, $gte: lastMonth } }),

      // Failed today
      Payment.countDocuments({
        status: "FAILED",
        createdAt: { $gte: todayStart },
      }),

      // Last month failed
      Payment.countDocuments({
        status: "FAILED",
        createdAt: { $gte: lastMonth, $lt: now },
      }),

      // Recent 5 payments
      Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Monthly revenue for chart (last 12 months)
      Payment.aggregate([
        { $match: { status: { $in: ["SETTLED", "CAPTURED"] } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue:      { $sum: "$amount" },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
    ]);

    // Calculate percentage changes
    const totalRev      = totalRevenueResult[0]?.total      || 0;
    const lastMonthRev  = lastMonthRevenueResult[0]?.total  || 0;
    const revenueChange = lastMonthRev > 0
      ? (((totalRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
      : "0";

    const txChange = lastMonthTransactions > 0
      ? (((totalTransactions - lastMonthTransactions) / lastMonthTransactions) * 100).toFixed(1)
      : "0";

    const clientChange = lastMonthClients > 0
      ? (((activeClients - lastMonthClients) / lastMonthClients) * 100).toFixed(1)
      : "0";

    const failedChange = lastMonthFailed > 0
      ? ((( lastMonthFailed - failedToday) / lastMonthFailed) * 100).toFixed(1)
      : "0";

    // Format monthly chart data
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const chartData = monthlyRevenue.map((m: any) => ({
      month:        months[m._id.month - 1],
      revenue:      m.revenue,
      transactions: m.transactions,
    }));

    // Format recent payments
    const formattedPayments = recentPayments.map((p: any) => ({
      id:     p.paymentId || p._id,
      client: p.client,
      amount: p.amount,
      status: p.status,
      method: p.method,
      time:   p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue:     { value: totalRev,          change: `+${revenueChange}%`, positive: true  },
        transactions:     { value: totalTransactions,  change: `+${txChange}%`,     positive: true  },
        activeClients:    { value: activeClients,      change: `+${clientChange}%`, positive: true  },
        failedPayments:   { value: failedToday,        change: `-${failedChange}%`, positive: false },
      },
      chartData,
      recentPayments: formattedPayments,
    });

  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}