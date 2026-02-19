/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const projectId = body.projectGroupId;
    const results = [];
    const errors = [];

    // Helper to format date as yyyy-MM-dd HH:mm:ss
    const formatDate = (dateString: string) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        const yyyy = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const HH = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
      } catch (e) {
        console.error("Date parsing error", e);
        return dateString; // Fallback
      }
    };

    for (const task of body.tasks) {
      const formattedDeadline = formatDate(task.deadlineTimestamp);

      const taskRequest = {
        projectId: projectId,
        taskName: task.taskName,
        description: task.description,
        deadlineTimestamp: formattedDeadline,
        priority: task.priority || "Medium", // Default if missing
        assignedEmployeeIds: task.assignedEmployees, // map number[] to Long[]
        // assignedBy is handled by token in backend
      };

      try {
        const backendRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/task/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(taskRequest),
          }
        );

        const responseData = await backendRes.json();

        if (!backendRes.ok || responseData.errors) {
          errors.push({ task: task.taskName, error: responseData.errors?.[0]?.message || "Failed" });
        } else {
          results.push(responseData);
        }

      } catch (err: any) {
        errors.push({ task: task.taskName, error: err.message });
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json({ error: { message: "All task creations failed", details: errors } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled ${results.length} tasks. ${errors.length > 0 ? `${errors.length} failed.` : ""}`,
      results,
      errors
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
