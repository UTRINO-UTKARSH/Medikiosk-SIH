/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect, useCallback } from "react";
import { QrCode, X, Camera } from "lucide-react";
import jsQR from "jsqr";

/**
 * QR Code Scanner
 * The camera view only mounts when the button is clicked — no camera
 * access is requested until then. Video frames are continuously decoded
 * with jsQR; as soon as a code is found, the modal closes and the result
 * (e.g. the summary PDF URL from Parchi) is surfaced/opened.
 */
export default function QrScanner() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);

  const handleResult = (value) => {
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

      {open && <ScannerModal onClose={() => setOpen(false)} onResult={handleResult} />}
    </div>
  );
}

function ScannerModal({ onClose, onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const scanFrameRef = useRef(null); // holds the latest scan function, avoids self-reference

  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // Pulls one frame from the video, runs it through jsQR, and either
  // schedules the next frame or reports a found code. Stored in a ref
  // (rather than called by its own useCallback name) so the recursive
  // requestAnimationFrame call doesn't self-reference the binding.
  useEffect(() => {
    scanFrameRef.current = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          stopStream();
          onResult(code.data);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(() => scanFrameRef.current());
    };
  }, [onResult, stopStream]);

  const startCamera = useCallback(async () => {
    setError(null);
    setReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
      rafRef.current = requestAnimationFrame(() => scanFrameRef.current());
    } catch (err) {
      setError(
        "Camera unavailable. Allow camera access in your browser, or check that a camera is connected."
      );
    }
  }, []);

  useEffect(() => {
    startCamera();
    return stopStream;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
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
            onClick={handleClose}
            aria-label="Close scanner"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative w-full aspect-square bg-slate-900">
          {!error ? (
            <>
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-52 w-52 sm:h-60 sm:w-60 rounded-lg border-2 border-[#2A9D8F]">
                  <div className="absolute -top-0.5 -left-0.5 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-[#2A9D8F]" />
                  <div className="absolute -top-0.5 -right-0.5 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-[#2A9D8F]" />
                  <div className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-[#2A9D8F]" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-[#2A9D8F]" />
                </div>
              </div>
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm text-slate-200">
                  Starting camera…
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <Camera className="h-8 w-8 text-slate-400" />
              <p className="text-sm text-slate-300">{error}</p>
              <button
                onClick={startCamera}
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
  );
}