import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/auth/auth";

// Define paths that do not require authentication
const PUBLIC_PATHS: string[] = [
  "/",
  // "/about/*",
  // "/search/*",
  // "/posts/*",
  "/login",
  "/signup",
  // "/admin/signup",
];
const PUBLIC_FILES_REGEX: RegExp = /\.(js|css|png|jpg|gif|svg|ico|pdf)$/;

// Middleware function
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for public paths
  if (isPublicPath(pathname) || isPublicFile(pathname)) {
    return NextResponse.next();
  }

  // Fetch session (or use another method to check authentication)
  const session = await getSession();
  // If no token is found, redirect to login page
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Helper function to check if path matches public paths
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((pattern) => {
    if (pattern.endsWith("/*")) {
      return pathname.startsWith(pattern.slice(0, -2));
    } else {
      return pathname === pattern;
    }
  });
}

// Helper function to check if path matches public file extensions
function isPublicFile(pathname: string): boolean {
  return PUBLIC_FILES_REGEX.test(pathname);
}
