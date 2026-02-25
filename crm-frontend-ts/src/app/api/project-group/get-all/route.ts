import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const userId = cookieStore.get("id")?.value;

  if (!token || !userId) {
    console.error("Missing token or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user details to determine role
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/get_employee_by_id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: userId }),
      }
    ).then((res) => res.json());
    console.log("USER DATA: ", userRes.attributes);

    const isEmployee =
      userRes?.attributes?.role?.toLowerCase() === "employee";

    const url = new URL(req.url);
    const num = url.searchParams.get("num") || "1";
    const size = url.searchParams.get("size") || "10";
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search") || "";

    // For employees, fetch ALL projects (large page) so we can filter by participation,
    // then manually paginate. For admins/HR, use normal paginated request.
    const fetchSize = isEmployee ? "1000" : size;
    const fetchPage = isEmployee ? "0" : String(Number(num) - 1);

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/project?page=${fetchPage}&size=${fetchSize}${status ? `&status=${status}` : ""}`,
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
        message:
          backendResponse.errors[0]?.message || "Failed to fetch projects",
        status: backendResponse.errors[0]?.code,
      };
    }

    const pageData = backendResponse.attributes;
    let projects = pageData.content || [];
    let totalProjects = pageData.totalElements || 0;
    console.log("isEMPLOYEE: ", isEmployee);

    // Filter by participation for employees — only show projects where the
    // employee is explicitly listed in the participants (team members) list.
    if (isEmployee) {
      projects = projects.filter((p: any) => {
        if (p.participants) {
          console.log("participant ID: ", String(p.participants.id));
          console.log("userID: ", String(userId));
          return p.participants?.find(
            (participant: any) => String(participant.id) === String(userId)
          );
        }
        return false;
      });
      totalProjects = projects.length;
    }

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
      totalProjects = projects.length;
    }

    // For employees, manually paginate after filtering
    if (isEmployee) {
      const pageNum = Number(num) - 1;
      const pageSize = Number(size);
      const start = pageNum * pageSize;
      const end = start + pageSize;
      projects = projects.slice(start, end);
    }

    return NextResponse.json({
      success: true,
      message: "Projects fetched successfully",
      projects,
      totalProjects,
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
