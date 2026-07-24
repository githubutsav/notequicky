import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/auth"

// Parse credentials from individual env vars (cleaner and more reliable)
const rawUrl = process.env.CLOUDINARY_URL || ""
const cleanUrl = rawUrl.startsWith("CLOUDINARY_URL=")
  ? rawUrl.slice("CLOUDINARY_URL=".length)
  : rawUrl

const parsedUrl = cleanUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@/)
const apiKey = parsedUrl?.[1] || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
const apiSecret = parsedUrl?.[2] || ""

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: apiKey,
  api_secret: apiSecret,
})

export async function POST(request: Request) {
  // 🔒 SECURITY: Only authenticated users can request upload signatures
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { paramsToSign } = body

  if (!paramsToSign || typeof paramsToSign !== "object") {
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

  return Response.json({ signature })
}
