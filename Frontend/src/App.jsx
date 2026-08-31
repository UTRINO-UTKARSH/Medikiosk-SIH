import React from 'react';
import { 
  History, 
  Pencil, 
  FileText, 
  Image as ImageIcon, 
  File, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

const ReviewDoc = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-3xl flex flex-col gap-6 md:gap-8">
        
        {/* Header Section */}
        <header className="flex flex-col gap-2 mb-2">
          <h1 className="text-3xl md:text-[40px] font-bold text-slate-900 leading-tight">
            Let's check your information
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed">
            Please review your details below. You can change any information before sending it to your doctor.
          </p>
        </header>

        {/* Medical History Section */}
        <section className="bg-gray-100 rounded-3xl p-5 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <History className="w-7 h-7 md:w-8 md:h-8 text-blue-950" strokeWidth={2.5} />
              <h2 className="text-2xl md:text-3xl font-bold text-blue-950">
                Medical History
              </h2>
            </div>
            <button className="flex items-center gap-2 border-2 border-gray-400 text-slate-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Change</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold tracking-wider text-gray-600 uppercase">
                Previous Conditions
              </span>
              <span className="text-lg text-slate-800">
                Diabetes
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold tracking-wider text-gray-600 uppercase">
                Current Medicines
              </span>
              <span className="text-lg text-slate-800">
                Metformin
              </span>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section className="bg-gray-100 rounded-3xl p-5 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7 md:w-8 md:h-8 text-blue-950" strokeWidth={2.5} />
              <h2 className="text-2xl md:text-3xl font-bold text-blue-950">
                Documents
              </h2>
            </div>
            <button className="flex items-center gap-2 border-2 border-gray-400 text-slate-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Change</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              {/* Document Icon Box 1 */}
              <div className="w-14 h-14 bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm">
                <ImageIcon className="w-6 h-6 text-blue-950" strokeWidth={2.5} />
              </div>
              {/* Document Icon Box 2 */}
              <div className="w-14 h-14 bg-white border border-gray-300 rounded-xl flex items-center justify-center shadow-sm">
                <File className="w-6 h-6 text-blue-950" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-gray-700 font-medium ml-2">
              2 items added
            </span>
          </div>
        </section>

        {/* Confirmation & Submission Section */}
        <section className="bg-gray-100 rounded-3xl p-6 md:p-10 flex flex-col items-center mt-2">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
            <span className="text-lg md:text-xl text-slate-800 font-medium">
              Everything looks correct
            </span>
          </div>
          
          <button className="w-full max-w-[400px] bg-[#0A192F] hover:bg-[#061020] text-white py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg group">
            <span className="text-xl font-semibold">Next</span>
            <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

      </div>
    </div>
  );
};

export default ReviewDoc;