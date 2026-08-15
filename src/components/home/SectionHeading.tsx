import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/** Shared section header: eyebrow, title, optional subtitle and a "view all" link. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  viewAllHref,
  viewAllLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={`mb-10 flex flex-col gap-4 md:mb-14 sm:flex-row sm:items-end ${
        centered ? "text-center sm:justify-center" : "text-start sm:justify-between"
      }`}
    >
      <div className={`max-w-2xl ${centered ? "mx-auto" : ""}`}>
        {eyebrow ? (
          <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-widest text-brand md:text-sm">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p
            className={`mt-2.5 text-base text-muted-foreground md:text-lg ${centered ? "mx-auto" : ""}`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {viewAllHref && viewAllLabel ? (
        <Link
          to={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand transition-colors hover:text-brand-hover"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
