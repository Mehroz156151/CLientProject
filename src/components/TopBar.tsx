import Image from "next/image";
import { IconLock, IconLockOpen, IconWifi } from "./icons";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-navy-dark/40 bg-blue">
      <div className="mx-auto flex w-full items-center px-4 py-3 sm:px-6 lg:px-8">

        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
            <Image
              src="/images/logo.png"
              alt="NEXUS CONTROL"
              width={60}
              height={60}
              className="h-12 w-12 object-contain"
            />
          </div>

          <span className="whitespace-nowrap font-display text-lg font-bold tracking-wide text-white sm:text-xl">
            Messagerie Tactique
          </span>
        </div>

        <div className="ml-auto flex items-center justify-end gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-navy">
            <IconLock size={15} />
          </span>

          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-fuchsia-600 text-white">
            <IconLockOpen size={15} />
          </span>

          <IconWifi size={20} className="text-white" />
        </div>
      </div>
    </header>
  );
}