export const PRODUCT_NAME = 'ComplAI';
export const PRODUCT_TAGLINE = 'GRC Compliance Platform';
export const ORGANIZATION_NAME = 'Propel Ready Solutions';

export const CONTACT_EMAIL = 'tech@propelreadysolutions.in';
export const CONTACT_PHONE_DISPLAY = '+91-8796941115';
export const CONTACT_PHONE_TEL = '+918796941115';

/** Product logo assets (ComplAI mark — shield + compliance check + AI accent). */
export const COMPLAI_ICON = '/complai-icon.svg';
export const COMPLAI_LOGO = '/complai-logo.svg';

/** Alternate icon concepts — swap into COMPLAI_ICON to try a different mark. */
export const COMPLAI_ICON_ALTERNATES = {
  /** Current default: shield + check + AI spark on gradient tile */
  default: '/complai-icon.svg',
  /** Circular C monogram with compliance check */
  monogram: '/complai-icon-v2.svg',
  /** Hexagon badge with neural-node accent */
  hexBadge: '/complai-icon-v3.svg',
  /** Shield with stacked control bars + check */
  controlStack: '/complai-icon-v4.svg',
} as const;
/** Propel Ready icon mark (globe + arrow — transparent PNG, white background removed). */
export const PROPEL_READY_ICON = '/propel-ready-logo-transparent.png';

/** White icon mark for very dark backgrounds where the colored mark lacks contrast. */
export const PROPEL_READY_ICON_WHITE = '/propel-ready-icon-white.svg';

/** PNG lockup — avoid in UI; use PROPEL_READY_ICON + PropelReadyWordmark instead. */
export const PROPEL_READY_LOCKUP = '/propel-ready-lockup.png';

/** Legacy full lockup PNGs — same artwork as PROPEL_READY_LOCKUP. */
export const COMPANY_LOGO = '/company-logo.png';
export const COMPANY_LOGO_FULL = '/company-logo-full.png';

export const PRODUCT_TITLE = `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`;
export const PRODUCT_DESCRIPTION = `${PRODUCT_NAME} — manage security frameworks and define how your organization complies with each control. Built for ${ORGANIZATION_NAME}.`;

/** Public help centre base for integration setup guides (Propel Ready Solutions). */
export const INTEGRATION_HELP_BASE_URL =
  process.env.NEXT_PUBLIC_INTEGRATION_HELP_BASE_URL ??
  'https://propelreadysolutions.in/help/integrations';

export function integrationHelpGuidePath(toolId: string): string {
  return `/help/integrations/${toolId}`;
}

export function integrationHelpGuideUrl(toolId: string): string {
  return `${INTEGRATION_HELP_BASE_URL}/${toolId}`;
}

/** Public help centre base for framework guides (Propel Ready Solutions). */
export const FRAMEWORK_HELP_BASE_URL =
  process.env.NEXT_PUBLIC_FRAMEWORK_HELP_BASE_URL ??
  'https://propelreadysolutions.in/help/frameworks';

export function frameworkHelpGuidePath(frameworkId: string): string {
  return `/help/frameworks/${frameworkId}`;
}

export function frameworkHelpGuideUrl(frameworkId: string): string {
  return `${FRAMEWORK_HELP_BASE_URL}/${frameworkId}`;
}
