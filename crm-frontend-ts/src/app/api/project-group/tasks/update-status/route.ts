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

        // Backend expects: employee_id, taskId, status, companyId
        const finalBody = {
            ...body,
            employee_id: userId,
            companyId: body.companyId || "1",
        };

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/update`;
        console.log("Calling Backend URL:", url);
        console.log("Request Body:", JSON.stringify(finalBody));

        const backendResponse = await fetch(
            url,
            {
                method: "POST",
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
