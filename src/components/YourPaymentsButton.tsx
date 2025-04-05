"use client";
import { useRouter } from "next/navigation";
import { IoReceiptOutline } from "react-icons/io5";

const YourPaymentsButton: React.FC = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("yourpayments")}
      className="flex items-center rounded-full bg-white bg-opacity-10 px-4 py-2 text-white transition-all hover:bg-opacity-20 hover:shadow-lg focus:outline-none"
      title="Your Payments"
    >
      <IoReceiptOutline size={20} className="mr-2" />
      <span className="font-medium">My Payments</span>
    </button>
  );
};

export default YourPaymentsButton;
