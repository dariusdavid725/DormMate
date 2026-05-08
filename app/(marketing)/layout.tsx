import { MarketingFrame } from "@/components/marketing/marketing-frame";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MarketingFrame header={<SiteHeader />} footer={<SiteFooter />}>
      {children}
    </MarketingFrame>
  );
}
