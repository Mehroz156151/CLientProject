import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import MenuTile from "@/components/MenuTile";
import { IconTaxi, IconCar, IconBus, IconBuilding } from "@/components/icons";

export const metadata = { title: "Activité professionnelle — NEXUS CONTROL" };

export default function ActivityPage() {
  return (
    <>
      <TopBar />
      <BackLink href="/controls" />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="font-display text-xl font-bold text-navy">
          ACTIVITÉ PROFESSIONNELLE
        </h1>
        <p className="mt-1 text-sm text-muted">Que souhaitez-vous vérifier ?</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MenuTile
            href="/controls/search/taxi"
            icon={
              <img
                src="/images/Taxi.png"
                alt="Taxi"
                className="h-11 w-11 object-contain"
              />
            }
            title="TAXI"
            variant="dark"
          />

          <MenuTile
            href="/controls/search/vtc"
            icon={
              <img
                src="/images/vtc.png"
                alt="VTC"
                className="h-12 w-12 object-contain"
              />
            }
            title="VTC"
            variant="dark"
          />

          <MenuTile
            href="/controls/search/transport"
            icon={<IconBus size={40} />}
            title="TRANSPORT"
            variant="dark"
          />

          <MenuTile
            href="/controls/search/autre"
            icon={<IconBuilding size={40} />}
            title="AUTRE ACTIVITÉ"
            variant="dark"
          />
        </div>
      </main>
    </>
  );
}
