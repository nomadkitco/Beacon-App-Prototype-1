# Beacon Prototype

A working interactive prototype of the Beacon travel app, built to be deployed to the web so the receipt scanner runs live and the whole thing can be screen-recorded.

## What's in here
- `src/App.jsx` - the entire app (5 screens, nav drawer, notifications, budget, currency, live receipt scan)
- `src/index.css` - styling/layout
- `src/main.jsx` - the entry point that boots the app
- `index.html` - the page shell
- `api/scan.js` - the secure backend that reads receipts (holds your API key; never exposed to the browser)
- `package.json`, `vite.config.js` - build setup

## The one thing that makes the scanner work
The receipt scanner calls `/api/scan`. That backend function needs your Anthropic API key, set as an environment variable in Vercel named exactly:

    ANTHROPIC_API_KEY

Set it in Vercel under Project Settings > Environment Variables. Without it, every screen works except the scan.

## Deploy steps (short version)
1. Get an Anthropic API key at console.anthropic.com and add a little billing credit.
2. Put this folder on GitHub (GitHub Desktop is the easy way).
3. Import the repo at vercel.com.
4. Add the `ANTHROPIC_API_KEY` environment variable in Vercel.
5. Deploy. Open the live URL on your phone. Test the scan. Record.

## Run it locally first (optional)
With Node installed:

    npm install
    npm run dev

The UI will open in your browser. Everything works locally except the scan (the scan needs the backend, which only runs once deployed to Vercel). That's expected.

## If the scan errors after deploy
The model name lives in `api/scan.js` (look for `model: "claude-sonnet-4-6"`). If you ever see a model error, that one line is the thing to change.
