/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
   * Features:
    - Removed axios support and replaced it with nextjs fetch
    - Added type support
    - Added error handling
*/
interface Task {
  taskName: string,
  description: string,
  assignedBy: string
  email: string,
  deadlineTimestamp: string,
  assignedEmployees: number[]
}


interface AssignTaskToYourselfRequest {
  projectGroupId: string,
  task: Task[]
}



export async function POST(req: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    console.error("Missing token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: AssignTaskToYourselfRequest = await req.json();
    const projectId = body.projectGroupId;

    if (!projectId || !Array.isArray(body.task)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

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

    for (const taskItem of body.task) {
      const formattedDeadline = formatDate(taskItem.deadlineTimestamp);

      const taskRequest = {
        projectId: projectId,
        taskName: taskItem.taskName,
        description: taskItem.description,
        deadlineTimestamp: formattedDeadline,
        priority: "Medium", // Default or extract if avail
        assignedEmployeeIds: taskItem.assignedEmployees,
        // Backend handles assignedBy via token
      };

      try {
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/task/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(taskRequest)
          }
        );

        const responseData = await backendResponse.json();

        if (!backendResponse.ok || responseData.errors) {
          errors.push({ task: taskItem.taskName, error: responseData.errors?.[0]?.message || "Failed" });
        } else {
          results.push(responseData);
        }
      } catch (err: any) {
        errors.push({ task: taskItem.taskName, error: err.message });
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json({ error: { message: "Failed to assign tasks", details: errors } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Assigned ${results.length} tasks successfully.`,
    });

  } catch (error: any) {
    console.error("Assign Task to Yourself API error: ", error);
    return NextResponse.json({ error: error });
  }
}
