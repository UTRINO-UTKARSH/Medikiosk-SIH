/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { FileText, Sparkles, FileUp, Download as DownloadIcon, RefreshCw } from "lucide-react";
import User_nav from "./User_nav"; // <-- Import User_nav

const RecordRow = ({ record, apiUrl }) => {
  const date = record.createdAt
    ? new Date(record.createdAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs transition-all hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F1B2D]/5">
          {record.type === "summary" ? (
            <Sparkles className="h-4 w-4 text-[#0F1B2D]" />
          ) : (
            <FileText className="h-4 w-4 text-[#0F1B2D]" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{record.title}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
      </div>

      <a
        href={`${apiUrl}${record.fileUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0F1B2D] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-950 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-1"
      >
        <DownloadIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Download</span>
      </a>
    </div>
  );
};

const Downloads = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [records, setRecords] = useState(null);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    setError(null);
    setRecords(null);
    try {
      const res = await fetch(`${API_URL}/api/records`, { credentials: "include" });
      if (res.status === 401) {
        setError("Please log in to view your downloads.");
        setRecords([]);
        return;
      }
      if (!res.ok) throw new Error("Failed to load records.");
      const data = await res.json();
      setRecords(data.records || []);
    } catch (e) {
      console.error(e);
      setError("Couldn't load your downloads. Please try again.");
      setRecords([]);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const summaries = (records || []).filter((r) => r.type === "summary");
  const documents = (records || []).filter((r) => r.type === "document");

  return (
    <div className="flex h-screen  w-full font-sans bg-[#F7F9F9] overflow-hidden">
      {/* Sidebar Navigation */}
      <User_nav />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl font-semibold text-[#0F1B2D] sm:text-2xl">Medical History</h1>
              <p className="mt-1 text-sm text-slate-500">
                Your AI summaries and uploaded documents, in one place.
              </p>
            </div>
            <button
              onClick={fetchRecords}
              aria-label="Refresh list"
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:w-auto sm:px-3 sm:py-2 sm:text-xs cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {records === null && !error && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-xl border border-slate-200 bg-white" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {/* Empty State */}
          {records && records.length === 0 && !error && (
            <div className="w-full rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm font-medium">Nothing to download yet.</p>
              <p className="text-xs mt-1">
                Generated AI summaries and uploaded documents will show up here.
              </p>
            </div>
          )}

          {/* AI Summaries */}
          {summaries.length > 0 && (
            <section className="mb-8 w-full">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Sparkles className="h-4 w-4" />
                AI Summaries
              </h2>
              <div className="flex flex-col gap-3">
                {summaries.map((record) => (
                  <RecordRow key={record._id} record={record} apiUrl={API_URL} />
                ))}
              </div>
            </section>
          )}

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <section className="w-full">
              <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FileUp className="h-4 w-4" />
                Uploaded Documents
              </h2>
              <div className="flex flex-col gap-3">
                {documents.map((record) => (
                  <RecordRow key={record._id} record={record} apiUrl={API_URL} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Downloads;