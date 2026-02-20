/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
* Features:
- Removed axios support and replaced it with nextjs fetch
- Added type support
- Added error handling
*/

export async function POST() {
  const token = cookies().get("token")?.value;
  const id = cookies().get("id")?.value;

  if (!token || !id) {
    console.error("Missing token or id");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/get_employee_by_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      }
    ).then((res) => res.json());

    const responseData = backendResponse;
    console.log("Response Data: ", responseData);

    // !Error handling
    if (responseData.errors) {
      throw {
        title: responseData.errors[0].title,
        message: responseData.errors[0].message,
        status: responseData.errors[0].code,
      };
    }

    // *If no errors then proceed
    // const { message } = responseData.attributes;

    //? Extra things, if needed ( like setting cookies )
    // Set secure cookies

    // Return response
    const response = NextResponse.json({
      success: true,
      user: responseData.attributes,
    });
    return response;
  } catch (error: any) {
    console.error("Auth check failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
