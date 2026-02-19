/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(request: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const userId = cookieStore.get("id")?.value;

    if (!token || !userId) {
        return NextResponse.json(
            { error: { message: "Unauthorized" } },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        console.log("Parsed Frontend Body:", body);

        // Backend expects UpdateTaskStatusRequest: { taskId: Long, status: String }
        const finalBody = {
            taskId: Number(body.taskId),
            status: body.status,
        };

        console.log("Sending to backend:", JSON.stringify(finalBody));

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/task/update-status`;

        const backendResponse = await fetch(
            url,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(finalBody),
            }
        );

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(data, { status: backendResponse.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: { message: error.message || "Internal Server Error" } },
            { status: 500 }
        );
    }
}
