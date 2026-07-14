import { prisma } from '@/lib/db/prisma';
import type {
  FrameworkCatalogEntry,
  FrameworkCatalogSource,
  FrameworkCategory,
} from '@/lib/types';

const VALID_CATEGORIES: FrameworkCategory[] = [
  'security',
  'privacy',
  'healthcare',
  'financial',
  'government',
  'manufacturing',
  'ai',
];

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

function serialize(row: {
  id: string;
  frameworkId: string;
  source: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  region: string;
  version: string;
  popular: boolean;
  published: boolean;
  tags: unknown;
  createdAt: Date;
  updatedAt: Date;
}): FrameworkCatalogEntry {
  return {
    id: row.id,
    frameworkId: row.frameworkId,
    source: row.source === 'builtin_override' ? 'builtin_override' : 'custom',
    name: row.name,
    shortName: row.shortName,
    description: row.description,
    category: row.category as FrameworkCategory,
    region: row.region,
    version: row.version,
    popular: row.popular,
    published: row.published,
    tags: parseTags(row.tags),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function normalizeFrameworkId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidFrameworkCategory(value: string): value is FrameworkCategory {
  return VALID_CATEGORIES.includes(value as FrameworkCategory);
}

export async function listFrameworkCatalogEntries(): Promise<FrameworkCatalogEntry[]> {
  const rows = await prisma.frameworkCatalogEntry.findMany({
    orderBy: [{ name: 'asc' }],
  });
  return rows.map(serialize);
}

export async function getFrameworkCatalogEntryByFrameworkId(
  frameworkId: string
): Promise<FrameworkCatalogEntry | null> {
  const row = await prisma.frameworkCatalogEntry.findUnique({
    where: { frameworkId },
  });
  return row ? serialize(row) : null;
}

export type FrameworkCatalogWriteInput = {
  frameworkId: string;
  source: FrameworkCatalogSource;
  name: string;
  shortName: string;
  description: string;
  category: FrameworkCategory;
  region: string;
  version: string;
  popular?: boolean;
  published?: boolean;
  tags?: string[];
};

export async function createFrameworkCatalogEntry(
  input: FrameworkCatalogWriteInput
): Promise<FrameworkCatalogEntry> {
  const row = await prisma.frameworkCatalogEntry.create({
    data: {
      frameworkId: input.frameworkId,
      source: input.source,
      name: input.name.trim(),
      shortName: input.shortName.trim(),
      description: input.description.trim(),
      category: input.category,
      region: input.region.trim() || 'Global',
      version: input.version.trim(),
      popular: input.popular ?? false,
      published: input.published ?? true,
      tags: input.tags ?? [],
    },
  });
  return serialize(row);
}

export async function updateFrameworkCatalogEntry(
  frameworkId: string,
  input: Partial<FrameworkCatalogWriteInput>
): Promise<FrameworkCatalogEntry> {
  const row = await prisma.frameworkCatalogEntry.update({
    where: { frameworkId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.shortName !== undefined ? { shortName: input.shortName.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.region !== undefined ? { region: input.region.trim() || 'Global' } : {}),
      ...(input.version !== undefined ? { version: input.version.trim() } : {}),
      ...(input.popular !== undefined ? { popular: input.popular } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.source !== undefined ? { source: input.source } : {}),
    },
  });
  return serialize(row);
}

export async function upsertFrameworkCatalogEntry(
  input: FrameworkCatalogWriteInput
): Promise<FrameworkCatalogEntry> {
  const row = await prisma.frameworkCatalogEntry.upsert({
    where: { frameworkId: input.frameworkId },
    create: {
      frameworkId: input.frameworkId,
      source: input.source,
      name: input.name.trim(),
      shortName: input.shortName.trim(),
      description: input.description.trim(),
      category: input.category,
      region: input.region.trim() || 'Global',
      version: input.version.trim(),
      popular: input.popular ?? false,
      published: input.published ?? true,
      tags: input.tags ?? [],
    },
    update: {
      source: input.source,
      name: input.name.trim(),
      shortName: input.shortName.trim(),
      description: input.description.trim(),
      category: input.category,
      region: input.region.trim() || 'Global',
      version: input.version.trim(),
      popular: input.popular ?? false,
      published: input.published ?? true,
      tags: input.tags ?? [],
    },
  });
  return serialize(row);
}

export async function deleteFrameworkCatalogEntry(frameworkId: string): Promise<void> {
  await prisma.frameworkCatalogEntry.delete({ where: { frameworkId } });
}
