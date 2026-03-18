import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  // Always return NextResponse to continue the request
  return NextResponse.next();
}


export const config = {
  matcher: ["/timeline", "/submit"],
};
