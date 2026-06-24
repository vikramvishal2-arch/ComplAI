/**
 * Generates docs/complyos-ciso-deck.pptx — run: npm run deck:pptx
 */
import pptxgen from 'pptxgenjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'docs', 'complyos-ciso-deck.pptx');
const LOGO = join(__dirname, '..', 'public', 'company-logo.png');
const LOGO_B64 = `image/png;base64,${readFileSync(LOGO).toString('base64')}`;

/** ASCII-safe text for PowerPoint compatibility */
const T = (s) =>
  s
    .replace(/\u2194/g, '<->')
    .replace(/\u2192/g, '->')
    .replace(/\u00b7/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/\u2193/g, 'v');

const C = {
  brand: '2563EB',
  brandDark: '1E3A8A',
  brandLight: 'DBEAFE',
  slate900: '0F172A',
  slate700: '334155',
  slate500: '64748B',
  slate200: 'E2E8F0',
  slate100: 'F1F5F9',
  white: 'FFFFFF',
  red: 'DC2626',
  redBg: 'FEF2F2',
  amber: 'D97706',
  amberBg: 'FFFBEB',
  green: '059669',
  greenBg: 'ECFDF5',
};

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Propel Ready Solutions';
pptx.title = 'ComplAI — CISO & CIO Deck';
pptx.subject = 'One Stop GRC for security leadership';

function noLine() {
  return { width: 0 };
}

function addHeader(slide) {
  slide.addImage({
    data: LOGO_B64,
    x: 8.15,
    y: 0.22,
    w: 1.45,
    h: 0.4,
  });
}

function addFooter(slide, label, opts = {}) {
  const textColor = opts.dark ? '94A3B8' : C.slate500;
  slide.addText(label, {
    x: 0.4,
    y: 5.15,
    w: 5,
    h: 0.3,
    fontSize: 8,
    color: textColor,
    fontFace: 'Arial',
  });
  slide.addText('Confidential', {
    x: 7.5,
    y: 5.15,
    w: 2.1,
    h: 0.3,
    fontSize: 8,
    color: textColor,
    align: 'right',
    italic: true,
    fontFace: 'Arial',
  });
}

function addSlideChrome(slide, label, opts = {}) {
  addHeader(slide);
  addFooter(slide, label, opts);
}

function addSlideTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.45,
    y: 0.35,
    w: 7.6,
    h: 0.65,
    fontSize: 26,
    bold: true,
    color: C.slate900,
    fontFace: 'Arial',
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.45,
    y: 1.02,
    w: 1.2,
    h: 0.06,
    fill: { color: C.brand },
    line: noLine(),
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.45,
      y: 1.12,
      w: 7.6,
      h: 0.45,
      fontSize: 12,
      color: C.slate500,
      fontFace: 'Arial',
    });
  }
}

function box(slide, x, y, w, h, fill, text, sub, textColor = C.slate900) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: C.slate200, width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(text, {
    x,
    y: y + 0.12,
    w,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: textColor,
    align: 'center',
    fontFace: 'Arial',
  });
  if (sub) {
    slide.addText(sub, {
      x,
      y: y + 0.42,
      w,
      h: 0.3,
      fontSize: 8,
      color: C.slate500,
      align: 'center',
      fontFace: 'Arial',
    });
  }
}

function statChip(slide, x, y, w, value, label) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h: 0.72,
    fill: { color: C.white },
    line: { color: C.slate200, width: 1 },
    rectRadius: 0.06,
  });
  slide.addText(value, {
    x: x + 0.15,
    y: y + 0.12,
    w: 0.7,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: C.brand,
    fontFace: 'Arial',
  });
  slide.addText(label, {
    x: x + 0.85,
    y: y + 0.14,
    w: w - 0.95,
    h: 0.5,
    fontSize: 9,
    color: C.slate700,
    valign: 'middle',
    fontFace: 'Arial',
  });
}

