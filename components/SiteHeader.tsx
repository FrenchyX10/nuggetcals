import { kcal } from "@/lib/format";

export type SitePage = "meals" | "snacks" | "homemade" | "drinks";

const LINKS: { id: SitePage; href: string; label: string }[] = [
  { id: "meals", href: "/", label: "Meals" },
  { id: "snacks", href: "/snacks", label: "Snacks" },
  { id: "homemade", href: "/homemade", label: "Homemade" },
  { id: "drinks", href: "/drinks", label: "Drinks" },
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
          <a href="/#log">Today</a>
        </nav>
        <a className="today-pill" href="/#log">
          <span>Today</span>
          <strong>
            {kcal(todayCalories)} / {kcal(planCalories)}
          </strong>
        </a>
      </header>
      <nav className="page-tabs" aria-label="Sections">
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
    </>
  );
}
