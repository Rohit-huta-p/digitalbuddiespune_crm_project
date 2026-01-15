import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface CheckInRequest {
  employeeId: number;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: { message: "Unauthorized: Missing token" } },
      { status: 401 }
    );
  }

  try {
    const body: CheckInRequest = await request.json();
    console.log("Check-in request:", body);

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance/checkin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: {
            title: "Error",
            message: responseData.message || "Something went wrong",
            status: backendResponse.status,
          },
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Check-in recorded successfully",
      attendance: responseData,
    });
  } catch (error: any) {
    console.error("Unhandled error:", error);
    return NextResponse.json(
      {
        error: {
          title: "Unhandled Error",
          message: error.message || "Something went wrong",
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}
