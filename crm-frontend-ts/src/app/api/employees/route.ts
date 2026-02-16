import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/get_employee`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: "1" }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // console.log("GET ALL EMPLOYEES response", result.attributes.employees);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch employees", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}



export async function PUT(req: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    /**
     * Expected body from frontend:
     * {
     *   id: number,
     *   companyId: number,
     *   name?: string,
     *   email?: string,
     *   mobile?: string,
     *   role?: number | string,
     *   roleDescription?: string,
     *   employeeId?: string,
     *   password?: string
     * }
     */

    if (!body.id || !body.companyId) {
      return NextResponse.json(
        { error: "Employee id and companyId are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Backend error ${response.status}: ${text}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to update employee", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Employee id is required" },
        { status: 400 }
      );
    }

    // Backend expects POST /employee/delete with { id, companyId }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/delete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: body.id,
          companyId: body.companyId || "1",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Backend error ${response.status}: ${text}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to delete employee", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete employee" },
      { status: 500 }
    );
  }
}
