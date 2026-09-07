import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import VerifyClient from "@/components/VerifyClient";

export const metadata = {
  title: "Vérification — NEXUS CONTROL",
};

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;

  const { type = "vtc" } = resolvedSearchParams;

  return (
    <>
      <TopBar />

      <BackLink href={`/controls/search/${type}`} />

      <VerifyClient
        token={token}
        type={type}
      />
    </>
  );
}