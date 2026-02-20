/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
   * Features:
    - Removed axios support and replaced it with nextjs fetch
    - Added type support
    - Added error handling
*/


interface MarkProjectStatus {
  projectGroupId: string
  status: string,
}



export async function POST(req: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const _requestBody = { ...body, companyId: "1" };

    // We're using nextjs fetch here
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/${body.projectGroupId}/status?status=${body.status}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
  } catch (error: any) {
    /*
        !Error handling returns an object with schema
        error: {
            title: string,
            message: string,
            status: number,
        }
    */
    console.error("Mark project status API error: ", error);
    return NextResponse.json({ error: error });
  }
}
