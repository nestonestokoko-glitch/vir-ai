import { ReactNode } from "react";
import { Check, ArrowRight } from "lucide-react";

interface FeatureStoryboardCardProps {
  /** Optional leading number, e.g. "01" */
  num?: string;
  title: string;
  /** Image URL for the thumbnail (rendered full-width at the top) */
  icon?: string;
  /** Inline icon node (e.g. an SVG) used instead of `icon` */
  iconNode?: ReactNode;
  /** Checklist items rendered with checkmarks */
  items?: string[];
  /** Free-form body (description) rendered when there is no checklist */
  children?: ReactNode;
  /** If provided, renders a bottom-pinned "Learn more" style link */
  ctaLabel?: string;
  href?: string;
  className?: string;
}

/**
 * Feature Storyboard Card — charcoal (#212121) card with a full-width
 * thumbnail, a numbered heading, a checklist (or description), and a
 * bottom-pinned CTA. Height is responsive (min-height floor + grows with
 * content) so text never overlaps on small screens.
 */
export function FeatureStoryboardCard({
  num,
  title,
  icon,
  iconNode,
  items,
  children,
  ctaLabel,
  href = "#",
  className = "",
}: FeatureStoryboardCardProps) {
  return (
    <div
      className={`flex h-full min-h-[420px] flex-col rounded-2xl bg-[#212121] p-6 md:min-h-[520px] ${className}`}
    >
      {iconNode ? (
        <div className="mb-5 flex h-12 w-12 items-center justify-center">{iconNode}</div>
      ) : icon ? (
        <img
          alt={title}
          src={icon}
          className="mb-5 h-40 w-full rounded-xl object-cover"
        />
      ) : null}

      <h3 className="text-xl font-medium text-[#E1E0CC]">
        {num ? <span className="mr-2 text-[#DEDBC8]/60">{num}</span> : null}
        {title}
      </h3>

      {items && items.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-gray-400"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#DEDBC8]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {children ? (
        <div className="mt-6 text-sm leading-relaxed text-gray-400">
          {children}
        </div>
      ) : null}

      {ctaLabel ? (
        <a
          href={href}
          className="mt-auto flex items-center gap-2 pt-6 text-sm text-[#DEDBC8] transition-colors hover:text-white"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 -rotate-45" />
        </a>
      ) : null}
    </div>
  );
}

export default FeatureStoryboardCard;
