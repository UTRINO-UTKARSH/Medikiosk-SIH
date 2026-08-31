/* eslint-disable no-unused-vars */
import React from "react";
import { Sparkles, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import User_nav from "./User_nav";

const ServiceCard = ({ icon, title, description, cta, onClick }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 flex-1 hover:border-slate-300 transition-colors text-left">
      <div className="w-12 h-12 rounded-xl bg-[#0F1B2D] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
      <button 
        onClick={onClick}
        className="text-sm font-medium text-slate-900 flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer"
      >
        {cta}
        <span aria-hidden>→</span>
      </button>
    </div>
  );
};

const UserDash = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full font-sans bg-slate-50 overflow-hidden">
      <User_nav />

      <main className="flex-1 flex items-center justify-center px-8 overflow-y-auto">
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-3xl font-semibold text-slate-900 mb-3">
            How can we assist you today?
          </h2>
          <p className="text-slate-500 mb-10">
            Select a service to proceed with your patient records or diagnostics.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <ServiceCard
              icon={<Sparkles size={20} className="text-white" />}
              title="AI Summary"
              description="Generate concise, AI-powered overviews of recent consultations and patient history."
              cta="Generate now"
              onClick={() => navigate("/ai")}
            />
            <ServiceCard
              icon={<FlaskConical size={20} className="text-white" />}
              title="Lab Reports"
              description="Access, view, and print recent pathology, radiology, and diagnostic test results."
              cta="View results"
              onClick={() => navigate("/user-reports")}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDash;