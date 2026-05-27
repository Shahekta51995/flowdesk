import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

// GET /api/payments
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page   = parseInt(searchParams.get("page") || "1");
    const limit  = parseInt(searchParams.get("limit") || "10");

    const query: any = {};
    if (status && status !== "ALL") query.status = status;

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Payment.countDocuments(query),
    ]);

    // Stats
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: payments,
      stats,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Idempotency check
    const existing = await Payment.findOne({
      idempotencyKey: body.idempotencyKey
    });

    if (existing) {
      return NextResponse.json(
        { success: true, data: existing, idempotent: true },
        { status: 200 }
      );
    }

    const payment = await Payment.create({
      ...body,
      paymentId: `pay_${Date.now()}`,
      status: "INITIATED",
      webhookEvents: [{
        event: "payment.initiated",
        timestamp: new Date(),
        status: "processed",
        payload: JSON.stringify({ amount: body.amount, currency: "INR" }),
      }],
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}