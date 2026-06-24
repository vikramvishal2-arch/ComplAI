/** Shared typography constants for policy Word export and portal preview. */
export const POLICY_FONT = 'Calibri';
export const POLICY_FONT_FALLBACK = 'Arial';
export const POLICY_FONT_FAMILY = `${POLICY_FONT}, ${POLICY_FONT_FALLBACK}, sans-serif`;

/** Body size in half-points (docx API). 20 → 10pt. */
export const POLICY_BODY_SIZE_HALF_PT = 20;

/** Heading sizes in half-points for docx. */
export const POLICY_HEADING_SIZES_HALF_PT: Record<number, number> = {
  1: 32, // 16pt
  2: 28, // 14pt
  3: 24, // 12pt
};

/** CSS font sizes matching Word export. */
export const POLICY_FONT_SIZES = {
  body: '10pt',
  h3: '12pt',
  h2: '14pt',
  h1: '16pt',
} as const;

export const POLICY_LINE_HEIGHT = 1.15;
