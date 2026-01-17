import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface CreateEmployeeRequest {
  name: string;
  phno: string;
  email: string;
  role: string;
  password: string;
  monthlySalary: string;
}

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: CreateEmployeeRequest = await request.json();

    console.log("CREATE EMPLOYEE", { ...body, companyId: "1" });

    // We're using nextjs fetch here
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...body,
        companyId: "1",
      }),
    }).then((res) => res.json());

    const responseData = backendResponse;

    console.log("CREATE EMPLOYEE", responseData);

    // !Error handling
    if (responseData?.errors?.length > 0) {
      throw {
        title: "Employee Creation Failed",
        message: responseData.errors[0]?.message || "Unknown error occurred",
        status: responseData.errors[0]?.code || 400,
      };
    }

    // *If no errors then proceed
    const message = responseData?.attributes?.message || responseData?.message || "Employee created successfully";
    console.log("CREATE EMPLOYEE", message);

    // Return response
    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    /*         !Error handling returns an object with schema         error: {             title: string,             message: string,             status: number,         }     */
    console.error("Employee creation API error: ", error);
    return NextResponse.json(
      {
        error: {
          title: error.title || "Unknown Error",
          message: error.message || "Create Employee failed",
          status: error.status || 500,
        },
      },
      { status: error.status || 500 }
    );
  }
}
