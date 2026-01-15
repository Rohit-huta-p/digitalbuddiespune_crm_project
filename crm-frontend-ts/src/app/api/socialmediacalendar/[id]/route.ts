import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request, context: any) {
  const token = cookies().get("token")?.value;
  const id = context.params.id;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Social getById error:", error);

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

export async function PUT(request: Request, context: any) {
  const token = cookies().get("token")?.value;
  const id = context.params.id;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

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
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok || responseData.errors) {
      const error = responseData.errors?.[0];
      return NextResponse.json(
        {
          error: {
            title: error?.title || "Error",
            message: error?.message || responseData.message || "Something went wrong",
            status: error?.code || backendResponse.status,
          },
        },
        { status: error?.code || backendResponse.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: responseData.attributes?.message || "Updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Social update error:", error);

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

export async function DELETE(request: Request, context: any) {
  const token = cookies().get("token")?.value;
  const id = context.params.id;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

    return NextResponse.json(
      {
        success: true,
        message: responseData.attributes?.message || "Deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Social delete error:", error);

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
