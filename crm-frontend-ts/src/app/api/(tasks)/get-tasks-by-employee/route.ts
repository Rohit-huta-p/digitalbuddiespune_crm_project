import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const id = body.id;
    const companyId = body.companyId || "1";

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/task/getByEmployeeId`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, companyId }),
      }
    ).then((res) => res.json());

    const { attributes, errors } = backendResponse;

    if (errors) {
      throw {
        title: errors[0]?.title,
        message: errors[0]?.message,
        status: errors[0]?.code,
      };
    }

    const tasks = attributes?.tasks || [];

    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    console.error("Get tasks by employee API error: ", error);
    return NextResponse.json({ error }, { status: error?.status || 500 });
  }
}
