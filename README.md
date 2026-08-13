# NuggetCals

NuggetCals photographs a real meal and estimates calories in three steps: identify the plate, look up the size, then estimate calories.

## What it does

1. You upload a JPG/PNG of food (or take one with your phone camera).
2. Optionally type a restaurant and what the dish is (`chicken`, `bowl`, …).
3. Vision AI identifies every item on the plate. It does not invent calorie numbers.
4. Size comes next: official 1-serving chain items, a typical homemade serving, or a US quarter (24.26 mm) as a ruler.
5. Calories are published restaurant / USDA numbers scaled to that size.

Add a free Groq key in the app so vision can actually see the plate. Create one at [console.groq.com/keys](https://console.groq.com/keys) — no credit card.

## Setup

```bash
cd bitewise
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Put it on the internet (always on)

`localhost` only works while this computer is running the app. To make NuggetCals a real website anyone (or just you) can open anytime:

### Easiest: Vercel (free)

1. Create a free account at [https://vercel.com/signup](https://vercel.com/signup).
2. Install [Git](https://git-scm.com/download/win) if you do not have it.
3. Push this repo, then import it in Vercel.

Open the live URL on your phone. In Safari / Chrome, choose **Add to Home Screen**. Paste your Groq key once in the app.

## Tips

- Type the restaurant for official chain-menu calories.
- Tap **Chicken** (or type it) if the photo is chicken.
- If the name is wrong, tap the right dish under the result.
- Lay a US quarter next to homemade food for a closer size.
- Use **I ate** if you only finished part of the plate.

Estimates only — not medical advice.
