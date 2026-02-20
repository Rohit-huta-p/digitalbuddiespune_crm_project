import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface UpdateClientWorkRequest {
  clientId: number;
  completedPosts: number;
  completedVideos: number;
  completedShoots: number;
}

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("id")?.value;

  if (!token || !userId) {
    return NextResponse.json(
      { error: { message: "Unauthorized: Missing token or user ID" } },
      { status: 401 }
    );
  }

  try {
    const body: UpdateClientWorkRequest = await request.json();

    // Add companyId if not provided
    const finalBody = {
      ...body,
    };

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/update-work`,
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

    console.log("Update work response:", responseData);

    if (!backendResponse.ok || responseData.errors) {
      const error = responseData.errors?.[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            title: error?.title || "Error",
            message: error?.message || responseData.message || "Something went wrong",
            status: error?.code || backendResponse.status,
          },
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        responseData.attributes?.message || responseData.message ||
        "Client work progress updated successfully",
      percentage: responseData.attributes?.percentage,
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
