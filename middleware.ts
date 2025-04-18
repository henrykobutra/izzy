import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/", "/sign-in", "/about", "/terms", "/privacy"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(
          cookies: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );

  // Use getUser instead of getSession for secure auth validation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if the route requires authentication
  const path = request.nextUrl.pathname;
  const isPublicRoute =
    publicRoutes.includes(path) ||
    path.startsWith("/_next") ||
    path.includes("/favicon.ico") ||
    /\.(svg|png|jpg|jpeg|gif|webp)$/.test(path);

  // Redirect to sign-in if the route requires authentication and user is not logged in
  if (!isPublicRoute && !user) {
    const redirectUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if the user is authenticated and trying to access the sign-in page
  if (path === "/sign-in" && user) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Exclude static files, images, and favicon
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
