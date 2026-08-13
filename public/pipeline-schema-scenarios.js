// Pipeline scenario definitions (Mermaid graphs + steps + metrics).
const SCENARIOS = {
  ingest: {
    title: 'Scenario 01 · Data Ingestion',
    sub: 'Filesystem watcher detects new FASTQ files from the sequencer and triggers the pipeline.',
    architecture:
      'Architecture: linear ingest chain (sequencer → watcher → validate → decompress → stage → workflow trigger) with a single validation gate. Side branches only for bad files or disk/resource failures; retries and paging sit after the failure diamond.',
    steps: [
      { icon: '⬡', name: 'Sequencer Output', tip: 'Instrument finishes a run and writes gzipped FASTQ under the lab raw path (e.g. /data/raw/run_xxx).' },
      { icon: '👁', name: 'FS Watcher', tip: 'Kernel watcher (inotifywait / equivalent) sees closed files and emits a stable new-file event for the validator.' },
      { icon: '📋', name: 'File Validator', tip: 'Checksum, size, and extension gates · bad files route to quarantine instead of the compute queue.' },
      { icon: '🗜', name: 'Decompression', tip: 'Streaming or batch gzip decode into a temp prefix so downstream tools see plain FASTQ.' },
      { icon: '📦', name: 'Staging Area', tip: 'Fast scratch holds decompressed chunks until the workflow run ID is bound and locks are acquired.' },
      { icon: '✅', name: 'Pipeline Trigger', tip: 'Snakemake / Nextflow driver starts with pinned threads, containers, and run metadata logged to LIMS.' },
    ],
    metrics: { reads: '48.3M', pass: '45.1M', variants: '–', duration: '2m 14s' },
    graphs: {
      happy: `flowchart LR
    SEQ(["🧬 Sequencer\n/data/raw/run_042"]):::source
    SEQ -->|"FASTQ.gz detected"| WATCH["👁 FS Watcher\ninotifywait"]
    WATCH -->|"new_file event"| VAL{"📋 Validator\nchecksum · size"}
    VAL -->|"✓ valid"| DECOMP["🗜 Decompress\ngzip -d"]
    VAL -->|"✗ corrupt"| QUARANTINE["⚠️ Quarantine\n/data/bad/"]:::warn
    DECOMP --> STAGE["📦 Staging\n/scratch/pipeline/"]
    STAGE --> TRIGGER["🚀 Pipeline Trigger\nSnakemake --cores 32"]
    TRIGGER --> QC["→ QC & Trimming"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      qfail: `flowchart LR
    SEQ(["🧬 Sequencer\n/data/raw/run_042"]):::source
    SEQ -->|"FASTQ.gz detected"| WATCH["👁 FS Watcher"]
    WATCH --> VAL{"📋 Validator"}
    VAL -->|"✗ checksum mismatch"| QUARANTINE["⚠️ Quarantine\n/data/bad/run_042/"]:::warn
    QUARANTINE --> ALERT["📧 Alert lab lead\npi@yeastlab.pt"]:::warn
    QUARANTINE --> LOG["📝 Log entry\nFAILED_CHECKSUM"]:::warn
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842`,
      error: `flowchart LR
    SEQ(["🧬 Sequencer\n/data/raw/run_042"]):::source
    SEQ --> WATCH["👁 FS Watcher"]
    WATCH --> VAL{"📋 Validator"}
    VAL --> DECOMP["🗜 Decompress"]
    DECOMP -->|"disk full"| ERR["💥 OSError\nNo space left"]:::err
    ERR --> RETRY{"♻️ Retry\n3 attempts"}
    RETRY -->|"all failed"| DEAD["☠️ Dead Letter\nQueue"]:::err
    DEAD --> PAGE["📟 PagerDuty\nP1 Alert"]:::err
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72`,
    },
  },

  qc: {
    title: 'Scenario 02 · Quality Control & Trimming',
    sub: 'FastQC runs on raw reads. Adapter sequences stripped. Low-quality bases removed at q<30.',
    architecture:
      'Architecture: fork-join QC · pre-trim metrics feed Trimmomatic, then post-trim QC and MultiQC aggregation. A parallel “dropped reads” sink captures what was removed without blocking the main pass to alignment.',
    steps: [
      { icon: '📦', name: 'Raw FASTQ Input', tip: 'Demultiplexed reads for the strain/run pair · counts and read length inform trim aggressiveness.' },
      { icon: '🔍', name: 'FastQC (pre)', tip: 'Per-read quality, adapter content, and duplication before trimming · HTML artifacts land in run QC folder.' },
      { icon: '✂️', name: 'Trimmomatic', tip: 'SLIDINGWINDOW / MINLEN (or cutadapt) removes adapters and tails below q30 before alignment.' },
      { icon: '🔍', name: 'FastQC (post)', tip: 'Second pass proves trimming worked · big deltas here often mean over- or under-trimming.' },
      { icon: '📊', name: 'MultiQC Report', tip: 'Aggregates all FastQC + tool logs into one dashboard the lab lead can skim before sign-off.' },
      { icon: '➡️', name: 'Pass to Aligner', tip: 'Clean FASTQ handed to BWA-MEM with reference path, RG tags, and thread budget from the workflow profile.' },
    ],
    metrics: { reads: '48.3M', pass: '45.1M', variants: '–', duration: '8m 32s' },
    graphs: {
      happy: `flowchart LR
    IN(["📦 Raw FASTQ\n48.3M reads"]):::source
    IN --> PRE["🔍 FastQC Pre-Trim\nHTML report"]
    PRE --> TRIM["✂️ Trimmomatic\nSLIDINGWINDOW:4:30\nMINLEN:50"]
    TRIM -->|"45.1M surviving"| POST["🔍 FastQC Post-Trim\nHTML report"]
    TRIM -->|"3.2M dropped"| DROPPED[/"🗑 Dropped Reads\nlow quality / adapter"/]:::warn
    POST --> MQC["📊 MultiQC\naggregate report"]
    MQC --> ALN["→ BWA-MEM Aligner\n(next stage)"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      qfail: `flowchart LR
    IN(["📦 Raw FASTQ\n48.3M reads"]):::source
    IN --> PRE["🔍 FastQC Pre-Trim"]
    PRE -->|"avg quality < 20"| FLAG["⚠️ Low Quality Flag"]:::warn
    FLAG --> TRIM["✂️ Trimmomatic\naggressive settings"]
    TRIM -->|"only 21.0M pass"| FAIL["❌ QC FAIL\nrun rejected"]:::err
    FAIL --> ALERT["📧 Notify lab lead\nRun 042 failed QC"]:::err
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72`,
      error: `flowchart LR
    IN(["📦 Raw FASTQ"]):::source
    IN --> PRE["🔍 FastQC"]
    PRE --> TRIM["✂️ Trimmomatic"]
    TRIM -->|"OOM / SIGKILL\n32GB exceeded"| CRASH["💥 Process Killed"]:::err
    CRASH --> RETRY{"♻️ Retry with\nchunked input"}
    RETRY -->|"attempt 2 ok"| POST["🔍 FastQC Post-Trim"]:::next
    POST --> MQC["📊 MultiQC"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
    },
  },

  variant: {
    title: 'Scenario 03 · Variant Calling',
    sub: 'BWA-MEM alignment to S288C reference. GATK HaplotypeCaller produces per-strain VCF.',
    architecture:
      'Architecture: classic alignment stack as a straight pipeline (align → sort → dedup → BQSR → caller) with optional investigation branches for mapping QC failures. GVCF / joint genotyping is modeled as a second stage after per-sample calling.',
    steps: [
      { icon: '🧬', name: 'Trimmed FASTQ', tip: 'Post-QC reads plus metadata (read groups, lane IDs) carried into the alignment manifest.' },
      { icon: '🗺', name: 'BWA-MEM Align', tip: 'Seed-and-extend aligner against S288C R64 · emits SAM with MAPQ for downstream QC filters.' },
      { icon: '🗂', name: 'SAMtools Sort', tip: 'Coordinate-sorted BAM + .bai so random access works for GATK walkers and depth plots.' },
      { icon: '♻️', name: 'Mark Duplicates', tip: 'Optical / PCR dup tagging lowers false-positive calls in amplicon-heavy libraries.' },
      { icon: '🔬', name: 'GATK HaplotypeCaller', tip: 'Local reassembly + BQSR-aware genotyping · GVCF mode when joint calling is scheduled.' },
      { icon: '📄', name: 'VCF Output', tip: 'Filtered SNPs/INDELs + QUAL/DP annotations written to LIMS-linked paths for archival.' },
    ],
    metrics: { reads: '45.1M', pass: '44.8M', variants: '1,247 SNPs', duration: '38m 11s' },
    graphs: {
      happy: `flowchart LR
    FQ(["🧬 Trimmed FASTQ\n45.1M reads"]):::source
    FQ --> BWA["🗺 BWA-MEM\nref: S288C_R64\n--threads 32"]
    BWA -->|"SAM output"| SORT["🗂 SAMtools Sort\n+ index .bai"]
    SORT --> DEDUP["♻️ MarkDuplicates\n2.1% dup rate"]
    DEDUP --> BQSR["📐 GATK BQSR\nBase Recalibration"]
    BQSR --> HC["🔬 HaplotypeCaller\n-ERC GVCF mode"]
    HC --> GVCF[/"📄 per-sample\n.g.vcf.gz"/]:::next
    GVCF --> GENO["🧩 GenomicsDBImport\njoint genotyping"]
    GENO --> VCF[/"✅ final .vcf.gz\n1,247 SNPs · 83 INDELs"/]:::done
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff
    classDef done fill:#0a1f0a,stroke:#3ddc84,color:#3ddc84`,
      qfail: `flowchart LR
    FQ(["🧬 Trimmed FASTQ"]):::source
    FQ --> BWA["🗺 BWA-MEM"]
    BWA -->|"mapping rate 61%\n< 80% threshold"| FLAG["⚠️ Low Mapping Rate"]:::warn
    FLAG --> INV{"🔎 Investigate"}
    INV -->|"kraken2 screen"| CONT["🦠 Contamination\n14% E. coli reads"]:::warn
    INV -->|"wrong ref?"| RERUN["♻️ Re-align\nalternate ref"]:::next
    CONT --> FILTER["🧹 Filter contaminants\nsubtract E. coli BAM"]
    FILTER --> HC["🔬 HaplotypeCaller"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      error: `flowchart LR
    FQ(["🧬 Trimmed FASTQ"]):::source
    FQ --> BWA["🗺 BWA-MEM"]
    BWA --> SORT["🗂 SAMtools Sort"]
    SORT --> DEDUP["♻️ MarkDuplicates"]
    DEDUP -->|"corrupt BAM header"| ERR["💥 GATK Exception\nSAMFormatException"]:::err
    ERR --> FIX["🔧 ValidateSamFile\n+ RevertSam"]
    FIX --> DEDUP2["♻️ Re-run from Sort"]:::next
    DEDUP2 --> HC["🔬 HaplotypeCaller"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
    },
  },

  slide: {
    title: 'Scenario 04 · Microscopy Slide Analysis',
    sub: 'Brightfield/fluorescence slide images ingested, segmented, and morphology features extracted per colony.',
    architecture:
      'Architecture: CV pipeline · metadata → preprocess → segmentation with a rejected-ROI sink, then feature extraction and strain linkage before DB write. Triage paths handle borderline image quality without blocking the whole plate.',
    steps: [
      { icon: '🔬', name: 'Image Ingest', tip: 'Multi-channel TIFF/PNG per well · checksum + plate map validated before any CV work.' },
      { icon: '📐', name: 'Pre-processing', tip: 'Flat-field, denoise, and intensity normalization so segmentation thresholds stay comparable across plates.' },
      { icon: '🟢', name: 'Colony Segmentation', tip: 'Otsu + watershed (or learned mask) · rejects edge-touching ROIs to avoid partial colonies.' },
      { icon: '📏', name: 'Morphology Extraction', tip: 'Area, eccentricity, mean fluorescence · numeric features keyed by colony_id for stats later.' },
      { icon: '🔗', name: 'Genotype Linkage', tip: 'Joins colony_id to strain_id / well metadata so phenotype rows are LIMS-addressable.' },
      { icon: '💾', name: 'DB Write', graphMatch: 'phenotype_observations', tip: 'INSERT into phenotype_observations with provenance hash + operator id for audit replay.' },
    ],
    metrics: { reads: '384 images', pass: '371 valid', variants: '2,048 colonies', duration: '4m 58s' },
    graphs: {
      happy: `flowchart LR
    IMG(["🔬 Slide Images\n384 TIF / PNG"]):::source
    IMG --> META["📋 Metadata Parse\nplate ID · well · channel"]
    META --> PRE["📐 Pre-processing\nnormalize · denoise · flat-field"]
    PRE --> SEG["🟢 Colony Segmentation\nOtsu + watershed"]
    SEG -->|"2,048 colonies"| MORPH["📏 Morphology Features\narea · circularity · fluorescence"]
    SEG -->|"13 rejected"| REJECT[/"⚠️ Rejected ROIs\nedge artifacts"/]:::warn
    MORPH --> LINK["🔗 Genotype Linkage\nstrain_id → colony_id"]
    LINK --> DB["💾 phenotype_observations\nINSERT"]:::done
    DB --> VIZ["📊 Colony Heatmap\ngenerated"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842
    classDef done fill:#0a1f0a,stroke:#3ddc84,color:#3ddc84
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      qfail: `flowchart LR
    IMG(["🔬 Slide Images\nrun_slide_019"]):::source
    IMG --> PRE["📐 Pre-processing"]
    PRE -->|"focus score < 0.4\nout-of-focus"| OOF["⚠️ Out-of-Focus\n47 images flagged"]:::warn
    OOF --> TRIAGE{"📋 Triage"}
    TRIAGE -->|"salvageable"| SHARP["🔧 Sharpening filter\nUnsharp Mask"]
    TRIAGE -->|"unsalvageable"| SKIP["🗑 Skip + flag\nre-image requested"]:::warn
    SHARP --> SEG["🟢 Segmentation\n(reduced ROI count)"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      error: `flowchart LR
    IMG(["🔬 Slide Images"]):::source
    IMG --> META["📋 Metadata Parse"]
    META -->|"plate_id missing"| ERR["💥 Metadata Error\nKeyError: plate_id"]:::err
    ERR --> FALLBACK{"🔧 Fallback\nmanual metadata?"}
    FALLBACK -->|"CSV sidecar found"| PATCH["✅ Patch from CSV\nretry pipeline"]:::next
    FALLBACK -->|"no sidecar"| HOLD["⏸ Held for\nmanual review"]:::err
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
    },
  },

  lims: {
    title: 'Scenario 05 · LIMS Archival',
    sub: 'Processed results committed to the central SQL LIMS database with full provenance.',
    architecture:
      'Architecture: transactional write path · schema gate, then strain resolution (update vs insert), merged lineage update, audit + search reindex. Error path shows rollback and compensating seed rows before retry.',
    steps: [
      { icon: '📄', name: 'VCF + Phenotype', tip: 'JSON + VCF pointers produced by the pipeline bundle · versioned schema checked first.' },
      { icon: '🔍', name: 'Schema Validation', tip: 'JSON Schema / Cerbos-style rules · rejects partial payloads before any SQL is touched.' },
      { icon: '🆔', name: 'Strain ID Resolution', tip: 'Barcode + fuzzy name match decides UPDATE vs INSERT and sets lineage parent links.' },
      { icon: '💾', name: 'DB INSERT', tip: 'Transactional writes with row-level locks · FK checks reference genome and project tables.' },
      { icon: '🔗', name: 'Lineage Graph Update', tip: 'Materialized edges for parent→child strain relationships used in graph queries.' },
      { icon: '🔒', name: 'Audit Log', tip: 'Immutable append-only record: user, timestamp, content hash for compliance / replay.' },
    ],
    metrics: { reads: '–', pass: '–', variants: '1,330 records', duration: '0m 18s' },
    graphs: {
      happy: `flowchart LR
    IN(["📄 Pipeline Results\nVCF + phenotype JSON"]):::source
    IN --> VAL{"🔍 Schema Validation\nJSON Schema v4"}
    VAL -->|"✓ pass"| RES["🆔 Strain ID Resolution\nfuzzy-match · barcode"]
    VAL -->|"✗ fail"| REJECT["❌ Rejected\nvalidation errors"]:::err
    RES -->|"known strain"| UPD["🔄 UPDATE record\nmutation history"]
    RES -->|"new strain"| INS["➕ INSERT record\nauto-increment id"]
    UPD & INS --> LIN["🔗 Lineage Graph\nparent → child edge"]
    LIN --> AUDIT["🔒 Audit Log\nuser · timestamp · hash"]:::done
    AUDIT --> IDX["⚡ Reindex FTS\nfull-text search"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72
    classDef done fill:#0a1f0a,stroke:#3ddc84,color:#3ddc84
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      qfail: `flowchart LR
    IN(["📄 Pipeline Results"]):::source
    IN --> VAL{"🔍 Schema Validation"}
    VAL -->|"strain_id collides"| DEDUP{"♻️ Dedup Check"}
    DEDUP -->|"identical hash\nalready stored"| SKIP["⏭ Skip · idempotent\nno write needed"]:::warn
    DEDUP -->|"same id diff data\npossible re-run"| CONFLICT["⚠️ Conflict\nversion bump required"]:::warn
    CONFLICT --> BUMP["🔢 Version v1 → v2\nstore both"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      error: `flowchart LR
    IN(["📄 Pipeline Results"]):::source
    IN --> TXN["🔐 BEGIN TRANSACTION"]
    TXN --> INS["💾 INSERT records"]
    INS -->|"FK violation\nref genome missing"| ERR["💥 DB Error\nForeignKeyViolation"]:::err
    ERR --> RB["↩️ ROLLBACK"]:::err
    RB --> SEED["🌱 Insert missing\nreference genome row"]
    SEED --> RETRY["♻️ Retry transaction"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
    },
  },

  report: {
    title: 'Scenario 06 · Automated Report Generation',
    sub: 'After each successful run, a structured PDF is assembled and delivered to the lab lead.',
    architecture:
      'Architecture: fan-out delivery · aggregate metrics → plots → template → PDF, then parallel notify (email + archive + Slack). Failure mode fans out to file/Slack fallbacks before incident logging.',
    steps: [
      { icon: '📊', name: 'Metrics Aggregation', tip: 'Pulls QC, depth, and variant counts from LIMS + file paths into one run summary object.' },
      { icon: '📈', name: 'Plot Generation', tip: 'matplotlib/plotly figures embedded as base64 or file refs for the templating layer.' },
      { icon: '📝', name: 'Template Render', tip: 'Jinja2 (or similar) merges metrics + plots into HTML before PDF conversion.' },
      { icon: '🖨', name: 'PDF Export', tip: 'WeasyPrint / wkhtml · embeds fonts and sets PDF/A metadata when the lab requires it.' },
      { icon: '📧', name: 'Email Delivery', tip: 'SMTP with TLS · distribution lists per project; failures trigger fallback paths.' },
      { icon: '🗃', name: 'Archive', tip: 'Cold storage mirror (NFS / object) plus retention policy hooks for long-term compliance.' },
    ],
    metrics: { reads: '–', pass: '–', variants: '1 PDF · 14 pages', duration: '1m 02s' },
    graphs: {
      happy: `flowchart LR
    DB(["💾 LIMS Database\nrun results"]):::source
    DB --> AGG["📊 Metrics Aggregation\nquality · mapping · variants"]
    AGG --> PLT["📈 Plot Generation\nmatplotlib / plotly"]
    PLT --> TMPL["📝 Jinja2 Template\nrun_report.html.j2"]
    TMPL --> PDF["🖨 Weasyprint → PDF\n14 pages"]
    PDF --> EMAIL["📧 SMTP Delivery\npi@yeastlab.pt · team"]:::done
    PDF --> ARCH["🗃 Archive\n/reports/2026/run_042.pdf"]:::done
    EMAIL & ARCH --> NOTIFY["🔔 Slack\n#lab-sequencing"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef done fill:#0a1f0a,stroke:#3ddc84,color:#3ddc84
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
      qfail: `flowchart LR
    DB(["💾 LIMS Database"]):::source
    DB --> AGG["📊 Metrics Aggregation"]
    AGG -->|"coverage < 10x"| WARN["⚠️ Low Coverage Warning\nflagged in report"]:::warn
    WARN --> TMPL["📝 Template Render\nwith warning banner"]
    TMPL --> PDF["🖨 PDF Export\nwith ⚠️ header"]:::warn
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef warn fill:#1f1500,stroke:#f5c842,color:#f5c842`,
      error: `flowchart LR
    DB(["💾 LIMS Database"]):::source
    DB --> AGG["📊 Metrics Aggregation"]
    AGG --> PLT["📈 Plot Generation"]
    PLT -->|"SMTP auth failure\nport 587 blocked"| ERR["💥 Email Error\nSMTPAuthenticationError"]:::err
    ERR --> FB1["📁 Fallback 1\nSave to shared drive"]:::next
    ERR --> FB2["📲 Fallback 2\nSlack DM to lab lead"]:::next
    FB1 & FB2 --> LOG["📝 Incident logged\nfor infra review"]:::next
    classDef source fill:#0d2416,stroke:#3ddc84,color:#3ddc84
    classDef err fill:#1f0a0a,stroke:#ff7b72,color:#ff7b72
    classDef next fill:#0d1a2e,stroke:#58a6ff,color:#58a6ff`,
    },
  },
};
