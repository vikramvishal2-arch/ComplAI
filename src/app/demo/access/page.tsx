import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  DEMO_SESSION_COOKIE,
  isDemoPortalEnabled,
  isValidDemoSession,
} from '@/lib/demo-access';
import { DemoAccessForm } from './demo-access-form';

type DemoAccessPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function resolveNextPath(next: string | undefined): string {
  if (!next || !next.startsWith('/')) return '/dashboard';
  return next;
}

export default async function DemoAccessPage({ searchParams }: DemoAccessPageProps) {
  const params = await searchParams;
  const nextPath = resolveNextPath(params.next);

  if (!isDemoPortalEnabled()) {
    redirect(nextPath);
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  if (await isValidDemoSession(session)) {
    redirect(nextPath);
  }

  return <DemoAccessForm nextPath={nextPath} />;
}
