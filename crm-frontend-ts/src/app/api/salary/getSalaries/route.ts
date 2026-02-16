import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const token = cookies().get("token")?.value;
    const { searchParams } = new URL(req.url);
    const pageNum = searchParams.get("pageNum") || "0";
    const pageSize = searchParams.get("pageSize") || "10";

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({})); // Handle optional body

        // Construct query string for backend
        const queryString = `pageNum=${pageNum}&pageSize=${pageSize}`;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/salary/getSalaries?${queryString}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch salary records", error);
        return NextResponse.json(
            { error: "Failed to fetch salary records" },
            { status: 500 }
        );
    }
}
