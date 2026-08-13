// LIMS database demo catalog + search UI.
let dbSearchScope = 'all';

const LIMS_DB_FILES = [
  { path: 's3://yeast-lims/YG-2841/v4/gatk.filtered.vcf.gz', kind: 'VCF', project: 'PRJ-019', strain: 'YG-2841', updated: '2026-04-11' },
  { path: 's3://yeast-lims/YG-2842/v2/gatk.filtered.vcf.gz', kind: 'VCF', project: 'PRJ-021', strain: 'YG-2842', updated: '2026-04-10' },
  { path: '/data/raw/RUN-20260411-03/R1_001.fastq.gz', kind: 'FASTQ', project: 'PRJ-019', strain: 'YG-2850', updated: '2026-04-11' },
  { path: '/scratch/pipeline/run_042/MultiQC_report.html', kind: 'HTML', project: 'PRJ-019', strain: '–', updated: '2026-04-09' },
  { path: 's3://yeast-lims/reports/2026/run_042.pdf', kind: 'PDF', project: 'PRJ-019', strain: 'YG-2841', updated: '2026-04-09' },
  { path: '/data/bad/run_042_corrupt.fq.gz', kind: 'FASTQ', project: '–', strain: 'YG-2841', updated: '2026-04-08' },
  { path: 's3://yeast-lims/YG-2852/v5/gatk.filtered.vcf.gz', kind: 'VCF', project: 'PRJ-030', strain: 'YG-2852', updated: '2026-04-08' },
  { path: '/archive/slide/run_slide_019/colony_features.parquet', kind: 'Parquet', project: 'PRJ-024', strain: 'YG-2845', updated: '2026-04-07' },
  { path: 's3://yeast-lims/YG-2845/v1/gatk.filtered.vcf.gz', kind: 'VCF', project: 'PRJ-019', strain: 'YG-2845', updated: '2026-04-06' },
  { path: '/lims/exports/strain_registry_202604.csv', kind: 'CSV', project: '–', strain: '–', updated: '2026-04-05' },
  { path: 's3://yeast-lims/YG-2850/v3/bwa.sorted.bam', kind: 'BAM', project: 'PRJ-019', strain: 'YG-2850', updated: '2026-04-11' },
  { path: '/reports/templates/run_report.html.j2', kind: 'Template', project: '–', strain: '–', updated: '2026-03-22' },
];

const LIMS_DB_PROJECTS = [
  { id: 'PRJ-019', name: 'ADE2 suppressor screen', pi: 'Lab lead', runs: 14, status: 'active' },
  { id: 'PRJ-021', name: 'FAS1 splice stress', pi: 'Lab lead', runs: 9, status: 'active' },
  { id: 'PRJ-024', name: 'Colony imaging · plate 019', pi: 'Lab lead', runs: 6, status: 'active' },
  { id: 'PRJ-030', name: 'TOR1 rapamycin dose response', pi: 'Lab lead', runs: 22, status: 'active' },
  { id: 'PRJ-008', name: 'S288C baseline resequencing', pi: 'Lab lead', runs: 31, status: 'archived' },
  { id: 'PRJ-012', name: 'HAP1 upstream indel cohort', pi: 'Lab lead', runs: 11, status: 'active' },
  { id: 'PRJ-015', name: 'CDC28 ts panel', pi: 'Lab lead', runs: 18, status: 'qc_hold' },
  { id: 'PRJ-003', name: 'Reference bundle QA', pi: 'Lab infra', runs: 4, status: 'archived' },
];

function escapeHtmlText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dbHaystackFile(f) {
  return [f.path, f.kind, f.project, f.strain, f.updated].join(' ').toLowerCase();
}

function dbHaystackProject(p) {
  return [p.id, p.name, p.pi, p.status, String(p.runs)].join(' ').toLowerCase();
}

function renderDatabaseSearch() {
  const root = document.getElementById('db-results');
  const countEl = document.getElementById('db-count');
  if (!root) return;

  const q = (document.getElementById('db-search')?.value || '').trim().toLowerCase();
  const scope = dbSearchScope;

  const match = (hay) => !q || hay.includes(q);

  const files = LIMS_DB_FILES.filter((f) => match(dbHaystackFile(f)));
  const projects = LIMS_DB_PROJECTS.filter((p) => match(dbHaystackProject(p)));

  let showFiles = scope === 'all' || scope === 'files';
  let showProjects = scope === 'all' || scope === 'projects';
  const listFiles = showFiles ? files : [];
  const listProjects = showProjects ? projects : [];

  const n = listFiles.length + listProjects.length;
  if (countEl) {
    if (n > 0) {
      countEl.textContent =
        `${n} result${n === 1 ? '' : 's'}${q ? ` · “${q}”` : ''}`;
    } else {
      countEl.textContent = q
        ? '0 matches · try another keyword or widen scope.'
        : `${LIMS_DB_FILES.length + LIMS_DB_PROJECTS.length} indexed rows · type to filter.`;
    }
  }

  if (!n) {
    root.innerHTML = `<div class="db-empty">${q ? 'No files or projects matched that search.' : 'Enter a search term to filter the demo catalog.'}</div>`;
    return;
  }

  const parts = [];
  if (listFiles.length) {
    parts.push(`<div class="db-section-title">Files &amp; artifacts (${listFiles.length})</div>`);
    listFiles.forEach((f) => {
      parts.push(`<div class="db-row">
        <div class="db-row-main">
          <div class="db-row-title">${escapeHtmlText(f.path)}</div>
          <div class="db-row-meta">${escapeHtmlText(f.kind)} · project ${escapeHtmlText(f.project)} · strain ${escapeHtmlText(f.strain)} · updated ${escapeHtmlText(f.updated)}</div>
        </div>
        <span class="db-row-badge">${escapeHtmlText(f.kind)}</span>
      </div>`);
    });
  }
  if (listProjects.length) {
    parts.push(`<div class="db-section-title">Projects (${listProjects.length})</div>`);
    listProjects.forEach((p) => {
      parts.push(`<div class="db-row">
        <div class="db-row-main">
          <div class="db-row-title">${escapeHtmlText(p.id)} · ${escapeHtmlText(p.name)}</div>
          <div class="db-row-meta">Lab lead · ${escapeHtmlText(p.pi)} · ${p.runs} runs · ${escapeHtmlText(p.status)}</div>
        </div>
        <span class="db-row-badge project">PROJECT</span>
      </div>`);
    });
  }
  root.innerHTML = parts.join('');
}

let _dbSearchTimer = 0;
function initDatabaseSearch() {
  const input = document.getElementById('db-search');
  const filters = document.getElementById('db-filters');
  if (!input || !filters) return;

  input.addEventListener('input', () => {
    clearTimeout(_dbSearchTimer);
    _dbSearchTimer = setTimeout(renderDatabaseSearch, 160);
  });

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-db-scope]');
    if (!btn) return;
    dbSearchScope = btn.getAttribute('data-db-scope') || 'all';
    filters.querySelectorAll('.db-chip').forEach((b) => b.classList.toggle('active', b === btn));
    renderDatabaseSearch();
  });

  renderDatabaseSearch();
}
