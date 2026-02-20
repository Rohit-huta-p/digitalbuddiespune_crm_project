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
    const requestBody = { ...body };

    if (requestBody.deadlineTimestamp) {
      requestBody.deadlineTimestamp = new Date(requestBody.deadlineTimestamp)
        .toISOString()
        .slice(0, 19);
    }

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

    console.log("Backend /task/update response:", backendResponse.status, responseData);

    // If backend returned non-OK or errors, forward the full response and status
    if (!backendResponse.ok || responseData?.errors) {
      return NextResponse.json(responseData, { status: backendResponse.status || 500 });
    }

    // Forward backend attributes (includes message) and status to client for transparency
    return NextResponse.json(responseData, { status: backendResponse.status });
  } catch (error: any) {
    console.error("Update Task API error:", error);
    return NextResponse.json({ error }, { status: error?.status || 500 });
  }
}
