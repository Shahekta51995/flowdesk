import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  totalSpend: number;
  transactions: number;
  status: "ACTIVE" | "INACTIVE" | "CHURNED";
  joinedAt: Date;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    phone:       { type: String, required: true },
    company:     { type: String, required: true },
    industry:    { type: String, required: true },
    totalSpend:  { type: Number, default: 0 },
    transactions:{ type: Number, default: 0 },
    status:      { type: String, enum: ["ACTIVE", "INACTIVE", "CHURNED"], default: "ACTIVE" },
    joinedAt:    { type: Date, default: Date.now },
    lastActivity:{ type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);