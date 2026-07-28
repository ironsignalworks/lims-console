"use client";

import { useMemo, useState } from "react";
import { dashboardTokens } from "./dashboardTheme";
import { FAQ_INTRO, FAQ_INTRO_DEMO, FAQ_SECTIONS, FAQ_SHORT_ANSWERS } from "./faqContent";

export function FaqPanel({ lightMode = true }: { lightMode?: boolean }) {
  const th = useMemo(() => dashboardTokens(lightMode), [lightMode]);
  const [openKey, setOpenKey] = useState<string | null>(`${FAQ_SECTIONS[0]?.id}-0`);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className={th.kpiCard}>
        <p className={`text-xs font-medium tracking-wide ${th.kpiLabel} mb-1`}>HELP · FAQ</p>
        <h2 className={`text-lg font-semibold ${th.kpiValue}`}>About this LIMS Console</h2>
        <p className={`text-sm ${th.bodyText} mt-2 leading-relaxed`}>{FAQ_INTRO}</p>
        <p className={`text-sm ${th.bodyText} mt-2 leading-relaxed`}>{FAQ_INTRO_DEMO}</p>
        <p className={`text-xs ${th.footNote} mt-3`}>
          Demo build with simulated data - not connected to live sequencing infrastructure.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FAQ_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#faq-${section.id}`}
            className={th.secondaryBtn}
          >
            {section.title}
          </a>
        ))}
      </div>

      {FAQ_SECTIONS.map((section) => (
        <section key={section.id} id={`faq-${section.id}`} className={th.panel}>
          <div className={`p-4 ${th.panelSectionBorder}`}>
            <p className={th.accentLabel}>{section.title}</p>
            <p className={`text-sm ${th.bodyText} mt-1`}>{section.blurb}</p>
          </div>
          <ul className={lightMode ? "divide-y divide-slate-100" : "divide-y divide-white/[.06]"}>
            {section.items.map((item, idx) => {
              const key = `${section.id}-${idx}`;
              const open = openKey === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenKey(open ? null : key)}
                    className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                      lightMode ? "hover:bg-slate-50" : "hover:bg-white/[.04]"
                    }`}
                  >
                    <span className={`text-sm font-medium ${th.kpiValue}`}>{item.q}</span>
                    <span
                      className={`shrink-0 text-xs font-mono mt-0.5 ${th.bodyTextSoft}`}
                      aria-hidden
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open && (
                    <div className={`px-4 pb-4 text-sm ${th.bodyText} leading-relaxed`}>
                      {Array.isArray(item.a) ? (
                        <ul className="list-disc pl-5 space-y-1.5">
                          {item.a.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{item.a}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className={th.panel}>
        <div className={`p-4 ${th.panelSectionBorder}`}>
          <p className={th.accentLabel}>Short answers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={th.tableHead}>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Answer</th>
              </tr>
            </thead>
            <tbody>
              {FAQ_SHORT_ANSWERS.map((row) => (
                <tr key={row.q} className={th.tableRowPlain}>
                  <td className={`px-4 py-3 ${th.strainId}`}>{row.q}</td>
                  <td className={`px-4 py-3 ${th.strainMuted}`}>{row.a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
