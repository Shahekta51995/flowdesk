import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

// GET /api/customers
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("search") || "";
    const status   = searchParams.get("status") || "";
    const industry = searchParams.get("industry") || "";
    const page     = parseInt(searchParams.get("page") || "1");
    const limit    = parseInt(searchParams.get("limit") || "10");
    const sortField = searchParams.get("sortField") || "totalSpend";
    const sortDir   = searchParams.get("sortDir") || "desc";

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: "i" } },
        { email:   { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "ALL")   query.status   = status;
    if (industry && industry !== "ALL") query.industry = industry;

    const sortObj: any = { [sortField]: sortDir === "asc" ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const customer = await Customer.create({
      ...body,
      customerId: `CUST_${Date.now()}`,
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}