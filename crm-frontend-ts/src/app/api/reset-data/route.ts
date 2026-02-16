import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const token = cookies().get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/reset-data`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json(
                { error: `Backend error ${response.status}: ${text}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Failed to reset data", error);
        return NextResponse.json(
            { error: error.message || "Failed to reset data" },
            { status: 500 }
        );
    }
}
