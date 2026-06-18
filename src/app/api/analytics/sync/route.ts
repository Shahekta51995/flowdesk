import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment  from "@/models/Payment";
import Customer from "@/models/Customer";
import { queryStarRocks } from "@/lib/starrocks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const results = {
      customers: { synced: 0, errors: 0 },
      payments:  { synced: 0, errors: 0 },
    };

    // ── Step 1: Clear StarRocks tables ──────────────────────────────────
    await queryStarRocks("TRUNCATE TABLE flowdesk.customers");
    await queryStarRocks("TRUNCATE TABLE flowdesk.payments");

    // ── Step 2: Fetch all customers from MongoDB ─────────────────────────
    const customers = await Customer.find({}).lean();

    if (customers.length > 0) {
      // Build VALUES string for bulk insert
      const customerValues = customers.map((c: any) => {
        const joinedAt = c.joinedAt
          ? new Date(c.joinedAt).toISOString().slice(0, 19).replace("T", " ")
          : "2024-01-01 00:00:00";

        // Escape single quotes in strings
        const name    = (c.name    || "").replace(/'/g, "\\'");
        const email   = (c.email   || "").replace(/'/g, "\\'");
        const company = (c.company || "").replace(/'/g, "\\'");

        return `(
          '${c.customerId || c._id}',
          '${name}',
          '${email}',
          '${company}',
          '${c.industry   || "Unknown"}',
          ${c.totalSpend  || 0},
          ${c.transactions || 0},
          '${c.status     || "ACTIVE"}',
          '${joinedAt}'
        )`;
      }).join(",");

      await queryStarRocks(`
        INSERT INTO flowdesk.customers
        (customer_id, name, email, company, industry,
         total_spend, transactions, status, joined_at)
        VALUES ${customerValues}
      `);

      results.customers.synced = customers.length;
    }

    // ── Step 3: Fetch all payments from MongoDB ──────────────────────────
    const payments = await Payment.find({}).lean();

    if (payments.length > 0) {
      // Process in batches of 50 to avoid query size limits
      const batchSize = 50;

      for (let i = 0; i < payments.length; i += batchSize) {
        const batch = payments.slice(i, i + batchSize);

        const paymentValues = batch.map((p: any) => {
          const createdAt = p.createdAt
            ? new Date(p.createdAt).toISOString().slice(0, 19).replace("T", " ")
            : "2024-01-01 00:00:00";

          const client = (p.client || "").replace(/'/g, "\\'");
          const upiId  = (p.upiId  || "").replace(/'/g, "\\'");

          return `(
            '${p.paymentId || p._id}',
            '${p.orderId   || ""}',
            '${p.customerId || ""}',
            '${client}',
            ${p.amount   || 0},
            '${p.currency || "INR"}',
            '${p.status  || "INITIATED"}',
            '${p.method  || "UPI"}',
            '${upiId}',
            '${createdAt}'
          )`;
        }).join(",");

        await queryStarRocks(`
          INSERT INTO flowdesk.payments
          (payment_id, order_id, customer_id, client,
           amount, currency, status, method, upi_id, created_at)
          VALUES ${paymentValues}
        `);

        results.payments.synced += batch.length;
      }
    }

    // ── Step 4: Verify sync ──────────────────────────────────────────────
    const srCustomers = await queryStarRocks(
      "SELECT COUNT(*) as count FROM flowdesk.customers"
    );
    const srPayments = await queryStarRocks(
      "SELECT COUNT(*) as count FROM flowdesk.payments"
    );

    const srCustomerCount = (srCustomers.rows[0] as any)?.count || 0;
    const srPaymentCount  = (srPayments.rows[0]  as any)?.count || 0;

    return NextResponse.json({
      success: true,
      message: "MongoDB → StarRocks sync completed!",
      sync: {
        customers: {
          mongodb:    customers.length,
          starrocks:  srCustomerCount,
          synced:     results.customers.synced,
        },
        payments: {
          mongodb:    payments.length,
          starrocks:  srPaymentCount,
          synced:     results.payments.synced,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}