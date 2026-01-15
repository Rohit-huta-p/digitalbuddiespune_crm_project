import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Read social media object from frontend
    const body = await request.json();

    // Call Spring Boot API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    ).then((res) => res.json());

    // Handle backend errors
    if (backendResponse.errors) {
      throw {
        title: backendResponse.errors[0].title,
        message: backendResponse.errors[0].message,
        status: backendResponse.errors[0].code,
      };
    }

    // Extract success message + id
    const { id, message } = backendResponse.attributes;

    return NextResponse.json(
      {
        success: true,
        id,
        message,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Social create API error:", error);

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
