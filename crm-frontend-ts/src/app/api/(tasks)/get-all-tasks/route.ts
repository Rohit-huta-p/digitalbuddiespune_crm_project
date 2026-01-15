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

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We're using nextjs fetch here
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/getAll`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: "1" }),
      }
    ).then((res) => res.json());

    console.log("backendResponse", backendResponse);

    const { attributes, errors } = backendResponse;

    console.log("attributes", attributes);
    console.log("errors", errors);

    if (errors) {
      throw {
        title: errors[0].title,
        message: errors[0].message,
        status: errors[0].code,
      };
    }

    const { TaskManagement } = attributes;

    // Return response
    const response = NextResponse.json({
      success: true,
      data: TaskManagement,
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
    console.error("Get all tasks API error: ", error);
    return NextResponse.json({ error });
  }
}
