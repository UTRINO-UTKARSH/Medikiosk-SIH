import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, X } from "lucide-react";

/**
 * QR Code Scanner
 * Uses @yudiel/react-qr-scanner, which handles camera access and
 * decoding internally — the camera only turns on once the button is
 * clicked and the <Scanner> mounts, and turns off again on close.
 */
export default function QrScanner() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = (detectedCodes) => {
    const value = detectedCodes?.[0]?.rawValue;
    if (!value) return;

    setResult(value);
    setOpen(false);

    // Your Parchi QR encodes the summary PDF URL — open it directly.
    if (/^https?:\/\//i.test(value)) {
      window.open(value, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9F9] p-4">
      {!open && (
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            onClick={() => {
              setResult(null);
              setError(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[#0F2A3D] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#163a52] focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] focus:ring-offset-2"
          >
            <QrCode className="h-4 w-4" />
            Scan QR code
          </button>

          {result && (
            <p className="max-w-xs break-all text-sm text-slate-600">
              Last scan:{" "}
              <span className="font-medium text-[#0F2A3D]">{result}</span>
            </p>
          )}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2A3D]/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Scan QR code"
        >
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#2A9D8F]" />
                <h2 className="text-base font-semibold text-[#0F2A3D]">Scan QR code</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close scanner"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative w-full aspect-square bg-slate-900">
              {!error ? (
                <Scanner
                  onScan={handleScan}
                  onError={(err) =>
                    setError(
                      err?.message ||
                        "Camera unavailable. Allow camera access in your browser."
                    )
                  }
                  constraints={{ facingMode: "environment" }}
                  styles={{
                    container: { width: "100%", height: "100%" },
                    video: { objectFit: "cover" },
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-sm text-slate-300">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-1 rounded-md bg-[#2A9D8F] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#238478]"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-slate-500">Hold the QR code inside the frame.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}