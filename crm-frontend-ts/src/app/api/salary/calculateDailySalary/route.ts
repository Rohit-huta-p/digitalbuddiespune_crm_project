import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const token = cookies().get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/salary/calculateDailySalary`,
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
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch (e) {
                errorJson = { error: errorText };
            }
            return NextResponse.json(errorJson, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to calculate salary", error);
        return NextResponse.json(
            { error: "Failed to calculate salary" },
            { status: 500 }
        );
    }
}
