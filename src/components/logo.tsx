import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Donor Connect Home">
      <span className="text-2xl" role="img" aria-hidden="true">🩸</span>
      <span className={cn("text-xl font-bold font-headline", className)}>Donor Connect</span>
    </Link>
  );
}
