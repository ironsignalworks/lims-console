"use client";

import { useCallback, useMemo, useState } from "react";
import { dashboardTokens, drawerForm } from "./dashboardTheme";

type SlackMessage = {
  id: string;
  channel: string;
  text: string;
  sentAt: string;
  scheduled: boolean;
  scheduledFor?: string;
  status: "sent" | "scheduled" | "failed";
};

type Reminder = {
  id: string;
  text: string;
  dueAt: string;
  channel: string;
  done: boolean;
};

const CHANNELS = [
  { id: "genomics-alerts", label: "#genomics-alerts", desc: "Pipeline run events and QC holds" },
  { id: "lab-general", label: "#lab-general", desc: "General lab announcements" },
  { id: "qc-review", label: "#qc-review", desc: "Strains awaiting manual QC" },
  { id: "weekly-digest", label: "#weekly-digest", desc: "Automated lab summary bot" },
];

const SEED_MESSAGES: SlackMessage[] = [
  {
    id: "slk-001",
    channel: "#genomics-alerts",
    text: "✅ Run RUN-20260411-02 complete — 12 FASTQ pairs, 1 variant of interest. Report attached.",
    sentAt: "2026-04-11 06:50",
    scheduled: false,
    status: "sent",
  },
  {
    id: "slk-002",
    channel: "#qc-review",
    text: "⚠️ QC hold raised for YG-2845 (CDC28 R149G). Temperature curve non-monotonic. Bench repeat required.",
    sentAt: "2026-04-09 14:32",
    scheduled: false,
    status: "sent",
  },
  {
    id: "slk-003",
    channel: "#weekly-digest",
    text: "📊 Weekly digest: 14 runs · 128 strains indexed · Mean Q30 94.2% · 3 open QC holds.",
    sentAt: "2026-04-14 08:00",
    scheduled: true,
    scheduledFor: "2026-04-14 08:00",
    status: "scheduled",
  },
];

const SEED_REMINDERS: Reminder[] = [
  {
    id: "rem-001",
    text: "Review YG-2845 QC hold bench repeat results",
    dueAt: "2026-04-13 10:00",
    channel: "#qc-review",
    done: false,
  },
  {
    id: "rem-002",
    text: "Send run bundle to PI for RUN-20260411-03",
    dueAt: "2026-04-12 17:00",
    channel: "#genomics-alerts",
    done: false,
  },
  {
    id: "rem-003",
    text: "Archive completed Q1 strain records",
    dueAt: "2026-04-11 09:00",
    channel: "#lab-general",
    done: true,
  },
];

const SLACK_TEMPLATES = [
  { id: "run_done", label: "Run complete", text: "✅ Run {{run_id}} complete — {{files}} FASTQ pairs processed. Variant report ready in LIMS." },
  { id: "qc_hold", label: "QC hold alert", text: "⚠️ QC hold raised for {{strain_id}}. Reason: {{reason}}. Manual review required." },
  { id: "digest", label: "Weekly digest", text: "📊 Weekly digest: {{runs}} runs · {{strains}} strains indexed · Mean Q30 {{q30}}% · {{holds}} open QC holds." },
  { id: "custom", label: "Custom message", text: "" },
];

function SlackStatusPill({ status }: { status: SlackMessage["status"] }) {
  const map = {
    sent: "border-[#39d98a]/30 text-[#39d98a] bg-[#39d98a]/10",
    scheduled: "border-sky-500/30 text-sky-300 bg-sky-500/10",
    failed: "border-red-500/30 text-red-400 bg-red-500/10",
  } as const;
  return (
    <span className={`inline-flex text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${map[status]}`}>
      {status}
    </span>
  );
}

