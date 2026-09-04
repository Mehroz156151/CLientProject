import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Connexion — NEXUS CONTROL" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  console.log('hello')

  return (
    <>
      <TopBar />
      <BackLink href="/" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="font-display text-xl font-bold text-navy">
          Connexion
        </h1>
        <p className="mt-1 text-sm text-muted">
          Connectez-vous pour gérer votre profil et votre carte.
        </p>
        <div className="mt-6">
          <AuthForm mode="login" next={next} />
        </div>
      </main>
    </>
  );
}
