"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { kcal } from "@/lib/format";
import {
  findRestaurant,
  menuFor,
  restaurantNames,
  type FoodRecord,
} from "@/lib/nutrition-data";

export function RestaurantPicker({
  restaurant,
  onRestaurant,
  onPickItem,
}: {
  restaurant: string;
  onRestaurant: (value: string) => void;
  onPickItem: (item: FoodRecord) => void;
}) {
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const openedFor = useRef("");
  const boxRef = useRef<HTMLDivElement>(null);

  const matched = findRestaurant(restaurant);
  const names = useMemo(() => restaurantNames().sort(), []);
  const suggestions = useMemo(() => {
    const needle = restaurant.trim().toLowerCase();
    if (!needle) return names;
    return names.filter((name) => {
      const lower = name.toLowerCase();
      return (
        lower.includes(needle) ||
        needle.includes(lower) ||
        findRestaurant(restaurant) === name
      );
    });
  }, [restaurant, names]);

  const menu = useMemo(() => {
    if (!matched) return [];
    const items = menuFor(matched);
    const needle = menuQuery.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.name} ${item.aliases.join(" ")}`.toLowerCase().includes(needle),
    );
  }, [matched, menuQuery]);

  useEffect(() => {
    if (matched && openedFor.current !== matched) {
      openedFor.current = matched;
      setMenuOpen(true);
      setMenuQuery("");
      setSuggestOpen(false);
    }
    if (!matched) openedFor.current = "";
  }, [matched]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function chooseRestaurant(name: string) {
    onRestaurant(name);
    setSuggestOpen(false);
    openedFor.current = "";
  }

  function closeMenu() {
    setMenuOpen(false);
    setMenuQuery("");
  }

  return (
    <div className="resto-picker" ref={boxRef}>
      <label className="field">
        <span>
          Restaurant <em>optional · type McDonald&apos;s to open the menu</em>
        </span>
        <input
          value={restaurant}
          onChange={(event) => {
            onRestaurant(event.target.value);
            setSuggestOpen(true);
          }}
          onFocus={() => setSuggestOpen(true)}
          placeholder="McDonald's, Chipotle, diner…"
          maxLength={80}
          autoComplete="off"
          role="combobox"
          aria-expanded={suggestOpen}
          aria-controls="restaurant-suggest"
        />
      </label>

      {suggestOpen && suggestions.length > 0 ? (
        <ul className="suggest-list" id="restaurant-suggest" role="listbox">
          {suggestions.map((name) => (
            <li key={name}>
              <button
                type="button"
                className={matched === name ? "is-on" : undefined}
                onClick={() => chooseRestaurant(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {matched ? (
        <button
          type="button"
          className="ghost menu-open"
          onClick={() => {
            setMenuOpen(true);
            setMenuQuery("");
          }}
        >
          Open {matched} menu
        </button>
      ) : null}

      {menuOpen && matched ? (
        <div className="menu-sheet" role="dialog" aria-label={`${matched} menu`}>
          <div className="menu-sheet-card">
            <div className="menu-sheet-head">
              <div>
                <p className="card-kicker">{matched}</p>
                <h2>Menu</h2>
              </div>
              <button type="button" className="analyze menu-close" onClick={closeMenu}>
                Close menu
              </button>
            </div>
            <label className="field">
              <span>Search this menu</span>
              <input
                value={menuQuery}
                onChange={(event) => setMenuQuery(event.target.value)}
                placeholder="Big Mac, fries, McNuggets…"
                autoComplete="off"
              />
            </label>
            <ul className="menu-list">
              {menu.map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => {
                      onPickItem(item);
                      closeMenu();
                    }}
                  >
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.grams}g serving</small>
                    </span>
                    <em>{kcal(item.calories)} kcal</em>
                  </button>
                </li>
              ))}
            </ul>
            {menu.length === 0 ? (
              <p className="empty">No match on this menu. Close and type the dish yourself.</p>
            ) : (
              <button type="button" className="ghost menu-close-bottom" onClick={closeMenu}>
                Meal not here? Close menu
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
