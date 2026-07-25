/** Pitch / demo identity: YeastGenomics Lab NOVA FCT & lab lead (client). */

/** First line of the lab lockup (stack NOVA FCT below this in tight sidebars). */
export const LAB_TITLE_LINE = "YeastGenomics Lab";
/** Second line: keeps narrow layouts from clipping a single long string. */
export const LAB_NOVA_FCT_LINE = "NOVA FCT";

export const LAB_LOCATION_BRAND = `${LAB_TITLE_LINE} ${LAB_NOVA_FCT_LINE}`;
export const LAB_AFFILIATION_LINE =
  "NOVA School of Science and Technology (FCT) · Universidade NOVA de Lisboa";

export const LAB_LEAD_NAME = "Dr Carla Gonçalves";
export const LAB_LEAD_SHORT = "Dr Gonçalves";
export const LAB_LEAD_ROLE = "Lab lead";
export const LAB_LEAD_INITIALS = "CG";

/** Demo contact for mailto links (replace with real address when known). */
export const LAB_LEAD_EMAIL = "carla.goncalves@fct.unl.pt";

export function labLeadMailto(subject: string) {
  const q = encodeURIComponent(subject);
  return `mailto:${LAB_LEAD_EMAIL}?subject=${q}`;
}
