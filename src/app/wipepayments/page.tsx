"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/auth/actions"; // Import the change password action
import { deleteExpenses } from "@/prisma/payments";

const ChangePasswordPage = () => {
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");
  if (process.env.NODE_ENV !== "development") {
    return <div>Change Password invalid</div>;
  }

  const handleWipePayments = async () => {
    try {
      // const result = await deleteExpenses();
      // if (result) {
      //   setDeleted(true);
      // } else {
      //   setError("something went wrong");
      // }
    } catch {
      setError("something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-6 rounded bg-white p-8 shadow-md">
        {deleted && <div>Deleted Successfully</div>}
        {error && <div>{error}</div>}
        <div onClick={handleWipePayments}> Delete all payments </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
