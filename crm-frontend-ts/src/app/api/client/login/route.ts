/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

interface ClientLoginRequest {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: ClientLoginRequest = await request.json();

    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/login`,
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    const loginData = backendResponse.data;

    if (loginData.errors) {
      throw {
        title: loginData.errors[0].title,
        message: loginData.errors[0].message,
        status: loginData.errors[0].code,
      };
    }

    const { token, client_Id, name, message } = loginData.attributes;

    // Set secure cookies for both token and clientId
    const response = NextResponse.json({
      success: true,
      client: { clientId: client_Id, name, message, token },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // one day
    });
    response.cookies.set("clientId", client_Id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // one day
    });

    return response;
  } catch (error: any) {
    console.log(error);

    // Handle network/connection errors when backend is down or unreachable
    const isNetworkError = !error?.response;
    if (isNetworkError) {
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
        error: backendError?.title || "Login failed",
        details: backendError?.message || "Login failed",
      },
      { status: backendError?.code || 500 }
    );
  }
}
