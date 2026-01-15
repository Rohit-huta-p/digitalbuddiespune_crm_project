import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
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
    const finalBody = {
      companyId: 1,
    };

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/getAll`,
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
    
    console.log("Get all clients response:", responseData);

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
      data: responseData.attributes?.clients || [],
    });
  } catch (error: any) {
    console.error("Get all clients error:", error);
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
