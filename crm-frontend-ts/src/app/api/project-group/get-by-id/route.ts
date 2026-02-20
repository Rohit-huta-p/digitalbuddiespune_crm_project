/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // const _payload: GetProjectByIdRequest = {
    //   ...body,
    //   companyId: "1", // static company ID
    // };

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/${body.projectGroupId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let responseData;
    try {
      responseData = await backendResponse.json();
    } catch (e) {
      // If JSON parsing fails (e.g. 500 HTML error), handle gracefully
      if (!backendResponse.ok) {
        return NextResponse.json({ error: { message: `Backend Error: ${backendResponse.status} ${backendResponse.statusText}` } }, { status: backendResponse.status });
      }
      throw e;
    }

    if (!backendResponse.ok || (responseData.errors && responseData.errors.length > 0)) {
      const error = responseData.errors?.[0];
      return NextResponse.json(
        {
          error: {
            title: error?.title || "Error",
            message: error?.message || "Something went wrong",
            status: error?.code || backendResponse.status || 500,
          },
        },
        { status: parseInt(error?.code || "500", 10) }
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
