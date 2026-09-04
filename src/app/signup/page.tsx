import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Inscription — NEXUS CONTROL" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <TopBar />
      <BackLink href="/" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="font-display text-xl font-bold text-navy">
          Créer un compte
        </h1>
        <p className="mt-1 text-sm text-muted">
          Un compte vous permet de créer et gérer vos personnages.
        </p>
        <div className="mt-6">
          <AuthForm mode="signup" next={next} />
        </div>
      </main>
    </>
  );
}
