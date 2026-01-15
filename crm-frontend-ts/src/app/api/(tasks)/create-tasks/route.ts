import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CreateTaskRequest } from "@/types/tasks";

/*
   * Features:
    - Removed axios support and replaced it with nextjs fetch
    - Added type support
    - Added error handling
*/

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;
  const id = cookies().get("id")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const requestBody = { ...body, assignedBy: id, companyId: "1" };

    console.log(
      "/*============================================================*/"
    );

    console.log(requestBody.deadlineTimestamp);
    requestBody.deadlineTimestamp = new Date(requestBody.deadlineTimestamp)
      .toISOString()
      .slice(0, 19);

    console.log(requestBody.deadlineTimestamp);

    console.log(requestBody);

    // We're using nextjs fetch here
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/createTask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    ).then((res) => res.json());

    const responseData = backendResponse;

    // !Error handling
    if (responseData.errors) {
      throw {
        title: "Task Creation Failed",
        message: responseData.errors[0].message,
        status: responseData.errors[0].code || 400,
      };
    }

    // *If no errors then proceed
    const { message } = responseData.attributes;

    // Return response
    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    /*
        !Error handling returns an object with schema
        error: {
            title: string,
            message: string,
            status: number,
        }
    */
    console.error("Task creation API error: ", error);
    return NextResponse.json(
      {
        error: {
          title: error.title || "Unknown Error",
          message: error.message || "Create Task failed",
          status: error.status || 500,
        },
      },
      { status: error.status || 500 }
    );
  }
}
