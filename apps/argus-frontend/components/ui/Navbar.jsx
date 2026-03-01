"use client";

import React from "react";
import { RiNextjsFill } from "react-icons/ri";
import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="z-50 top-6 left-1/2 -translate-x-1/2 fixed flex items-center gap-5 py-2 px-4 rounded-full bg-black/60 backdrop-blur-lg border border-ternary/50">

            <Link href="/">
                <RiNextjsFill className="text-4xl text-white hover:scale-110 transition-transform" />
            </Link>

            <Link href="/" className="hover:text-gray-300 transition-colors">
                Features
            </Link>

            <Link href="/" className="hover:text-gray-300 transition-colors">
                Contact
            </Link>

        </nav>
    );
};

export default Navbar;