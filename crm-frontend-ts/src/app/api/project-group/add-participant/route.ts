import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { projectGroupId, employeeIds } = body;

        if (!projectGroupId || !employeeIds || employeeIds.length === 0) {
            return NextResponse.json(
                { error: { message: "projectGroupId and employeeIds are required" } },
                { status: 400 }
            );
        }

        const backendResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/${projectGroupId}/participants`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    projectId: projectGroupId,
                    employeeIds: employeeIds.map(Number),
                }),
            }
        );

        const result = await backendResponse.json();

        if (!backendResponse.ok || result.errors) {
            throw {
                message: result.errors?.[0]?.message || "Failed to add participants",
                status: result.errors?.[0]?.code || backendResponse.status,
            };
        }

        return NextResponse.json({
            success: true,
            message: result.attributes || "Participants added successfully",
        });
    } catch (error: any) {
        console.error("Add participant error:", error);
        return NextResponse.json(
            {
                error: {
                    title: "Error",
                    message: error.message || "Something went wrong",
                    status: error.status || 500,
                },
            },
            { status: error.status || 500 }
        );
    }
}
