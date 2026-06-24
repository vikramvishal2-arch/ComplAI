/**
 * ComplAI CISO/CIO Deck — Google Slides Generator
 * =================================================
 * Creates the presentation natively in Google Slides (no broken PPTX import).
 *
 * HOW TO USE:
 * 1. Go to https://script.google.com and click "New project"
 * 2. Delete the default code and paste this entire file
 * 3. Click Run ▶ on createComplAICisoDeck
 * 4. Authorize when prompted (Google Drive + Slides access)
 * 5. Check View → Logs (or Execution log) for the Slides URL
 * 6. Open the link — deck is saved in your Google Drive root
 *
 * Re-run anytime to create a fresh copy.
 */

function createComplAICisoDeck() {
  var pres = SlidesApp.create('ComplAI — CISO & CIO Deck');
  var slides = pres.getSlides();

  // Use the default first slide as slide 1
  buildSlide1_Title(slides[0]);

  buildSlide2_Challenges(pres.appendSlide(SlidesApp.PredefinedLayout.BLANK));
  buildSlide3_Product(pres.appendSlide(SlidesApp.PredefinedLayout.BLANK));
  buildSlide4_WhyBuy(pres.appendSlide(SlidesApp.PredefinedLayout.BLANK));

  var url = pres.getUrl();
  Logger.log('Created: ' + url);
  return url;
}

// ─── Colors (hex without #) ─────────────────────────────────────────────────
var BRAND = '#2563EB';
var BRAND_DARK = '#1E3A8A';
var BRAND_LIGHT = '#DBEAFE';
var SLATE900 = '#0F172A';
var SLATE700 = '#334155';
var SLATE500 = '#64748B';
var SLATE200 = '#E2E8F0';
var SLATE100 = '#F1F5F9';
var WHITE = '#FFFFFF';
var RED = '#DC2626';
var RED_BG = '#FEF2F2';
var AMBER = '#D97706';
var AMBER_BG = '#FFFBEB';
var GREEN = '#059669';
var GREEN_BG = '#ECFDF5';

// Slide size: widescreen 720 × 405 pt
var W = 720;
var H = 405;

function setBg(slide, hex) {
  slide.getBackground().setSolidFill(hex);
}

function textBox(slide, text, left, top, width, height, opts) {
  opts = opts || {};
  var box = slide.insertTextBox(text, left, top, width, height);
  var tr = box.getText();
  tr.getTextStyle()
    .setFontFamily(opts.font || 'Arial')
    .setFontSize(opts.size || 12)
    .setForegroundColor(opts.color || SLATE700);
  if (opts.bold) tr.getTextStyle().setBold(true);
  if (opts.align) tr.getParagraphStyle().setParagraphAlignment(opts.align);
  if (opts.valign) box.setContentAlignment(opts.valign);
  if (opts.bg) {
    box.getFill().setSolidFill(opts.bg);
  }
  if (opts.border) {
    box.getBorder().getLineFill().setSolidFill(opts.border);
    box.getBorder().setWeight(1);
  } else {
    box.getBorder().setTransparent();
  }
  return box;
}

function rect(slide, left, top, width, height, fill, borderColor) {
  var shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, left, top, width, height);
  shape.getFill().setSolidFill(fill);
  if (borderColor) {
    shape.getBorder().getLineFill().setSolidFill(borderColor);
    shape.getBorder().setWeight(1);
  } else {
    shape.getBorder().setTransparent();
  }
  return shape;
}

function roundRect(slide, left, top, width, height, fill, borderColor) {
  var shape = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, left, top, width, height);
  shape.getFill().setSolidFill(fill);
  if (borderColor) {
    shape.getBorder().getLineFill().setSolidFill(borderColor);
    shape.getBorder().setWeight(1);
  } else {
    shape.getBorder().setTransparent();
  }
  return shape;
}

function oval(slide, left, top, width, height, fill) {
  var shape = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, left, top, width, height);
  shape.getFill().setSolidFill(fill);
  shape.getBorder().setTransparent();
  return shape;
}