function bullet(slide, x, y, w, icon, text, iconColor, iconBg) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y: y + 0.04,
    w: 0.22,
    h: 0.22,
    fill: { color: iconBg },
    line: noLine(),
    rectRadius: 0.5,
  });
  slide.addText(T(icon), {
    x,
    y: y + 0.04,
    w: 0.22,
    h: 0.22,
    fontSize: 9,
    bold: true,
    color: iconColor,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial',
  });
  slide.addText(T(text), {
    x: x + 0.32,
    y,
    w: w - 0.32,
    h: 0.55,
    fontSize: 9.5,
    color: C.slate700,
    fontFace: 'Arial',
  });
}

// ─── SLIDE 1: Title + hub ───────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  slide.background = { color: C.slate900 };

  slide.addText(T('GOVERNANCE - RISK - COMPLIANCE'), {
    x: 0.55,
    y: 0.55,
    w: 5,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: '93C5FD',
    fontFace: 'Arial',
  });

  slide.addText('ComplAI', {
    x: 0.55,
    y: 0.95,
    w: 5.2,
    h: 0.75,
    fontSize: 40,
    bold: true,
    color: C.white,
    fontFace: 'Arial',
  });
  slide.addText('One Stop GRC for CISOs & CIOs', {
    x: 0.55,
    y: 1.65,
    w: 5.2,
    h: 0.55,
    fontSize: 22,
    color: 'CBD5E1',
    fontFace: 'Arial',
  });
  slide.addText(
    T('The leadership portal that unifies frameworks, controls, and risk - so security executives answer the board in minutes, not weeks.'),
    {
      x: 0.55,
      y: 2.35,
      w: 4.8,
      h: 0.9,
      fontSize: 12,
      color: '94A3B8',
      fontFace: 'Arial',
    }
  );

  const pills = [T('SOC 2 - ISO 27001 - 21+ frameworks'), 'RAG leadership view', 'Risk-to-control traceability'];
  pills.forEach((p, i) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.55 + (i % 2) * 2.35,
      y: 3.35 + Math.floor(i / 2) * 0.42,
      w: 2.2,
      h: 0.32,
      fill: { color: '1E3A8A' },
      line: { color: '60A5FA', width: 0.75 },
      rectRadius: 0.15,
    });
    slide.addText(T(p), {
      x: 0.55 + (i % 2) * 2.35,
      y: 3.35 + Math.floor(i / 2) * 0.42,
      w: 2.2,
      h: 0.32,
      fontSize: 8,
      bold: true,
      color: C.white,
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial',
    });
  });

  // Hub diagram (right side)
  slide.addText(T('ONE PLATFORM - FIVE OUTCOMES'), {
    x: 5.35,
    y: 0.55,
    w: 4.2,
    h: 0.25,
    fontSize: 8,
    bold: true,
    color: '93C5FD',
    fontFace: 'Arial',
  });

  const cx = 7.45;
  const cy = 2.85;
  slide.addShape(pptx.shapes.OVAL, {
    x: cx - 0.55,
    y: cy - 0.55,
    w: 1.1,
    h: 1.1,
    fill: { color: C.brand },
    line: noLine(),
  });
  slide.addText('ComplAI\nGRC Portal', {
    x: cx - 0.55,
    y: cy - 0.3,
    w: 1.1,
    h: 0.65,
    fontSize: 10,
    bold: true,
    color: C.white,
    align: 'center',
    fontFace: 'Arial',
  });

  const nodes = [
    { x: 5.55, y: 1.15, t: 'Frameworks', s: T('SOC 2 - ISO 27001') },
    { x: 8.85, y: 1.15, t: 'Controls', s: '154+ per tenant' },
    { x: 5.35, y: 4.05, t: 'Risk Register', s: 'Linked to controls' },
    { x: 8.95, y: 4.05, t: 'Leadership', s: 'RAG dashboard' },
  ];
  nodes.forEach((n) => box(slide, n.x, n.y, 1.55, 0.72, C.brandDark, n.t, n.s, C.white));

  box(slide, 6.75, 4.85, 1.85, 0.55, C.green, 'Audit Ready', T('Evidence - Export - Proof'), C.white);

  addSlideChrome(slide, T('Slide 1 of 4 - Introduction'), { dark: true });
}

