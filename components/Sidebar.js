
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { sidebarIcons } from "@/components/sidebarIcons";

const sidebarLinks = [
  { label: "Admission Form", href: "/" },
  { label: "Parents", href: "/parents" },
  { label: "Students", href: "/students" },
  { label: "Teachers", href: "/teachers" },
  { label: "Talent Hunt", href: "/talent-hunt" },
  { label: "Notice", href: "/notice" },
];

// Maroon-red from logo: #8B1F1F
export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="sticky top-0 h-screen w-84 bg-white shadow-xl flex flex-col p-6 z-20">
      <div className="flex flex-col items-center mb-10">
        <Image
          src="/logo.jpeg"
          alt="Logo"
          width={300}
          height={300}
          priority
        />
      </div>
      <nav className="flex-1 w-full">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = sidebarIcons[link.label];
            const isActive = router.pathname === link.href;
            const isDisabled = link.label === "Teachers" || link.label === "Talent Hunt" || link.label === "Notice";
            return (
              <li key={link.href}>
                {!isDisabled ? (
                  <Link
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors group
                      hover:bg-[#8B1F1F]/10 hover:text-[#8B1F1F]
                      ${isActive ? "bg-[#8B1F1F]/10 text-[#8B1F1F] font-bold" : "text-black"}
                    `}
                  >
                    {Icon && <Icon className={`text-2xl mr-4 ${isActive ? "text-[#8B1F1F]" : "group-hover:text-[#8B1F1F]"}`} />}
                    <span className={`tracking-wide text-base ${isActive ? "text-[#8B1F1F]" : "group-hover:text-[#8B1F1F]"}`}>{link.label}</span>
                  </Link>
                ) : (
                  <span
                    className="flex items-center px-4 py-3 rounded-lg font-medium  cursor-not-allowed select-none "
                  >
                    {Icon && <Icon className="text-2xl mr-4 " />}
                    <span className="tracking-wide text-base">{link.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
