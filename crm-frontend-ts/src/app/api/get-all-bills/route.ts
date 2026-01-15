import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const pageNum = searchParams.get("pageNum") || "1";
    const pageSize = searchParams.get("pageSize") || "1";

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/bill/getAllBills?pageNum=${pageNum}&pageSize=${pageSize}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("API error response:", errorBody);
      return NextResponse.json(
        { error: "Fetching bills failed", details: errorBody.errors || null },
        { status: response.status }
      );
    }

    const result = await response.json();
    const billData = result.attributes;

    return NextResponse.json({
      success: true,
      data: billData,
    });
  } catch (error: any) {
    console.error("Bill fetching API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
