import Link from "next/link";

export type NavItem = { href: string; icon: string; label: string };

type Props = {
  items: NavItem[];
  active: string;
};

export default function BottomNav({ items, active }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-slate-200 flex justify-around py-2 z-10">
      {items.map((item) => {
        const isActive = item.href === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-center text-[11px] ${
              isActive ? "text-blue-800 font-semibold" : "text-slate-500"
            }`}
          >
            <span className="block text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
