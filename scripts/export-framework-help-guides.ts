import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { listFrameworkGuides } from '../src/lib/data/framework-guides';
import { CATEGORY_LABELS } from '../src/lib/types';
import {
  FRAMEWORK_HELP_BASE_URL,
  ORGANIZATION_NAME,
  PRODUCT_NAME,
} from '../src/lib/brand';

const guides = listFrameworkGuides().map(({ framework, guide }) => ({
  id: framework.id,
  slug: framework.id,
  path: `/help/frameworks/${framework.id}`,
  url: `${FRAMEWORK_HELP_BASE_URL}/${framework.id}`,
  name: framework.name,
  shortName: framework.shortName,
  description: framework.description,
  category: framework.category,
  categoryLabel: CATEGORY_LABELS[framework.category],
  region: framework.region,
  version: framework.version,
  popular: framework.popular,
  tags: framework.tags,
  controlCount: framework.controlCount,
  guide,
}));

const payload = {
  meta: {
    title: 'Propel Ready Solutions — Framework Help Center guides',
    organization: ORGANIZATION_NAME,
    product: PRODUCT_NAME,
    baseUrl: FRAMEWORK_HELP_BASE_URL,
    indexUrl: 'https://propelreadysolutions.in/help/frameworks',
    helpHomeUrl: 'https://propelreadysolutions.in/help',
    generatedAt: new Date().toISOString(),
    count: guides.length,
    format: 'propel-ready-framework-help-guides.v1',
  },
  frameworks: guides,
};

const outDir = join(process.cwd(), 'docs', 'exports');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'propel-ready-framework-help-guides.json');
writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');
console.log(`Wrote ${guides.length} framework guides → ${outFile}`);
