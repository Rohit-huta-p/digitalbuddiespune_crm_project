import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
   * Features:
    - Removed axios and replaced with Next.js fetch
    - Added type support (TODO comment)
    - Added structured error handling
*/

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const requestBody = { ...body, companyId: "1" };

    /* 
        TODO: Add type here
        const body: UpdateTaskRequest = await request.json();
    */

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseData = await backendResponse.json();

    console.log(responseData);

    if (responseData.errors) {
      throw {
        title: "Update Task failed",
        message: responseData.errors,
        status: 400,
      };
    }

    const { message } = responseData.attributes;

    const response = NextResponse.json({
      success: true,
      message,
    });

    return response;
  } catch (error: any) {
    console.error("Update Task API error:", error);
    return NextResponse.json({ error }, { status: error?.status || 500 });
  }
}
