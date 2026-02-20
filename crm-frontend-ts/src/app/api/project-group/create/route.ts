/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface CreateProjectGroupRequest {
  projectName: string;
  projectDesc: string;
  groupLeaderIds: Array<number>;
  clientId: string;
  participants: Array<{ id: string; role: string }>;
}

export async function POST(request: Request) {
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
    const body: CreateProjectGroupRequest = await request.json();

    const finalBody = {
      ...body,
      createdById: userId,
      clientId: body.clientId ? body.clientId : null
    };

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/create`,
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
      message:
        responseData.attributes?.Message || "Project created successfully",
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
