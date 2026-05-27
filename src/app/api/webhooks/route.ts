import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import crypto from "crypto";

// POST /api/webhooks
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";

    // HMAC-SHA256 Signature Verification
    const secret = process.env.WEBHOOK_SECRET || "flowdesk_webhook_secret";
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature && signature !== expectedSig) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { orderId, eventType, payload } = event;

    // Idempotency — ignore duplicate webhook events
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    const alreadyProcessed = payment.webhookEvents.some(
      (e: any) => e.event === eventType
    );

    if (alreadyProcessed) {
      return NextResponse.json({
        success: true,
        message: "Duplicate event ignored",
        idempotent: true,
      });
    }

    // Update payment status based on event
    const statusMap: Record<string, string> = {
      "payment.processing": "PROCESSING",
      "payment.captured":   "CAPTURED",
      "payment.settled":    "SETTLED",
      "payment.failed":     "FAILED",
      "refund.processed":   "REFUNDED",
    };

    const newStatus = statusMap[eventType];

    await Payment.findOneAndUpdate(
      { orderId },
      {
        ...(newStatus && { status: newStatus }),
        $push: {
          webhookEvents: {
            event: eventType,
            timestamp: new Date(),
            status: "processed",
            payload: JSON.stringify(payload),
          },
        },
      }
    );

    return NextResponse.json({ success: true, message: "Webhook processed" });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}