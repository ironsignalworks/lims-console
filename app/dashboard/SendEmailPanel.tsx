"use client";

import { useCallback, useMemo, useState } from "react";
import { LAB_LEAD_EMAIL, LAB_LEAD_NAME } from "../labIdentity";
import { dashboardTokens, drawerForm } from "./dashboardTheme";

type SentEmail = {
  id: string;
  to: string;
  subject: string;
  preview: string;
  sentAt: string;
  status: "sent" | "queued" | "failed";
};

const SEED_SENT: SentEmail[] = [
  {
    id: "em-001",
    to: "pi@yeastlab.pt",
    subject: "Run RUN-20260411-02 · Variant report ready",
    preview: "GATK HaplotypeCaller completed on 12 FASTQ pairs. 1 variant of interest flagged for YG-2841.",
    sentAt: "2026-04-11 06:50",
    status: "sent",
  },
  {
    id: "em-002",
    to: "pi@yeastlab.pt",
    subject: "QC hold · YG-2845 awaiting bench repeat",
    preview: "Temperature curve non-monotonic across replicates. Manual review required before VCF commit.",
    sentAt: "2026-04-09 14:30",
    status: "sent",
  },
  {
    id: "em-003",
    to: "team@yeastlab.pt",
    subject: "Weekly digest · 14 runs, 128 strains indexed",
    preview: "Mean Q30 this week: 94.2%. 3 open QC holds. Full table attached.",
    sentAt: "2026-04-07 08:00",
    status: "sent",
  },
];

const EMAIL_TEMPLATES = [
  { id: "run_complete", label: "Run complete notification", subject: "Run {{run_id}} · Variant report ready", body: "Hi,\n\nRun {{run_id}} has completed successfully.\n\nFiles processed: {{files}} FASTQ pairs\nVariants flagged: {{variants}}\n\nThe full variant report is attached and available in the LIMS console.\n\nRegards,\nYeastGenomics Automation" },
  { id: "qc_hold", label: "QC hold alert", subject: "QC hold · {{strain_id}} awaiting review", body: "Hi,\n\nStrain {{strain_id}} has been placed on QC hold and requires manual review.\n\nReason: {{reason}}\n\nPlease access the LIMS console to review and clear the hold.\n\nRegards,\nYeastGenomics Automation" },
  { id: "weekly_digest", label: "Weekly digest", subject: "Weekly lab digest · {{date}}", body: "Hi team,\n\nWeekly summary for the YeastGenomics pipeline:\n\n• Runs completed: {{runs}}\n• Strains indexed: {{strains}}\n• Mean Q30: {{q30}}%\n• Open QC holds: {{holds}}\n\nFull metrics available in the LIMS console.\n\nRegards,\nYeastGenomics Automation" },
  { id: "custom", label: "Custom message", subject: "", body: "" },
];

function StatusPill({ status }: { status: SentEmail["status"] }) {
  const map = {
    sent: "border-[#39d98a]/30 text-[#39d98a] bg-[#39d98a]/10",
    queued: "border-amber-500/30 text-amber-300 bg-amber-500/10",
    failed: "border-red-500/30 text-red-400 bg-red-500/10",
  } as const;
  return (
    <span className={`inline-flex text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${map[status]}`}>
      {status}
    </span>
  );
}

