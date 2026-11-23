# Oghie Weather App

A Next.js weather dashboard that retrieves current weather data from WeatherAPI.com.

## Requirements

- Node.js 20 or later
- npm

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WEATHER_API_KEY` to your WeatherAPI key.

3. Start the development server:

   ```bash
   npm run dev
   ```

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## API-key handling

The current weather widget calls WeatherAPI directly from the browser. A variable prefixed with `NEXT_PUBLIC_` is included in the client-side bundle and must be treated as public, not as a server-side secret. Restrict the key and its quota through the provider's account controls where supported. For stronger secrecy, move the provider request behind a server-side route and use a server-only environment variable.

Do not commit `.env`, `.env.local`, or other local environment files. Only the placeholder `.env.example` template is intended for version control.
