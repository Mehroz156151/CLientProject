import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import VerifyClient from "@/components/VerifyClient";
import { createClient } from "@/lib/supabase/server";

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

  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  // Normal phone camera / unauthenticated access:
  // show completely blank page.
  if (!user) {
    return <div className="min-h-screen bg-white" />;
  }

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