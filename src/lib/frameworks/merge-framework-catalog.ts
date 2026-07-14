import { FRAMEWORKS as STATIC_FRAMEWORKS } from '@/lib/data/frameworks';
import { getControlsByFramework } from '@/lib/data/controls';
import { listFrameworkCatalogEntries } from '@/lib/db/framework-catalog-repository';
import type { Framework, FrameworkCatalogEntry, FrameworkWithCatalogMeta } from '@/lib/types';

function applyCatalogFields(base: Framework, entry: FrameworkCatalogEntry): Framework {
  return {
    ...base,
    name: entry.name,
    shortName: entry.shortName,
    description: entry.description,
    category: entry.category,
    region: entry.region,
    version: entry.version,
    popular: entry.popular,
    tags: entry.tags,
  };
}

function customEntryToFramework(entry: FrameworkCatalogEntry): Framework {
  return {
    id: entry.frameworkId,
    name: entry.name,
    shortName: entry.shortName,
    description: entry.description,
    category: entry.category,
    region: entry.region,
    version: entry.version,
    controlCount: getControlsByFramework(entry.frameworkId).length,
    popular: entry.popular,
    tags: entry.tags,
  };
}

export async function getMergedFrameworks(): Promise<FrameworkWithCatalogMeta[]> {
  let catalog: FrameworkCatalogEntry[] = [];
  try {
    catalog = await listFrameworkCatalogEntries();
  } catch (error) {
    console.warn('Framework catalog unavailable; serving built-in frameworks only.', error);
  }
  const catalogById = new Map(catalog.map((entry) => [entry.frameworkId, entry]));
  const staticIds = new Set(STATIC_FRAMEWORKS.map((framework) => framework.id));

  const fromStatic: FrameworkWithCatalogMeta[] = STATIC_FRAMEWORKS.flatMap((framework) => {
    const entry = catalogById.get(framework.id);
    if (entry && !entry.published) return [];

    const merged = entry ? applyCatalogFields(framework, entry) : framework;
    return [
      {
        ...merged,
        catalogSource: entry ? 'builtin_override' : 'builtin',
        editable: true,
      },
    ];
  });

  const customOnly: FrameworkWithCatalogMeta[] = catalog
    .filter((entry) => entry.source === 'custom' && entry.published && !staticIds.has(entry.frameworkId))
    .map((entry) => ({
      ...customEntryToFramework(entry),
      catalogSource: 'custom' as const,
      editable: true,
    }));

  return [...fromStatic, ...customOnly].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMergedFrameworkById(id: string): Promise<FrameworkWithCatalogMeta | undefined> {
  const frameworks = await getMergedFrameworks();
  return frameworks.find((framework) => framework.id === id);
}

export function getStaticFrameworkById(id: string): Framework | undefined {
  return STATIC_FRAMEWORKS.find((framework) => framework.id === id);
}
