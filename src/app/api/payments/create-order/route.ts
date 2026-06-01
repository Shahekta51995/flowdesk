import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const sessionCookie = req.cookies.get("flowdesk_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session  = JSON.parse(sessionCookie);
    const userId   = session.user?.id;
    const userName = session.user?.name || "User";

    const { amount, description, upiId } = await req.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum amount is ₹1 (100 paise)" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
      notes: {
        userId,
        userName,
        description,
        upiId,
      },
    });

    // Save to MongoDB
    const idempotencyKey = `idem_${order.id}`;
    const payment = await Payment.create({
      paymentId:      `pay_${Date.now()}`,
      orderId:        order.id,
      customerId:     userId,
      client:         userName,
      amount,
      currency:       "INR",
      status:         "INITIATED",
      method:         "UPI",
      upiId:          upiId || "",
      idempotencyKey,
      webhookEvents: [{
        event:     "payment.initiated",
        timestamp: new Date(),
        status:    "processed",
        payload:   JSON.stringify({ amount, currency: "INR", orderId: order.id }),
      }],
    });

    return NextResponse.json({
      success:   true,
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      paymentId: payment.paymentId,
    });

  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}