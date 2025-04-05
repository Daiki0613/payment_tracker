import Link from "next/link";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="mb-6 flex items-center md:mb-0">
            <FaMoneyBillTransfer size={24} className="mr-3 text-indigo-400" />
            <span className="text-xl font-semibold text-white">PayTrack</span>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-indigo-400 transition-colors">
              <FaGithub size={20} />
            </Link>
            <Link href="#" className="hover:text-indigo-400 transition-colors">
              <FaTwitter size={20} />
            </Link>
            <Link href="#" className="hover:text-indigo-400 transition-colors">
              <FaLinkedin size={20} />
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} PayTrack. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="#" className="text-sm hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:text-indigo-400 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
