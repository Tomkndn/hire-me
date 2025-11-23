import Link from "next/link";
import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[10] bg-white/70 backdrop-blur-md border-b border-indigo-200 shadow-sm py-3">
  <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto">
    
    {/* Left Section */}
    <div className="flex flex-row gap-4 items-center">
      <Link href={"/dashboard"} className="flex items-center gap-2">
        <p className="px-2 py-1 text-2xl font-bold text-gray-900 select-none">
          Hire
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Me
          </span>
        </p>
      </Link>

      <span className="text-xl font-light text-gray-400 select-none">/</span>

      <div className="my-auto">
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          afterLeaveOrganizationUrl="/dashboard"
          hidePersonal={true}
          appearance={{
            variables: {
              fontSize: "0.9rem",
            },
          }}
        />
      </div>
    </div>

    {/* Right Section */}
    <div className="flex items-center">
      <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
    </div>
  </div>
</div>

  );
}

export default Navbar;
