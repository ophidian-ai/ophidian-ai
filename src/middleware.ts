import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/meta/|api/chat/|api/email/|api/crm/|api/ads/|api/scan/|api/webhooks/|chat/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js)$).*)",
  ],
}
