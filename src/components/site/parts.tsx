import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { useSiteContent } from "@/content/context";

export function Brand({ size = "md" }: { size?: "md" | "lg" }) {
  const site = useSiteContent();
  return (
    <span className="flex items-center gap-3">
      <img src={site.brand.logo} alt="" width={768} height={768} className={size === "lg" ? "size-16" : "size-12"} />
      <span className={cn("font-serif", size === "lg" ? "text-3xl" : "hidden text-2xl sm:inline")}>{site.brand.name}</span>
    </span>
  );
}

const btn = {
  light: "bg-card text-primary hover:bg-secondary",
  outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
  solid: "bg-accent text-accent-foreground hover:bg-primary",
};

export function ActionLink({ href, children, variant = "outline" }: { href: string; children: ReactNode; variant?: keyof typeof btn }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors", btn[variant])}
    >
      {children}
      <Icon name="arrow" className="size-4" />
    </a>
  );
}

const panel = {
  deep: "bg-deep text-primary-foreground",
  pale: "bg-card",
  powder: "bg-secondary",
  spotlight: "border-2 border-accent bg-primary text-primary-foreground",
};

/** Shared layout for the concert, open-rehearsal and audition panels. */
export function Panel({ id, eyebrow, title, tone = "pale", children, art }: {
  id: string; eyebrow?: string; title: string; tone?: keyof typeof panel; children: ReactNode; art?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className={cn("relative overflow-hidden rounded-3xl shadow-soft", panel[tone])}>
      {art}
      <div className={cn("relative max-w-xl p-6 sm:p-10", tone === "spotlight" && "py-10 sm:py-14")}>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] opacity-75">{eyebrow}</p>}
        <h2 id={`${id}-t`} className="text-4xl italic sm:text-5xl">{title}</h2>
        <div className="mt-3 space-y-4">{children}</div>
      </div>
    </section>
  );
}
