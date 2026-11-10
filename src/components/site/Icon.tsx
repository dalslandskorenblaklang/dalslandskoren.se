const paths = {
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  choir: "M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 20v-3a6 6 0 0 1 12 0v3M1.5 18v-2a4 4 0 0 1 4-4M22.5 18v-2a4 4 0 0 0-4-4",
  mic: "M15 4.5a3.5 3.5 0 1 1 4.9 4.9l-1.4 1.4-4.9-4.9zM13.6 5.9 6 16l2 2 10.1-7.6M6 16l-3 5",
  envelope: "M3 5h18v14H3zM3 6l9 7 9-7",
  instagram: "M4 4h16v16H4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 7h.01",
  arrow: "M5 12h14M13 6l6 6-6 6",
  location: "M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-6" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={paths[name]} />
    </svg>
  );
}
