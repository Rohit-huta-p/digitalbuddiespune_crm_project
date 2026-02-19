/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Read social media object from frontend
    const body = await request.json();
    console.log("Social Create Payload:", body);

    const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/create`;
    console.log("Sending request to backend:", backendUrl);

    // Call Spring Boot API
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Backend response status:", backendResponse.status);

    let responseData;
    try {
      responseData = await backendResponse.json();
    } catch (parseError) {
      console.error("Failed to parse backend response:", parseError);
      return NextResponse.json(
        {
          error: {
            title: "Backend Error",
            message: "Invalid response from backend server",
            status: backendResponse.status,
          },
        },
        { status: backendResponse.status }
      );
    }

    console.log("Backend response data:", responseData);

    // Handle backend errors
    if (!backendResponse.ok || responseData.errors) {
      const error = responseData.errors?.[0];
      return NextResponse.json(
        {
          error: {
            title: error?.title || "Error",
            message: error?.message || responseData.message || "Something went wrong",
            status: error?.code || backendResponse.status,
          },
        },
        { status: backendResponse.status }
      );
    }

    // Extract success message + id
    const { id, message } = responseData.attributes || responseData;

    return NextResponse.json(
      {
        success: true,
        id,
        message: message || "Created successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Social create API error:", error);

    return NextResponse.json(
      {
        error: {
          title: error.title || "Internal Server Error",
          message: error.message || "Something went wrong",
          status: error.status || 500,
        },
      },
      { status: error.status || 500 }
    );
  }
}
