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
