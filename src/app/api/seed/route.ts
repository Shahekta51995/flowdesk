import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await connectDB();

    // Clear existing
    await Customer.deleteMany({});
    await Payment.deleteMany({});

    // Seed Customers
    const customers = await Customer.insertMany([
      {
        customerId: "CUST_001",
        name: "Rahul Sharma",
        email: "rahul@acmecorp.com",
        phone: "+91 9800000001",
        company: "Acme Corp",
        industry: "FinTech",
        totalSpend: 4500000,
        transactions: 45,
        status: "ACTIVE",
        joinedAt: new Date("2023-01-15"),
      },
      {
        customerId: "CUST_002",
        name: "Priya Patel",
        email: "priya@techstart.com",
        phone: "+91 9800000002",
        company: "TechStart Inc",
        industry: "SaaS",
        totalSpend: 1250000,
        transactions: 18,
        status: "ACTIVE",
        joinedAt: new Date("2023-03-22"),
      },
      {
        customerId: "CUST_003",
        name: "Amit Kumar",
        email: "amit@retailhub.com",
        phone: "+91 9800000003",
        company: "RetailHub",
        industry: "Retail",
        totalSpend: 720000,
        transactions: 12,
        status: "INACTIVE",
        joinedAt: new Date("2023-05-10"),
      },
      {
        customerId: "CUST_004",
        name: "Sneha Gupta",
        email: "sneha@finserv.com",
        phone: "+91 9800000004",
        company: "FinServ Ltd",
        industry: "FinTech",
        totalSpend: 23400000,
        transactions: 89,
        status: "ACTIVE",
        joinedAt: new Date("2023-02-28"),
      },
      {
        customerId: "CUST_005",
        name: "Raj Mehta",
        email: "raj@globaltrade.com",
        phone: "+91 9800000005",
        company: "GlobalTrade",
        industry: "Logistics",
        totalSpend: 9800000,
        transactions: 67,
        status: "CHURNED",
        joinedAt: new Date("2023-04-05"),
      },
      {
        customerId: "CUST_006",
        name: "Ananya Singh",
        email: "ananya@datasync.com",
        phone: "+91 9800000006",
        company: "DataSync",
        industry: "SaaS",
        totalSpend: 3200000,
        transactions: 34,
        status: "ACTIVE",
        joinedAt: new Date("2023-06-18"),
      },
      {
        customerId: "CUST_007",
        name: "Vikram Nair",
        email: "vikram@cloudbase.com",
        phone: "+91 9800000007",
        company: "CloudBase",
        industry: "SaaS",
        totalSpend: 5600000,
        transactions: 52,
        status: "ACTIVE",
        joinedAt: new Date("2023-07-22"),
      },
      {
        customerId: "CUST_008",
        name: "Pooja Joshi",
        email: "pooja@swiftpay.com",
        phone: "+91 9800000008",
        company: "SwiftPay",
        industry: "FinTech",
        totalSpend: 8900000,
        transactions: 78,
        status: "ACTIVE",
        joinedAt: new Date("2023-08-14"),
      },
      {
        customerId: "CUST_009",
        name: "Arjun Reddy",
        email: "arjun@neobank.com",
        phone: "+91 9800000009",
        company: "NeoBank",
        industry: "FinTech",
        totalSpend: 15600000,
        transactions: 92,
        status: "ACTIVE",
        joinedAt: new Date("2023-09-30"),
      },
      {
        customerId: "CUST_010",
        name: "Kavya Iyer",
        email: "kavya@payflow.com",
        phone: "+91 9800000010",
        company: "PayFlow",
        industry: "FinTech",
        totalSpend: 2100000,
        transactions: 28,
        status: "INACTIVE",
        joinedAt: new Date("2023-10-12"),
      },
    ]);

    // Seed Payments
    await Payment.insertMany([
      {
        paymentId: "pay_001",
        orderId: "ORD_2024_001",
        customerId: "CUST_001",
        client: "Acme Corp",
        amount: 4500000,
        currency: "INR",
        status: "SETTLED",
        method: "UPI",
        upiId: "acme@okaxis",
        idempotencyKey: "idem_001",
        webhookEvents: [
          {
            event: "payment.initiated",
            timestamp: new Date(),
            status: "processed",
            payload: '{"amount":4500000}',
          },
        ],
      },
      {
        paymentId: "pay_002",
        orderId: "ORD_2024_002",
        customerId: "CUST_002",
        client: "TechStart Inc",
        amount: 1250000,
        currency: "INR",
        status: "PROCESSING",
        method: "UPI",
        upiId: "techstart@paytm",
        idempotencyKey: "idem_002",
        webhookEvents: [
          {
            event: "payment.initiated",
            timestamp: new Date(),
            status: "processed",
            payload: '{"amount":1250000}',
          },
        ],
      },
      {
        paymentId: "pay_003",
        orderId: "ORD_2024_003",
        customerId: "CUST_003",
        client: "RetailHub",
        amount: 720000,
        currency: "INR",
        status: "FAILED",
        method: "UPI",
        upiId: "retail@ybl",
        idempotencyKey: "idem_003",
        webhookEvents: [
          {
            event: "payment.failed",
            timestamp: new Date(),
            status: "failed",
            payload: '{"error":"INSUFFICIENT_FUNDS"}',
          },
        ],
      },
      {
        paymentId: "pay_004",
        orderId: "ORD_2024_004",
        customerId: "CUST_004",
        client: "FinServ Ltd",
        amount: 23400000,
        currency: "INR",
        status: "CAPTURED",
        method: "UPI",
        upiId: "finserv@hdfcbank",
        idempotencyKey: "idem_004",
        webhookEvents: [
          {
            event: "payment.captured",
            timestamp: new Date(),
            status: "processed",
            payload: '{"bank_ref":"HDFC001"}',
          },
        ],
      },
      {
        paymentId: "pay_005",
        orderId: "ORD_2024_005",
        customerId: "CUST_005",
        client: "GlobalTrade",
        amount: 9800000,
        currency: "INR",
        status: "REFUNDED",
        method: "UPI",
        upiId: "global@icici",
        idempotencyKey: "idem_005",
        webhookEvents: [
          {
            event: "refund.processed",
            timestamp: new Date(),
            status: "processed",
            payload: '{"refund_id":"RFD_005"}',
          },
        ],
      },
    ]);
    const syncRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/analytics/sync`,
    );
    const syncData = await syncRes.json();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        customers: customers.length,
        payments: 5,
      },
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
