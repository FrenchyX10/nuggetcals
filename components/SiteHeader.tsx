import { kcal } from "@/lib/format";

export type SitePage = "meals" | "snacks" | "homemade" | "drinks" | "trends" | "nugget";

const LINKS: { id: SitePage; href: string; label: string; short: string }[] = [
  { id: "meals", href: "/", label: "Meals", short: "Meals" },
  { id: "snacks", href: "/snacks", label: "Snacks", short: "Snacks" },
  { id: "homemade", href: "/homemade", label: "Homemade", short: "Home" },
  { id: "drinks", href: "/drinks", label: "Drinks", short: "Drinks" },
  { id: "trends", href: "/trends", label: "Trends", short: "Trends" },
  { id: "nugget", href: "/nugget", label: "Your Nugget", short: "Nugget" },
];

export function SiteHeader({
  todayCalories,
  planCalories,
  active,
}: {
  todayCalories: number;
  planCalories: number;
  active: SitePage;
}) {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="mark" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nugget.jpg" alt="" />
          </span>
          Nugget<b>Cals</b>
        </a>
        <nav className="nav-links">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={active === link.id ? "is-active" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a className="today-pill" href={active === "meals" ? "/#log" : `${LINKS.find((link) => link.id === active)?.href ?? "/"}#log`}>
          <span>Today</span>
          <strong>
            {kcal(todayCalories)}
            <i> / {kcal(planCalories)}</i>
          </strong>
        </a>
      </header>
      <nav className="dock" aria-label="Main">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={active === link.id ? "is-active" : undefined}
          >
            {link.short}
          </a>
        ))}
      </nav>
    </>
  );
}
