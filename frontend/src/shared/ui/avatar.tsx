/** "Kim Min-ji" → "KM", "민지" → "민" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return Array.from(parts[0])[0].toUpperCase();
  return (Array.from(parts[0])[0] + Array.from(parts[parts.length - 1])[0]).toUpperCase();
}

/** Round avatar with the user's initials on the brand gradient. */
export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" | "xl" }) {
  const cls = { md: "size-8 text-xs", lg: "size-10 text-sm", xl: "size-20 text-2xl" }[size];
  return (
    <span
      aria-hidden
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--hot))] font-bold text-white`}
    >
      {initials(name)}
    </span>
  );
}
