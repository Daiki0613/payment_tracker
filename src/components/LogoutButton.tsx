"use client";

import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoIosLogOut, IoIosLogIn } from "react-icons/io";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const { session } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    if (session) {
      setIsDialogOpen(true);
    } else {
      router.push("/login");
    }
  };

  const handleConfirmLogout = () => {
    setIsDialogOpen(false);
    router.push("/logout");
  };

  const handleCancelLogout = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleLogoutClick}
        className="mb-0.5 rounded-md px-2 py-2 hover:bg-gray-300 hover:text-gray-800 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title="Logout"
      >
        {session ? <IoIosLogOut size={22} /> : <IoIosLogIn size={22} />}
      </button>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        message="Are you sure you want to logout?"
      />
    </>
  );
};

export default LogoutButton;
