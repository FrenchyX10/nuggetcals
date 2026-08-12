# NuggetCals

NuggetCals photographs a real meal and estimates calories. No account. No API key. No credits.

## What it does

1. You upload a JPG/PNG of food (or take one with your phone camera).
2. Optionally type a restaurant and what the dish is (`chicken`, `bowl`, …).
3. A food model runs **on this computer**, describes the photo, and estimates portion size from how full the plate is.
4. Calories come from published restaurant / USDA numbers, scaled to that estimated size.

The first analyze downloads a free model once. After that it works without the internet.

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
3. In this folder, run:

```bash
cd C:\Users\david\bitewise
npx vercel
```

4. Log in when it asks. Accept the defaults. Vercel will give you a URL like `https://nuggetcals.vercel.app`.
5. That URL stays up even when your PC is off.

Optional: in the Vercel dashboard, add your own domain (for example `nuggetcals.com`).

### After it is live

- Open the URL on your phone.
- In Safari / Chrome, choose **Add to Home Screen**. It opens like an app.
- First calorie scan still downloads the food model in *that* browser. After that it is fast.

No API keys are required to host it.

## Tips

- Type the restaurant for chain-menu calories.
- Tap **Chicken** (or type it) if the photo is chicken.
- If the name is wrong, tap the right dish under the result.
- Use **I ate** if you only finished part of the plate.

Estimates only — not medical advice.
