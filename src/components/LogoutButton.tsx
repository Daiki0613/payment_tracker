"use client";
import { SessionPayload, getSession } from "@/auth/auth";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoIosLogOut, IoIosLogIn } from "react-icons/io";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  // const [session, setSession] = useState<SessionPayload>();

  const { session } = useAuth();

  // useEffect(() => {
  //   const loadSession = async () => {
  //     const session = await getSession();
  //     if (!session) {
  //       return;
  //     } else {
  //       setSession(session);
  //     }
  //   };
  //   loadSession();
  // }, [router]);

  return (
    <button
      onClick={() => (session ? router.push("/logout") : router.push("/login"))}
      className="mb-0.5 rounded-md px-2 py-2 hover:bg-gray-300 hover:text-gray-800 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-200"
      title="About"
    >
      {session ? <IoIosLogOut size={22} /> : <IoIosLogIn size={22} />}
    </button>
  );
};

export default LogoutButton;
