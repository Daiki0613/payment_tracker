"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/auth/actions";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const response = await logout();

        if (response) {
          // Redirect to login page after logout
          router.push("/login");
        } else {
          console.error("Failed to log out");
        }
      } catch (error) {
        console.error("An error occurred while logging out", error);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-bold">Logging Out...</h1>
      </div>
    </div>
  );
};

export default LogoutPage;