// ─── SLIDE 2: Challenges ────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  slide.background = { color: C.slate100 };
  addSlideTitle(
    slide,
    T('The challenge - GRC is broken across too many tools'),
    'CISOs and CIOs lose visibility, time, and audit confidence when data lives in silos.'
  );

  statChip(slide, 0.45, 1.65, 4.35, '5+', 'disconnected tools typical per org (spreadsheets, risk tools, drives, ticketing)');
  statChip(slide, 0.45, 2.45, 4.35, '40h+', 'lost per audit cycle reconciling controls, risks, and evidence manually');
  statChip(slide, 0.45, 3.25, 4.35, '?', T('Board asks "Are we green?" - often no real-time, domain-level answer'));

  bullet(slide, 0.45, 4.05, 4.35, '!', T('Risks float without control linkage - audit gaps stay hidden.'), C.red, C.redBg);
  bullet(slide, 0.45, 4.55, 4.35, '!', T('Open issues can mask "audit ready" status - leadership sees green, auditors see red.'), C.red, C.redBg);

  // Silo infographic panel
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.05,
    y: 1.55,
    w: 4.5,
    h: 3.45,
    fill: { color: C.white },
    line: { color: C.slate200, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText(T("TODAY'S REALITY - FRAGMENTED GRC STACK"), {
    x: 5.2,
    y: 1.65,
    w: 4.2,
    h: 0.25,
    fontSize: 8,
    bold: true,
    color: C.slate500,
    fontFace: 'Arial',
  });

  const silos = [
    { x: 5.2, y: 2.0, fill: C.redBg, t: 'Excel', s: 'Controls', tc: C.red },
    { x: 6.15, y: 1.85, fill: C.amberBg, t: 'Risk Tool', s: 'Separate DB', tc: C.amber },
    { x: 7.1, y: 2.05, fill: 'FEFCE8', t: 'SharePoint', s: 'Evidence', tc: '854D0E' },
    { x: 8.05, y: 1.9, fill: 'F5F3FF', t: 'Jira / ITSM', s: 'Issues', tc: '5B21B6' },
    { x: 8.85, y: 2.1, fill: C.greenBg, t: 'Email', s: 'Status', tc: C.green },
  ];
  silos.forEach((s) => box(slide, s.x, s.y, 0.85, 0.62, s.fill, s.t, s.s, s.tc));

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.0,
    y: 2.95,
    w: 2.55,
    h: 0.75,
    fill: { color: C.redBg },
    line: { color: C.red, width: 1.5 },
    rectRadius: 0.08,
  });
  slide.addText('CISO / CIO\n"Which number do I trust?"', {
    x: 6.0,
    y: 3.0,
    w: 2.55,
    h: 0.65,
    fontSize: 10,
    bold: true,
    color: C.red,
    align: 'center',
    fontFace: 'Arial',
  });

  // Progress bars
  slide.addText('AUDIT PREP TIME - 85% manual', {
    x: 5.2,
    y: 3.85,
    w: 4.2,
    h: 0.2,
    fontSize: 7,
    bold: true,
    color: C.slate500,
    fontFace: 'Arial',
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.2,
    y: 4.08,
    w: 4.2,
    h: 0.18,
    fill: { color: C.slate200 },
    line: noLine(),
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.2,
    y: 4.08,
    w: 3.55,
    h: 0.18,
    fill: { color: C.red },
    line: noLine(),
  });

  slide.addText(T('LEADERSHIP CONFIDENCE - Low (stale data)'), {
    x: 5.2,
    y: 4.35,
    w: 4.2,
    h: 0.2,
    fontSize: 7,
    bold: true,
    color: C.slate500,
    fontFace: 'Arial',
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.2,
    y: 4.58,
    w: 4.2,
    h: 0.18,
    fill: { color: C.slate200 },
    line: noLine(),
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.2,
    y: 4.58,
    w: 1.45,
    h: 0.18,
    fill: { color: C.amber },
    line: noLine(),
  });

  addSlideChrome(slide, T('Slide 2 of 4 - The problem'));
}

