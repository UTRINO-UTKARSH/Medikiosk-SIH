/* eslint-disable no-unused-vars */
import React from "react";
import { CircleQuestionMark, CircleUser, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
const Navbar = ({ Logo, LogoTitle = "MediKiosk", Language, HelpText = "Help", UserText = "User", showLanguage, showHelp, showUser, onHelpClick,
  onUserClick,
}) => {
  const {i18n} = useTranslation()
  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "mr", label: "मराठी" } 
  ];
 
  const onLanguageClick = () => {
   const currentLangCode = i18n.resolvedLanguage || i18n.language
   const currentIndex = languages.findIndex(lang=>lang.code == currentLangCode)
   const nextIndex = (currentIndex+1)%languages.length
   i18n.changeLanguage(languages[nextIndex].code);
  }
  const currentLangCode = i18n.resolvedLanguage||i18n.language;
  const currentLangLabel = languages.find(lang => lang.code === currentLangCode)?.label || "English";
  return (
    <div>
      <nav className="fixed top-0 left-0 w-full h-16 md:h-20 shadow-sm z-50 bg-white">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-10">

          <div className="flex items-center gap-2 md:gap-4">
            {Logo && (
              <img
                src={Logo}
                className="block w-9 md:w-12 lg:w-14 h-9 md:h-12 lg:h-14 object-contain shrink-0"
                alt={`${LogoTitle} Logo`}
              />
            )}
            <span className="text-xl md:text-3xl lg:text-4xl font-greet font-bold text-blue-950 leading-none">
              {LogoTitle}
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-8 lg:gap-10 text-sm md:text-base text-gray-700">

            {showLanguage && (
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-blue-950"
                onClick={onLanguageClick}
              >
                <Globe className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                <span className="hidden sm:block font-medium">{currentLangLabel}</span>
              </div>
            )}

            {showHelp && (
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-zinc-950"
                onClick={onHelpClick}
              >
                <CircleQuestionMark className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                <span className="hidden sm:block font-medium">{HelpText}</span>
              </div>
            )}

            {showUser && (
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-zinc-950"
                onClick={onUserClick}
              >
                <CircleUser className="w-6 h-6 md:w-7 md:h-7" />
                <span className="hidden sm:block font-medium">{UserText}</span>
              </div>
            )}

          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;