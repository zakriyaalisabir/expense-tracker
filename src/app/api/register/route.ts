import { NextResponse } from "next/server";
import { registerUser } from "@lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const user = await registerUser(email, password, name);
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
