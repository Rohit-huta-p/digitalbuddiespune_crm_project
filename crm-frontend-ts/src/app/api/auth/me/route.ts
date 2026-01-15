import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/me
 * Returns the current user's ID and token status from httpOnly cookies
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const id = cookieStore.get("id")?.value;

    if (!token || !id) {
      return NextResponse.json(
        { 
          error: "Not authenticated",
          authenticated: false 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      employeeId: id,
      hasToken: !!token,
    });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check authentication",
        authenticated: false,
      },
      { status: 500 }
    );
  }
}
