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
        const { projectGroupId, employeeId } = body;

        if (!projectGroupId || !employeeId) {
            return NextResponse.json(
                { error: { message: "projectGroupId and employeeId are required" } },
                { status: 400 }
            );
        }

        const backendResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/${projectGroupId}/participants/${employeeId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const result = await backendResponse.json();

        if (!backendResponse.ok || result.errors) {
            throw {
                message: result.errors?.[0]?.message || "Failed to remove participant",
                status: result.errors?.[0]?.code || backendResponse.status,
            };
        }

        return NextResponse.json({
            success: true,
            message: result.attributes || "Participant removed successfully",
        });
    } catch (error: any) {
        console.error("Remove participant error:", error);
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
