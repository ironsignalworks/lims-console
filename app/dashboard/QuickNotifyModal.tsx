"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { accentBtn, dashboardTokens, drawerForm } from "./dashboardTheme";

export type NotifyPreset = {
  title: string;
  /** Email defaults */
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  /** Slack defaults */
  slackChannel: string;
  slackText: string;
};

const SLACK_CHANNELS = [
  { id: "genomics-alerts", label: "#genomics-alerts" },
  { id: "qc-review", label: "#qc-review" },
  { id: "lab-general", label: "#lab-general" },
  { id: "weekly-digest", label: "#weekly-digest" },
];

export function QuickNotifyModal({
  preset,
  onClose,
  lightMode,
}: {
  preset: NotifyPreset;
  onClose: () => void;
  lightMode: boolean;
}) {
  const th = useMemo(() => dashboardTokens(lightMode), [lightMode]);
  const df = useMemo(() => drawerForm(lightMode), [lightMode]);

  const [tab, setTab] = useState<"email" | "slack">("email");
  const [emailTo, setEmailTo] = useState(preset.emailTo);
  const [emailSubject, setEmailSubject] = useState(preset.emailSubject);
  const [emailBody, setEmailBody] = useState(preset.emailBody);
  const [slackChannel, setSlackChannel] = useState(preset.slackChannel);
  const [slackText, setSlackText] = useState(preset.slackText);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSend = useCallback(() => {
    if (tab === "email" && (!emailTo.trim() || !emailSubject.trim())) return;
    if (tab === "slack" && !slackText.trim()) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      window.setTimeout(onClose, 900);
    }, 850);
  }, [tab, emailTo, emailSubject, slackText, onClose]);

  const tabBtn = (id: "email" | "slack", label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === id ? th.pillActive : th.pillInactive}`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qn-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className={`absolute inset-0 ${lightMode ? "bg-slate-900/25" : "bg-slate-950/45"} backdrop-blur-[3px] border-0 cursor-default w-full h-full`}
        aria-label="Close notification"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={overlayRef}
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-[drawerIn_0.18s_ease-out] font-sans ${
          lightMode
            ? "border-slate-200 bg-white"
            : "border-white/[.10] bg-[#222c3a]"
        }`}
      >
        <style>{`@keyframes drawerIn { from { transform: translateY(8px); opacity: 0.9; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Header */}
        <div className={`flex items-start justify-between gap-3 p-4 border-b ${lightMode ? "border-slate-200" : "border-white/[.07]"}`}>
          <div>
            <p className={`text-xs font-medium tracking-wide ${th.accentText} mb-0.5`}>Quick notify</p>
            <h2 id="qn-title" className={`text-sm font-semibold ${lightMode ? "text-slate-900" : "text-white"}`}>
              {preset.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
              lightMode
                ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                : "border-white/[.12] text-zinc-400 hover:bg-white/[.06]"
            }`}
          >
            Esc
          </button>
        </div>

        {/* Tab strip */}
        <div className={`px-4 pt-3 pb-2 border-b ${lightMode ? "border-slate-100" : "border-white/[.05]"}`}>
          <div className={`${th.pillToggleWrap} self-start`}>
            {tabBtn("email", "✉ Email")}
            {tabBtn("slack", "# Slack")}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {tab === "email" && (
            <>
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>To</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className={df.inputMt}
                  placeholder="recipient@lab.pt"
                />
              </div>
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={df.inputMt}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  className={df.textarea}
                  aria-label="Email body"
                  placeholder="Email body…"
                />
              </div>
            </>
          )}

          {tab === "slack" && (
            <>
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Channel</label>
                <select
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  className={df.select + " w-full mt-1"}
                  aria-label="Slack channel"
                >
                  {SLACK_CHANNELS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Message</label>
                <textarea
                  value={slackText}
                  onChange={(e) => setSlackText(e.target.value)}
                  rows={5}
                  className={df.textarea}
                  aria-label="Slack message"
                  placeholder="Slack message…"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between gap-3 px-4 py-3 border-t ${lightMode ? "border-slate-200 bg-slate-50" : "border-white/[.07] bg-[#1a2332]"}`}>
          <span className={`text-[10px] font-mono ${th.footNote}`}>Simulated · no real message sent</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={th.secondaryBtn}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || sent}
              className={`${accentBtn} disabled:opacity-60`}
            >
              {sent ? (
                "✓ Sent"
              ) : sending ? (
                <>
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-[#0d7377]/40 border-t-[#0d7377] animate-spin" />
                  Sending…
                </>
              ) : (
                tab === "email" ? "Send email" : "Post to Slack"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
