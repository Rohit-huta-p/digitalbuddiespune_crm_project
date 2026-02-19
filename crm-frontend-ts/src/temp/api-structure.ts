import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
   * Features:
    - Removed axios support and replaced it with nextjs fetch
    - Added type support
    - Added error handling
*/

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    /* 
        TODO: Add type here
        const body: CreateBillRequest = await request.json();
    */

    // We're using nextjs fetch here
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/bill/createbill`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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

    //? Extra things, if needed ( like setting cookies )
    // Set secure cookies

    // Return response
    const response = NextResponse.json({
      success: true,
      message,
    });

    return response;
  } catch (error: unknown) {
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
