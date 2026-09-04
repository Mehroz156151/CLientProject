import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import VerifyClient from "@/components/VerifyClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Vérification — NEXUS CONTROL" };

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

  if (!user) {
    const next = `/verify/${token}${
      resolvedSearchParams.type ? `?type=${resolvedSearchParams.type}` : ""
    }`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <>
      <TopBar />
      <BackLink href={`/controls/search/${type}`} />
      <VerifyClient token={token} type={type} />
    </>
  );
}
