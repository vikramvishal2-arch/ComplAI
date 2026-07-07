# ComplAI Customer Demo Deck

Customer-facing presentation for showcasing the ComplAI GRC platform to prospects and clients.

## Brand assets & colors

The deck uses the same marketing brand as the website (`tailwind.config.ts`, `globals.css`):

| Token | Hex | Usage in deck |
|-------|-----|----------------|
| scrut-teal | `#10b981` | Primary accent, progress bar, CTAs |
| scrut-blue | `#34d399` | Secondary accent, wordmark “Compl”, hovers |
| scrut-gradient | `#34d399 → #10b981 → #059669` | Hero pills, contact card |
| scrut-navy | `#12141c` | Dark slide base |
| scrut-navy-light | `#1e212b` | Cards, infographics |
| marketing-surface | gradient `#454956 → #060708` | Hero / HTML slide backgrounds |

**Logos** (embedded as base64 in HTML; rasterized for PPTX):

| Asset | Path | Placement |
|-------|------|-----------|
| ComplAI logo | `public/complai-logo.svg` | Title slide (large), every slide header |
| ComplAI icon | `public/complai-icon.svg` | Slide chrome badge (left of section label) |
| Propel Ready icon | `public/propel-ready-icon.svg` | Footer only (correct aspect ratio — round globe) |

For PPTX, SVG logos are rasterized to PNG via Puppeteer (system Chrome/Edge or `npx puppeteer browsers install chrome`). If rasterization is unavailable, the generator falls back to styled ComplAI wordmark text in headers.

## Files

| File | Description |
|------|-------------|
| `complai-customer-demo-deck.html` | Browser presenter (9 slides) — open and press **F** for fullscreen |
| `complai-customer-demo-deck.pptx` | PowerPoint export for email and offline sharing |
| `complai-customer-demo-deck-content.mjs` | Slide content source (edit here, then regenerate) |
| `complyos-ciso-deck.html` | Shorter 4-slide CISO/CIO executive deck |

## Generate / update deck

```bash
npm run deck:customer
```

This creates both `complai-customer-demo-deck.html` and `complai-customer-demo-deck.pptx` in this folder.

For the shorter executive deck:

```bash
npm run deck:pptx
npm run deck:pdf
```

## Slide outline (9 slides)

1. **Title** — ComplAI hero with progress-ring stats
2. **The challenge** — fragmented GRC pain points + before/after
3. **Why ComplAI** — value cards + Propel Ready partnership
4. **Platform overview** — hub-spoke + module cards
5. **Compliance & frameworks** — RAG donut + policies/audit readiness
6. **Risk & TPRM** — vendor rating gauge + assessment funnel
7. **Integrations & Intelligence** — category nodes + AI capability cards
8. **Leadership & outcomes** — KPI dashboard + ROI highlights
9. **Thank you / CTA** — next steps checklist + contact card

Speaker notes are embedded in the PPTX export (View → Notes in PowerPoint).

## Presenting the HTML deck

1. Open `docs/complai-customer-demo-deck.html` in Chrome or Edge (logo is embedded — works offline)
2. Press **→** or **Space** to advance, **←** to go back
3. Press **F** for fullscreen
4. Press **P** to print or save as PDF

## Suggested live demo flow (~10 minutes)

After slides 1–8, switch to the running ComplAI app (**Acme Industries Demo**):

1. **Leadership dashboard** — RAG posture, program overview, escalations
2. **Controls** — CC6.1 (or any control): status, evidence, remediation
3. **Policies** — ISMS template and approval workflow
4. **Audits** — internal programs, findings, external readiness
5. **TPRM** — vendor portfolio; open Stripe or Okta profile
6. **Intelligence** — gap analysis and AI copilot

## Contact

- **Email:** tech@propelreadysolutions.in  
- **Phone:** +91-8796941115  
- **Company:** Propel Ready Solutions
