import Link from "next/link";

type Props = {
  back?: string;
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export default function PhoneHeader({ back, title, subtitle, rightSlot }: Props) {
  return (
    <div className="bg-blue-800 text-white px-4 py-3 flex items-center gap-2">
      {back ? (
        <Link href={back} className="text-white text-lg w-8" aria-label="Back">
          ←
        </Link>
      ) : (
        <div className="w-8" />
      )}
      <div className="flex-1 text-center">
        <h1 className="text-base font-semibold">{title}</h1>
        {subtitle && <div className="text-xs opacity-85">{subtitle}</div>}
      </div>
      <div className="w-8 text-right">{rightSlot}</div>
    </div>
  );
}
