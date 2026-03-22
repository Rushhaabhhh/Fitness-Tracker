import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Explicitly set secureCookie based on environment, as Vercel Edge 
  // sometimes misinfers the protocol, failing to read '__Secure-' cookies.
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  const isAuth = !!token;

  if (!isAuth) {
    let callbackUrl = req.nextUrl.pathname;
    if (req.nextUrl.search) callbackUrl += req.nextUrl.search;
    
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/nutrition/:path*", "/profile/:path*", "/history/:path*"],
};
