import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
   * Features:
    - Removed axios support and replaced it with nextjs fetch
    - Added type support
    - Added error handling
*/

interface DeleteTaskRequest {
  id: string;
}

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: DeleteTaskRequest = await request.json();
    const requestBody = { ...body };

    // We're using nextjs fetch here
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/delete`,
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
        title: responseData.errors[0].title,
        message: responseData.errors[0].message,
        status: responseData.errors[0].code,
      };
    }

    // *If no errors then proceed
    const { message } = responseData.attributes;

    // Return response
    const response = NextResponse.json({
      success: true,
      message,
    });

    return response;
  } catch (error: any) {
    /*
        !Error handling returns an object with schema
        error: {
            title: string,
            message: string,
            status: number,
        }
    */
    console.error("Bill creation API error: ", error);
    return NextResponse.json({ error: error });
  }
}
