import { kcal } from "@/lib/format";

export function SiteHeader({
  todayCalories,
  planCalories,
  active,
}: {
  todayCalories: number;
  planCalories: number;
  active: "meals" | "snacks";
}) {
  return (
    <header className="topbar">
      <a className="brand" href="/">
        <span className="mark" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nugget.jpg" alt="" />
        </span>
        Nugget<b>Cals</b>
      </a>
      <nav className="nav-links">
        <a href="/" className={active === "meals" ? "is-active" : undefined}>
          Meals
        </a>
        <a href="/snacks" className={active === "snacks" ? "is-active" : undefined}>
          Chips & snacks
        </a>
        <a href="/#log">Today</a>
      </nav>
      <a className="snack-jump" href={active === "snacks" ? "/" : "/snacks"}>
        {active === "snacks" ? "Meals" : "Snacks"}
      </a>
      <a className="today-pill" href="/#log">
        <span>Today</span>
        <strong>
          {kcal(todayCalories)} / {kcal(planCalories)}
        </strong>
      </a>
    </header>
  );
}