function labelInShape(shape, text, color, size, bold) {
  var tr = shape.getText();
  tr.setText(text);
  tr.getTextStyle()
    .setFontFamily('Arial')
    .setFontSize(size || 10)
    .setForegroundColor(color || WHITE)
    .setBold(!!bold);
  tr.getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  shape.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
}

function footer(slide, label) {
  textBox(slide, label, 20, 382, 200, 16, { size: 8, color: SLATE500 });
  textBox(slide, 'ComplAI · Propel Ready Solutions', 500, 382, 200, 16, {
    size: 8,
    color: SLATE500,
    align: SlidesApp.ParagraphAlignment.END,
  });
}

function slideTitle(slide, title, subtitle) {
  textBox(slide, title, 28, 18, 664, 36, { size: 22, color: SLATE900, bold: true });
  rect(slide, 28, 56, 80, 4, BRAND);
  if (subtitle) {
    textBox(slide, subtitle, 28, 64, 664, 28, { size: 11, color: SLATE500 });
  }
}

function statChip(slide, left, top, width, value, label) {
  roundRect(slide, left, top, width, 48, WHITE, SLATE200);
  textBox(slide, value, left + 10, top + 6, 40, 36, { size: 20, color: BRAND, bold: true });
  textBox(slide, label, left + 52, top + 8, width - 58, 34, { size: 9, color: SLATE700 });
}

function progressBar(slide, left, top, width, pct, color, label) {
  textBox(slide, label, left, top, width, 14, { size: 7, color: SLATE500, bold: true });
  rect(slide, left, top + 14, width, 10, SLATE200);
  rect(slide, left, top + 14, width * pct, 10, color);
}

// ─── SLIDE 1: Title + hub ───────────────────────────────────────────────────
function buildSlide1_Title(slide) {
  setBg(slide, SLATE900);

  textBox(slide, 'GOVERNANCE · RISK · COMPLIANCE', 36, 28, 400, 18, {
    size: 9,
    color: '#93C5FD',
    bold: true,
  });

  textBox(slide, 'ComplAI', 36, 52, 420, 48, { size: 36, color: WHITE, bold: true });
  textBox(slide, 'One Stop GRC for CISOs & CIOs', 36, 98, 420, 32, { size: 20, color: '#CBD5E1' });
  textBox(
    slide,
    'The leadership portal that unifies frameworks, controls, and risk — so security executives answer the board in minutes, not weeks.',
    36,
    138,
    380,
    60,
    { size: 11, color: '#94A3B8' }
  );

  var pills = [
    'SOC 2 · ISO 27001 · 21+ frameworks',
    'RAG leadership view',
    'Risk-to-control traceability',
  ];
  for (var i = 0; i < pills.length; i++) {
    var px = 36 + (i % 2) * 195;
    var py = 210 + Math.floor(i / 2) * 28;
    roundRect(slide, px, py, 185, 22, BRAND_DARK, '#60A5FA');
    textBox(slide, pills[i], px, py + 2, 185, 18, {
      size: 8,
      color: WHITE,
      bold: true,
      align: SlidesApp.ParagraphAlignment.CENTER,
    });
  }

  // Hub diagram (right)
  textBox(slide, 'ONE PLATFORM · FIVE OUTCOMES', 430, 28, 260, 16, {
    size: 8,
    color: '#93C5FD',
    bold: true,
  });

  var cx = 560;
  var cy = 200;
  var hub = oval(slide, cx - 36, cy - 36, 72, 72, BRAND);
  labelInShape(hub, 'ComplAI\nGRC Portal', WHITE, 10, true);

  var nodes = [
    { x: 440, y: 70, t: 'Frameworks', s: 'SOC 2 · ISO 27001' },
    { x: 620, y: 70, t: 'Controls', s: '154+ per tenant' },
    { x: 430, y: 290, t: 'Risk Register', s: 'Linked to controls' },
    { x: 610, y: 290, t: 'Leadership', s: 'RAG dashboard' },
  ];
  for (var n = 0; n < nodes.length; n++) {
    var nd = nodes[n];
    var box = roundRect(slide, nd.x, nd.y, 120, 44, BRAND_DARK, '#93C5FD');
    labelInShape(box, nd.t + '\n' + nd.s, WHITE, 8, true);
  }

  var audit = roundRect(slide, 510, 340, 140, 36, GREEN, '#6EE7B7');
  labelInShape(audit, 'Audit Ready\nEvidence · Export · Proof', WHITE, 8, true);

  footer(slide, 'Slide 1 of 4 · Introduction');
}

