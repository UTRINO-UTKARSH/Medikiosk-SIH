/* eslint-disable no-unused-vars */
import React from "react";
import { CircleHelp, CircleUser, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Navbar = ({ 
  Logo, 
  showLanguage, 
  showHelp, 
  showUser, 
  onHelpClick, 
  onUserClick 
}) => {
  const { i18n, t } = useTranslation();
  
  const languages = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हि" },
    { code: "mr", label: "मरा" }
  ];

  const onLanguageClick = () => {
    const currentLangCode = i18n.resolvedLanguage || i18n.language;
    const currentIndex = languages.findIndex(lang => lang.code === currentLangCode);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex].code);
  };

  const currentLangCode = i18n.resolvedLanguage || i18n.language;
  const currentLangLabel = languages.find(lang => lang.code === currentLangCode)?.label || "EN";

  return (
    <header className="fixed top-0 left-0 w-full h-14 z-50 bg-[#131314]/90 backdrop-blur-md border-b border-[#2d2e30] px-4 md:px-6 flex items-center justify-between shadow-sm">
      
      {/* Left: Logo & App Name */}
      <div className="flex items-center gap-2.5 cursor-pointer">
        {Logo && (
          <img
            src={Logo}
            className="w-7 h-7 object-contain shrink-0"
            alt="Logo"
          />
        )}
        <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
          {t('common.appName') || "Parchi"}
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500"></span>
        </span>
      </div>

      {/* Right: Actions (Compact & Sleek) */}
      <div className="flex items-center gap-2 text-sm text-gray-300">

        {showLanguage && (
          <button
            onClick={onLanguageClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e1f20] hover:bg-[#2d2e30] border border-[#2d2e30] text-gray-300 hover:text-white transition text-xs font-semibold shadow-sm"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{currentLangLabel}</span>
          </button>
        )}

        {showHelp && (
          <button
            onClick={onHelpClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e1f20] hover:bg-[#2d2e30] border border-[#2d2e30] text-gray-300 hover:text-white transition text-xs font-medium shadow-sm"
          >
            <CircleHelp className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="hidden sm:inline">{t('navbar.help') || "Help"}</span>
          </button>
        )}

        {showUser && (
          <Link to='/user-dash'>
            <button
              onClick={onUserClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 text-blue-200 hover:text-white transition text-xs font-medium shadow-sm"
            >
              <CircleUser className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">{t('navbar.user') || "User"}</span>
            </button>
          </Link>
        )}

      </div>
    </header>
  );
};

export default Navbar;