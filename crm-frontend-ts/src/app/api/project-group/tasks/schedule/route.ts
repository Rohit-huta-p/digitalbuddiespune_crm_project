import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface Task {
  taskName: string;
  description: string;
  deadlineTimestamp: string;
  assignedBy: string;
  assignedEmployees: number[];
  priority: "low" | "medium" | "high";
  email?: string; // optional
}

interface ScheduleTaskRequest {
  projectGroupId: string;
  tasks: Task[];
}

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;
  const id = cookies().get("id")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: ScheduleTaskRequest = await request.json();

    if (!body.projectGroupId || !Array.isArray(body.tasks)) {
      return NextResponse.json(
        { error: "projectGroupId and tasks[] are required" },
        { status: 400 }
      );
    }

    const requestBody = {
      ...body,
      companyId: "1", // static as required
    };

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/task/schedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseData = await backendRes.json();

    if (responseData.errors) {
      const { title, message, code } = responseData.errors[0];
      return NextResponse.json(
        { error: { title, message, status: code } },
        { status: parseInt(code || "500", 10) }
      );
    }

    const message =
      responseData.attributes?.Message || "Tasks scheduled successfully";

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error("Schedule Task API error:", error);
    return NextResponse.json(
      {
        error: {
          title: "Unhandled Error",
          message: error.message || "Something went wrong",
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}