// ─── SLIDE 2: Challenges ────────────────────────────────────────────────────
function buildSlide2_Challenges(slide) {
  setBg(slide, SLATE100);
  slideTitle(
    slide,
    'The challenge — GRC is broken across too many tools',
    'CISOs and CIOs lose visibility, time, and audit confidence when data lives in silos.'
  );

  statChip(slide, 28, 100, 310, '5+', 'disconnected tools typical per org (spreadsheets, risk tools, drives, ticketing)');
  statChip(slide, 28, 156, 310, '40h+', 'lost per audit cycle reconciling controls, risks, and evidence manually');
  statChip(slide, 28, 212, 310, '?', 'Board asks "Are we green?" — often no real-time, domain-level answer');

  textBox(slide, '! Risks float without control linkage — audit gaps stay hidden.', 28, 272, 310, 28, {
    size: 9,
    color: RED,
  });
  textBox(
    slide,
    '! Open issues can mask "audit ready" — leadership sees green, auditors see red.',
    28,
    302,
    310,
    28,
    { size: 9, color: RED }
  );

  // Infographic panel
  roundRect(slide, 360, 96, 332, 270, WHITE, SLATE200);
  textBox(slide, "TODAY'S REALITY — FRAGMENTED GRC STACK", 372, 104, 308, 16, {
    size: 8,
    color: SLATE500,
    bold: true,
  });

  var silos = [
    { x: 372, y: 128, fill: RED_BG, t: 'Excel', bc: '#FCA5A5' },
    { x: 448, y: 120, fill: AMBER_BG, t: 'Risk Tool', bc: '#FDBA74' },
    { x: 524, y: 132, fill: '#FEFCE8', t: 'SharePoint', bc: '#FDE047' },
    { x: 600, y: 124, fill: '#F5F3FF', t: 'Jira', bc: '#C4B5FD' },
    { x: 660, y: 136, fill: GREEN_BG, t: 'Email', bc: '#86EFAC' },
  ];
  for (var i = 0; i < silos.length; i++) {
    var s = silos[i];
    var b = roundRect(slide, s.x, s.y, 68, 36, s.fill, s.bc);
    labelInShape(b, s.t, SLATE700, 8, true);
  }

  var ciso = roundRect(slide, 430, 190, 200, 52, RED_BG, RED);
  labelInShape(ciso, 'CISO / CIO\n"Which number do I trust?"', RED, 10, true);

  progressBar(slide, 372, 258, 300, 0.85, RED, 'AUDIT PREP TIME — 85% manual');
  progressBar(slide, 372, 296, 300, 0.35, AMBER, 'LEADERSHIP CONFIDENCE — Low (stale data)');

  footer(slide, 'Slide 2 of 4 · The problem');
}