// ─── SLIDE 3: What ComplAI provides ────────────────────────────────────────
{
  const slide = pptx.addSlide();
  slide.background = { color: C.slate100 };
  addSlideTitle(
    slide,
    T('What ComplAI provides - one portal, full GRC lifecycle'),
    T('From framework activation to audit-ready proof - designed for how CISOs and CIOs actually work.')
  );

  bullet(
    slide,
    0.45,
    1.65,
    4.2,
    '1',
    T('Leadership dashboard - RAG by domain and framework, click-to-filter charts, path-to-green.'),
    C.brand,
    C.brandLight
  );
  bullet(
    slide,
    0.45,
    2.2,
    4.2,
    '2',
    T('Control register - per-control compliance method, remediation, evidence, audit-ready rules.'),
    C.brand,
    C.brandLight
  );
  bullet(
    slide,
    0.45,
    2.75,
    4.2,
    '3',
    T('Risk register - inherent and present scoring; every risk/issue linked to a control.'),
    C.brand,
    C.brandLight
  );
  bullet(
    slide,
    0.45,
    3.3,
    4.2,
    '4',
    T('Export and integrate - CSV for auditors; architecture for IdAM, SIEM, access tools.'),
    C.brand,
    C.brandLight
  );
  statChip(
    slide,
    0.45,
    3.95,
    4.2,
    '21+',
    T('frameworks prebuilt - SOC 2 (61) - ISO 27001 (93) enabled by default')
  );

  // Dashboard panel + pie chart
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.0,
    y: 1.55,
    w: 4.55,
    h: 2.05,
    fill: { color: C.white },
    line: { color: C.slate200, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText(T('Leadership Dashboard - RAG Posture'), {
    x: 5.15,
    y: 1.65,
    w: 4.2,
    h: 0.25,
    fontSize: 9,
    bold: true,
    color: C.slate700,
    fontFace: 'Arial',
  });
  slide.addShape(pptx.shapes.OVAL, { x: 5.25, y: 2.0, w: 1.0, h: 1.0, fill: { color: C.slate200 }, line: noLine() });
  slide.addShape(pptx.shapes.OVAL, { x: 5.45, y: 2.2, w: 0.6, h: 0.6, fill: { color: C.white }, line: noLine() });
  [
    { c: C.green, t: 'Green 55%' },
    { c: C.amber, t: 'Amber 28%' },
    { c: C.red, t: 'Red 17%' },
  ].forEach((item, i) => {
    slide.addShape(pptx.shapes.RECTANGLE, { x: 6.4, y: 2.05 + i * 0.22, w: 0.12, h: 0.12, fill: { color: item.c }, line: noLine() });
    slide.addText(item.t, { x: 6.58, y: 2.02 + i * 0.22, w: 0.8, h: 0.18, fontSize: 8, color: C.slate700, fontFace: 'Arial' });
  });
  slide.addText('By domain', { x: 6.4, y: 2.62, w: 0.8, h: 0.15, fontSize: 7, color: C.slate500, fontFace: 'Arial' });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 6.4, y: 2.75, w: 1.2, h: 0.1, fill: { color: C.green }, line: noLine() });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 6.4, y: 2.88, w: 0.85, h: 0.1, fill: { color: C.amber }, line: noLine() });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 6.4, y: 3.01, w: 0.55, h: 0.1, fill: { color: C.red }, line: noLine() });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.45,
    y: 2.05,
    w: 1.95,
    h: 1.35,
    fill: { color: C.amberBg },
    line: { color: 'FED7AA', width: 1 },
    rectRadius: 0.06,
  });
  slide.addText(T('Needs attention\n- Access mgmt - Red\n- Change control - Amber\n- 3 open risks block audit\n-> Path to green'), {
    x: 7.55,
    y: 2.12,
    w: 1.75,
    h: 1.2,
    fontSize: 7.5,
    color: '9A3412',
    fontFace: 'Arial',
  });

  // Risk-control link + flow
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.0,
    y: 3.7,
    w: 4.55,
    h: 1.35,
    fill: { color: C.brandLight },
    line: { color: '93C5FD', width: 1 },
    rectRadius: 0.1,
  });
  slide.addText(T('Risk <-> Control linkage'), {
    x: 5.15,
    y: 3.78,
    w: 2,
    h: 0.22,
    fontSize: 9,
    bold: true,
    color: C.brandDark,
    fontFace: 'Arial',
  });
  box(slide, 5.2, 4.05, 1.1, 0.55, C.brand, 'CC6.1', 'Logical Access', C.white);
  slide.addText('<->', {
    x: 6.35,
    y: 4.15,
    w: 0.35,
    h: 0.35,
    fontSize: 16,
    bold: true,
    color: C.brand,
    align: 'center',
  });
  box(slide, 6.75, 4.0, 1.55, 0.7, C.redBg, 'Privileged access risk', T('Inherent High -> Present Medium'), C.red);

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 4.72,
    w: 4.15,
    h: 0.28,
    fill: { color: C.greenBg },
    line: { color: '6EE7B7', width: 1 },
    rectRadius: 0.04,
  });
  slide.addText('Audit Ready blocked until linked risks & issues are resolved', {
    x: 5.2,
    y: 4.72,
    w: 4.15,
    h: 0.28,
    fontSize: 7.5,
    bold: true,
    color: C.green,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial',
  });

  addSlideChrome(slide, T('Slide 3 of 4 - Product capabilities'));
}

