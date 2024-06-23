"use server";

import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: number;
  name: string;
}

async function encrypt(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({
    ...payload,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1w")
    .sign(key);
  return token;
}

async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });

    // Check if payload or userId is undefined/null
    if (
      !payload ||
      typeof payload.userId !== "number" ||
      typeof payload.name !== "string"
    ) {
      throw new Error("Invalid JWT payload");
    }

    const sessionPayload: SessionPayload = {
      userId: payload.userId, // Adjust this based on your JWT payload structure
      name: payload.name,
    };
    return sessionPayload;
  } catch (error) {
    return null;
  }
}

function getExpires() {
  return new Date(Date.now() + 7 * 60 * 60 * 24 * 1000);
}

export async function getSession(): Promise<SessionPayload | null> {
  const sessionToken = cookies().get("session")?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}

// Sets a new session cookie with the given payload
export async function setSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  cookies().set({
    name: "session",
    value: token,
    httpOnly: true,
    expires: getExpires(),
  });
}

export async function revokeSession() {
  cookies().set("session", "", { expires: new Date(0) });
}

// export async function updateSession(request: NextRequest) {
//   const session = request.cookies.get("session")?.value;
//   if (!session) return;

//   // Refresh the session so it doesn't expire
// }
