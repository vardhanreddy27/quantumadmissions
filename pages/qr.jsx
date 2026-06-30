import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCheckCircle, FaRedo, FaQrcode, FaSpinner, FaWhatsapp, FaPlug } from "react-icons/fa";
import { withAuthPage } from "@/lib/withAuthPage";

export const getServerSideProps = withAuthPage({ path: "/qr" });

const POLL_INTERVAL = 4000;

export default function QrPage() {
  // "idle" makes no API/DB calls at all. Polling only happens while
  // "connecting", and it stops itself on success, error, or Cancel.
  const [phase, setPhase] = useState("idle");
  const [qrState, setQrState] = useState({
    ready: false,
    qrImage: "",
    lastError: "",
  });
  const [busy, setBusy] = useState(false);
  const activeRef = useRef(false);

  const fetchState = useCallback(async (action) => {
    const response = await fetch("/api/whatsapp/qr", {
      method: action ? "POST" : "GET",
      headers: action ? { "Content-Type": "application/json" } : undefined,
      body: action ? JSON.stringify({ action }) : undefined,
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to load WhatsApp status");
    }

    return data.data;
  }, []);

  const stopPolling = useCallback(() => {
    activeRef.current = false;
  }, []);

  const startPolling = useCallback(
    async (action) => {
      activeRef.current = true;
      setBusy(true);
      setQrState((current) => ({ ...current, lastError: "" }));

      try {
        let result = await fetchState(action);
        setQrState({ ready: result.ready, qrImage: result.qrImage, lastError: "" });

        while (activeRef.current && !result.ready) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

          if (!activeRef.current) break;

          result = await fetchState();
          setQrState({ ready: result.ready, qrImage: result.qrImage, lastError: "" });
        }

        if (result.ready) {
          setPhase("connected");
        }
      } catch (error) {
        setQrState((current) => ({
          ...current,
          lastError: error.message || "Unable to connect WhatsApp",
        }));
        setPhase("idle");
      } finally {
        activeRef.current = false;
        setBusy(false);
      }
    },
    [fetchState]
  );

  useEffect(() => stopPolling, [stopPolling]);

  function handleConnect() {
    setPhase("connecting");
    startPolling();
  }

  function handleRestart() {
    setPhase("connecting");
    startPolling("restart");
  }

  function handleCancel() {
    stopPolling();
    setBusy(false);
    setPhase("idle");
  }

  const status = useMemo(() => {
    if (phase === "connected") {
      return {
        label: "Connected",
        text: "WhatsApp is connected and ready to send messages.",
        tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: FaCheckCircle,
      };
    }

    if (qrState.qrImage) {
      return {
        label: "Scan QR",
        text: "Open WhatsApp on your phone, tap Linked Devices, and scan this code.",
        tone: "border-sky-200 bg-sky-50 text-sky-700",
        icon: FaQrcode,
      };
    }

    if (phase === "connecting") {
      return {
        label: "Starting",
        text: "Starting the WhatsApp connection. The QR code will appear here shortly.",
        tone: "border-amber-200 bg-amber-50 text-amber-700",
        icon: FaSpinner,
      };
    }

    return {
      label: "Not connected",
      text: "Click Connect WhatsApp below to generate a QR code.",
      tone: "border-slate-200 bg-slate-50 text-slate-600",
      icon: FaPlug,
    };
  }, [phase, qrState.qrImage]);

  const StatusIcon = status.icon;

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                QR Connect
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">
                Connect WhatsApp
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Scan the QR code to link the school WhatsApp account for communication.
              </p>
            </div>

            {phase === "connecting" ? (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
            ) : phase === "connected" ? (
              <button
                type="button"
                onClick={handleRestart}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaRedo />
                Connect a different phone
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaWhatsapp />
                Connect WhatsApp
              </button>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`rounded-2xl border px-4 py-3 ${status.tone}`}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-white/80 p-3 shadow-sm">
                  <StatusIcon className={phase === "connecting" && !qrState.qrImage ? "animate-spin" : ""} />
                </span>
                <div>
                  <p className="font-bold">{status.label}</p>
                  <p className="mt-1 text-sm leading-6">{status.text}</p>
                </div>
              </div>
            </div>

            {qrState.lastError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {qrState.lastError}
              </div>
            ) : null}

            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  1
                </span>
                <p>Click Connect WhatsApp, then open WhatsApp on the phone that should be used by the school.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  2
                </span>
                <p>Go to Linked Devices and choose Link a Device.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  3
                </span>
                <p>Scan the QR code on this page and wait for the connected status.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
              {phase === "connected" ? (
                <div className="text-center">
                  <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <FaWhatsapp className="text-4xl" />
                  </span>
                  <h2 className="mt-5 text-2xl font-black text-slate-900">WhatsApp connected</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    The linked session is active. No need to keep this page open.
                  </p>
                </div>
              ) : qrState.qrImage ? (
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrState.qrImage}
                    alt="WhatsApp connection QR code"
                    className="mx-auto h-80 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  />
                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    This code refreshes automatically if WhatsApp sends a new one.
                  </p>
                </div>
              ) : phase === "connecting" ? (
                <div className="text-center text-slate-600">
                  <FaSpinner className="mx-auto text-4xl text-primary animate-spin" />
                  <p className="mt-4 text-sm font-semibold">
                    Preparing QR code...
                  </p>
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <FaPlug className="mx-auto text-4xl" />
                  <p className="mt-4 text-sm font-semibold">
                    Not connected yet. Click Connect WhatsApp to begin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
