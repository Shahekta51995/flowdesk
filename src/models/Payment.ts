import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  paymentId: string;
  orderId: string;
  customerId: string;
  client: string;
  amount: number;
  currency: string;
  status: "INITIATED" | "PROCESSING" | "CAPTURED" | "SETTLED" | "FAILED" | "REFUNDED";
  method: string;
  upiId?: string;
  webhookEvents: {
    event: string;
    timestamp: Date;
    status: string;
    payload: string;
  }[];
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId:      { type: String, required: true, unique: true },
    orderId:        { type: String, required: true, unique: true },
    customerId:     { type: String, required: true },
    client:         { type: String, required: true },
    amount:         { type: Number, required: true },
    currency:       { type: String, default: "INR" },
    status:         {
      type: String,
      enum: ["INITIATED","PROCESSING","CAPTURED","SETTLED","FAILED","REFUNDED"],
      default: "INITIATED"
    },
    method:         { type: String, required: true },
    upiId:          { type: String },
    webhookEvents:  [{
      event:     { type: String },
      timestamp: { type: Date },
      status:    { type: String },
      payload:   { type: String },
    }],
    idempotencyKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);