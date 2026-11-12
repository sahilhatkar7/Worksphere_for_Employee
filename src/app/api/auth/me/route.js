
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not logged in.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Current user API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve user information.",
      },
      { status: 500 }
    );
  }
}
