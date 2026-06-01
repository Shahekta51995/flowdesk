import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    // Verify signature
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    const isValid = expected === razorpay_signature;

    if (!isValid) {
      // Update payment as failed
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          status: "FAILED",
          $push: {
            webhookEvents: {
              event:     "payment.failed",
              timestamp: new Date(),
              status:    "failed",
              payload:   JSON.stringify({ reason: "Invalid signature" }),
            },
          },
        }
      );

      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update payment as captured
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: "CAPTURED",
        $push: {
          webhookEvents: {
            event:     "payment.captured",
            timestamp: new Date(),
            status:    "processed",
            payload:   JSON.stringify({
              razorpay_payment_id,
              razorpay_order_id,
            }),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success:   true,
      paymentId: payment?.paymentId,
      orderId:   razorpay_order_id,
      status:    "CAPTURED",
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}