export function SendEmailPanel({ lightMode }: { lightMode: boolean }) {
  const th = useMemo(() => dashboardTokens(lightMode), [lightMode]);
  const df = useMemo(() => drawerForm(lightMode), [lightMode]);

  const [templateId, setTemplateId] = useState("run_complete");
  const [to, setTo] = useState("pi@yeastlab.pt");
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [body, setBody] = useState(EMAIL_TEMPLATES[0].body);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sentLog, setSentLog] = useState<SentEmail[]>(SEED_SENT);

  const applyTemplate = useCallback((id: string) => {
    setTemplateId(id);
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === id);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const handleSend = useCallback(() => {
    if (!to.trim() || !subject.trim()) {
      showToast("Recipient and subject are required.");
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      const now = new Date();
      const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setSentLog((prev) => [
        {
          id: `em-${Date.now()}`,
          to: to.trim(),
          subject: subject.trim(),
          preview: body.trim().slice(0, 90) + (body.length > 90 ? "…" : ""),
          sentAt: ts,
          status: "sent",
        },
        ...prev,
      ]);
      showToast(`Email queued to ${to.trim()} via Email API`);
    }, 1100);
  }, [to, subject, body, showToast]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* API info banner */}
      <div className={`rounded-xl border ${lightMode ? "border-slate-200 bg-slate-50" : "border-white/[.07] bg-white/[.02]"} p-4 flex items-start gap-3`}>
        <span className="text-[#39d98a] text-lg leading-none shrink-0 mt-0.5">✉</span>
        <div className="min-w-0">
          <p className={`text-xs font-mono uppercase tracking-widest ${th.accentLabel} mb-1`}>Email API integration</p>
          <p className={`text-sm ${th.bodyText} leading-relaxed`}>
            Sends transactional emails via the lab&apos;s Email API (Resend / SendGrid / SMTP). Used for automated run notifications, QC alerts, and periodic digests. In production, triggered by pipeline events.
          </p>
          <p className={`text-xs font-mono mt-2 ${th.footNote}`}>
            From: {LAB_LEAD_NAME} &lt;{LAB_LEAD_EMAIL}&gt; · API endpoint configured in environment
          </p>
        </div>
      </div>

      {/* Compose */}
      <div className={th.panel}>
        <div className={`p-4 ${th.panelSectionBorder}`}>
          <p className={th.accentLabel}>Compose message</p>
        </div>
        <div className="p-4 space-y-4">
          {/* Template */}
          <div>
            <label className={`block text-xs ${df.labelMono} mb-1`}>Template</label>
            <select
              value={templateId}
              onChange={(e) => applyTemplate(e.target.value)}
              className={`${df.select} w-full mt-1`}
              aria-label="Email template"
            >
              {EMAIL_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* To */}
          <div>
            <label className={`block text-xs ${df.labelMono} mb-1`}>To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@lab.pt"
              className={df.inputMt}
            />
          </div>

          {/* Subject */}
          <div>
            <label className={`block text-xs ${df.labelMono} mb-1`}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className={df.inputMt}
            />
          </div>

          {/* Body */}
          <div>
            <label className={`block text-xs ${df.labelMono} mb-1`}>Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              className={df.textarea}
              aria-label="Email body"
              placeholder="Email body…"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg border border-[#39d98a]/35 bg-[#39d98a]/10 px-5 py-2 text-xs font-semibold text-[#39d98a] hover:bg-[#39d98a]/18 transition-colors disabled:opacity-50"
            >
              {sending ? (
                <>
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-[#39d98a]/40 border-t-[#39d98a] animate-spin" />
                  Sending…
                </>
              ) : (
                "Send via Email API"
              )}
            </button>
            <button
              type="button"
              onClick={() => applyTemplate(templateId)}
              className={th.secondaryBtn}
            >
              Reset template
            </button>
            <span className={`text-xs ${th.footNote} font-mono`}>Simulated · no real email sent</span>
          </div>
        </div>
      </div>

      {/* Sent log */}
      <div className={th.panel}>
        <div className={`p-4 ${th.panelSectionBorder} flex items-center justify-between`}>
          <p className={th.accentLabel}>Sent log</p>
          <span className={`text-xs font-mono ${th.footNote}`}>{sentLog.length} messages</span>
        </div>
        <ul className="divide-y divide-white/[.04]">
          {sentLog.map((email) => (
            <li key={email.id} className={`p-4 flex flex-col gap-1 ${lightMode ? "hover:bg-slate-50" : "hover:bg-white/[.02]"} transition-colors`}>
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm font-semibold ${lightMode ? "text-slate-900" : "text-white"} truncate flex-1`}>{email.subject}</p>
                <StatusPill status={email.status} />
              </div>
              <p className={`text-xs font-mono ${th.footNote}`}>To: {email.to} · {email.sentAt}</p>
              <p className={`text-xs ${th.bodyTextSoft} leading-relaxed truncate`}>{email.preview}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] rounded-xl border border-[#39d98a]/35 bg-[#0a1a10] px-5 py-3 text-sm font-mono text-[#39d98a] shadow-2xl shadow-black/50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
