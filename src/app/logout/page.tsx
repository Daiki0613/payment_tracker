"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/authContext";

const LogoutPage = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
    };
    handleLogout();
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-bold">Logging Out...</h1>
      </div>
    </div>
  );
};

export default LogoutPage;
