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
        className={`flex items-center rounded-full px-4 py-2 transition-all hover:shadow-lg focus:outline-none ${
          session 
            ? "bg-white bg-opacity-10 text-white hover:bg-opacity-20" 
            : "bg-white text-indigo-600 hover:bg-opacity-90"
        }`}
        title={session ? "Logout" : "Login"}
      >
        {session ? (
          <>
            <IoIosLogOut size={20} className="mr-2" />
            <span className="font-medium">Logout</span>
          </>
        ) : (
          <>
            <IoIosLogIn size={20} className="mr-2" />
            <span className="font-medium">Login</span>
          </>
        )}
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
