/* eslint-disable no-unused-vars */
import React from "react";
import Logo from "../assets/Logo.png";
import Navbar from "../components/common/Navbar";
import Auth from "../components/Auth/Auth";

const Verification = () => {
  return (
    <div>
      <Navbar
        Logo={Logo}
        Language={"English"}
        showHelp={true}
        showLanguage={true}
        showUser={true}
      />
      <main className="pt-20 md:pt-24">
        <Auth />
      </main>
    </div>
  );
};

export default Verification;
