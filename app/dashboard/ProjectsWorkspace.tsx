"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LAB_LEAD_EMAIL, LAB_LEAD_NAME } from "../labIdentity";
import { accentBtn, dashboardTokens, drawerForm, drawerTokens } from "./dashboardTheme";

const STORAGE_KEY = "genomics-pitch:projects:v1";

export type CollaboratorRole = "owner" | "editor" | "viewer";

export type ProjectCollaborator = {
  id: string;
  email: string;
  role: CollaboratorRole;
  invitedAt: string;
};

export type ProjectRecord = {
  id: string;
  code: string;
  name: string;
  summary: string;
  piName: string;
  tags: string[];
  collaborators: ProjectCollaborator[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

const SEED_PROJECTS: ProjectRecord[] = [
  {
    id: "prj-seed-1",
    code: "PRJ-019",
    name: "TOR pathway rapamycin screen",
    summary: "Diploid cross panel + variant confirmation for TOR1 resistance phenotypes.",
    piName: LAB_LEAD_NAME,
    tags: ["screening", "drug", "diploid"],
    collaborators: [
      {
        id: "col-1",
        email: LAB_LEAD_EMAIL,
        role: "owner",
        invitedAt: "2026-03-12",
      },
      {
        id: "col-2",
        email: "postdoc.chen@fct.unl.pt",
        role: "editor",
        invitedAt: "2026-03-18",
      },
    ],
    archived: false,
    createdAt: "2026-03-12",
    updatedAt: "2026-04-08",
  },
  {
    id: "prj-seed-2",
    code: "PRJ-021",
    name: "ADE2 pigment lineage trace",
    summary: "Colony imaging + VCF linkage for red/white sectoring strains.",
    piName: LAB_LEAD_NAME,
    tags: ["imaging", "ADE2", "lineage"],
    collaborators: [
      {
        id: "col-3",
        email: LAB_LEAD_EMAIL,
        role: "owner",
        invitedAt: "2026-02-01",
      },
    ],
    archived: false,
    createdAt: "2026-02-01",
    updatedAt: "2026-04-01",
  },
  {
    id: "prj-seed-3",
    code: "PRJ-008",
    name: "Legacy fermentation yield (closed)",
    summary: "Historical batch, superseded by PRJ-019 metadata merge.",
    piName: LAB_LEAD_NAME,
    tags: ["archive", "fermentation"],
    collaborators: [],
    archived: true,
    createdAt: "2025-09-10",
    updatedAt: "2026-01-15",
  },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nextProjectCode(projects: ProjectRecord[]): string {
  let max = 0;
  for (const p of projects) {
    const m = /^PRJ-(\d+)$/i.exec(p.code.trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `PRJ-${String(max + 1).padStart(3, "0")}`;
}

function loadFromStorage(): ProjectRecord[] {
  if (typeof window === "undefined") return SEED_PROJECTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_PROJECTS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SEED_PROJECTS;
    return parsed as ProjectRecord[];
  } catch {
    return SEED_PROJECTS;
  }
}

function ProjectDrawer({
  project,
  onClose,
  onSave,
  lightMode,
}: {
  project: ProjectRecord;
  onClose: () => void;
  onSave: (next: ProjectRecord) => void;
  lightMode: boolean;
}) {
  const [name, setName] = useState(project.name);
  const [summary, setSummary] = useState(project.summary);
  const [piName, setPiName] = useState(project.piName);
  const [tagsRaw, setTagsRaw] = useState(project.tags.join(", "));
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>("viewer");
  const [collaborators, setCollaborators] = useState(project.collaborators);
  const [archived, setArchived] = useState(project.archived);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const persist = useCallback(() => {
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const now = new Date().toISOString().slice(0, 10);
    onSave({
      ...project,
      name: name.trim() || project.name,
      summary: summary.trim(),
      piName: piName.trim() || project.piName,
      tags,
      collaborators,
      archived,
      updatedAt: now,
    });
  }, [project, name, summary, piName, tagsRaw, collaborators, archived, onSave]);

  const th = dashboardTokens(lightMode);
  const dr = drawerTokens(lightMode);
  const df = drawerForm(lightMode);

  const addCollaborator = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (collaborators.some((c) => c.email.toLowerCase() === email)) {
      setInviteEmail("");
      return;
    }
    setCollaborators((prev) => [
      ...prev,
      {
        id: uid("col"),
        email,
        role: inviteRole,
        invitedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setInviteEmail("");
  };

  const removeCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const changeRole = (id: string, role: CollaboratorRole) => {
    setCollaborators((prev) => prev.map((c) => (c.id === id ? { ...c, role } : c)));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="project-drawer-title">
      <button
        type="button"
        className={`absolute inset-0 ${lightMode ? "bg-slate-900/25" : "bg-slate-950/45"} backdrop-blur-[2px] border-0 cursor-default`}
        aria-label="Close project"
        onClick={onClose}
      />
      <div className={dr.panel}>
        <style>{`@keyframes drawerIn { from { transform: translateX(12px); opacity: 0.92; } to { transform: translateX(0); opacity: 1; } }`}</style>
        <div className={`shrink-0 p-5 ${dr.headerBorder} flex items-start justify-between gap-3`}>
          <div className="min-w-0">
            <p className={`text-xs font-medium tracking-wide ${dr.kicker} mb-1`}>Project record</p>
            <h2 id="project-drawer-title" className={`text-xl font-mono ${dr.title} truncate`}>
              {project.code}
            </h2>
            <span
              className={`inline-flex mt-2 text-xs font-medium tracking-wide px-2 py-1 rounded border ${
                archived
                  ? lightMode
                    ? "bg-slate-200 text-slate-700 border-slate-300"
                    : "bg-zinc-500/15 text-zinc-400 border-zinc-500/25"
                  : lightMode
                    ? "bg-[#0d7377]/10 text-[#0d7377] border-[#0d7377]/20"
                    : "bg-[#0d7377]/15 text-[#5eead4] border-[#0d7377]/25"
              }`}
            >
              {archived ? "Archived" : "Active"}
            </span>
          </div>
          <button type="button" onClick={onClose} className={dr.escBtn}>
            Esc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          <section className="space-y-3">
            <h3 className={dr.sectionTitlePlain}>Attributes</h3>
            <label className="block text-xs">
              <span className={df.labelMono}>name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={df.inputMt} />
            </label>
            <label className="block text-xs">
              <span className={df.labelMono}>lab_lead</span>
              <input value={piName} onChange={(e) => setPiName(e.target.value)} className={df.inputMt} />
            </label>
            <label className="block text-xs">
              <span className={df.labelMono}>summary</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className={df.textarea}
              />
            </label>
            <label className="block text-xs">
              <span className={df.labelMono}>tags (comma-separated)</span>
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="e.g. screening, diploid"
                className={df.inputMt}
              />
            </label>
            <p className={`text-xs ${df.metaLine}`}>
              created {project.createdAt} · updated {project.updatedAt}
            </p>
          </section>

          <section>
            <h3 className={dr.sectionTitle}>Collaborators</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@institution.edu"
                className={`flex-1 ${df.input}`}
              />
              <select
                aria-label="Role for new collaborator"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                className={df.select}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
              <button
                type="button"
                onClick={addCollaborator}
                className={`${accentBtn} px-3 whitespace-nowrap`}
              >
                Invite
              </button>
            </div>
            <ul className={df.listWrap}>
              {collaborators.length === 0 ? (
                <li className={df.emptyHint}>No collaborators yet; invite by email.</li>
              ) : (
                collaborators.map((c) => (
                  <li
                    key={c.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-2 text-xs ${df.listRowBorder} pb-2 last:pb-0`}
                  >
                    <span className={df.emailText}>{c.email}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        aria-label={`Access role for ${c.email}`}
                        value={c.role}
                        onChange={(e) => changeRole(c.id, e.target.value as CollaboratorRole)}
                        className={df.selectSm}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCollaborator(c.id)}
                        className={df.removeLink}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className={dr.sectionTitlePlain}>Lifecycle</h3>
            <label className={`flex items-center gap-2 ${df.lifecycle} cursor-pointer`}>
              <input
                type="checkbox"
                checked={archived}
                onChange={(e) => setArchived(e.target.checked)}
                className={df.checkbox}
              />
              Archive project (hidden from default list; strains can still reference code)
            </label>
          </section>
        </div>

        <div className={df.footer}>
          <button type="button" onClick={onClose} className={th.secondaryBtn}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              persist();
              onClose();
            }}
            className={accentBtn}
          >
            Save to project log
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsWorkspace({ lightMode = false }: { lightMode?: boolean }) {
  const th = useMemo(() => dashboardTokens(lightMode), [lightMode]);
  const pf = useMemo(() => drawerForm(lightMode), [lightMode]);
  const [projects, setProjects] = useState<ProjectRecord[]>(SEED_PROJECTS);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSummary, setNewSummary] = useState("");

  useEffect(() => {
    setProjects(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      /* quota or private mode */
    }
  }, [projects, hydrated]);

  const upsert = useCallback((record: ProjectRecord) => {
    setProjects((prev) => {
      const i = prev.findIndex((p) => p.id === record.id);
      if (i === -1) return [record, ...prev];
      const next = [...prev];
      next[i] = record;
      return next;
    });
  }, []);

  const createProject = () => {
    const name = newName.trim();
    if (!name) return;
    const today = new Date().toISOString().slice(0, 10);
    setProjects((prev) => {
      const code = nextProjectCode(prev);
      const rec: ProjectRecord = {
        id: uid("prj"),
        code,
        name,
        summary: newSummary.trim(),
        piName: "– assign in record",
        tags: [],
        collaborators: [],
        archived: false,
        createdAt: today,
        updatedAt: today,
      };
      return [rec, ...prev];
    });
    setNewName("");
    setNewSummary("");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter === "active" && p.archived) return false;
      if (filter === "archived" && !p.archived) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.piName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.summary.toLowerCase().includes(q)
      );
    });
  }, [projects, filter, search]);

  const openProject = useMemo(() => (openId ? projects.find((p) => p.id === openId) ?? null : null), [openId, projects]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className={`text-sm ${th.bodyText} leading-relaxed`}>
          Log and curate lab projects in a lightweight project database. Each project gets a stable{" "}
          <span className={`${lightMode ? "text-slate-800" : "text-zinc-300"} font-mono`}>PRJ-###</span> code for
          LIMS cross-links, collaborator access roles, and archival when work wraps. Data persists in this browser via{" "}
          <span className={`font-mono ${th.kpiLabel}`}>localStorage</span> (demo; wire to your API in production).
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${th.panel}`}>
          <div className={`p-4 ${th.panelSectionBorder} flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between`}>
            <div>
              <p className={`${th.accentLabel} mb-1`}>Project registry</p>
              <p className={`text-sm ${th.bodyTextSoft}`}>
                {filtered.length} shown · {projects.length} total
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={th.pillToggleWrap}>
                {(["active", "archived", "all"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                      filter === f ? th.pillActive : th.pillInactive
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <label className="w-full sm:w-56">
                <span className="sr-only">Search projects</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, code, lab lead…"
                  className={`${pf.input} text-xs`}
                />
              </label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={th.tableHead}>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">PI</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Team</th>
                  <th className="px-4 py-3 font-medium text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className={th.tableRowPlain}>
                    <td className={`px-4 py-3 font-mono ${th.accentText}`}>{p.code}</td>
                    <td className="px-4 py-3">
                      <span className={`${th.strainId} font-medium`}>{p.name}</span>
                      {p.archived && (
                        <span
                          className={`ml-2 text-xs font-mono uppercase ${th.bodyTextSoft} border ${lightMode ? "border-slate-300" : "border-zinc-600/40"} rounded px-1.5 py-0.5`}
                        >
                          archived
                        </span>
                      )}
                      <p className={`text-xs ${th.bodyTextSoft} mt-1 line-clamp-2 max-w-md`}>{p.summary || "–"}</p>
                    </td>
                    <td className={`px-4 py-3 ${th.strainMuted} hidden md:table-cell`}>{p.piName}</td>
                    <td className={`px-4 py-3 ${th.strainMeta} hidden sm:table-cell whitespace-nowrap`}>
                      {p.collaborators.length} invited
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setOpenId(p.id)}
                        className={`text-xs font-mono ${th.accentText} hover:underline`}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className={`p-8 text-center text-sm ${th.bodyTextSoft}`}>No projects match this view.</p>
          )}
        </div>

        <div className={`${th.kpiCard} flex flex-col gap-3 h-fit`}>
          <p className={th.accentLabel}>New project</p>
          <label className="text-xs">
            <span className={pf.labelMono}>Title</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. HAP1 regulatory network"
              className={pf.inputMt}
            />
          </label>
          <label className="text-xs">
            <span className={pf.labelMono}>Summary (optional)</span>
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              rows={3}
              placeholder="One-line scope for the registry…"
              className={pf.textarea}
            />
          </label>
          <button
            type="button"
            onClick={createProject}
            className={`${accentBtn} mt-1 py-2.5`}
          >
            Create &amp; assign code
          </button>
          <p className={`text-xs ${th.footNote} leading-relaxed`}>
            Codes auto-increment from existing <span className="font-mono">PRJ-###</span> values. Edit lab lead, tags,
            and collaborators after creation.
          </p>
        </div>
      </div>

      <p className={`text-xs ${th.footNote} font-mono text-center`}>
        Project log {hydrated ? "synced to this browser" : "loading…"}; replace with Postgres / org SSO when backend lands.
      </p>

      {openProject ? (
        <ProjectDrawer
          key={openProject.id}
          project={openProject}
          lightMode={lightMode}
          onClose={() => setOpenId(null)}
          onSave={(next) => {
            upsert(next);
            setOpenId(null);
          }}
        />
      ) : null}
    </div>
  );
}
