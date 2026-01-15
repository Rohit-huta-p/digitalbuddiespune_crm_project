import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json(); // { status: "SCHEDULED" }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/status`,
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

    return NextResponse.json(
      {
        success: true,
        data: Array.isArray(responseData) ? responseData : [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Social status filter error:", error);

    return NextResponse.json(
      {
        error: {
          title: error.title || "Error",
          message: error.message || "Something went wrong",
          status: error.status || 500,
        },
      },
      { status: error.status || 500 }
    );
  }
}
