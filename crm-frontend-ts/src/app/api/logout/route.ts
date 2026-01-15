import { LogoutRequest, LogoutResponse } from "@/types/logout";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: LogoutRequest = await request.json();
    const backendResponse = await axios.post<LogoutResponse>(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/logout`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    const logoutData = backendResponse.data;

    if (logoutData.errors) {
      throw {
        title: logoutData.errors[0].title,
        message: logoutData.errors[0].message,
        status: logoutData.errors[0].code,
      };
    }

    const { message } = logoutData.attributes;

    const response = NextResponse.json({ success: true, message });

    response.cookies.set("token", "", { expires: new Date(0), path: "/" });
    response.cookies.set("id", "", { expires: new Date(0), path: "/" });

    return response;
  } catch (error: any) {
    // Handle network/connection errors when backend is down or unreachable
    if (!error?.response) {
      return NextResponse.json(
        {
          error: "Service Unavailable",
          details: "Backend API is not reachable. Please try again later.",
        },
        { status: 503 }
      );
    }

    const backendError = error?.response?.data?.errors?.[0];
    return NextResponse.json(
      {
        error: backendError?.title || "Logout failed",
        details: backendError?.message || "Logout failed",
      },
      { status: backendError?.code || 500 }
    );
  }
}
