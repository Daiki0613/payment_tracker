"use server";

import prisma from "@/prisma/connect";
import bcrypt from "bcrypt";
import { getSession, revokeSession, setSession } from "@/auth/auth";

// Handle the POST request for authentication
export async function login(
  username: string,
  password: string
): Promise<boolean> {
  try {
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: {
        name: username,
      },
    });

    // If user is not found, return a 401 Unauthorized response
    if (!user) {
      return false;
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the password is not valid, return a 401 Unauthorized response
    if (!isPasswordValid) {
      return false;
    }
    await setSession({ userId: user.id, name: user.name });
    return true;
  } catch (error) {
    // Handle any errors and return a 500 Internal Server Error response
    console.error(error);
    return false;
  }
}

export async function logout(): Promise<boolean> {
  try {
    await revokeSession();
    return true;
  } catch {
    return false;
  }
}

export async function signup(
  username: string,
  password: string
): Promise<boolean> {
  try {
    if (process.env.NODE_ENV !== "development") {
      return false;
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        name: username,
      },
    });

    if (existingUser) {
      return false;
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name: username,
        password: hashedPassword,
      },
    });

    return true;
  } catch (error) {
    return false;
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    const userId = (await getSession())?.userId;
    if (!userId) {
      return false;
    }
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return false;
    }

    // Compare the provided old password with the stored hashed password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return false;
    }

    // Hash the new password before storing it
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
