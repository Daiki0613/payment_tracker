"use client";

import { useCallback, useEffect } from "react";
import { useAuth } from "@/context/authContext";

const LogoutPage = () => {
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      const result = await logout();
      if (!result) {
        console.log("Logout failed");
      }
    } catch {
      console.log("Failing to log out");
    }
  }, [logout]);

  useEffect(() => {
    handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-bold">Logging Out...</h1>
        <button onClick={handleLogout}>Click here if not redirecting...</button>
      </div>
    </div>
  );
};

export default LogoutPage;
