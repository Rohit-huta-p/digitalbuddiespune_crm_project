/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request: Request, context: any) {
  const token = cookies().get("token")?.value;
  const id = context.params.id;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Call backend Spring Boot API
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/update/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    ).then((res) => res.json());

    // Backend returns error format?
    if (backendResponse.errors) {
      throw {
        title: backendResponse.errors[0].title,
        message: backendResponse.errors[0].message,
        status: backendResponse.errors[0].code,
      };
    }

    // Success attributes
    const { id: socialId, message } = backendResponse.attributes;

    return NextResponse.json(
      {
        success: true,
        id: socialId,
        message,
      },
      { status: 200 }
    );
  } catch (error: any) {
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
