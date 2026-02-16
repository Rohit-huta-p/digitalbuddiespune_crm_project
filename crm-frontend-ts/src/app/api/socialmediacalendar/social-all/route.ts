import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { format, subYears, addYears } from "date-fns";

export async function GET(request: Request) {
    const token = cookies().get("token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use a wide range to get "all" entries (e.g., last 1 year to next 2 years)
    // Adjust as needed based on system age.
    const fromStr = format(subYears(new Date(), 1), "yyyy-MM-dd'T'00:00:00");
    const toStr = format(addYears(new Date(), 2), "yyyy-MM-dd'T'23:59:59");

    try {
        const backendResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/range`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ from: fromStr, to: toStr }),
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

        // Sort by ID descending (newest first)
        const sortedData = Array.isArray(responseData)
            ? responseData.sort((a: any, b: any) => b.id - a.id)
            : [];

        return NextResponse.json(
            {
                success: true,
                data: sortedData,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Social all (range) error:", error);

        return NextResponse.json(
            {
                error: {
                    title: error.title || "Error",
                    message: error.message || "Something went wrong",
                    status: error.status || 500,
                },
            },
            { status: error.status || 500 }
        );
    }
}
