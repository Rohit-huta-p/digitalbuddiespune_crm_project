import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
   * Features:
    - Uses token from cookies
    - Static companyId is added
    - Returns project details by ID
    - Error handling with structured format
*/

interface GetProjectByIdRequest {
  projectGroupId: string;
  companyId: string;
}

export async function POST(req: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }

  try {
    const body: Omit<GetProjectByIdRequest, "companyId"> = await req.json();

    const payload: GetProjectByIdRequest = {
      ...body,
      companyId: "1", // static company ID
    };

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/get-project-by-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const responseData = await backendResponse.json();

    if (responseData.errors) {
      const error = responseData.errors[0];
      return NextResponse.json(
        {
          error: {
            title: error.title || "Error",
            message: error.message || "Something went wrong",
            status: error.code || 500,
          },
        },
        { status: parseInt(error.code || "500", 10) }
      );
    }

    return NextResponse.json({
      success: true,
      data: responseData.attributes,
    });
  } catch (error: any) {
    console.error("GET PROJECT BY ID API error:", error);
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
