import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("id")?.value; // 👈 Fetch user ID from cookies

  if (!token || !userId) {
    console.error("Missing token or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const num = url.searchParams.get("num") || "1";
    const size = url.searchParams.get("size") || "10";
    const body = { companyId: "1" };

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/get-all-projects?num=${num}&size=${size}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    ).then((res) => res.json());

    interface ProjectResponse {
      errors?: Array<{
        title: string;
        message: string;
        code: number;
      }>;
      attributes: {
        message: string;
        totalProjects: number;
        projects: Array<any>;
      };
    }

    const responseData: ProjectResponse = backendResponse;

    if (responseData.errors) {
      throw {
        title: responseData.errors[0].title,
        message: responseData.errors[0].message,
        status: responseData.errors[0].code,
      };
    }

    const { message, projects } = responseData.attributes;

    // 🔍 Filter projects where user is a participant OR the creator
    let filteredProjects = projects.filter(
      (project: any) =>
        project.participants.some((p: any) => p.id === userId) ||
        String(project.createdById) === String(userId)
    );

    // 🔎 Apply search filter
    const search = url.searchParams.get("search") || "";
    if (search) {
      const q = search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        (p: any) =>
          p.projectName?.toLowerCase().includes(q) ||
          p.projectDesc?.toLowerCase().includes(q)
      );
    }

    // 📋 Apply status filter
    const status = url.searchParams.get("status") || "";
    if (status) {
      filteredProjects = filteredProjects.filter(
        (p: any) => p.status?.toLowerCase() === status.toLowerCase()
      );
    }

    // 📊 Total after filters but before pagination
    const totalFiltered = filteredProjects.length;

    // 📄 Apply pagination slicing
    const pageNum = parseInt(num, 10);
    const pageSize = parseInt(size, 10);
    const start = (pageNum - 1) * pageSize;
    const paginatedProjects = filteredProjects.slice(start, start + pageSize);

    return NextResponse.json({
      success: true,
      message,
      projects: paginatedProjects,
      totalProjects: totalFiltered,
    });
  } catch (error: any) {
    console.error("Unhandled error:", error);
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