// ─── SLIDE 4: Why purchase ───────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  slide.background = { color: C.slate100 };
  addSlideTitle(
    slide,
    T('Why purchase ComplAI - the executive business case'),
    'Reduce risk, cut audit friction, and give the board a number they can trust.'
  );

  // Before / After panels
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.45,
    y: 1.6,
    w: 4.35,
    h: 2.05,
    fill: { color: C.white },
    line: { color: C.slate200, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText('BEFORE vs AFTER', {
    x: 0.6,
    y: 1.68,
    w: 4,
    h: 0.22,
    fontSize: 8,
    bold: true,
    color: C.slate500,
    fontFace: 'Arial',
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6,
    y: 1.95,
    w: 1.85,
    h: 1.55,
    fill: { color: C.redBg },
    line: { color: 'FCA5A5', width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(T('BEFORE\nQuarterly fire drill\n\nWeeks of manual prep\nHigh stress - High cost\nRepeat every cycle'), {
    x: 0.65,
    y: 2.0,
    w: 1.75,
    h: 1.45,
    fontSize: 8.5,
    color: C.red,
    align: 'center',
    fontFace: 'Arial',
  });

  slide.addText('->', {
    x: 2.55,
    y: 2.55,
    w: 0.35,
    h: 0.4,
    fontSize: 22,
    bold: true,
    color: C.brand,
    align: 'center',
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 2.95,
    y: 1.95,
    w: 1.75,
    h: 1.55,
    fill: { color: C.greenBg },
    line: { color: '6EE7B7', width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(T('AFTER\nContinuous GRC\n\nReal-time RAG dashboard\nAudit-ready on demand\nOne export - One truth'), {
    x: 3.0,
    y: 2.0,
    w: 1.65,
    h: 1.45,
    fontSize: 8.5,
    color: C.green,
    align: 'center',
    fontFace: 'Arial',
  });

  slide.addText('Audit prep effort', {
    x: 0.6,
    y: 3.55,
    w: 4,
    h: 0.18,
    fontSize: 7,
    color: C.slate500,
    fontFace: 'Arial',
  });
  slide.addText('Before', { x: 0.6, y: 3.75, w: 0.55, h: 0.15, fontSize: 7, color: C.slate700, fontFace: 'Arial' });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 1.15, y: 3.75, w: 3.45, h: 0.12, fill: { color: C.slate200 }, line: noLine() });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 1.15, y: 3.75, w: 2.95, h: 0.12, fill: { color: C.red }, line: noLine() });
  slide.addText('After', { x: 0.6, y: 3.92, w: 0.55, h: 0.15, fontSize: 7, color: C.slate700, fontFace: 'Arial' });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 1.15, y: 3.92, w: 3.45, h: 0.12, fill: { color: C.slate200 }, line: noLine() });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 1.15, y: 3.92, w: 0.95, h: 0.12, fill: { color: C.green }, line: noLine() });

  // Decision drivers chart
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.0,
    y: 1.6,
    w: 4.55,
    h: 2.05,
    fill: { color: C.white },
    line: { color: C.slate200, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText(T('WHY CISOs & CIOs BUY - DECISION DRIVERS'), {
    x: 5.15,
    y: 1.68,
    w: 4.2,
    h: 0.22,
    fontSize: 8,
    bold: true,
    color: C.slate500,
    fontFace: 'Arial',
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.3,
    y: 2.54,
    w: 4.0,
    h: 0.02,
    fill: { color: C.slate200 },
    line: noLine(),
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 7.29,
    y: 2.0,
    w: 0.02,
    h: 1.5,
    fill: { color: C.slate200 },
    line: noLine(),
  });
  [
    { x: 5.55, y: 2.1, w: 1.2, h: 0.55, fill: C.brandLight, t: 'Board\nconfidence' },
    { x: 8.0, y: 2.1, w: 1.2, h: 0.55, fill: C.greenBg, t: 'Audit\npass rate' },
    { x: 5.55, y: 2.85, w: 1.2, h: 0.55, fill: C.amberBg, t: 'Risk\nvisibility' },
    { x: 8.0, y: 2.85, w: 1.2, h: 0.55, fill: 'F5F3FF', t: 'Team\nefficiency' },
  ].forEach((d) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: d.x, y: d.y, w: d.w, h: d.h, fill: { color: d.fill }, line: { color: C.slate200, width: 1 }, rectRadius: 0.08 });
    slide.addText(d.t, { x: d.x, y: d.y + 0.08, w: d.w, h: d.h - 0.1, fontSize: 8, bold: true, color: C.slate700, align: 'center', fontFace: 'Arial' });
  });
  slide.addShape(pptx.shapes.OVAL, { x: 7.05, y: 2.35, w: 0.55, h: 0.55, fill: { color: C.brand }, line: noLine() });
  slide.addText('ComplAI', { x: 7.05, y: 2.48, w: 0.55, h: 0.3, fontSize: 7, bold: true, color: C.white, align: 'center', fontFace: 'Arial' });
  slide.addText(T('Board confidence - Audit pass - Risk visibility - Team efficiency'), {
    x: 5.15,
    y: 3.35,
    w: 4.2,
    h: 0.22,
    fontSize: 7.5,
    color: C.slate500,
    align: 'center',
    fontFace: 'Arial',
  });

  // Value cards
  const cards = [
    { x: 0.45, title: 'Single pane of glass', body: T('One login for posture, risks, and compliance - no reconciling 5 tools before board meetings.') },
    { x: 2.55, title: 'Faster red to green', body: T('Domain RAG + path-to-green actions focus budget and people where impact is highest.') },
    { x: 4.65, title: 'Defensible audit trail', body: T('Risks tied to controls, evidence per context, CSV export - auditors get proof, not stories.') },
    { x: 6.75, title: 'Your stack, your way', body: T('Customer-defined compliance per control - flexible for your environment, structured for SOC 2 and ISO.') },
  ];
  cards.forEach((c) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: c.x,
      y: 3.75,
      w: 1.95,
      h: 1.05,
      fill: { color: C.white },
      line: { color: C.slate200, width: 1 },
      rectRadius: 0.08,
    });
    slide.addText(c.title, {
      x: c.x + 0.08,
      y: 3.82,
      w: 1.8,
      h: 0.3,
      fontSize: 8.5,
      bold: true,
      color: C.slate900,
      fontFace: 'Arial',
    });
    slide.addText(c.body, {
      x: c.x + 0.08,
      y: 4.12,
      w: 1.8,
      h: 0.62,
      fontSize: 7.5,
      color: C.slate700,
      fontFace: 'Arial',
    });
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.45,
    y: 4.92,
    w: 9.1,
    h: 0.55,
    fill: { color: C.brandLight },
    line: { color: 'BFDBFE', width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(
    T('Purchase ComplAI when you need to lead GRC - not chase it.\nTrack risk. Prove control. Walk into every audit with confidence.'),
    {
      x: 0.55,
      y: 4.97,
      w: 8.9,
      h: 0.45,
      fontSize: 11,
      bold: true,
      color: C.brandDark,
      align: 'center',
      fontFace: 'Arial',
    }
  );

  addSlideChrome(slide, T('Slide 4 of 4 - Business case'));
}

await pptx.writeFile({ fileName: OUT, compression: true });
console.log(`Created ${OUT}`);
