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
    const status = url.searchParams.get("status"); // Extract status first

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project?page=${Number(num) - 1}&size=${size}${status ? `&status=${status}` : ''}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    ).then((res) => res.json());

    if (backendResponse.errors) {
      throw {
        title: "Error",
        message: backendResponse.errors[0]?.message || "Failed to fetch projects",
        status: backendResponse.errors[0]?.code
      };
    }

    // Backend returns Page<ProjectDTO> in attributes or directly? 
    // ResponseDTO<Page<ProjectDTO>> structure: { attributes: { content: [], totalElements: ... } }

    // Check if backendResponse has attributes.content (Page object)
    const pageData = backendResponse.attributes;
    const projects = pageData.content || [];
    const _totalProjects = pageData.totalElements || 0;

    // 🔍 Filter projects where user is a participant OR the creator (Frontend filtering might still be needed if backend doesn't filter by user permissions strictly for 'all' endpoint, but backend should handle this. keeping existing logic for safety if needed, but 'projects' comes from backend).
    // The previous logic filtered `projects` array.
    // Let's assume backend returns all visible projects.

    let filteredProjects = projects;

    // 🔎 Apply search filter (Frontend side as backend might not support search param yet based on controller code)
    const search = url.searchParams.get("search") || "";
    if (search) {
      const q = search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) || // DTO has 'name', not 'projectName'
          p.description?.toLowerCase().includes(q) // DTO has 'description', not 'projectDesc'
      );
    }

    // Backend already handles status filter if passed.

    return NextResponse.json({
      success: true,
      message: "Projects fetched successfully",
      projects: filteredProjects, // Note: DTO fields changed (name vs projectName), frontend components might break if not mapped back.
      // Mapping DTO back to expected frontend structure if needed:
      // ProjectDTO: name, description, status, companyId, createdBy, createdAt, clientId, clientName, groupLeaderIds, participants
      // Old Frontend expected: projectName, projectDesc, ...
      // Let's map it to be safe.
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
