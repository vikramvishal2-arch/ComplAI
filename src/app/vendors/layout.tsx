import { TprmSubNav } from '@/components/tprm/tprm-sub-nav';

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tprm-module">
      <TprmSubNav />
      {children}
    </div>
  );
}
