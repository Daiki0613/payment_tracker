"use client";
import { useRouter } from "next/navigation";
import { CiCirclePlus } from "react-icons/ci";

const NewPaymentButton: React.FC = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/new")}
      className="mb-0.5 rounded-md px-2 py-2 hover:bg-gray-300 hover:text-gray-800 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-200"
      title="About"
    >
      <CiCirclePlus size={22} />
    </button>
    // <a href="/about">
    //   <FaBook size={24} />
    // </a>
  );
};

export default NewPaymentButton;
