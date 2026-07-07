/**
 * Generates docs/complai-customer-demo-deck.pptx and .html
 * Run: npm run deck:customer
 */
import pptxgen from 'pptxgenjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  DECK_META,
  DECK_BRAND,
  SLIDES,
  INFOGRAPHIC_COLORS as IG,
  SECTION_THEMES,
} from '../docs/complai-customer-demo-deck-content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'docs', 'complai-customer-demo-deck.pptx');
const HTML_OUT = join(ROOT, 'docs', 'complai-customer-demo-deck.html');
const COMPLAI_LOGO_SVG = join(ROOT, 'public', 'complai-logo.svg');
const COMPLAI_ICON_SVG = join(ROOT, 'public', 'complai-icon.svg');
const PROPEL_ICON_SVG = join(ROOT, 'public', 'propel-ready-icon.svg');
const PROPEL_ICON_RATIO = 88 / 64;

function svgDataUri(path) {
  const svg = readFileSync(path, 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function findChromeExecutable() {
  const localAppData = process.env.LOCALAPPDATA ?? '';
  const programFiles = process.env.PROGRAMFILES ?? 'C:\\Program Files';
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(programFiles.replace(' (x86)', ''), 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

/** pptxgenjs does not embed SVG reliably — rasterize via puppeteer (uses system Chrome/Edge when bundled browser missing). */
async function rasterizeSvgToPngDataUri(svgPath, { width = 480, height = 120 } = {}) {
  const svg = readFileSync(svgPath, 'utf8');
  const chromePath = findChromeExecutable();
  try {
    const puppeteer = await import('puppeteer');
    const launchOpts = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    if (chromePath) launchOpts.executablePath = chromePath;
    const browser = await puppeteer.default.launch(launchOpts);
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.setContent(
      `<!DOCTYPE html><html><body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center">${svg}</body></html>`
    );
    const png = await page.screenshot({ omitBackground: true, type: 'png' });
    await browser.close();
    return { dataUri: `image/png;base64,${png.toString('base64')}`, ok: true };
  } catch (err) {
    console.warn(`SVG rasterize failed for ${svgPath}: ${err.message}`);
    return { dataUri: null, ok: false };
  }
}

const COMPLAI_LOGO_HTML = svgDataUri(COMPLAI_LOGO_SVG);
const COMPLAI_ICON_HTML = svgDataUri(COMPLAI_ICON_SVG);
const PROPEL_ICON_HTML = svgDataUri(PROPEL_ICON_SVG);

const logoRaster = await rasterizeSvgToPngDataUri(COMPLAI_LOGO_SVG, { width: 480, height: 115 });
const iconRaster = await rasterizeSvgToPngDataUri(COMPLAI_ICON_SVG, { width: 96, height: 96 });
const propelIconRaster = await rasterizeSvgToPngDataUri(PROPEL_ICON_SVG, { width: 176, height: 128 });
const COMPLAI_LOGO_PPTX = logoRaster.dataUri;
const COMPLAI_ICON_PPTX = iconRaster.dataUri;
const PROPEL_ICON_PPTX = propelIconRaster.dataUri;
const PPTX_LOGOS_OK = logoRaster.ok && iconRaster.ok;
if (!PPTX_LOGOS_OK) {
  console.warn(
    'PPTX logo embed: using ComplAI wordmark text fallback (install Chrome/Edge or run `npx puppeteer browsers install chrome` for PNG logos).'
  );
}

const T = (s) =>
  String(s)
    .replace(/\u2194/g, '<->')
    .replace(/\u2192/g, '->')
    .replace(/\u00b7/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2022/g, '-')
    .replace(/→/g, '->')
    .replace(/·/g, '-');

const C = {
  brand: IG.brand,
  brandSecondary: IG.brandSecondary,
  brandDark: IG.brandDark,
  brandNavy: IG.brandNavy,
  brandNavyLight: IG.brandNavyLight,
  brandLight: IG.brandLight,
  brandMuted: IG.brandMuted,
  purple: IG.purple,
  purpleBg: IG.purpleLight,
  slate900: IG.slate900,
  slate700: IG.slate700,
  slate500: IG.slate500,
  slate200: IG.slate200,
  slate100: IG.slate100,
  white: IG.white,
  zinc100: DECK_BRAND.zinc100,
  zinc400: DECK_BRAND.zinc400,
  green: IG.green,
  greenBg: IG.greenLight,
  amber: IG.amber,
  amberBg: IG.amberLight,
  red: IG.red,
  redBg: IG.redLight,
};

const TOTAL = SLIDES.length;

function getSectionBg(section) {
  const theme = SECTION_THEMES[section];
  if (!theme) return C.brandNavyLight;
  switch (theme.tint) {
    case 'red':
      return '2A1818';
    case 'purple':
      return '1F1B2E';
    case 'green':
      return '0F2922';
    default:
      return C.brandNavyLight;
  }
}

function isDarkSection(section) {
  return SECTION_THEMES[section]?.dark !== false;
}

function getSectionTheme(section) {
  return SECTION_THEMES[section] ?? SECTION_THEMES.hero;
}

function addSpeakerNotes(slide, data) {
  if (data.notes) slide.addNotes(T(data.notes));
}

const COLOR_MAP = {
  brand: C.brand,
  brandDark: C.brandDark,
  brandLight: C.brandLight,
  purple: C.purple,
  purpleLight: IG.purpleLight,
  green: C.green,
  greenLight: IG.greenLight,
  amber: C.amber,
  amberLight: IG.amberLight,
  red: C.red,
  redLight: IG.redLight,
  slate: C.slate500,
  slate500: C.slate500,
};

function igColor(key) {
  return COLOR_MAP[key] ?? C.brand;
}

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = DECK_META.company;
pptx.title = DECK_META.title;
pptx.subject = DECK_META.subtitle;

function noLine() {
  return { width: 0 };
}

/** ComplAI wordmark for PPTX text fallback — green "Compl" + white "AI" with spacing. */
function addWordmarkPptx(slide, { x, y, fontSize = 14, h = 0.36 }) {
  const complW = Math.max(0.72, fontSize * 0.052);
  slide.addText('Compl', {
    x,
    y,
    w: complW,
    h,
    fontSize,
    bold: true,
    color: C.brandSecondary,
    fontFace: 'Arial',
  });
  slide.addText('AI', {
    x: x + complW + 0.02,
    y,
    w: Math.max(0.32, fontSize * 0.03),
    h,
    fontSize,
    bold: true,
    color: C.white,
    fontFace: 'Arial',
  });
}

function complaiWordmarkHtml(className = '') {
  const extra = className ? ` ${className}` : '';
  return `<span class="complai-wordmark${extra}"><span class="wordmark-compl">Compl</span><span class="wordmark-ai">AI</span></span>`;
}

function addHeader(slide, y = 0.08) {
  if (PPTX_LOGOS_OK) {
    slide.addImage({ data: COMPLAI_ICON_PPTX, x: 0.45, y, w: 0.26, h: 0.26 });
    slide.addImage({ data: COMPLAI_LOGO_PPTX, x: 7.15, y, w: 2.05, h: 0.48 });
    return;
  }
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.45,
    y,
    w: 0.26,
    h: 0.26,
    fill: { color: C.brand },
    line: noLine(),
    rectRadius: 0.06,
  });
  slide.addText('C', {
    x: 0.45,
    y,
    w: 0.26,
    h: 0.26,
    fontSize: 10,
    bold: true,
    color: C.white,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial',
  });
  addWordmarkPptx(slide, { x: 7.15, y: y + 0.04, fontSize: 14, h: 0.36 });
}

function addSlideChrome(slide, data, index, { dark = false, bgOverride } = {}) {
  const theme = getSectionTheme(data.section);
  const useDark = dark || isDarkSection(data.section);
  slide.background = { color: bgOverride ?? (useDark ? C.brandNavy : getSectionBg(data.section)) };
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.05,
    fill: { color: theme.accent },
    line: noLine(),
  });
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.78,
    y: 0.1,
    w: 1.85,
    h: 0.26,
    fill: { color: theme.accent },
    line: noLine(),
    rectRadius: 0.1,
  });
  slide.addText(T(theme.label), {
    x: 0.78,
    y: 0.1,
    w: 1.85,
    h: 0.26,
    fontSize: 7,
    bold: true,
    color: C.white,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial',
  });
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 9.05,
    y: 0.1,
    w: 0.5,
    h: 0.26,
    fill: { color: useDark ? C.brandMuted : C.slate200 },
    line: noLine(),
    rectRadius: 0.1,
  });
  slide.addText(String(index + 1), {
    x: 9.05,
    y: 0.1,
    w: 0.5,
    h: 0.26,
    fontSize: 8,
    bold: true,
    color: useDark ? C.zinc100 : C.slate700,
    align: 'center',
    valign: 'middle',
    fontFace: 'Arial',
  });
  addHeader(slide, 0.1);
}

function addFooter(slide, label, dark = false) {
  const color = dark ? C.zinc400 : C.slate500;
  const propelH = 0.3;
  const propelW = propelH * PROPEL_ICON_RATIO;
  slide.addText(label, { x: 0.4, y: 5.15, w: 5.0, h: 0.3, fontSize: 8, color, fontFace: 'Arial' });
  if (propelIconRaster.ok && PROPEL_ICON_PPTX) {
    slide.addImage({ data: PROPEL_ICON_PPTX, x: 9.05 - propelW, y: 5.1, w: propelW, h: propelH });
  }
  slide.addText('Confidential', {
    x: 7.15,
    y: 5.15,
    w: 1.3,
    h: 0.3,
    fontSize: 7,
    color,
    align: 'right',
    italic: true,
    fontFace: 'Arial',
  });
}

function addTitle(slide, title, subtitle, theme, y = 0.48, { dark = false } = {}) {
  slide.addText(T(title), {
    x: 0.45,
    y,
    w: 7.8,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: dark ? C.zinc100 : C.slate900,
    fontFace: 'Arial',
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.45,
    y: y + 0.62,
    w: 1.1,
    h: 0.05,
    fill: { color: theme?.accent ?? C.brand },
    line: noLine(),
  });
  if (subtitle) {
    slide.addText(T(subtitle), {
      x: 0.45,
      y: y + 0.72,
      w: 8.5,
      h: 0.4,
      fontSize: 10,
      color: dark ? C.zinc400 : C.slate500,
      fontFace: 'Arial',
    });
  }
}

function addBullets(slide, items, x, y, w, h, opts = {}) {
  const max = opts.max ?? items.length;
  const list = items.slice(0, max);
  const fontSize = opts.fontSize ?? (list.length > 4 ? 8.5 : 9.5);
  slide.addText(
    list.map((b, i) => ({
      text: opts.numbered ? `${i + 1}. ${T(b)}` : T(b),
      options: { bullet: !opts.numbered, breakLine: true },
    })),
    {
      x,
      y,
      w,
      h,
      fontSize,
      color: opts.color ?? C.slate700,
      fontFace: 'Arial',
      valign: 'top',
    }
  );
}

function addNumberedCallouts(slide, items, x, y, w, max = 4) {
  items.slice(0, max).forEach((text, i) => {
    const rowY = y + i * 0.42;
    slide.addShape(pptx.shapes.OVAL, {
      x,
      y: rowY + 0.02,
      w: 0.22,
      h: 0.22,
      fill: { color: C.brand },
      line: noLine(),
    });
    slide.addText(String(i + 1), {
      x,
      y: rowY + 0.02,
      w: 0.22,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: C.white,
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial',
    });
    slide.addText(T(text), {
      x: x + 0.3,
      y: rowY,
      w: w - 0.3,
      h: 0.34,
      fontSize: 8,
      color: C.slate700,
      fontFace: 'Arial',
    });
  });
}

function addRoundedBox(slide, x, y, w, h, fill, lineColor, radius = 0.08) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: lineColor ? { color: lineColor, width: 1 } : noLine(),
    rectRadius: radius,
  });
}

function addArrowRight(slide, x, y, w = 0.35, h = 0.2) {
  slide.addShape(pptx.shapes.RIGHT_ARROW, {
    x,
    y,
    w,
    h,
    fill: { color: C.brand },
    line: noLine(),
  });
}

function addProgressRing(slide, cx, cy, r, pct, color, label, value) {
  slide.addShape(pptx.shapes.OVAL, {
    x: cx - r,
    y: cy - r,
    w: r * 2,
    h: r * 2,
    fill: { color: C.slate200 },
    line: { color, width: 2 },
  });
  slide.addShape(pptx.shapes.OVAL, {
    x: cx - r + 0.08,
    y: cy - r + 0.08,
    w: (r - 0.08) * 2,
    h: (r - 0.08) * 2,
    fill: { color: C.white },
    line: noLine(),
  });
  slide.addText(String(value), {
    x: cx - r,
    y: cy - 0.12,
    w: r * 2,
    h: 0.28,
    fontSize: 11,
    bold: true,
    color: C.brandDark,
    align: 'center',
    fontFace: 'Arial',
  });
  slide.addText(T(label), {
    x: cx - r,
    y: cy + 0.12,
    w: r * 2,
    h: 0.2,
    fontSize: 6,
    color: C.slate500,
    align: 'center',
    fontFace: 'Arial',
  });
  const arcW = Math.max(0.12, (r * 2 * pct) / 100);
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: cx - r,
    y: cy + r - 0.06,
    w: arcW,
    h: 0.06,
    fill: { color },
    line: noLine(),
  });
}