// ─── SLIDE 3: Product ───────────────────────────────────────────────────────
function buildSlide3_Product(slide) {
  setBg(slide, SLATE100);
  slideTitle(
    slide,
    'What ComplAI provides — one portal, full GRC lifecycle',
    'From framework activation to audit-ready proof — designed for how CISOs and CIOs actually work.'
  );

  var bullets = [
    '1  Leadership dashboard — RAG by domain & framework, click-to-filter charts, path-to-green.',
    '2  Control register — per-control compliance method, remediation, evidence, audit-ready rules.',
    '3  Risk register — inherent & present scoring; every risk/issue linked to a control.',
    '4  Export & integrate — CSV for auditors; architecture for IdAM, SIEM, access tools.',
  ];
  for (var i = 0; i < bullets.length; i++) {
    textBox(slide, bullets[i], 28, 100 + i * 34, 300, 30, { size: 9, color: SLATE700 });
  }
  statChip(slide, 28, 240, 300, '21+', 'frameworks · SOC 2 (61) · ISO 27001 (93) enabled by default');

  // RAG donut (simulated with segments)
  roundRect(slide, 360, 96, 332, 148, WHITE, SLATE200);
  textBox(slide, 'Leadership Dashboard — RAG Posture', 372, 104, 300, 16, {
    size: 9,
    color: SLATE700,
    bold: true,
  });

  // Simulated donut using arcs of colored rects + legend
  oval(slide, 380, 128, 80, 80, SLATE200);
  oval(slide, 396, 144, 48, 48, WHITE);
  textBox(slide, 'RAG', 408, 162, 24, 16, { size: 8, bold: true, color: SLATE900, align: SlidesApp.ParagraphAlignment.CENTER });

  var legend = [
    { c: GREEN, t: 'Green 55%' },
    { c: AMBER, t: 'Amber 28%' },
    { c: RED, t: 'Red 17%' },
  ];
  for (var j = 0; j < legend.length; j++) {
    rect(slide, 480, 132 + j * 22, 10, 10, legend[j].c);
    textBox(slide, legend[j].t, 496, 130 + j * 22, 80, 14, { size: 8, color: SLATE700 });
  }

  roundRect(slide, 580, 128, 100, 80, AMBER_BG, '#FED7AA');
  textBox(
    slide,
    'Needs attention\n• Access mgmt — Red\n• Change control — Amber\n• 3 open risks block audit\n→ Path to green',
    586,
    132,
    88,
    72,
    { size: 7, color: '#9A3412' }
  );

  // Domain bars
  textBox(slide, 'By domain', 480, 196, 60, 12, { size: 7, color: SLATE500, bold: true });
  rect(slide, 480, 210, 120, 8, GREEN);
  rect(slide, 480, 222, 82, 8, AMBER);
  rect(slide, 480, 234, 52, 8, RED);

  // Risk-control link
  roundRect(slide, 360, 252, 332, 114, BRAND_LIGHT, '#93C5FD');
  textBox(slide, 'Risk ↔ Control linkage', 372, 258, 160, 14, { size: 9, color: BRAND_DARK, bold: true });

  var ctrl = roundRect(slide, 372, 278, 88, 40, BRAND);
  labelInShape(ctrl, 'CC6.1\nLogical Access', WHITE, 8, true);

  textBox(slide, '↔', 468, 286, 24, 24, { size: 16, color: BRAND, bold: true, align: SlidesApp.ParagraphAlignment.CENTER });

  var risk = roundRect(slide, 496, 274, 120, 48, RED_BG, '#FCA5A5');
  labelInShape(risk, 'Privileged access risk\nInherent High → Present Medium', RED, 7, true);

  var gate = roundRect(slide, 372, 328, 300, 24, GREEN_BG, '#6EE7B7');
  labelInShape(gate, 'Audit Ready blocked until linked risks & issues are resolved', GREEN, 7, true);

  // GRC flow (right column style - below or inline)
  textBox(slide, 'Continuous flow: Activate → Plan → Track → Evidence → Audit Ready ✓', 372, 368, 310, 14, {
    size: 7,
    color: GREEN,
    bold: true,
  });

  footer(slide, 'Slide 3 of 4 · Product capabilities');
}

