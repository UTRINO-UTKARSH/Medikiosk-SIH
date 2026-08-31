/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Globe, HelpCircle, UserCircle2 } from "lucide-react";
import { useHospital } from "../context/HospitalContext"; // adjust path as needed

const navItems = [
  { label: "Home", active: true },
  { label: "Download", active: false },
  { label: "Time Table", active: false },
  { label: "Medical History", active: false },
];

const User_nav = () => {
  const { hospitalName, setHospitalName } = useHospital();

  useEffect(() => {
    // Context already has a real name (set right after the QR scan) —
    // nothing to fetch, avoids an unnecessary request + flicker.
    if (hospitalName && hospitalName !== "Loading...") return;

    let isMounted = true;

    const fetchHospital = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/users/hospital", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          console.warn("Failed to fetch hospital:", res.status);
          if (isMounted) setHospitalName("No hospital linked");
          return;
        }

        const data = await res.json();
        const name = data.hospital?.name;

        if (isMounted) {
          setHospitalName(name || "No hospital linked");
        }
      } catch (err) {
        console.error("Could not load hospital name:", err);
        if (isMounted) setHospitalName("No hospital linked");
      }
    };

    fetchHospital();

    return () => {
      isMounted = false;
    };
  }, [hospitalName, setHospitalName]);

  return (
    <aside className="w-64 shrink-0 bg-[#0F1B2D] text-white flex flex-col justify-between h-full">
      <div>
        <div className="px-6 pt-8 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Parchi</h1>
          <p className="text-m text-white/40 mt-1">
            {hospitalName === "Loading..." ? "Loading..." : hospitalName}
          </p>
        </div>

        <nav className="mt-2 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`text-left cursor-pointer px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-3 pb-6 flex flex-col gap-1 border-t border-white/10 pt-4 mx-3">
        <button className="flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">
          <Globe size={16} />
          Language
        </button>
        <button className="flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">
          <HelpCircle size={16} />
          Help
        </button>
        <button className="flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">
          <UserCircle2 size={16} />
          Profile
        </button>
      </div>
    </aside>
  );
};

export default User_nav;