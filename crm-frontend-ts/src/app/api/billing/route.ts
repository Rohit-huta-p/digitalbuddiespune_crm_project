import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { CreateBillResponse } from "@/types/bills";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { billData } = body;
    const requestBody = { ...billData, companyId: "1" };

    const backendResponse: CreateBillResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/bill/createbill`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    ).then((res) => res.json());

    const createBillData = backendResponse;

    if (createBillData.errors) {
      throw {
        title: createBillData.errors[0].title,
        message: createBillData.errors[0].message,
        status: createBillData.errors[0].code,
      };
    }

    const { message } = createBillData.attributes;

    const response = NextResponse.json({
      success: true,
      message,
    });

    return response;
  } catch (error: any) {
    console.error("Bill creation API error: ", error);
    return NextResponse.json({ error: error });
  }
}
