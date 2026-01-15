import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface GetTasksRequest {
  projectGroupId: string;
}

interface Task {
  assignedBy: number;
  deadlineTimestamp: string;
  assignedTimestamp: string;
  assignedEmployees: number[];
  description: string;
  taskName: string;
  priority: string | null;
  taskId: number;
  status: string;
}

interface TaskApiResponse {
  attributes: {
    totalPages: number;
    totalTasks: number;
    currentPage: number;
    tasks: Task[];
  };
  errors?: {
    id: string;
    code: string;
    title: string;
    message: string;
  }[];
}

export async function POST(req: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: GetTasksRequest = await req.json();

    if (!body.projectGroupId) {
      return NextResponse.json(
        { error: "Missing projectGroupId in request body" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const num = url.searchParams.get("num") || "1";
    const size = url.searchParams.get("size") || "10";

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/get-tasks?num=${num}&size=${size}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...body, companyId: "1" }),
      }
    );

    const result: TaskApiResponse = await backendResponse.json();

    if (result.errors && result.errors.length > 0) {
      const { title, message, code } = result.errors[0];
      return NextResponse.json(
        { error: { title, message, status: code } },
        { status: parseInt(code || "500", 10) }
      );
    }

    const { tasks, totalPages, currentPage, totalTasks } = result.attributes;

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        totalPages,
        currentPage,
        totalTasks,
      },
    });
  } catch (error: any) {
    console.error("Get tasks API error:", error);
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
