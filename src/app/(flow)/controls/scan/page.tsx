import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import QrScanner from "@/components/QrScanner";

export const metadata = { title: "Scanner — NEXUS CONTROL" };

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "identite" } = await searchParams;

  return (
    <>
      <TopBar />
      <BackLink href={`/controls/search/${type}`} />
      <QrScanner type={type} />
    </>
  );
}