export function SlackPanel({ lightMode }: { lightMode: boolean }) {
  const th = useMemo(() => dashboardTokens(lightMode), [lightMode]);
  const df = useMemo(() => drawerForm(lightMode), [lightMode]);

  const [activeTab, setActiveTab] = useState<"notify" | "schedule" | "reminders">("notify");

  // Notify tab state
  const [notifyChannel, setNotifyChannel] = useState("genomics-alerts");
  const [templateId, setTemplateId] = useState("run_done");
  const [notifyText, setNotifyText] = useState(SLACK_TEMPLATES[0].text);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [messageLog, setMessageLog] = useState<SlackMessage[]>(SEED_MESSAGES);

  // Schedule tab state
  const [schedChannel, setSchedChannel] = useState("weekly-digest");
  const [schedText, setSchedText] = useState("");
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("08:00");
  const [scheduling, setScheduling] = useState(false);

  // Reminders tab state
  const [reminders, setReminders] = useState<Reminder[]>(SEED_REMINDERS);
  const [newRemText, setNewRemText] = useState("");
  const [newRemDue, setNewRemDue] = useState("");
  const [newRemTime, setNewRemTime] = useState("09:00");
  const [newRemChannel, setNewRemChannel] = useState("genomics-alerts");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const applyTemplate = useCallback((id: string) => {
    setTemplateId(id);
    const tpl = SLACK_TEMPLATES.find((t) => t.id === id);
    if (tpl) setNotifyText(tpl.text);
  }, []);

  const handleSendNotification = useCallback(() => {
    if (!notifyText.trim()) {
      showToast("Message text is required.");
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      const now = new Date();
      const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const channelLabel = CHANNELS.find((c) => c.id === notifyChannel)?.label ?? `#${notifyChannel}`;
      setMessageLog((prev) => [
        { id: `slk-${Date.now()}`, channel: channelLabel, text: notifyText.trim(), sentAt: ts, scheduled: false, status: "sent" },
        ...prev,
      ]);
      showToast(`Notification posted to ${channelLabel}`);
    }, 900);
  }, [notifyText, notifyChannel, showToast]);

  const handleSchedule = useCallback(() => {
    if (!schedText.trim() || !schedDate) {
      showToast("Message text and date are required.");
      return;
    }
    setScheduling(true);
    window.setTimeout(() => {
      setScheduling(false);
      const channelLabel = CHANNELS.find((c) => c.id === schedChannel)?.label ?? `#${schedChannel}`;
      setMessageLog((prev) => [
        {
          id: `slk-${Date.now()}`,
          channel: channelLabel,
          text: schedText.trim(),
          sentAt: `${schedDate} ${schedTime}`,
          scheduled: true,
          scheduledFor: `${schedDate} ${schedTime}`,
          status: "scheduled",
        },
        ...prev,
      ]);
      setSchedText("");
      setSchedDate("");
      showToast(`Message scheduled for ${schedDate} ${schedTime} in ${channelLabel}`);
    }, 800);
  }, [schedText, schedDate, schedTime, schedChannel, showToast]);

  const addReminder = useCallback(() => {
    if (!newRemText.trim() || !newRemDue) {
      showToast("Reminder text and date are required.");
      return;
    }
    const channelLabel = CHANNELS.find((c) => c.id === newRemChannel)?.label ?? `#${newRemChannel}`;
    setReminders((prev) => [
      {
        id: `rem-${Date.now()}`,
        text: newRemText.trim(),
        dueAt: `${newRemDue} ${newRemTime}`,
        channel: channelLabel,
        done: false,
      },
      ...prev,
    ]);
    setNewRemText("");
    setNewRemDue("");
    showToast("Reminder added");
  }, [newRemText, newRemDue, newRemTime, newRemChannel, showToast]);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  }, []);

  const tabBtn = (id: "notify" | "schedule" | "reminders", label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setActiveTab(id)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === id ? "bg-[#39d98a]/15 text-[#39d98a]" : th.pillInactive}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* API info banner */}
      <div className={`rounded-xl border ${lightMode ? "border-slate-200 bg-slate-50" : "border-white/[.07] bg-white/[.02]"} p-4 flex items-start gap-3`}>
        <span className="text-[#4A154B] text-lg leading-none shrink-0 mt-0.5 bg-white rounded px-1">slack</span>
        <div className="min-w-0">
          <p className={`text-xs font-mono uppercase tracking-widest ${th.accentLabel} mb-1`}>Slack API integration</p>
          <p className={`text-sm ${th.bodyText} leading-relaxed`}>
            Posts notifications to lab Slack channels via the Slack Web API (Bot Token). Used for automated pipeline events, QC alerts, and time-managed digest scheduling. Full message history logged in LIMS.
          </p>
          <p className={`text-xs font-mono mt-2 ${th.footNote}`}>
            Workspace: yeastlab.slack.com · Bot token configured in environment
          </p>
        </div>
      </div>

      {/* Tab strip */}
      <div className={`${th.pillToggleWrap} self-start`}>
        {tabBtn("notify", "Send notification")}
        {tabBtn("schedule", "Schedule message")}
        {tabBtn("reminders", "Reminders")}
      </div>

      {/* ── NOTIFY TAB ── */}
      {activeTab === "notify" && (
        <>
          <div className={th.panel}>
            <div className={`p-4 ${th.panelSectionBorder}`}>
              <p className={th.accentLabel}>Post to channel</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs ${df.labelMono} mb-1`}>Channel</label>
                  <select
                    value={notifyChannel}
                    onChange={(e) => setNotifyChannel(e.target.value)}
                    className={df.select + " w-full mt-1"}
                    aria-label="Slack channel"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <p className={`text-xs ${th.footNote} mt-1`}>
                    {CHANNELS.find((c) => c.id === notifyChannel)?.desc}
                  </p>
                </div>
                <div>
                  <label className={`block text-xs ${df.labelMono} mb-1`}>Template</label>
                  <select
                    value={templateId}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className={df.select + " w-full mt-1"}
                    aria-label="Message template"
                  >
                    {SLACK_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Message</label>
                <textarea
                  value={notifyText}
                  onChange={(e) => setNotifyText(e.target.value)}
                  rows={4}
                  placeholder="Type a message or select a template above…"
                  className={df.textarea}
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#39d98a]/35 bg-[#39d98a]/10 px-5 py-2 text-xs font-semibold text-[#39d98a] hover:bg-[#39d98a]/18 transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <span className="inline-block w-3 h-3 rounded-full border-2 border-[#39d98a]/40 border-t-[#39d98a] animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Slack notification"
                  )}
                </button>
                <span className={`text-xs ${th.footNote} font-mono`}>Simulated · no real message sent</span>
              </div>
            </div>
          </div>

          {/* Message log */}
          <div className={th.panel}>
            <div className={`p-4 ${th.panelSectionBorder} flex items-center justify-between`}>
              <p className={th.accentLabel}>Message log</p>
              <span className={`text-xs font-mono ${th.footNote}`}>{messageLog.length} messages</span>
            </div>
            <ul className={`divide-y ${lightMode ? "divide-slate-100" : "divide-white/[.04]"}`}>
              {messageLog.map((msg) => (
                <li key={msg.id} className={`p-4 flex flex-col gap-1 ${lightMode ? "hover:bg-slate-50" : "hover:bg-white/[.02]"} transition-colors`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm ${lightMode ? "text-slate-900" : "text-white"} flex-1 leading-snug`}>{msg.text}</p>
                    <SlackStatusPill status={msg.status} />
                  </div>
                  <p className={`text-xs font-mono ${th.footNote}`}>
                    {msg.channel} · {msg.scheduled ? `Scheduled for ${msg.scheduledFor}` : `Sent ${msg.sentAt}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* ── SCHEDULE TAB ── */}
      {activeTab === "schedule" && (
        <div className={th.panel}>
          <div className={`p-4 ${th.panelSectionBorder}`}>
            <p className={th.accentLabel}>Schedule future message</p>
            <p className={`text-xs ${th.footNote} mt-1`}>
              Messages are queued and posted at the specified time via the Slack API scheduler.
            </p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={`block text-xs ${df.labelMono} mb-1`}>Channel</label>
              <select
                value={schedChannel}
                onChange={(e) => setSchedChannel(e.target.value)}
                className={df.select + " w-full mt-1"}
                aria-label="Schedule channel"
              >
                {CHANNELS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs ${df.labelMono} mb-1`}>Message</label>
              <textarea
                value={schedText}
                onChange={(e) => setSchedText(e.target.value)}
                rows={4}
                placeholder="e.g. 📊 Weekly digest: 14 runs this week…"
                className={df.textarea}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Date</label>
                <input
                  type="date"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className={df.inputMt}
                  aria-label="Schedule date"
                  title="Schedule date"
                />
              </div>
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Time</label>
                <input
                  type="time"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className={df.inputMt}
                  aria-label="Schedule time"
                  title="Schedule time"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleSchedule}
                disabled={scheduling}
                className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/15 transition-colors disabled:opacity-50"
              >
                {scheduling ? (
                  <>
                    <span className="inline-block w-3 h-3 rounded-full border-2 border-sky-400/40 border-t-sky-300 animate-spin" />
                    Scheduling…
                  </>
                ) : (
                  "Schedule via Slack API"
                )}
              </button>
              <span className={`text-xs ${th.footNote} font-mono`}>Simulated · added to message log</span>
            </div>

            {/* Scheduled messages */}
            {messageLog.filter((m) => m.status === "scheduled").length > 0 && (
              <div>
                <p className={`text-xs font-mono uppercase tracking-widest ${th.accentLabel} mt-4 mb-2`}>Upcoming scheduled</p>
                <ul className={`space-y-2 border ${lightMode ? "border-slate-200 bg-slate-50/80" : "border-white/[.06] bg-white/[.02]"} rounded-xl p-3`}>
                  {messageLog.filter((m) => m.status === "scheduled").map((m) => (
                    <li key={m.id} className={`text-xs ${th.bodyText} border-b ${lightMode ? "border-slate-100 last:border-0" : "border-white/[.04] last:border-0"} pb-2 last:pb-0`}>
                      <span className="font-mono text-sky-400">{m.scheduledFor}</span>
                      {" · "}
                      <span className={`font-mono ${th.footNote}`}>{m.channel}</span>
                      <br />
                      <span className="leading-snug">{m.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REMINDERS TAB ── */}
      {activeTab === "reminders" && (
        <>
          <div className={th.panel}>
            <div className={`p-4 ${th.panelSectionBorder}`}>
              <p className={th.accentLabel}>New reminder</p>
              <p className={`text-xs ${th.footNote} mt-1`}>
                Reminders are posted to the chosen channel at the set time and tracked here.
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-xs ${df.labelMono} mb-1`}>Reminder text</label>
                <input
                  type="text"
                  value={newRemText}
                  onChange={(e) => setNewRemText(e.target.value)}
                  placeholder="e.g. Review YG-2845 QC results"
                  className={df.inputMt}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs ${df.labelMono} mb-1`}>Due date</label>
                  <input
                    type="date"
                    value={newRemDue}
                    onChange={(e) => setNewRemDue(e.target.value)}
                    className={df.inputMt}
                    aria-label="Reminder due date"
                    title="Reminder due date"
                  />
                </div>
                <div>
                  <label className={`block text-xs ${df.labelMono} mb-1`}>Time</label>
                  <input
                    type="time"
                    value={newRemTime}
                    onChange={(e) => setNewRemTime(e.target.value)}
                    className={df.inputMt}
                    aria-label="Reminder time"
                    title="Reminder time"
                  />
                </div>
                <div>
                  <label className={`block text-xs ${df.labelMono} mb-1`}>Channel</label>
                  <select
                    value={newRemChannel}
                    onChange={(e) => setNewRemChannel(e.target.value)}
                    className={df.select + " w-full mt-1"}
                    aria-label="Reminder channel"
                  >
                    {CHANNELS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={addReminder}
                className="inline-flex items-center gap-2 rounded-lg border border-[#39d98a]/35 bg-[#39d98a]/10 px-5 py-2 text-xs font-semibold text-[#39d98a] hover:bg-[#39d98a]/18 transition-colors"
              >
                Add reminder
              </button>
            </div>
          </div>

          {/* Reminders list */}
          <div className={th.panel}>
            <div className={`p-4 ${th.panelSectionBorder} flex items-center justify-between`}>
              <p className={th.accentLabel}>Active reminders</p>
              <span className={`text-xs font-mono ${th.footNote}`}>
                {reminders.filter((r) => !r.done).length} pending
              </span>
            </div>
            <ul className={`divide-y ${lightMode ? "divide-slate-100" : "divide-white/[.04]"}`}>
              {reminders.map((rem) => (
                <li
                  key={rem.id}
                  className={`p-4 flex items-start gap-3 ${lightMode ? "hover:bg-slate-50" : "hover:bg-white/[.02]"} transition-colors`}
                >
                  <button
                    type="button"
                    onClick={() => toggleReminder(rem.id)}
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                      rem.done
                        ? "border-[#39d98a]/50 bg-[#39d98a]/20"
                        : lightMode
                          ? "border-slate-300 bg-white"
                          : "border-white/20 bg-transparent"
                    }`}
                    aria-label={rem.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {rem.done && <span className="text-[#39d98a] text-[10px] leading-none">✓</span>}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${rem.done ? `${th.footNote} line-through` : lightMode ? "text-slate-900" : "text-white"} leading-snug`}>
                      {rem.text}
                    </p>
                    <p className={`text-xs font-mono ${th.footNote} mt-0.5`}>
                      {rem.channel} · due {rem.dueAt}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] rounded-xl border border-[#39d98a]/35 bg-[#0a1a10] px-5 py-3 text-sm font-mono text-[#39d98a] shadow-2xl shadow-black/50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
}
