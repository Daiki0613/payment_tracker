"use client";
import { useRouter } from "next/navigation";
import { IoReceiptOutline } from "react-icons/io5";

const YourPaymentsButton: React.FC = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("yourpayments")}
      className="mb-0.5 rounded-md px-2 py-2 hover:bg-gray-300 hover:text-gray-800 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-200"
      title="Your Payments"
    >
      <IoReceiptOutline size={22} />
    </button>
  );
};

export default YourPaymentsButton;
