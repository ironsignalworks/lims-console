/** Demo identity: YeastGenomics Lab NOVA FCT (generic placeholders). */

/** First line of the lab lockup (stack NOVA FCT below this in tight sidebars). */
export const LAB_TITLE_LINE = "YeastGenomics Lab";
/** Second line: keeps narrow layouts from clipping a single long string. */
export const LAB_NOVA_FCT_LINE = "NOVA FCT";

export const LAB_LOCATION_BRAND = `${LAB_TITLE_LINE} ${LAB_NOVA_FCT_LINE}`;
export const LAB_AFFILIATION_LINE =
  "NOVA School of Science and Technology (FCT) · Universidade NOVA de Lisboa";

export const LAB_LEAD_NAME = "Lab lead";
export const LAB_LEAD_SHORT = "Lab lead";
export const LAB_LEAD_ROLE = "Lab lead";
export const LAB_LEAD_INITIALS = "LL";

/** Demo contact for mailto links (replace with real address in production). */
export const LAB_LEAD_EMAIL = "pi@yeastlab.pt";

export function labLeadMailto(subject: string) {
  const q = encodeURIComponent(subject);
  return `mailto:${LAB_LEAD_EMAIL}?subject=${q}`;
}