// ─── SLIDE 4: Why buy ───────────────────────────────────────────────────────
function buildSlide4_WhyBuy(slide) {
  setBg(slide, SLATE100);
  slideTitle(
    slide,
    'Why purchase ComplAI — the executive business case',
    'Reduce risk, cut audit friction, and give the board a number they can trust.'
  );

  // Before / After
  roundRect(slide, 28, 100, 320, 130, WHITE, SLATE200);
  textBox(slide, 'BEFORE vs AFTER', 40, 106, 120, 14, { size: 8, color: SLATE500, bold: true });

  roundRect(slide, 40, 124, 130, 96, RED_BG, '#FCA5A5');
  textBox(
    slide,
    'BEFORE\nQuarterly fire drill\n\nWeeks of manual prep\nHigh stress · High cost',
    44,
    128,
    122,
    88,
    { size: 8, color: RED, align: SlidesApp.ParagraphAlignment.CENTER }
  );

  textBox(slide, '→', 178, 158, 24, 28, { size: 22, color: BRAND, bold: true, align: SlidesApp.ParagraphAlignment.CENTER });

  roundRect(slide, 208, 124, 130, 96, GREEN_BG, '#6EE7B7');
  textBox(
    slide,
    'AFTER\nContinuous GRC\n\nReal-time RAG dashboard\nAudit-ready on demand',
    212,
    128,
    122,
    88,
    { size: 8, color: GREEN, align: SlidesApp.ParagraphAlignment.CENTER }
  );

  progressBar(slide, 40, 232, 290, 0.85, RED, 'Audit prep — Before');
  progressBar(slide, 40, 262, 290, 0.28, GREEN, 'Audit prep — After (ComplAI)');

  // Decision drivers quadrant
  roundRect(slide, 360, 100, 332, 130, WHITE, SLATE200);
  textBox(slide, 'WHY CISOs & CIOs BUY', 372, 106, 200, 14, { size: 8, color: SLATE500, bold: true });

  // Quadrant lines
  var qx = 526;
  var qy = 175;
  rect(slide, 372, qy, 308, 1, SLATE200);
  rect(slide, qx, 124, 1, 96, SLATE200);

  var drivers = [
    { x: 560, y: 140, t: 'Board\nconfidence', c: BRAND_LIGHT },
    { x: 400, y: 140, t: 'Audit\npass rate', c: GREEN_BG },
    { x: 560, y: 200, t: 'Risk\nvisibility', c: AMBER_BG },
    { x: 400, y: 200, t: 'Team\nefficiency', c: '#F5F3FF' },
  ];
  for (var d = 0; d < drivers.length; d++) {
    var dr = drivers[d];
    var bubble = oval(slide, dr.x, dr.y, 56, 56, dr.c);
    labelInShape(bubble, dr.t, SLATE700, 7, true);
  }
  var center = oval(slide, qx - 20, qy - 20, 40, 40, BRAND);
  labelInShape(center, 'ComplAI\ndelivers all 4', WHITE, 7, true);

  textBox(slide, 'Impact →', 580, 108, 60, 12, { size: 7, color: SLATE500 });
  textBox(slide, 'Urgency →', 372, 218, 60, 12, { size: 7, color: SLATE500 });

  // Value cards
  var cards = [
    { x: 28, t: 'Single pane of glass', b: 'One login for posture, risks, and compliance — no reconciling 5 tools.' },
    { x: 188, t: 'Faster red to green', b: 'Domain RAG + path-to-green actions focus budget and people.' },
    { x: 348, t: 'Defensible audit trail', b: 'Risks tied to controls, evidence, CSV export — proof not stories.' },
    { x: 508, t: 'Your stack, your way', b: 'Customer-defined compliance — flexible yet structured for SOC 2 & ISO.' },
  ];
  for (var c = 0; c < cards.length; c++) {
    var card = cards[c];
    roundRect(slide, card.x, 300, 148, 68, WHITE, SLATE200);
    textBox(slide, card.t, card.x + 8, 306, 132, 18, { size: 8, color: SLATE900, bold: true });
    textBox(slide, card.b, card.x + 8, 324, 132, 40, { size: 7, color: SLATE700 });
  }

  roundRect(slide, 28, 376, 664, 28, BRAND_LIGHT, '#BFDBFE');
  textBox(
    slide,
    'Purchase ComplAI when you need to lead GRC — not chase it.  Track risk. Prove control. Walk into every audit with confidence.',
    36,
    380,
    648,
    20,
    { size: 10, color: BRAND_DARK, bold: true, align: SlidesApp.ParagraphAlignment.CENTER }
  );

  footer(slide, 'Slide 4 of 4 · Business case');
}
