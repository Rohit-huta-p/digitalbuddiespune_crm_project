import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const leadId = params.leadId;

  if (!token) {
    return NextResponse.json(
      { error: { message: "Unauthorized: Missing token" } },
      { status: 401 }
    );
  }

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leads/${leadId}/followups`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      followUps: Array.isArray(responseData) ? responseData : [],
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
