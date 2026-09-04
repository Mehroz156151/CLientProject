import { IconLock, IconLockOpen, IconWifi } from "./icons";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-navy-dark/40 bg-blue">
      <div className="mx-auto flex max-w-md items-center justify-end gap-2 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-navy">
          <IconLock size={15} />
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-fuchsia-600 text-white">
          <IconLockOpen size={15} />
        </span>
        <IconWifi size={20} className="text-white" />
      </div>
    </header>
  );
}