function renderCoverageBarsPptx(slide, bars, x, y, w) {
  (bars ?? []).forEach((bar, i) => {
    const by = y + i * 0.38;
    slide.addText(T(bar.label), {
      x,
      y: by,
      w: 0.95,
      h: 0.24,
      fontSize: 7,
      color: C.slate700,
      fontFace: 'Arial',
    });
    addRoundedBox(slide, x + 1.0, by + 0.03, w - 1.45, 0.16, C.slate200, null, 0.04);
    addRoundedBox(slide, x + 1.0, by + 0.03, (w - 1.45) * (bar.pct / 100), 0.16, C.brand, null, 0.04);
    slide.addText(`${bar.pct}%`, {
      x: x + w - 0.4,
      y: by,
      w: 0.35,
      h: 0.24,
      fontSize: 7,
      bold: true,
      color: C.brand,
      align: 'right',
      fontFace: 'Arial',
    });
  });
}

function renderDomainBarsPptx(slide, domains, x, y, w) {
  (domains ?? []).forEach((d, i) => {
    const dy = y + i * 0.3;
    const barColor = d.status === 'green' ? C.green : d.status === 'amber' ? C.amber : C.red;
    slide.addText(T(d.name), {
      x,
      y: dy,
      w: 0.65,
      h: 0.22,
      fontSize: 6.5,
      color: C.slate700,
      fontFace: 'Arial',
    });
    addRoundedBox(slide, x + 0.7, dy + 0.03, w - 1.05, 0.14, C.slate200, null, 0.03);
    addRoundedBox(slide, x + 0.7, dy + 0.03, (w - 1.05) * (d.pct / 100), 0.14, barColor, null, 0.03);
    slide.addText(`${d.pct}%`, {
      x: x + w - 0.32,
      y: dy,
      w: 0.28,
      h: 0.22,
      fontSize: 6.5,
      bold: true,
      color: barColor,
      align: 'right',
      fontFace: 'Arial',
    });
  });
}

function renderFunnelPptx(slide, funnel, x, y, w, h) {
  if (funnel.title) {
    slide.addText(T(funnel.title), {
      x,
      y,
      w,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: C.brandDark,
      fontFace: 'Arial',
    });
  }
  const fy = y + (funnel.title ? 0.26 : 0);
  (funnel.tiers ?? []).forEach((tier, i) => {
    const tw = (w * tier.width) / 100;
    const tx = x + (w - tw) / 2;
    const ty = fy + i * (h * 0.16);
    addRoundedBox(slide, tx, ty, tw, h * 0.13, i === 0 ? C.brandDark : C.brandLight, C.brand, 0.05);
    slide.addText(T(`${tier.label} (${tier.count})`), {
      x: tx,
      y: ty,
      w: tw,
      h: h * 0.13,
      fontSize: 7,
      bold: true,
      color: i === 0 ? C.white : C.brandDark,
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial',
    });
  });
}

