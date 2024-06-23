import React from "react";
import Image from "next/image";
import Link from "next/link";
// import AuthLinks from "../authLinks/AuthLinks";
import Logo from "@/app/icon.svg";
import NewPaymentButton from "./NewPaymentButton";
import LogoutButton from "./LogoutButton";
import YourPaymentsButton from "./YourPaymentsButton";

const Navbar = async () => {
  return (
    <div className="flex items-center justify-between bg-rose-200 px-6 py-4 text-gray-700">
      <div className="flex items-center space-x-3">
        <Link href="/">
          <div>Bordeaux Payment Tracker</div>
          {/* <Image priority src={Logo} alt="logo" width={30} height={30} /> */}
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        <YourPaymentsButton />
        <NewPaymentButton />
        <LogoutButton />
      </div>
    </div>
  );
};

export default Navbar;
