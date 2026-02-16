import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const token = cookies().get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        if (!body.clientId) {
            return NextResponse.json(
                { error: "Client ID is required" },
                { status: 400 }
            );
        }

        // Backend expects POST /project/get-by-client with { clientId, companyId }
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/get-by-client`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clientId: body.clientId,
                    companyId: body.companyId || "1",
                }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            console.error("Backend error fetching client projects:", response.status, text);
            throw new Error(`Backend error ${response.status}: ${text}`);
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Failed to fetch client projects", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch client projects" },
            { status: 500 }
        );
    }
}
