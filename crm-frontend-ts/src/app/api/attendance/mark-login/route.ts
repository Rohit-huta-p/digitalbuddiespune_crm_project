import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface MarkLoginRequest {
  latitude: string;
  longitude: string;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const id = cookieStore.get("id")?.value;

  if (!token || !id) {
    return NextResponse.json(
      { error: { message: "Unauthorized: Missing token or user ID" } },
      { status: 401 }
    );
  }

  try {
    const body: MarkLoginRequest = await request.json();

    const finalBody = {
      id,
      companyId: "1", // ✅ hardcoded
      latitude: body.latitude,
      longitude: body.longitude,
    };

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/mark-login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalBody),
      }
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok || responseData.errors) {
      const error = responseData.errors?.[0];
      return NextResponse.json(
        {
          error: {
            title: error?.title || "Error",
            message: error?.message || "Something went wrong",
            status: error?.code || 500,
          },
        },
        { status: parseInt(error?.code || "500", 10) }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseData.attributes?.message || "Login marked successfully",
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
