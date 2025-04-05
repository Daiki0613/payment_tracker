"use client";
import { useRouter } from "next/navigation";
import { IoAddCircleOutline } from "react-icons/io5";

const NewPaymentButton: React.FC = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/new")}
      className="flex items-center rounded-full bg-white bg-opacity-20 px-4 py-2 text-white transition-all hover:bg-opacity-30 hover:shadow-lg focus:outline-none"
      title="New Payment"
    >
      <IoAddCircleOutline size={20} className="mr-2" />
      <span className="font-medium">New</span>
    </button>
  );
};

export default NewPaymentButton;
