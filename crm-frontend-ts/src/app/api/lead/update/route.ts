/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return NextResponse.json(
            { error: { message: "Unauthorized: Missing token" } },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { leadId, ...fields } = body;

        if (!leadId) {
            return NextResponse.json(
                { error: { message: "leadId is required" } },
                { status: 400 }
            );
        }

        const backendResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leads/${leadId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(fields),
            }
        );

        const responseData = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                {
                    error: {
                        title: "Error",
                        message: responseData.message || "Something went wrong",
                        status: backendResponse.status,
                    },
                },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Lead updated successfully",
            lead: responseData,
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