/** PPTX infographic renderers — draw into bounding box (x, y, w, h). */
function renderInfographicPptx(slide, info, box) {
  if (!info) return;
  const { x, y, w, h } = box;

  switch (info.kind) {
    case 'hero-rings':
    case 'hero-stats': {
      const stats = info.stats ?? [];
      stats.forEach((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = x + col * (w / 2 + 0.05) + w / 4;
        const cy = y + row * (h / 2 + 0.05) + h / 4;
        addProgressRing(slide, cx, cy, 0.42, s.pct ?? 100, C.brand, s.label, s.value);
      });
      break;
    }

    case 'agenda-roadmap': {
      (info.sections ?? []).forEach((sec, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const bx = x + col * (w / 3 + 0.02);
        const by = y + row * (h / 2 + 0.06);
        const bw = w / 3 - 0.04;
        const bh = h / 2 - 0.08;
        addRoundedBox(slide, bx, by, bw, bh, C.white, C.brand, 0.08);
        slide.addShape(pptx.shapes.OVAL, {
          x: bx + 0.1,
          y: by + 0.1,
          w: 0.28,
          h: 0.28,
          fill: { color: C.brand },
          line: noLine(),
        });
        slide.addText(String(sec.num), {
          x: bx + 0.1,
          y: by + 0.1,
          w: 0.28,
          h: 0.28,
          fontSize: 9,
          bold: true,
          color: C.white,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        slide.addText(T(sec.title), {
          x: bx + 0.45,
          y: by + 0.1,
          w: bw - 0.52,
          h: 0.28,
          fontSize: 8,
          bold: true,
          color: C.brandDark,
          fontFace: 'Arial',
        });
        slide.addText(T(sec.desc ?? ''), {
          x: bx + 0.12,
          y: by + 0.42,
          w: bw - 0.2,
          h: bh - 0.48,
          fontSize: 6.5,
          color: C.slate700,
          fontFace: 'Arial',
        });
      });
      break;
    }

    case 'value-quadrant': {
      (info.quadrants ?? []).forEach((q, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const qx = x + col * (w / 2 + 0.04);
        const qy = y + row * (h * 0.28);
        addRoundedBox(slide, qx, qy, w / 2 - 0.04, h * 0.24, C.white, igColor(q.color), 0.06);
        slide.addText(String(q.metric), {
          x: qx + 0.08,
          y: qy + 0.06,
          w: 0.55,
          h: 0.3,
          fontSize: 14,
          bold: true,
          color: igColor(q.color),
          fontFace: 'Arial',
        });
        slide.addText(T(q.title), {
          x: qx + 0.65,
          y: qy + 0.06,
          w: w / 2 - 0.75,
          h: 0.18,
          fontSize: 7.5,
          bold: true,
          color: C.slate900,
          fontFace: 'Arial',
        });
        slide.addText(T(q.desc ?? ''), {
          x: qx + 0.65,
          y: qy + 0.22,
          w: w / 2 - 0.75,
          h: 0.18,
          fontSize: 6.5,
          color: C.slate500,
          fontFace: 'Arial',
        });
      });
      const compY = y + h * 0.58;
      (info.comparison ?? []).forEach((c, i) => {
        const cy = compY + i * 0.32;
        slide.addText(T(c.label), {
          x,
          y: cy,
          w: 1.1,
          h: 0.22,
          fontSize: 6.5,
          color: C.slate700,
          fontFace: 'Arial',
        });
        addRoundedBox(slide, x + 1.15, cy + 0.04, 0.55, 0.14, C.redBg, C.red, 0.03);
        slide.addText(`${c.before}${c.unit ?? ''}`, {
          x: x + 1.15,
          y: cy + 0.04,
          w: 0.55,
          h: 0.14,
          fontSize: 6,
          bold: true,
          color: C.red,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        addArrowRight(slide, x + 1.75, cy + 0.05, 0.15, 0.12);
        addRoundedBox(slide, x + 1.95, cy + 0.04, 0.55, 0.14, C.greenBg, C.green, 0.03);
        slide.addText(`${c.after}${c.unit ?? ''}`, {
          x: x + 1.95,
          y: cy + 0.04,
          w: 0.55,
          h: 0.14,
          fontSize: 6,
          bold: true,
          color: C.green,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        const barW = w - 2.65;
        addRoundedBox(slide, x + 2.6, cy + 0.04, barW, 0.14, C.slate200, null, 0.03);
        addRoundedBox(slide, x + 2.6, cy + 0.04, barW * (c.after / 100), 0.14, C.brand, null, 0.03);
      });
      break;
    }

    case 'framework-honeycomb':
    case 'framework-grid': {
      const badges = info.badges ?? [];
      badges.forEach((b, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const offset = row % 2 === 1 ? 0.18 : 0;
        const bx = x + offset + col * (w / 4 + 0.02);
        const by = y + row * 0.3;
        addRoundedBox(slide, bx, by, w / 4 - 0.06, 0.26, C.brandLight, C.brand, 0.06);
        slide.addText(T(b), {
          x: bx,
          y: by,
          w: w / 4 - 0.06,
          h: 0.26,
          fontSize: 6,
          bold: true,
          color: C.brandDark,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
      });
      renderCoverageBarsPptx(slide, info.coverage, x, y + 1.0, w);
      break;
    }

    case 'before-after': {
      if (info.painIcons?.length) {
        const iconW = w / info.painIcons.length;
        info.painIcons.forEach((icon, i) => {
          const ix = x + i * iconW;
          addRoundedBox(slide, ix + 0.02, y, iconW - 0.04, 0.28, C.redBg, C.red, 0.05);
          slide.addText(T(icon), {
            x: ix + 0.02,
            y: y,
            w: iconW - 0.04,
            h: 0.28,
            fontSize: 6.5,
            bold: true,
            color: C.red,
            align: 'center',
            valign: 'middle',
            fontFace: 'Arial',
          });
        });
      }
      const baY = y + (info.painIcons?.length ? 0.35 : 0);
      const baH = h - (info.painIcons?.length ? 0.35 : 0);
      const half = w / 2 - 0.15;
      addRoundedBox(slide, x, baY, half, baH, C.redBg, C.red, 0.08);
      slide.addText(T(info.before.title), {
        x: x + 0.1,
        y: baY + 0.08,
        w: half - 0.2,
        h: 0.28,
        fontSize: 9,
        bold: true,
        color: C.red,
        fontFace: 'Arial',
      });
      (info.before.items ?? []).forEach((item, i) => {
        slide.addShape(pptx.shapes.OVAL, {
          x: x + 0.12,
          y: baY + 0.42 + i * 0.34,
          w: 0.1,
          h: 0.1,
          fill: { color: C.red },
          line: noLine(),
        });
        slide.addText(T(item), {
          x: x + 0.28,
          y: baY + 0.38 + i * 0.34,
          w: half - 0.35,
          h: 0.32,
          fontSize: 7.5,
          color: C.slate700,
          fontFace: 'Arial',
        });
      });
      addArrowRight(slide, x + half + 0.05, baY + baH / 2 - 0.1, 0.3, 0.2);
      const ax = x + half + 0.4;
      addRoundedBox(slide, ax, baY, half, baH, C.brandLight, C.brand, 0.08);
      slide.addText(T(info.after.title), {
        x: ax + 0.1,
        y: baY + 0.08,
        w: half - 0.2,
        h: 0.28,
        fontSize: 9,
        bold: true,
        color: C.brandDark,
        fontFace: 'Arial',
      });
      (info.after.items ?? []).forEach((item, i) => {
        slide.addShape(pptx.shapes.OVAL, {
          x: ax + 0.12,
          y: baY + 0.42 + i * 0.34,
          w: 0.1,
          h: 0.1,
          fill: { color: C.brand },
          line: noLine(),
        });
        slide.addText(T(item), {
          x: ax + 0.28,
          y: baY + 0.38 + i * 0.34,
          w: half - 0.35,
          h: 0.32,
          fontSize: 7.5,
          color: C.slate700,
          fontFace: 'Arial',
        });
      });
      break;
    }

    case 'partnership': {
      const bw = w * 0.38;
      addRoundedBox(slide, x, y + h * 0.2, bw, h * 0.6, C.white, C.slate200);
      slide.addText(T(info.left.label), {
        x,
        y: y + h * 0.32,
        w: bw,
        h: 0.35,
        fontSize: 11,
        bold: true,
        color: C.slate900,
        align: 'center',
        fontFace: 'Arial',
      });
      slide.addText(T(info.left.role), {
        x,
        y: y + h * 0.55,
        w: bw,
        h: 0.35,
        fontSize: 8,
        color: C.slate500,
        align: 'center',
        fontFace: 'Arial',
      });
      addArrowRight(slide, x + bw + 0.08, y + h * 0.45, 0.35, 0.18);
      addRoundedBox(slide, x + bw + 0.55, y + h * 0.15, w - bw * 2 - 0.55, h * 0.7, C.brandLight, C.brand);
      slide.addText(T(info.bridge), {
        x: x + bw + 0.6,
        y: y + h * 0.38,
        w: w - bw * 2 - 0.65,
        h: 0.4,
        fontSize: 10,
        bold: true,
        color: C.brandDark,
        align: 'center',
        fontFace: 'Arial',
      });
      addArrowRight(slide, x + w - bw - 0.43, y + h * 0.45, 0.35, 0.18);
      addRoundedBox(slide, x + w - bw, y + h * 0.2, bw, h * 0.6, C.brandNavy, C.brand);
      slide.addText(T(info.right.label), {
        x: x + w - bw,
        y: y + h * 0.32,
        w: bw,
        h: 0.35,
        fontSize: 11,
        bold: true,
        color: C.white,
        align: 'center',
        fontFace: 'Arial',
      });
      slide.addText(T(info.right.role), {
        x: x + w - bw,
        y: y + h * 0.55,
        w: bw,
        h: 0.35,
        fontSize: 8,
        color: C.brandSecondary,
        align: 'center',
        fontFace: 'Arial',
      });
      break;
    }

    case 'hub-spoke': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const hubR = 0.55;
      slide.addShape(pptx.shapes.OVAL, {
        x: cx - hubR,
        y: cy - hubR,
        w: hubR * 2,
        h: hubR * 2,
        fill: { color: C.brandDark },
        line: { color: C.brand, width: 2 },
      });
      slide.addText(T(info.hub), {
        x: cx - hubR,
        y: cy - 0.15,
        w: hubR * 2,
        h: 0.35,
        fontSize: 10,
        bold: true,
        color: C.white,
        align: 'center',
        fontFace: 'Arial',
      });
      const spokes = info.spokes ?? [];
      const radius = Math.min(w, h) * 0.42;
      spokes.forEach((label, i) => {
        const angle = (i / spokes.length) * Math.PI * 2 - Math.PI / 2;
        const sx = cx + Math.cos(angle) * radius;
        const sy = cy + Math.sin(angle) * radius;
        slide.addShape(pptx.shapes.LINE, {
          x: cx,
          y: cy,
          w: sx - cx,
          h: sy - cy,
          line: { color: C.slate200, width: 1.5 },
        });
        const bw = 0.85;
        const bh = 0.38;
        addRoundedBox(slide, sx - bw / 2, sy - bh / 2, bw, bh, C.white, C.slate200, 0.05);
        slide.addText(T(label), {
          x: sx - bw / 2,
          y: sy - bh / 2,
          w: bw,
          h: bh,
          fontSize: 6.5,
          bold: true,
          color: C.brandDark,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
      });
      break;
    }

    case 'rag-donut': {
      const segments = info.segments ?? [];
      const donutW = info.domainBars?.length ? w * 0.55 : w;
      slide.addChart(
        pptx.charts.DOUGHNUT,
        [
          {
            name: 'Compliance',
            labels: segments.map((s) => T(s.label)),
            values: segments.map((s) => s.value),
          },
        ],
        {
          x,
          y,
          w: donutW,
          h: h * 0.55,
          showLegend: true,
          legendPos: 'b',
          legendFontSize: 6,
          chartColors: segments.map((s) => igColor(s.color)),
          dataLabelFontSize: 7,
          showPercent: true,
        }
      );
      slide.addText(String(info.centerLabel ?? ''), {
        x: x + donutW * 0.25,
        y: y + h * 0.18,
        w: donutW * 0.5,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C.brandDark,
        align: 'center',
        fontFace: 'Arial',
      });
      if (info.centerSub) {
        slide.addText(T(info.centerSub), {
          x: x + donutW * 0.25,
          y: y + h * 0.34,
          w: donutW * 0.5,
          h: 0.2,
          fontSize: 7,
          color: C.slate500,
          align: 'center',
          fontFace: 'Arial',
        });
      }
      if (info.domainBars?.length) {
        renderDomainBarsPptx(slide, info.domainBars, x + donutW + 0.1, y + 0.05, w - donutW - 0.1);
      }
      break;
    }

    case 'pipeline': {
      const steps = info.steps ?? [];
      const stepW = (w - 0.3) / steps.length;
      if (info.title) {
        slide.addText(T(info.title), {
          x,
          y,
          w,
          h: 0.25,
          fontSize: 9,
          bold: true,
          color: C.brandDark,
          fontFace: 'Arial',
        });
      }
      const py = y + (info.title ? 0.3 : 0);
      steps.forEach((step, i) => {
        const sx = x + i * (stepW + 0.05);
        addRoundedBox(slide, sx, py, stepW, h * 0.35, i % 2 === 0 ? C.brandLight : C.white, C.brand, 0.06);
        slide.addText(T(step), {
          x: sx,
          y: py,
          w: stepW,
          h: h * 0.35,
          fontSize: 7,
          bold: true,
          color: C.brandDark,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        if (i < steps.length - 1) {
          addArrowRight(slide, sx + stepW + 0.02, py + h * 0.12, 0.12, 0.12);
        }
      });
      break;
    }

    case 'risk-matrix': {
      const rows = info.rows ?? [];
      const cols = info.cols ?? [];
      const cellW = (w - 0.6) / cols.length;
      const cellH = (h - 0.35) / rows.length;
      const heatColors = [IG.greenLight, 'BBF7D0', IG.amberLight, 'FED7AA', IG.redLight];
      slide.addText('Impact →', {
        x: x + 0.55,
        y,
        w: w - 0.6,
        h: 0.2,
        fontSize: 7,
        bold: true,
        color: C.slate500,
        align: 'center',
        fontFace: 'Arial',
      });
      rows.forEach((rowLabel, ri) => {
        slide.addText(T(rowLabel), {
          x,
          y: y + 0.25 + ri * cellH,
          w: 0.5,
          h: cellH,
          fontSize: 6,
          color: C.slate500,
          valign: 'middle',
          fontFace: 'Arial',
        });
        cols.forEach((_colLabel, ci) => {
          const level = info.cells?.[ri]?.[ci] ?? 0;
          addRoundedBox(
            slide,
            x + 0.55 + ci * cellW,
            y + 0.25 + ri * cellH + 0.02,
            cellW - 0.04,
            cellH - 0.04,
            heatColors[level] ?? C.slate200,
            C.slate200,
            0.03
          );
        });
      });
      break;
    }

    case 'funnel': {
      if (info.title) {
        slide.addText(T(info.title), {
          x,
          y,
          w,
          h: 0.25,
          fontSize: 9,
          bold: true,
          color: C.brandDark,
          fontFace: 'Arial',
        });
      }
      const fy = y + (info.title ? 0.3 : 0);
      (info.tiers ?? []).forEach((tier, i) => {
        const tw = (w * tier.width) / 100;
        const tx = x + (w - tw) / 2;
        const ty = fy + i * (h * 0.17);
        addRoundedBox(slide, tx, ty, tw, h * 0.14, i === 0 ? C.brandDark : C.brandLight, C.brand, 0.05);
        slide.addText(T(`${tier.label} (${tier.count})`), {
          x: tx,
          y: ty,
          w: tw,
          h: h * 0.14,
          fontSize: 7.5,
          bold: true,
          color: i === 0 ? C.white : C.brandDark,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
      });
      break;
    }

    case 'nodes': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      slide.addShape(pptx.shapes.OVAL, {
        x: cx - 0.45,
        y: cy - 0.35,
        w: 0.9,
        h: 0.7,
        fill: { color: C.brandDark },
        line: { color: C.brand, width: 2 },
      });
      slide.addText(T(info.center), {
        x: cx - 0.45,
        y: cy - 0.12,
        w: 0.9,
        h: 0.28,
        fontSize: 9,
        bold: true,
        color: C.white,
        align: 'center',
        fontFace: 'Arial',
      });
      const nodes = info.nodes ?? [];
      const r = Math.min(w, h) * 0.4;
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + Math.cos(angle) * r;
        const ny = cy + Math.sin(angle) * r;
        slide.addShape(pptx.shapes.LINE, {
          x: cx,
          y: cy,
          w: nx - cx,
          h: ny - cy,
          line: { color: C.brand, width: 1, dashType: 'dash' },
        });
        addRoundedBox(slide, nx - 0.5, ny - 0.22, 1.0, 0.44, C.white, C.slate200, 0.05);
        slide.addText(T(node.label), {
          x: nx - 0.5,
          y: ny - 0.18,
          w: 1.0,
          h: 0.22,
          fontSize: 7,
          bold: true,
          color: C.slate900,
          align: 'center',
          fontFace: 'Arial',
        });
        slide.addText(T(node.category ?? ''), {
          x: nx - 0.5,
          y: ny + 0.02,
          w: 1.0,
          h: 0.18,
          fontSize: 5.5,
          color: C.slate500,
          align: 'center',
          fontFace: 'Arial',
        });
      });
      break;
    }

    case 'workflow': {
      const steps = info.steps ?? [];
      const stepW = (w - 0.45) / steps.length;
      steps.forEach((step, i) => {
        const sx = x + i * (stepW + 0.12);
        addRoundedBox(slide, sx, y, stepW, h * 0.55, C.white, C.brand, 0.08);
        slide.addShape(pptx.shapes.OVAL, {
          x: sx + 0.08,
          y: y + 0.06,
          w: 0.22,
          h: 0.22,
          fill: { color: C.brand },
          line: noLine(),
        });
        slide.addText(String(i + 1), {
          x: sx + 0.08,
          y: y + 0.06,
          w: 0.22,
          h: 0.22,
          fontSize: 8,
          bold: true,
          color: C.white,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        slide.addText(T(step.label), {
          x: sx + 0.08,
          y: y + 0.32,
          w: stepW - 0.16,
          h: 0.25,
          fontSize: 8,
          bold: true,
          color: C.brandDark,
          fontFace: 'Arial',
        });
        slide.addText(T(step.desc ?? ''), {
          x: sx + 0.08,
          y: y + 0.55,
          w: stepW - 0.16,
          h: h * 0.35,
          fontSize: 6.5,
          color: C.slate700,
          fontFace: 'Arial',
        });
        if (i < steps.length - 1) {
          addArrowRight(slide, sx + stepW + 0.02, y + h * 0.22, 0.1, 0.12);
        }
      });
      break;
    }

    case 'dashboard': {
      const kpis = info.kpis ?? [];
      const kpiW = (w - 0.15) / 2;
      kpis.forEach((kpi, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const kx = x + col * (kpiW + 0.1);
        const ky = y + row * 0.72;
        addRoundedBox(slide, kx, ky, kpiW, 0.62, C.white, C.slate200, 0.06);
        slide.addText(T(kpi.label), {
          x: kx + 0.08,
          y: ky + 0.06,
          w: kpiW - 0.16,
          h: 0.2,
          fontSize: 7,
          color: C.slate500,
          fontFace: 'Arial',
        });
        slide.addText(String(kpi.value), {
          x: kx + 0.08,
          y: ky + 0.24,
          w: kpiW - 0.3,
          h: 0.32,
          fontSize: 16,
          bold: true,
          color: igColor(kpi.color ?? 'brand'),
          fontFace: 'Arial',
        });
        const trendChar = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';
        slide.addText(trendChar, {
          x: kx + kpiW - 0.28,
          y: ky + 0.28,
          w: 0.2,
          h: 0.25,
          fontSize: 12,
          color: kpi.trend === 'up' ? C.green : kpi.trend === 'down' ? C.amber : C.slate500,
          fontFace: 'Arial',
        });
      });
      if (info.domains?.length) {
        renderDomainBarsPptx(slide, info.domains, x, y + 1.35, w);
      }
      if (info.chartBars?.length) {
        const chartY = y + 2.55;
        const barW = w / info.chartBars.length;
        const maxVal = Math.max(...info.chartBars, 1);
        info.chartBars.forEach((val, i) => {
          const bx = x + i * barW;
          const bh = (val / maxVal) * 0.55;
          addRoundedBox(slide, bx + 0.02, chartY + 0.55 - bh, barW - 0.04, bh, C.brand, null, 0.03);
        });
        slide.addText('Trend', {
          x,
          y: chartY - 0.18,
          w,
          h: 0.16,
          fontSize: 6.5,
          bold: true,
          color: C.slate500,
          fontFace: 'Arial',
        });
      }
      break;
    }

    case 'tprm-combo': {
      const gauge = info.gauge ?? {};
      const pct = gauge.max ? (gauge.value / gauge.max) * 100 : 0;
      slide.addShape(pptx.shapes.ARC, {
        x: x + 0.1,
        y: y + 0.05,
        w: 1.6,
        h: 1.6,
        fill: { color: C.slate200 },
        line: { color: C.purple, width: 4 },
        angleRange: [180, 0],
      });
      slide.addText(String(gauge.value ?? ''), {
        x: x + 0.35,
        y: y + 0.55,
        w: 1.1,
        h: 0.35,
        fontSize: 18,
        bold: true,
        color: C.purple,
        align: 'center',
        fontFace: 'Arial',
      });
      slide.addText(T(gauge.label ?? 'Rating'), {
        x: x + 0.2,
        y: y + 0.88,
        w: 1.4,
        h: 0.2,
        fontSize: 7,
        color: C.slate500,
        align: 'center',
        fontFace: 'Arial',
      });
      slide.addText(T(gauge.tier ?? ''), {
        x: x + 0.35,
        y: y + 1.05,
        w: 1.1,
        h: 0.22,
        fontSize: 8,
        bold: true,
        color: C.green,
        align: 'center',
        fontFace: 'Arial',
      });
      renderFunnelPptx(slide, info.funnel ?? {}, x + 1.85, y, w - 1.85, h);
      break;
    }

    case 'category-nodes': {
      const cats = info.categories ?? [];
      const colW = w / Math.max(cats.length, 1);
      cats.forEach((cat, ci) => {
        const cx = x + ci * colW;
        addRoundedBox(slide, cx + 0.04, y, colW - 0.08, 0.26, igColor(cat.color), null, 0.05);
        slide.addText(T(cat.name), {
          x: cx + 0.04,
          y: y,
          w: colW - 0.08,
          h: 0.26,
          fontSize: 7,
          bold: true,
          color: C.white,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        (cat.nodes ?? []).forEach((node, ni) => {
          const ny = y + 0.34 + ni * 0.38;
          addRoundedBox(slide, cx + 0.06, ny, colW - 0.12, 0.32, C.white, C.slate200, 0.05);
          slide.addText(T(node), {
            x: cx + 0.06,
            y: ny,
            w: colW - 0.12,
            h: 0.32,
            fontSize: 6.5,
            bold: true,
            color: C.slate900,
            align: 'center',
            valign: 'middle',
            fontFace: 'Arial',
          });
        });
      });
      slide.addShape(pptx.shapes.OVAL, {
        x: x + w / 2 - 0.5,
        y: y + h - 0.48,
        w: 1.0,
        h: 0.38,
        fill: { color: C.brandDark },
        line: noLine(),
      });
      addWordmarkPptx(slide, {
        x: x + w / 2 - 0.46,
        y: y + h - 0.43,
        fontSize: 8,
        h: 0.28,
      });
      break;
    }

    case 'ai-workflow': {
      const cx = x + w / 2;
      const cy = y + h * 0.38;
      slide.addShape(pptx.shapes.OVAL, {
        x: cx - 0.55,
        y: cy - 0.4,
        w: 1.1,
        h: 0.8,
        fill: { color: C.brandDark },
        line: { color: C.brand, width: 2 },
      });
      slide.addText(T(info.brainLabel ?? 'AI'), {
        x: cx - 0.55,
        y: cy - 0.15,
        w: 1.1,
        h: 0.3,
        fontSize: 8,
        bold: true,
        color: C.white,
        align: 'center',
        fontFace: 'Arial',
      });
      slide.addText('*', {
        x: cx + 0.25,
        y: cy - 0.35,
        w: 0.2,
        h: 0.2,
        fontSize: 12,
        bold: true,
        color: C.amber,
        fontFace: 'Arial',
      });
      const steps = info.steps ?? [];
      const stepW = (w - 0.3) / steps.length;
      steps.forEach((step, i) => {
        const sx = x + i * (stepW + 0.08);
        const sy = y + h * 0.62;
        addRoundedBox(slide, sx, sy, stepW, h * 0.32, C.white, C.brand, 0.06);
        slide.addText(T(step.label), {
          x: sx + 0.06,
          y: sy + 0.06,
          w: stepW - 0.12,
          h: 0.16,
          fontSize: 7,
          bold: true,
          color: C.brandDark,
          fontFace: 'Arial',
        });
        slide.addText(T(step.desc ?? ''), {
          x: sx + 0.06,
          y: sy + 0.2,
          w: stepW - 0.12,
          h: 0.14,
          fontSize: 6,
          color: C.slate500,
          fontFace: 'Arial',
        });
      });
      break;
    }

    case 'outcomes-bars': {
      (info.metrics ?? []).forEach((m, i) => {
        const rowY = y + i * (h / 4.2);
        slide.addText(T(m.label), {
          x,
          y: rowY,
          w: 1.15,
          h: 0.22,
          fontSize: 7,
          color: C.slate700,
          fontFace: 'Arial',
        });
        addRoundedBox(slide, x + 1.2, rowY + 0.03, 0.7, 0.14, C.redBg, C.red, 0.03);
        slide.addText(`${m.before}${m.unit ?? ''}`, {
          x: x + 1.2,
          y: rowY + 0.03,
          w: 0.7,
          h: 0.14,
          fontSize: 6,
          bold: true,
          color: C.red,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        addArrowRight(slide, x + 1.95, rowY + 0.05, 0.12, 0.1);
        addRoundedBox(slide, x + 2.1, rowY + 0.03, 0.7, 0.14, C.greenBg, C.green, 0.03);
        slide.addText(`${m.after}${m.unit ?? ''}`, {
          x: x + 2.1,
          y: rowY + 0.03,
          w: 0.7,
          h: 0.14,
          fontSize: 6,
          bold: true,
          color: C.green,
          align: 'center',
          valign: 'middle',
          fontFace: 'Arial',
        });
        slide.addText(T(m.improvement ?? ''), {
          x: x + w - 0.65,
          y: rowY,
          w: 0.6,
          h: 0.22,
          fontSize: 7,
          bold: true,
          color: C.green,
          align: 'right',
          fontFace: 'Arial',
        });
      });
      break;
    }

    case 'contact-card': {
      addRoundedBox(slide, x, y, w, h, C.green, null, 0.12);
      slide.addText(T(info.thankYou ?? 'Thank you'), {
        x: x + 0.2,
        y: y + 0.35,
        w: w - 0.4,
        h: 0.55,
        fontSize: 22,
        bold: true,
        color: C.white,
        fontFace: 'Arial',
      });
      slide.addText(T(info.tagline ?? ''), {
        x: x + 0.2,
        y: y + 0.95,
        w: w - 0.4,
        h: 0.35,
        fontSize: 11,
        color: 'D1FAE5',
        fontFace: 'Arial',
      });
      slide.addText(T(`${DECK_META.contactEmail}\n${DECK_META.contactPhone}`), {
        x: x + 0.2,
        y: y + 1.45,
        w: w - 0.4,
        h: 0.7,
        fontSize: 10,
        color: C.white,
        fontFace: 'Arial',
      });
      break;
    }

    case 'before-after-columns': {
      break;
    }

    default:
      break;
  }
}

function slideHero(data, index) {
  const slide = pptx.addSlide();
  const theme = getSectionTheme(data.section);
  addSlideChrome(slide, data, index, { dark: true, bgOverride: C.brandNavy });
  if (PPTX_LOGOS_OK) {
    slide.addImage({ data: COMPLAI_LOGO_PPTX, x: 0.55, y: 0.55, w: 3.1, h: 0.74 });
  } else {
    addWordmarkPptx(slide, { x: 0.55, y: 0.55, fontSize: 36, h: 0.7 });
  }
  slide.addText(T(data.badge), {
    x: 0.55,
    y: 1.35,
    w: 5,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: C.brandSecondary,
    fontFace: 'Arial',
  });
  slide.addText(data.title, {
    x: 0.55,
    y: 1.75,
    w: 5.5,
    h: 0.85,
    fontSize: 44,
    bold: true,
    color: C.white,
    fontFace: 'Arial',
  });
  slide.addText(T(data.headline), {
    x: 0.55,
    y: 2.65,
    w: 5.5,
    h: 0.5,
    fontSize: 20,
    color: C.zinc100,
    fontFace: 'Arial',
  });
  slide.addText(T(data.subtitle), {
    x: 0.55,
    y: 3.25,
    w: 5.2,
    h: 1.0,
    fontSize: 11,
    color: C.zinc400,
    fontFace: 'Arial',
  });
  (data.pills ?? []).forEach((p, i) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.55 + (i % 2) * 2.4,
      y: 4.35 + Math.floor(i / 2) * 0.42,
      w: 2.25,
      h: 0.32,
      fill: { color: C.brandMuted },
      line: { color: C.brand, width: 0.75 },
      rectRadius: 0.15,
    });
    slide.addText(T(p), {
      x: 0.55 + (i % 2) * 2.4,
      y: 4.35 + Math.floor(i / 2) * 0.42,
      w: 2.25,
      h: 0.32,
      fontSize: 8,
      bold: true,
      color: C.white,
      align: 'center',
      valign: 'middle',
      fontFace: 'Arial',
    });
  });
  if (data.infographic) {
    renderInfographicPptx(slide, data.infographic, { x: 5.5, y: 1.0, w: 4.0, h: 2.8 });
  }
  addFooter(slide, `Slide ${index + 1} of ${TOTAL} - ${data.title}`, true);
  addSpeakerNotes(slide, data);
}

function slideAgenda(data, index) {
  const slide = pptx.addSlide();
  const theme = getSectionTheme(data.section);
  const dark = isDarkSection(data.section);
  addSlideChrome(slide, data, index);
  addTitle(slide, data.title, data.subtitle, theme, 1.35, { dark });
  if (data.infographic) {
    renderInfographicPptx(slide, data.infographic, { x: 0.45, y: 2.15, w: 9.1, h: 2.85 });
  }
  addFooter(slide, `Slide ${index + 1} of ${TOTAL}`, dark);
  addSpeakerNotes(slide, data);
}

function slideSplit(data, index) {
  const slide = pptx.addSlide();
  const theme = getSectionTheme(data.section);
  const dark = isDarkSection(data.section);
  addSlideChrome(slide, data, index);
  addTitle(slide, data.title, data.subtitle, theme, 1.35, { dark });
  let y = 2.45;
  for (const stat of data.stats ?? []) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.45,
      y,
      w: 4.3,
      h: 0.68,
      fill: { color: dark ? C.brandNavy : C.white },
      line: { color: dark ? C.brandMuted : C.slate200, width: 1 },
      rectRadius: 0.06,
    });
    slide.addText(String(stat.value), {
      x: 0.6,
      y: y + 0.1,
      w: 0.9,
      h: 0.45,
      fontSize: 18,
      bold: true,
      color: C.brand,
      fontFace: 'Arial',
    });
    slide.addText(T(stat.label), {
      x: 1.55,
      y: y + 0.12,
      w: 3.1,
      h: 0.45,
      fontSize: 8,
      color: dark ? C.zinc100 : C.slate700,
      valign: 'middle',
      fontFace: 'Arial',
    });
    y += 0.76;
  }
  if (data.bullets?.length) {
    addBullets(slide, data.bullets, 0.45, y + 0.05, 4.3, 5.0 - y - 0.25, {
      fontSize: 8.5,
      max: 4,
      color: dark ? C.zinc100 : C.slate700,
    });
  }
  if (data.infographic) {
    renderInfographicPptx(slide, data.infographic, { x: 5.0, y: 2.15, w: 4.55, h: 2.75 });
  } else if (data.highlight) {
    addRoundedBox(slide, 5.0, 2.15, 4.55, 2.75, C.brandMuted, C.brand, 0.1);
    slide.addText(T(data.highlight), {
      x: 5.2,
      y: 3.0,
      w: 4.15,
      h: 1,
      fontSize: 16,
      bold: true,
      color: C.brandSecondary,
      align: 'center',
      fontFace: 'Arial',
    });
  }
  addFooter(slide, `Slide ${index + 1} of ${TOTAL}`, dark);
  addSpeakerNotes(slide, data);
}

function slideContent(data, index) {
  const slide = pptx.addSlide();
  const theme = getSectionTheme(data.section);
  const dark = isDarkSection(data.section);
  addSlideChrome(slide, data, index);
  addTitle(slide, data.title, data.subtitle, theme, 1.35, { dark });
  const hasInfo = !!data.infographic;
  addBullets(slide, data.bullets ?? [], 0.45, 2.45, hasInfo ? 4.5 : 9.1, hasInfo ? 2.4 : 2.8, {
    fontSize: hasInfo ? 8.5 : 10,
    max: hasInfo ? 4 : 5,
    color: dark ? C.zinc100 : C.slate700,
  });
  if (data.infographic) {
    renderInfographicPptx(slide, data.infographic, { x: 5.1, y: 2.15, w: 4.45, h: 2.85 });
  }
  if (data.highlight) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.45,
      y: hasInfo ? 4.95 : 4.75,
      w: hasInfo ? 4.5 : 9.1,
      h: 0.5,
      fill: { color: C.brandMuted },
      line: { color: C.brand, width: 1 },
      rectRadius: 0.08,
    });
    slide.addText(T(data.highlight), {
      x: 0.55,
      y: hasInfo ? 5.0 : 4.8,
      w: hasInfo ? 4.3 : 8.9,
      h: 0.4,
      fontSize: hasInfo ? 9 : 11,
      bold: true,
      color: C.brandSecondary,
      align: 'center',
      fontFace: 'Arial',
    });
  }
  addFooter(slide, `Slide ${index + 1} of ${TOTAL}`, dark);
  addSpeakerNotes(slide, data);
}

function slideGrid(data, index) {
  const slide = pptx.addSlide();
  const theme = getSectionTheme(data.section);
  const dark = isDarkSection(data.section);
  addSlideChrome(slide, data, index);
  addTitle(slide, data.title, data.subtitle, theme, 1.35, { dark });
  const kind = data.infographic?.kind;
  const sideBySide = kind === 'value-quadrant' || kind === 'ai-workflow' || kind === 'category-nodes';
  const fullWidthBottom = kind === 'workflow' || kind === 'partnership';
  (data.cards ?? []).forEach((card, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cardX = sideBySide ? 0.45 + col * 2.35 : 0.45 + col * 4.65;
    const cardW = sideBySide ? 2.2 : 4.45;
    const cardY = 2.45 + row * (fullWidthBottom ? 1.05 : sideBySide ? 1.05 : 1.35);
    const cardH = fullWidthBottom ? 0.95 : sideBySide ? 0.95 : 1.25;
    addRoundedBox(slide, cardX, cardY, cardW, cardH, dark ? C.brandNavy : C.white, dark ? C.brandMuted : C.slate200, 0.08);
    slide.addText(T(card.title), {
      x: cardX + 0.12,
      y: cardY + 0.1,
      w: cardW - 0.2,
      h: 0.3,
      fontSize: sideBySide ? 9 : 10,
      bold: true,
      color: dark ? C.zinc100 : C.slate900,
      fontFace: 'Arial',
    });
    slide.addText(T(card.body), {
      x: cardX + 0.12,
      y: cardY + 0.38,
      w: cardW - 0.2,
      h: cardH - 0.45,
      fontSize: sideBySide ? 7.5 : 8.5,
      color: dark ? C.zinc400 : C.slate700,
      fontFace: 'Arial',
    });
  });
  if (data.infographic) {
    renderInfographicPptx(
      slide,
      data.infographic,
      sideBySide
        ? { x: 5.0, y: 2.15, w: 4.55, h: 2.85 }
        : fullWidthBottom
          ? { x: 0.45, y: 4.35, w: 9.1, h: 0.75 }
          : { x: 0.45, y: 2.15, w: 9.1, h: 2.85 }
    );
  }
  addFooter(slide, `Slide ${index + 1} of ${TOTAL}`, dark);
  addSpeakerNotes(slide, data);
}

function slideModules(data, index) {
  const slide = pptx.addSlide();
  const theme = getSectionTheme(data.section);
  const dark = isDarkSection(data.section);
  addSlideChrome(slide, data, index);
  addTitle(slide, data.title, data.subtitle, theme, 1.35, { dark });
  if (data.infographic?.kind === 'hub-spoke') {
    renderInfographicPptx(slide, data.infographic, { x: 5.0, y: 2.15, w: 4.55, h: 2.75 });
    (data.modules ?? []).slice(0, 6).forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.45 + col * 2.25;
      const y = 2.45 + row * 0.95;
      addRoundedBox(slide, x, y, 2.1, 0.85, dark ? C.brandNavy : C.white, dark ? C.brandMuted : C.slate200, 0.06);
      slide.addText(T(m.name), {
        x: x + 0.08,
        y: y + 0.08,
        w: 1.95,
        h: 0.28,
        fontSize: 7.5,
        bold: true,
        color: dark ? C.brandSecondary : C.brandDark,
        fontFace: 'Arial',
      });
      slide.addText(T(m.desc), {
        x: x + 0.08,
        y: y + 0.34,
        w: 1.95,
        h: 0.45,
        fontSize: 6.5,
        color: dark ? C.zinc400 : C.slate700,
        fontFace: 'Arial',
      });
    });
  } else {
    (data.modules ?? []).forEach((m, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.45 + col * 3.15;
      const y = 2.45 + row * 0.95;
      addRoundedBox(slide, x, y, 3.0, 0.85, dark ? C.brandNavy : C.white, dark ? C.brandMuted : C.slate200, 0.06);
      slide.addText(T(m.name), {
        x: x + 0.1,
        y: y + 0.08,
        w: 2.8,
        h: 0.28,
        fontSize: 8.5,
        bold: true,
        color: dark ? C.brandSecondary : C.brandDark,
        fontFace: 'Arial',
      });
      slide.addText(T(m.desc), {
        x: x + 0.1,
        y: y + 0.34,
        w: 2.8,
        h: 0.45,
        fontSize: 7,
        color: dark ? C.zinc400 : C.slate700,
        fontFace: 'Arial',
      });
    });
  }
  addFooter(slide, `Slide ${index + 1} of ${TOTAL}`, dark);
  addSpeakerNotes(slide, data);
}

function slideCta(data, index) {
  const slide = pptx.addSlide();
  const theme = getSectionTheme(data.section);
  const dark = isDarkSection(data.section);
  addSlideChrome(slide, data, index, { bgOverride: '0F2922' });
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0.45,
    w: 10,
    h: 4.65,
    fill: { color: '0F2922' },
    line: noLine(),
  });
  addTitle(slide, data.title, data.subtitle, theme, 1.35, { dark: true });

  const baRows = data.beforeAfter ?? [];
  let y = 2.35;
  baRows.slice(0, 4).forEach((row) => {
    addRoundedBox(slide, 0.45, y, 2.2, 0.3, C.brandNavy, C.brandMuted, 0.04);
    slide.addText(T(row.before), {
      x: 0.52,
      y: y + 0.04,
      w: 2.05,
      h: 0.24,
      fontSize: 7,
      color: C.zinc100,
      fontFace: 'Arial',
    });
    addArrowRight(slide, 2.7, y + 0.06, 0.15, 0.15);
    addRoundedBox(slide, 2.95, y, 2.35, 0.3, C.brandMuted, C.brand, 0.04);
    slide.addText(T(row.after), {
      x: 3.02,
      y: y + 0.04,
      w: 2.2,
      h: 0.24,
      fontSize: 7,
      bold: true,
      color: C.brandSecondary,
      fontFace: 'Arial',
    });
    y += 0.34;
  });

  slide.addText(T('Next steps'), {
    x: 0.45,
    y: y + 0.12,
    w: 3,
    h: 0.28,
    fontSize: 10,
    bold: true,
    color: C.zinc100,
    fontFace: 'Arial',
  });
  addNumberedCallouts(slide, data.nextSteps ?? [], 0.45, y + 0.42, 5.0, 3);

  slide.addText(T('Live demo walkthrough'), {
    x: 0.45,
    y: 4.05,
    w: 4,
    h: 0.25,
    fontSize: 9,
    bold: true,
    color: C.zinc100,
    fontFace: 'Arial',
  });
  addBullets(slide, data.demoSteps ?? [], 0.45, 4.3, 5.0, 0.75, {
    fontSize: 7.5,
    max: 4,
    color: C.zinc400,
  });

  if (data.infographic) {
    renderInfographicPptx(slide, data.infographic, { x: 5.5, y: 2.15, w: 4.05, h: 2.85 });
  }

  addFooter(slide, `Slide ${index + 1} of ${TOTAL}`, true);
  addSpeakerNotes(slide, data);
}

SLIDES.forEach((slide, index) => {
  switch (slide.type) {
    case 'hero':
      slideHero(slide, index);
      break;
    case 'agenda':
      slideAgenda(slide, index);
      break;
    case 'split':
      slideSplit(slide, index);
      break;
    case 'content':
      slideContent(slide, index);
      break;
    case 'grid':
      slideGrid(slide, index);
      break;
    case 'modules':
      slideModules(slide, index);
      break;
    case 'cta':
      slideCta(slide, index);
      break;
    default:
      slideContent(slide, index);
  }
});

await pptx.writeFile({ fileName: OUT, compression: true });
console.log(`Created ${OUT} (${TOTAL} slides)`);

/* ── HTML renderer ── */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function complaiWordmarkLabel(text, className = '') {
  return text === 'ComplAI' ? complaiWordmarkHtml(className) : esc(text);
}

function svgDonut(segments, centerLabel, centerSub) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  const r = 42;
  const cx = 60;
  const cy = 60;
  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const angle = pct * 360;
    const start = offset;
    offset += angle;
    const large = angle > 180 ? 1 : 0;
    const a1 = ((start - 90) * Math.PI) / 180;
    const a2 = ((start + angle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const color = igColor(seg.color);
    return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="#${color}" opacity="0.92"/>`;
  });
  const legend = segments
    .map(
      (seg) =>
        `<span class="donut-legend-item"><span class="donut-swatch" style="background:#${igColor(seg.color)}"></span>${esc(seg.label)} ${seg.value}%</span>`
    )
    .join('');
  return `<div class="infographic infographic--donut">
    <svg viewBox="0 0 120 120" class="donut-svg" aria-hidden="true">${paths.join('')}<circle cx="${cx}" cy="${cy}" r="24" fill="white"/></svg>
    <div class="donut-center"><strong>${esc(centerLabel ?? '')}</strong><span>${esc(centerSub ?? '')}</span></div>
    <div class="donut-legend">${legend}</div>
  </div>`;
}

function htmlChrome(slide, index) {
  const theme = getSectionTheme(slide.section);
  return `<div class="slide-chrome">
    <div class="slide-chrome-accent" style="background:#${theme.accent}"></div>
    <div class="slide-chrome-bar">
      <img src="${COMPLAI_ICON_HTML}" alt="" class="slide-icon" aria-hidden="true" />
      <span class="slide-section-label" style="background:#${theme.accent}">${esc(theme.label)}</span>
      <img src="${COMPLAI_LOGO_HTML}" alt="ComplAI" class="slide-logo" />
      <span class="slide-num-badge">${index + 1}</span>
    </div>
  </div>`;
}

function htmlSectionClass(section) {
  const theme = getSectionTheme(section);
  if (theme.tint === 'red') return ' slide--tint-red';
  if (theme.tint === 'purple') return ' slide--tint-purple';
  if (theme.tint === 'green') return ' slide--tint-green';
  return ' slide--tint-brand';
}

function renderInfographicHtml(info, slide) {
  if (!info) return '';

  switch (info.kind) {
    case 'hero-rings':
    case 'hero-stats':
      return `<div class="infographic infographic--hero-rings">${(info.stats ?? [])
        .map(
          (s) =>
            `<div class="hero-ring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="4"/><circle cx="22" cy="22" r="18" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="${(s.pct ?? 100) * 1.13} 113" transform="rotate(-90 22 22)"/></svg><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`
        )
        .join('')}</div>`;

    case 'agenda-roadmap':
      return `<div class="infographic infographic--agenda">${(info.sections ?? [])
        .map(
          (sec) =>
            `<div class="agenda-card"><span class="agenda-num">${sec.num}</span><div><strong>${esc(sec.title)}</strong><p>${esc(sec.desc ?? '')}</p></div></div>`
        )
        .join('')}</div>`;

    case 'value-quadrant':
      return `<div class="infographic infographic--value-quadrant">
        <div class="quadrant-grid">${(info.quadrants ?? [])
          .map(
            (q) =>
              `<div class="quadrant" style="border-color:#${igColor(q.color)}"><strong class="quadrant-metric" style="color:#${igColor(q.color)}">${esc(q.metric)}</strong><span>${esc(q.title)}</span><small>${esc(q.desc ?? '')}</small></div>`
          )
          .join('')}</div>
        <div class="comparison-bars">${(info.comparison ?? [])
          .map(
            (c) =>
              `<div class="comparison-row"><span>${esc(c.label)}</span><em class="cmp-before">${c.before}${esc(c.unit ?? '')}</em><span class="cmp-arrow">→</span><em class="cmp-after">${c.after}${esc(c.unit ?? '')}</em><div class="cmp-track"><div class="cmp-fill" style="width:${c.after}%"></div></div></div>`
          )
          .join('')}</div>
      </div>`;

    case 'before-after': {
      const painRow = (info.painIcons ?? [])
        .map((icon) => `<span class="pain-icon">${esc(icon)}</span>`)
        .join('');
      return `<div class="infographic infographic--before-after">
        ${painRow ? `<div class="pain-icons">${painRow}</div>` : ''}
        <div class="ba-cols">
          <div class="ba-col ba-col--before"><h4>${esc(info.before.title)}</h4><ul>${(info.before.items ?? []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
          <div class="ba-arrow" aria-hidden="true">→</div>
          <div class="ba-col ba-col--after"><h4>${esc(info.after.title)}</h4><ul>${(info.after.items ?? []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
        </div>
      </div>`;
    }

    case 'partnership':
      return `<div class="infographic infographic--partnership">
        <div class="partner-box"><strong>${esc(info.left.label)}</strong><span>${esc(info.left.role)}</span></div>
        <div class="partner-bridge">${esc(info.bridge)}</div>
        <div class="partner-box partner-box--brand"><strong>${complaiWordmarkLabel(info.right.label)}</strong><span>${esc(info.right.role)}</span></div>
      </div>`;

    case 'hub-spoke': {
      const spokes = info.spokes ?? [];
      const lines = spokes
        .map((_, i) => {
          const angle = (i / spokes.length) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x2 = 50 + Math.cos(rad) * 38;
          const y2 = 50 + Math.sin(rad) * 38;
          return `<line x1="50" y1="50" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#e2e8f0" stroke-width="1.5"/>`;
        })
        .join('');
      const spokeHtml = spokes
        .map((label, i) => {
          const angle = (i / spokes.length) * 360 - 90;
          return `<div class="hub-spoke-item" style="--angle:${angle}deg"><span>${esc(label)}</span></div>`;
        })
        .join('');
      return `<div class="infographic infographic--hub"><svg class="hub-lines" viewBox="0 0 100 100" aria-hidden="true">${lines}</svg><div class="hub-center">${complaiWordmarkLabel(info.hub ?? 'ComplAI')}</div>${spokeHtml}</div>`;
    }

    case 'framework-honeycomb':
    case 'framework-grid':
      return `<div class="infographic infographic--frameworks">
        <div class="framework-badges framework-badges--honey">${(info.badges ?? [])
          .map((b, i) => `<span class="framework-badge${i % 2 === 1 ? ' framework-badge--offset' : ''}">${esc(b)}</span>`)
          .join('')}</div>
        <div class="coverage-bars">${(info.coverage ?? [])
          .map(
            (bar) =>
              `<div class="coverage-row"><span>${esc(bar.label)}</span><div class="coverage-track"><div class="coverage-fill" style="width:${bar.pct}%"></div></div><em>${bar.pct}%</em></div>`
          )
          .join('')}</div>
      </div>`;

    case 'rag-donut': {
      const donut = svgDonut(info.segments ?? [], info.centerLabel, info.centerSub);
      const domainBars = (info.domainBars ?? [])
        .map(
          (d) =>
            `<div class="domain-row"><span>${esc(d.name)}</span><div class="domain-track"><div class="domain-fill domain-fill--${esc(d.status)}" style="width:${d.pct}%"></div></div><em>${d.pct}%</em></div>`
        )
        .join('');
      return `<div class="infographic infographic--rag-donut"><div class="rag-donut-main">${donut}</div>${domainBars ? `<div class="rag-domain-bars">${domainBars}</div>` : ''}</div>`;
    }

    case 'pipeline':
      return `<div class="infographic infographic--pipeline">${info.title ? `<h4>${esc(info.title)}</h4>` : ''}<div class="pipeline-steps">${(info.steps ?? [])
        .map((s, i) => `<span class="pipeline-step">${esc(s)}</span>${i < info.steps.length - 1 ? '<span class="pipeline-arrow">→</span>' : ''}`)
        .join('')}</div></div>`;

    case 'risk-matrix': {
      const heat = ['heat-0', 'heat-1', 'heat-2', 'heat-3', 'heat-4'];
      const rows = info.rows ?? [];
      const cols = info.cols ?? [];
      const cells = rows
        .map(
          (row, ri) =>
            `<div class="matrix-row"><span class="matrix-label">${esc(row)}</span>${cols
              .map((_, ci) => `<div class="matrix-cell ${heat[info.cells?.[ri]?.[ci] ?? 0]}"></div>`)
              .join('')}</div>`
        )
        .join('');
      return `<div class="infographic infographic--matrix"><div class="matrix-header">Impact →</div>${cells}</div>`;
    }

    case 'funnel':
      return `<div class="infographic infographic--funnel">${info.title ? `<h4>${esc(info.title)}</h4>` : ''}${(info.tiers ?? [])
        .map((t) => `<div class="funnel-tier" style="width:${t.width}%"><span>${esc(t.label)}</span><em>${t.count}</em></div>`)
        .join('')}</div>`;

    case 'nodes': {
      const nodes = info.nodes ?? [];
      const nodeHtml = nodes
        .map((node, i) => {
          const angle = (i / nodes.length) * 360 - 90;
          return `<div class="node-item" style="--angle:${angle}deg"><strong>${esc(node.label)}</strong><small>${esc(node.category ?? '')}</small></div>`;
        })
        .join('');
      return `<div class="infographic infographic--nodes"><div class="node-center">${complaiWordmarkLabel(info.center ?? 'ComplAI')}</div>${nodeHtml}</div>`;
    }

    case 'workflow':
      return `<div class="infographic infographic--workflow">${(info.steps ?? [])
        .map(
          (step, i) =>
            `<div class="workflow-step"><span class="workflow-num">${i + 1}</span><strong>${esc(step.label)}</strong><p>${esc(step.desc ?? '')}</p></div>${i < info.steps.length - 1 ? '<span class="workflow-arrow">→</span>' : ''}`
        )
        .join('')}</div>`;

    case 'dashboard': {
      const chartBars = (info.chartBars ?? [])
        .map((v, i) => `<div class="chart-bar" style="height:${v}%" title="${v}"></div>`)
        .join('');
      return `<div class="infographic infographic--dashboard">
        <div class="kpi-grid">${(info.kpis ?? [])
          .map(
            (k) =>
              `<div class="kpi-tile"><span class="kpi-label">${esc(k.label)}</span><strong class="kpi-value kpi-value--${esc(k.color ?? 'brand')}">${esc(k.value)}</strong><span class="kpi-trend kpi-trend--${esc(k.trend ?? 'flat')}">${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'}</span></div>`
          )
          .join('')}</div>
        <div class="domain-bars">${(info.domains ?? [])
          .map(
            (d) =>
              `<div class="domain-row"><span>${esc(d.name)}</span><div class="domain-track"><div class="domain-fill domain-fill--${esc(d.status)}" style="width:${d.pct}%"></div></div><em>${d.pct}%</em></div>`
          )
          .join('')}</div>
        ${chartBars ? `<div class="chart-bars">${chartBars}</div>` : ''}
      </div>`;
    }

    case 'tprm-combo':
      return `<div class="infographic infographic--tprm-combo">
        <div class="tprm-gauge"><svg viewBox="0 0 100 60" aria-hidden="true"><path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#ede9fe" stroke-width="8"/><path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#7c3aed" stroke-width="8" stroke-dasharray="${((info.gauge?.value ?? 0) / (info.gauge?.max ?? 950)) * 126} 126"/></svg><strong>${esc(info.gauge?.value ?? '')}</strong><span>${esc(info.gauge?.label ?? '')}</span><em>${esc(info.gauge?.tier ?? '')}</em></div>
        <div class="tprm-funnel">${info.funnel?.title ? `<h4>${esc(info.funnel.title)}</h4>` : ''}${(info.funnel?.tiers ?? [])
          .map((t) => `<div class="funnel-tier" style="width:${t.width}%"><span>${esc(t.label)}</span><em>${t.count}</em></div>`)
          .join('')}</div>
      </div>`;

    case 'category-nodes':
      return `<div class="infographic infographic--category-nodes">${(info.categories ?? [])
        .map(
          (cat) =>
            `<div class="cat-col"><span class="cat-label" style="background:#${igColor(cat.color)}">${esc(cat.name)}</span>${(cat.nodes ?? []).map((n) => `<span class="cat-node">${esc(n)}</span>`).join('')}</div>`
        )
        .join('')}<div class="cat-center">${complaiWordmarkLabel(info.center ?? 'ComplAI')}</div></div>`;

    case 'ai-workflow':
      return `<div class="infographic infographic--ai-workflow">
        <div class="ai-brain"><span class="ai-spark">✦</span><strong>${esc(info.brainLabel ?? 'AI')}</strong></div>
        <div class="ai-steps">${(info.steps ?? [])
          .map(
            (step) =>
              `<div class="ai-step"><strong>${esc(step.label)}</strong><span>${esc(step.desc ?? '')}</span></div>`
          )
          .join('')}</div>
      </div>`;

    case 'outcomes-bars':
      return `<div class="infographic infographic--outcomes">${(info.metrics ?? [])
        .map(
          (m) =>
            `<div class="outcome-row"><span>${esc(m.label)}</span><em class="out-before">${m.before}${esc(m.unit ?? '')}</em><span>→</span><em class="out-after">${m.after}${esc(m.unit ?? '')}</em><strong>${esc(m.improvement ?? '')}</strong></div>`
        )
        .join('')}</div>`;

    case 'contact-card':
      return `<div class="infographic infographic--contact-card"><h3>${esc(info.thankYou ?? 'Thank you')}</h3><p>${esc(info.tagline ?? '')}</p><div class="contact-details">${esc(DECK_META.contactEmail)}<br/>${esc(DECK_META.contactPhone)}</div></div>`;

    case 'before-after-columns': {
      const rows = slide.beforeAfter ?? [];
      const bLabel = info.beforeLabel ?? 'Before';
      const aLabel = info.afterLabel ?? 'After';
      return `<div class="infographic infographic--ba-columns">
        <div class="ba-columns-header"><span class="ba-h-before">${esc(bLabel)}</span><span class="ba-h-after">${esc(aLabel)}</span></div>
        ${rows
          .map(
            (r) =>
              `<div class="ba-columns-row"><span class="ba-before">${esc(r.before)}</span><span class="ba-arrow-inline">→</span><span class="ba-after">${esc(r.after)}</span></div>`
          )
          .join('')}
      </div>`;
    }

    default:
      return '';
  }
}

function renderSlideHtml(slide, index) {
  const footer = `<footer class="footer"><span>Slide ${index + 1} of ${TOTAL}</span><div class="footer-brand"><span class="confidential">Confidential</span><img src="${PROPEL_ICON_HTML}" alt="${esc(DECK_META.company)}" class="footer-company-logo" /></div></footer>`;
  const chrome = htmlChrome(slide, index);
  const tintClass = htmlSectionClass(slide.section);
  const infoHtml = renderInfographicHtml(slide.infographic, slide);

  if (slide.type === 'hero') {
    const pills = (slide.pills ?? []).map((p) => `<span class="pill">${esc(p)}</span>`).join('');
    return `<section class="slide slide--hero${tintClass}${index === 0 ? ' active' : ''}">${chrome}
      <div class="hero-layout">
        <div class="hero-text">
          <img src="${COMPLAI_LOGO_HTML}" alt="ComplAI" class="hero-logo" />
          <span class="badge">${esc(slide.badge)}</span>
          <p class="headline">${esc(slide.headline)}</p>
          <p class="subtitle">${esc(slide.subtitle)}</p>
          <div class="pill-row">${pills}</div>
        </div>
        ${infoHtml ? `<div class="hero-visual">${infoHtml}</div>` : ''}
      </div>${footer}</section>`;
  }

  if (slide.type === 'agenda') {
    return `<section class="slide${tintClass}">${chrome}
      <header class="slide-header"><h2>${esc(slide.title)}</h2>${slide.subtitle ? `<p>${esc(slide.subtitle)}</p>` : ''}</header>
      ${infoHtml ? `<div class="slide-body slide-body--agenda">${infoHtml}</div>` : ''}${footer}</section>`;
  }

  const header = `<header class="slide-header"><h2>${esc(slide.title)}</h2>${slide.subtitle ? `<p>${esc(slide.subtitle)}</p>` : ''}</header>`;

  if (slide.type === 'modules') {
    const mods = (slide.modules ?? [])
      .map((m) => `<div class="module-card"><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p></div>`)
      .join('');
    const hasHub = slide.infographic?.kind === 'hub-spoke';
    return `<section class="slide${tintClass}">${chrome}${header}
      <div class="slide-body${hasHub ? ' slide-body--modules-hub' : ''}">
        <div class="module-grid${hasHub ? ' module-grid--compact' : ''}">${mods}</div>
        ${infoHtml ? `<div class="col-visual">${infoHtml}</div>` : ''}
      </div>${footer}</section>`;
  }

  if (slide.type === 'grid') {
    const cards = (slide.cards ?? [])
      .map((c) => `<div class="value-card"><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></div>`)
      .join('');
    const kind = slide.infographic?.kind;
    const sideBySide = kind === 'value-quadrant' || kind === 'ai-workflow' || kind === 'category-nodes';
    const fullWidthBottom = kind === 'workflow' || kind === 'partnership';
    return `<section class="slide${tintClass}">${chrome}${header}
      <div class="slide-body slide-body--grid${sideBySide ? ' slide-body--grid-side' : ''}${fullWidthBottom ? ' slide-body--grid-workflow' : ''}">
        <div class="value-grid">${cards}</div>
        ${infoHtml ? `<div class="${sideBySide ? 'col-visual' : 'infographic-row'}">${infoHtml}</div>` : ''}
      </div>${footer}</section>`;
  }

  if (slide.type === 'cta') {
    const baRows = (slide.beforeAfter ?? [])
      .map((r) => `<div class="cta-ba-row"><span class="cta-before">${esc(r.before)}</span><span class="cta-arrow">→</span><span class="cta-after">${esc(r.after)}</span></div>`)
      .join('');
    const nextSteps = (slide.nextSteps ?? [])
      .map((s, i) => `<li><span class="step-num">${i + 1}</span>${esc(s)}</li>`)
      .join('');
    const demoSteps = (slide.demoSteps ?? []).map((s) => `<li>${esc(s)}</li>`).join('');
    return `<section class="slide slide--cta${tintClass}">${chrome}${header}
      <div class="cta-layout">
        <div class="cta-main">
          <div class="cta-ba">${baRows}</div>
          <h3 class="cta-sub">Next steps</h3>
          <ol class="next-steps">${nextSteps}</ol>
          <h3 class="cta-sub">Live demo walkthrough</h3>
          <ol class="demo-steps">${demoSteps}</ol>
        </div>
        ${infoHtml ? `<div class="cta-visual">${infoHtml}</div>` : ''}
      </div>${footer}</section>`;
  }

  const stats = (slide.stats ?? [])
    .map((s) => `<div class="stat-chip"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`)
    .join('');
  const bullets = (slide.bullets ?? [])
    .map((b) => `<div class="bullet"><span class="bullet-icon bullet-icon--brand">•</span><span>${esc(b)}</span></div>`)
    .join('');
  const highlight = slide.highlight ? `<div class="highlight-bar">${esc(slide.highlight)}</div>` : '';

  if (slide.type === 'split') {
    return `<section class="slide${tintClass}">${chrome}${header}<div class="slide-body slide-body--split">
      <div class="col-text">${stats}${bullets}</div>
      ${infoHtml ? `<div class="col-visual">${infoHtml}</div>` : slide.highlight ? `<div class="col-visual"><div class="highlight-panel">${esc(slide.highlight)}</div></div>` : ''}
    </div>${footer}</section>`;
  }

  return `<section class="slide${tintClass}">${chrome}${header}<div class="slide-body slide-body--content">
    <div class="col-text">${stats}${bullets}${highlight}</div>
    ${infoHtml ? `<div class="col-visual">${infoHtml}</div>` : ''}
  </div>${footer}</section>`;
}

const htmlSlides = SLIDES.map((s, i) => renderSlideHtml(s, i)).join('\n');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(DECK_META.title)} — Customer Demo</title>
  <style>
    :root { --brand:#10b981; --brand-secondary:#34d399; --brand-dark:#059669; --brand-navy:#12141c; --brand-navy-light:#1e212b; --brand-light:#d1fae5; --brand-muted:#064e3b; --purple:#7c3aed; --purple-light:#2e1065; --green-light:#064e3b; --red-light:#3f1d1d; --slate-900:#12141c; --slate-700:#3f3f46; --slate-500:#a1a1aa; --slate-200:#3f3f46; --green:#059669; --amber:#d97706; --red:#dc2626; --zinc-100:#f4f4f5; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:"Segoe UI",system-ui,sans-serif; background:#060708; color:var(--zinc-100); overflow:hidden; height:100vh; }
    .deck { width:100vw; height:100vh; position:relative; }
    .slide { position:absolute; inset:0; display:none; padding:3.1rem 2.75rem 1.75rem; background:linear-gradient(180deg,#3d404c 0%,#2c303b 45%,#181b24 100%); color:var(--zinc-100); flex-direction:column; }
    .slide.active { display:flex; }
    .slide--tint-brand { background:linear-gradient(180deg,#3d404c 0%,#2c303b 45%,#181b24 100%); }
    .slide--tint-red { background:linear-gradient(180deg,#3d2a2a 0%,#2a1818 55%,#181b24 100%); }
    .slide--tint-purple { background:linear-gradient(180deg,#2e2640 0%,#1f1b2e 55%,#181b24 100%); }
    .slide--tint-green, .slide--cta { background:linear-gradient(180deg,#0f2922 0%,#064e3b 45%,#12141c 100%); }
    .slide--hero { background:linear-gradient(180deg,#454956 0%,#323641 24%,#22252f 52%,#12141c 78%,#060708 100%); color:white; padding-top:3.1rem; }
    .slide-chrome { position:absolute; top:0; left:0; right:0; z-index:2; }
    .slide-chrome-accent { height:4px; width:100%; }
    .slide-chrome-bar { display:flex; align-items:center; gap:.75rem; padding:.45rem 1.5rem .35rem 2.75rem; }
    .slide-icon { height:1.35rem; width:1.35rem; flex-shrink:0; }
    .slide-section-label { color:white; font-size:.62rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:.22rem .55rem; border-radius:999px; }
    .slide-logo { height:1.65rem; width:auto; margin-left:auto; }
    .slide-num-badge { background:var(--brand-muted); color:var(--zinc-100); font-size:.68rem; font-weight:800; width:1.35rem; height:1.35rem; border-radius:999px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(16,185,129,.35); }
    .slide--hero .slide-num-badge { background:rgba(255,255,255,.08); color:white; border-color:rgba(255,255,255,.15); }
    .slide-header h2 { font-size:clamp(1.35rem,2.2vw,1.85rem); font-weight:800; color:var(--zinc-100); }
    .slide-header p { margin-top:.35rem; color:var(--slate-500); font-size:.88rem; max-width:52rem; }
    .slide-body { flex:1; display:flex; gap:1.25rem; min-height:0; }
    .slide-body--split, .slide-body--content { display:flex; gap:1.25rem; }
    .slide-body--modules-hub { display:grid; grid-template-columns:1fr 38%; gap:1rem; }
    .slide-body--grid { flex-direction:column; }
    .slide-body--grid-side { flex-direction:row; }
    .slide-body--grid-side .value-grid { flex:0 0 48%; grid-template-columns:1fr 1fr; align-content:start; }
    .slide-body--grid-side .col-visual { flex:1; }
    .slide-body--grid-workflow .value-grid { flex:0; }
    .slide-body--agenda { display:block; }
    .col-text { flex:1; display:flex; flex-direction:column; gap:.65rem; overflow-y:auto; }
    .col-visual { flex:0 0 38%; display:flex; align-items:stretch; justify-content:center; }
    .col-visual .infographic { width:100%; }
    .badge { font-size:.68rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--brand-secondary); }
    .hero-logo { height:3.25rem; width:auto; margin-bottom:1rem; display:block; }
    .hero-layout { display:flex; gap:2rem; flex:1; align-items:center; }
    .hero-text { flex:1; }
    .hero-visual { flex:0 0 36%; }
    .complai-wordmark { display:inline-flex; align-items:baseline; gap:0.04em; white-space:nowrap; line-height:1; }
    .wordmark-compl { color:var(--brand-secondary); font-weight:800; }
    .wordmark-ai { color:#ffffff; font-weight:800; }
    .hub-center .complai-wordmark, .node-center .complai-wordmark, .cat-center .complai-wordmark, .partner-box--brand .complai-wordmark { font-size:inherit; }
    .headline { margin-top:.5rem; font-size:clamp(1rem,1.6vw,1.35rem); color:var(--zinc-100); }
    .subtitle { margin-top:.75rem; font-size:.95rem; line-height:1.55; color:var(--slate-500); max-width:36rem; }
    .pill-row { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1rem; }
    .pill { background:rgba(6,78,59,.55); border:1px solid rgba(16,185,129,.45); padding:.35rem .7rem; border-radius:999px; font-size:.78rem; font-weight:600; color:var(--zinc-100); }
    .stat-chip { display:flex; gap:.65rem; background:var(--brand-navy-light); border:1px solid rgba(255,255,255,.1); border-radius:.75rem; padding:.65rem .85rem; }
    .stat-chip strong { font-size:1.2rem; font-weight:800; color:var(--brand); min-width:2.5rem; }
    .stat-chip span { font-size:.78rem; color:var(--zinc-100); line-height:1.35; }
    .bullet { display:flex; gap:.55rem; font-size:.82rem; line-height:1.45; color:var(--zinc-100); }
    .bullet-icon { color:var(--brand); font-weight:800; }
    .highlight-bar, .highlight-panel { background:var(--brand-muted); border:1px solid rgba(16,185,129,.35); border-radius:.85rem; padding:1rem; font-weight:700; color:var(--brand-secondary); text-align:center; }
    .module-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.65rem; flex:1; }
    .module-grid--compact { grid-template-columns:repeat(2,1fr); }
    .module-card { background:var(--brand-navy-light); border:1px solid rgba(255,255,255,.1); border-radius:.75rem; padding:.75rem; }
    .module-card h3 { font-size:.82rem; font-weight:700; color:var(--brand-secondary); margin-bottom:.25rem; }
    .module-card p { font-size:.72rem; color:var(--slate-500); line-height:1.4; }
    .value-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; flex:1; }
    .value-card { background:var(--brand-navy-light); border:1px solid rgba(255,255,255,.1); border-radius:.85rem; padding:.85rem; }
    .value-card h3 { font-size:.88rem; font-weight:700; margin-bottom:.35rem; color:var(--zinc-100); }
    .value-card p { font-size:.78rem; line-height:1.45; color:var(--slate-500); }
    .cta-layout { display:grid; grid-template-columns:1.15fr .85fr; gap:1rem; flex:1; }
    .cta-ba-row { display:grid; grid-template-columns:1fr auto 1fr; gap:.35rem; align-items:center; margin-bottom:.25rem; font-size:.72rem; }
    .cta-before { background:var(--brand-navy-light); border:1px solid rgba(255,255,255,.1); border-radius:.4rem; padding:.28rem .4rem; color:var(--zinc-100); }
    .cta-after { background:var(--brand-muted); border:1px solid rgba(16,185,129,.45); border-radius:.4rem; padding:.28rem .4rem; color:var(--brand-secondary); font-weight:700; }
    .cta-arrow { color:var(--brand); font-weight:700; }
    .next-steps { list-style:none; margin:.25rem 0 .65rem; }
    .next-steps li { display:flex; gap:.45rem; align-items:flex-start; font-size:.78rem; margin-bottom:.35rem; color:var(--zinc-100); }
    .step-num { background:var(--brand); color:white; width:1rem; height:1rem; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; font-size:.62rem; font-weight:800; flex-shrink:0; }
    .cta-sub { font-size:.82rem; font-weight:700; margin:.45rem 0 .25rem; color:var(--zinc-100); }
    .demo-steps { margin-left:1.1rem; font-size:.78rem; color:var(--slate-500); line-height:1.5; }
    .footer { margin-top:auto; display:flex; justify-content:space-between; align-items:center; font-size:.72rem; color:var(--slate-500); padding-top:.75rem; }
    .footer-brand { display:flex; align-items:center; gap:.65rem; }
    .footer-company-logo { height:1.35rem; width:auto; max-height:1.35rem; object-fit:contain; aspect-ratio:88/64; opacity:.9; flex-shrink:0; }
    .slide--hero .footer { color:var(--slate-500); }
    .progress { position:fixed; bottom:0; left:0; height:4px; background:linear-gradient(90deg,var(--brand-secondary),var(--brand)); transition:width .25s; z-index:10; }
    .nav-hint { position:fixed; bottom:.5rem; right:1rem; font-size:.68rem; color:#71717a; z-index:11; }

    /* Infographics */
    .infographic { background:var(--brand-navy-light); border:1px solid rgba(255,255,255,.1); border-radius:.85rem; padding:.85rem; }
    .slide--hero .infographic { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12); }
    .infographic--hero-rings, .infographic--hero-stats { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
    .hero-ring { position:relative; text-align:center; padding:.35rem; }
    .hero-ring svg { width:3.2rem; height:3.2rem; display:block; margin:0 auto .25rem; }
    .hero-ring strong { display:block; font-size:1.15rem; color:white; }
    .hero-ring span { font-size:.62rem; color:var(--brand-secondary); }
    .infographic--agenda { display:grid; grid-template-columns:repeat(3,1fr); gap:.55rem; }
    .agenda-card { display:flex; gap:.55rem; background:var(--brand-navy); border:1px solid rgba(255,255,255,.1); border-radius:.75rem; padding:.65rem; }
    .agenda-num { background:var(--brand); color:white; width:1.5rem; height:1.5rem; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:800; flex-shrink:0; }
    .agenda-card strong { display:block; font-size:.78rem; margin-bottom:.15rem; color:var(--zinc-100); }
    .agenda-card p { font-size:.68rem; color:var(--slate-500); line-height:1.35; }
    .infographic--value-quadrant { display:flex; flex-direction:column; gap:.55rem; }
    .quadrant-grid { display:grid; grid-template-columns:1fr 1fr; gap:.4rem; }
    .quadrant { background:var(--brand-navy); border:2px solid var(--brand); border-radius:.65rem; padding:.45rem .55rem; }
    .quadrant-metric { display:block; font-size:1.1rem; }
    .quadrant span { font-size:.72rem; font-weight:700; color:var(--zinc-100); }
    .quadrant small { display:block; font-size:.62rem; color:var(--slate-500); }
    .comparison-row { display:grid; grid-template-columns:4.5rem 2rem auto 2rem 1fr; gap:.25rem; align-items:center; font-size:.62rem; }
    .cmp-before { color:var(--red); font-style:normal; font-weight:700; }
    .cmp-after { color:var(--green); font-style:normal; font-weight:700; }
    .cmp-track { height:.35rem; background:var(--slate-200); border-radius:999px; overflow:hidden; }
    .cmp-fill { height:100%; background:var(--brand); border-radius:999px; }
    .pain-icons { display:flex; gap:.35rem; margin-bottom:.45rem; flex-wrap:wrap; }
    .pain-icon { background:var(--red-light); color:var(--red); border:1px solid #fecaca; border-radius:999px; padding:.15rem .45rem; font-size:.6rem; font-weight:700; }
    .ba-cols { display:flex; align-items:stretch; gap:.5rem; }
    .infographic--hero-stats { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
    .hero-stat { background:rgba(6,78,59,.55); border:1px solid rgba(16,185,129,.4); border-radius:.65rem; padding:.65rem; text-align:center; }
    .hero-stat strong { display:block; font-size:1.4rem; color:white; }
    .hero-stat span { font-size:.68rem; color:var(--brand-secondary); }
    .infographic--before-after { display:flex; align-items:stretch; gap:.5rem; }
    .ba-col { flex:1; border-radius:.65rem; padding:.65rem; font-size:.72rem; }
    .ba-col--before { background:#3f1d1d; border:1px solid rgba(220,38,38,.35); }
    .ba-col--after { background:var(--brand-muted); border:1px solid rgba(16,185,129,.35); }
    .ba-col h4 { font-size:.75rem; margin-bottom:.4rem; }
    .ba-col--before h4 { color:var(--red); }
    .ba-col--after h4 { color:var(--brand-secondary); }
    .ba-col ul { margin-left:1rem; line-height:1.5; color:var(--zinc-100); }
    .ba-arrow { display:flex; align-items:center; font-size:1.2rem; color:var(--brand); font-weight:700; }
    .infographic--partnership { display:flex; align-items:center; gap:.5rem; }
    .partner-box { flex:1; background:var(--brand-navy); border:1px solid rgba(255,255,255,.1); border-radius:.65rem; padding:.75rem; text-align:center; }
    .partner-box--brand { background:var(--brand-navy); color:white; border-color:rgba(16,185,129,.45); }
    .partner-box--brand span { color:var(--brand-secondary); }
    .partner-box strong { display:block; font-size:.85rem; margin-bottom:.25rem; color:var(--zinc-100); }
    .partner-box span { font-size:.72rem; color:var(--slate-500); }
    .partner-bridge { flex:0.8; background:var(--brand-muted); border:1px solid rgba(16,185,129,.35); border-radius:.65rem; padding:.5rem; text-align:center; font-size:.72rem; font-weight:700; color:var(--brand-secondary); }
    .infographic--hub { position:relative; min-height:14rem; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#1e212b,#12141c); overflow:hidden; }
    .hub-lines { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
    .hub-center { position:relative; z-index:2; background:var(--brand-dark); color:white; border-radius:999px; padding:.55rem 1rem; font-weight:800; font-size:.85rem; box-shadow:0 0 0 4px var(--brand-muted); }
    .framework-badges--honey .framework-badge--offset { margin-left:.65rem; }
    .infographic--rag-donut { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; align-items:center; }
    .chart-bars { display:flex; align-items:flex-end; gap:.2rem; height:2.5rem; margin-top:.35rem; padding-top:.25rem; border-top:1px solid var(--slate-200); }
    .chart-bar { flex:1; background:var(--brand); border-radius:.2rem .2rem 0 0; min-height:8%; }
    .infographic--tprm-combo { display:grid; grid-template-columns:.9fr 1.1fr; gap:.5rem; align-items:center; }
    .tprm-gauge { text-align:center; }
    .tprm-gauge svg { width:5.5rem; height:3.2rem; }
    .tprm-gauge strong { display:block; font-size:1.2rem; color:var(--purple); }
    .tprm-gauge span { font-size:.62rem; color:var(--slate-500); }
    .tprm-gauge em { display:block; font-style:normal; font-size:.72rem; font-weight:700; color:var(--green); }
    .infographic--category-nodes { display:grid; grid-template-columns:repeat(4,1fr); gap:.35rem; position:relative; padding-bottom:1.5rem; }
    .cat-col { display:flex; flex-direction:column; gap:.25rem; }
    .cat-label { color:white; font-size:.62rem; font-weight:700; text-align:center; border-radius:.35rem; padding:.2rem; }
    .cat-node { background:var(--brand-navy); border:1px solid rgba(255,255,255,.1); border-radius:.35rem; padding:.22rem; font-size:.58rem; font-weight:700; text-align:center; color:var(--zinc-100); }
    .cat-center { position:absolute; bottom:0; left:50%; transform:translateX(-50%); background:var(--brand-dark); color:white; border-radius:999px; padding:.25rem .65rem; font-size:.68rem; font-weight:800; }
    .infographic--ai-workflow { display:flex; flex-direction:column; gap:.55rem; align-items:center; }
    .ai-brain { position:relative; background:var(--brand-dark); color:white; border-radius:999px; padding:.55rem 1.1rem; font-weight:800; }
    .ai-spark { position:absolute; top:-.2rem; right:-.15rem; color:var(--amber); font-size:.85rem; }
    .ai-steps { display:flex; gap:.35rem; width:100%; }
    .ai-step { flex:1; background:var(--brand-navy); border:1px solid rgba(255,255,255,.1); border-radius:.55rem; padding:.4rem; font-size:.62rem; }
    .ai-step strong { display:block; color:var(--brand-secondary); margin-bottom:.15rem; }
    .infographic--outcomes { display:flex; flex-direction:column; gap:.3rem; }
    .outcome-row { display:grid; grid-template-columns:1fr auto auto auto auto; gap:.25rem; align-items:center; font-size:.65rem; }
    .out-before { color:var(--red); font-style:normal; font-weight:700; }
    .out-after { color:var(--green); font-style:normal; font-weight:700; }
    .infographic--contact-card { background:linear-gradient(135deg,var(--brand),var(--brand-dark)); color:white; border:none; text-align:center; display:flex; flex-direction:column; justify-content:center; min-height:12rem; }
    .infographic--contact-card h3 { font-size:1.5rem; margin-bottom:.35rem; }
    .infographic--contact-card p { color:#d1fae5; margin-bottom:.75rem; }
    .contact-details { font-size:.85rem; line-height:1.5; }
    .hub-spoke-item { position:absolute; top:50%; left:50%; transform:rotate(var(--angle)) translateY(-5.5rem) rotate(calc(-1 * var(--angle))); }
    .hub-spoke-item span { display:block; background:var(--brand-navy-light); border:1px solid rgba(255,255,255,.1); border-radius:999px; padding:.2rem .55rem; font-size:.62rem; font-weight:700; color:var(--brand-secondary); white-space:nowrap; }
    .infographic--frameworks { display:flex; flex-direction:column; gap:.65rem; }
    .framework-badges { display:flex; flex-wrap:wrap; gap:.35rem; }
    .framework-badge { background:var(--brand-muted); color:var(--brand-secondary); border:1px solid rgba(16,185,129,.35); border-radius:999px; padding:.2rem .5rem; font-size:.62rem; font-weight:700; }
    .coverage-row { display:grid; grid-template-columns:4.5rem 1fr 2rem; gap:.4rem; align-items:center; font-size:.68rem; }
    .coverage-track, .domain-track { height:.45rem; background:var(--slate-200); border-radius:999px; overflow:hidden; }
    .coverage-fill { height:100%; background:var(--brand); border-radius:999px; }
    .coverage-row em { font-style:normal; font-weight:700; color:var(--brand); text-align:right; }
    .infographic--donut { display:grid; grid-template-columns:auto 1fr; grid-template-rows:auto auto; gap:.5rem; align-items:center; }
    .donut-svg { width:7rem; height:7rem; grid-row:span 2; }
    .donut-center { text-align:center; }
    .donut-center strong { display:block; font-size:1.4rem; color:var(--brand-secondary); }
    .donut-center span { font-size:.72rem; color:var(--slate-500); }
    .donut-legend { display:flex; flex-wrap:wrap; gap:.35rem .65rem; font-size:.62rem; color:var(--slate-700); }
    .donut-legend-item { display:flex; align-items:center; gap:.25rem; }
    .donut-swatch { width:.55rem; height:.55rem; border-radius:2px; }
    .infographic--pipeline h4, .infographic--funnel h4 { font-size:.78rem; color:var(--brand-secondary); margin-bottom:.45rem; }
    .pipeline-steps { display:flex; flex-wrap:wrap; align-items:center; gap:.25rem; }
    .pipeline-step { background:var(--brand-muted); border:1px solid rgba(16,185,129,.35); border-radius:.45rem; padding:.25rem .45rem; font-size:.65rem; font-weight:700; color:var(--brand-secondary); }
    .pipeline-arrow { color:var(--brand); font-weight:700; font-size:.75rem; }
    .infographic--matrix { font-size:.65rem; }
    .matrix-header { text-align:center; color:var(--slate-500); font-weight:700; margin-bottom:.35rem; }
    .matrix-row { display:grid; grid-template-columns:3rem repeat(4,1fr); gap:.2rem; margin-bottom:.2rem; align-items:center; }
    .matrix-label { color:var(--slate-500); font-size:.58rem; }
    .matrix-cell { aspect-ratio:1; border-radius:.25rem; border:1px solid var(--slate-200); }
    .heat-0 { background:#ecfdf5; } .heat-1 { background:#bbf7d0; } .heat-2 { background:#fffbeb; } .heat-3 { background:#fed7aa; } .heat-4 { background:#fef2f2; }
    .infographic--funnel { display:flex; flex-direction:column; align-items:center; gap:.25rem; }
    .funnel-tier { display:flex; justify-content:space-between; background:var(--brand-muted); border:1px solid rgba(16,185,129,.35); border-radius:.4rem; padding:.3rem .55rem; font-size:.68rem; font-weight:700; color:var(--brand-secondary); }
    .funnel-tier:first-child { background:var(--brand-dark); color:white; }
    .funnel-tier em { font-style:normal; opacity:.85; }
    .infographic--nodes { position:relative; min-height:13rem; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#1e212b,#12141c); }
    .node-center { position:relative; z-index:2; background:var(--brand-dark); color:white; border-radius:999px; padding:.45rem .85rem; font-weight:800; font-size:.78rem; }
    .node-item { position:absolute; top:50%; left:50%; transform:rotate(var(--angle)) translateY(-5rem) rotate(calc(-1 * var(--angle))); background:var(--brand-navy-light); border:1px solid rgba(255,255,255,.1); border-radius:.5rem; padding:.25rem .4rem; text-align:center; min-width:3.2rem; }
    .node-item strong { display:block; font-size:.62rem; color:var(--zinc-100); }
    .node-item small { font-size:.52rem; color:var(--slate-500); }
    .infographic-row { margin-top:.5rem; }
    .infographic--workflow { display:flex; align-items:stretch; gap:.35rem; flex-wrap:wrap; }
    .workflow-step { flex:1; min-width:5rem; background:var(--brand-navy); border:1px solid rgba(255,255,255,.1); border-radius:.65rem; padding:.55rem; position:relative; }
    .workflow-num { position:absolute; top:.35rem; right:.35rem; background:var(--brand); color:white; width:1.1rem; height:1.1rem; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:800; }
    .workflow-step strong { display:block; font-size:.72rem; color:var(--brand-secondary); margin-bottom:.2rem; padding-right:1.2rem; }
    .workflow-step p { font-size:.62rem; color:var(--slate-500); line-height:1.35; }
    .workflow-arrow { align-self:center; color:var(--brand); font-weight:700; }
    .infographic--dashboard { display:flex; flex-direction:column; gap:.55rem; }
    .kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:.4rem; }
    .kpi-tile { background:var(--brand-navy); border:1px solid rgba(255,255,255,.1); border-radius:.55rem; padding:.45rem .55rem; position:relative; }
    .kpi-label { font-size:.62rem; color:var(--slate-500); }
    .kpi-value { display:block; font-size:1.1rem; margin-top:.1rem; }
    .kpi-value--green { color:var(--green); } .kpi-value--brand { color:var(--brand); } .kpi-value--amber { color:var(--amber); }
    .kpi-trend { position:absolute; top:.4rem; right:.45rem; font-size:.85rem; }
    .kpi-trend--up { color:var(--green); } .kpi-trend--down { color:var(--amber); }
    .domain-row { display:grid; grid-template-columns:3rem 1fr 2rem; gap:.35rem; align-items:center; font-size:.65rem; }
    .domain-fill { height:100%; border-radius:999px; }
    .domain-fill--green { background:var(--green); } .domain-fill--amber { background:var(--amber); }
    .domain-row em { font-style:normal; font-weight:700; text-align:right; }
    .infographic--ba-columns { margin-bottom:.65rem; }
    .ba-columns-header { display:grid; grid-template-columns:1fr auto 1fr; gap:.35rem; margin-bottom:.35rem; font-size:.72rem; font-weight:700; }
    .ba-h-before { color:var(--red); } .ba-h-after { color:var(--brand-secondary); text-align:right; }
    .ba-columns-row { display:grid; grid-template-columns:1fr auto 1fr; gap:.35rem; align-items:center; margin-bottom:.25rem; font-size:.72rem; }
    .ba-before { background:#3f1d1d; border:1px solid rgba(220,38,38,.35); border-radius:.4rem; padding:.3rem .45rem; color:var(--zinc-100); }
    .ba-after { background:var(--brand-muted); border:1px solid rgba(16,185,129,.35); border-radius:.4rem; padding:.3rem .45rem; color:var(--brand-secondary); font-weight:600; text-align:right; }
    .ba-arrow-inline { color:var(--brand); font-weight:700; }

    @media print {
      body { overflow:visible; height:auto; }
      .slide { display:flex!important; position:relative; page-break-after:always; height:100vh; min-height:720px; }
      .progress,.nav-hint { display:none!important; }
      .infographic--hub, .infographic--nodes { min-height:10rem; }
    }
    @media (max-width:900px) {
      .slide-body--split, .slide-body--content, .hero-layout { flex-direction:column; }
      .col-visual, .hero-visual { flex:0 0 auto; }
      .hub-spoke-item { transform:rotate(var(--angle)) translateY(-4rem) rotate(calc(-1 * var(--angle))); }
    }
  </style>
</head>
<body>
  <div class="deck" id="deck">${htmlSlides}</div>
  <div class="progress" id="progress" style="width:${(1 / TOTAL) * 100}%"></div>
  <div class="nav-hint">Arrow keys navigate · F fullscreen · P print/PDF</div>
  <script>
    const slides=[...document.querySelectorAll('.slide')]; let current=0;
    function show(i){ current=Math.max(0,Math.min(i,slides.length-1)); slides.forEach((s,j)=>s.classList.toggle('active',j===current)); document.getElementById('progress').style.width=\`\${((current+1)/slides.length)*100}%\`; }
    document.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();show(current+1);} if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);} if(e.key==='Home')show(0); if(e.key==='End')show(slides.length-1); if(e.key==='f'||e.key==='F'){ if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } if(e.key==='p'||e.key==='P') window.print(); });
    let tx=0; document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX}); document.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx; if(dx>50)show(current-1); if(dx<-50)show(current+1);});
  </script>
</body>
</html>`;

writeFileSync(HTML_OUT, html, 'utf8');
console.log(`Created ${HTML_OUT} (${TOTAL} slides)`);
