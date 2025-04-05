import React from "react";
import Image from "next/image";
import Link from "next/link";
import NewPaymentButton from "./NewPaymentButton";
import LogoutButton from "./LogoutButton";
import YourPaymentsButton from "./YourPaymentsButton";
import { FaHome } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";

const Navbar = async () => {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white shadow-md">
      <div className="flex items-center space-x-3">
        <Link className="flex items-center transition-transform hover:scale-105" href="/all">
          <FaMoneyBillTransfer size="24" className="mr-3" />
          <div className="text-xl font-semibold">PayTrack</div>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <YourPaymentsButton />
        <NewPaymentButton />
        <LogoutButton />
      </div>
    </div>
  );
};

export default Navbar;
