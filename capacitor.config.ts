import type { CapacitorConfig } from '@capacitor/cli';

/**
 * FamilyHub runs as a server-backed Capacitor app: instead of bundling a
 * static web build, the iOS/iPad shell loads the Next.js app over HTTP.
 *
 * - Local development: defaults to http://localhost:3000 (run `npm run dev`
 *   or `docker compose up`, then `npm run ios:sync && npm run ios:open`).
 * - Production builds: set CAP_SERVER_URL to the hosted instance before
 *   syncing, e.g. `CAP_SERVER_URL=https://family.example.com npx cap sync ios`.
 *
 * `webDir` points at `public/` only because Capacitor requires a web
 * directory to exist; it is not actually served in server mode.
 * `cleartext: true` allows plain-HTTP localhost during development — harmless
 * once CAP_SERVER_URL is an https URL.
 */
const config: CapacitorConfig = {
  appId: 'com.familyhub.app',
  appName: 'FamilyHub',
  webDir: 'public',
  server: {
    url: process.env.CAP_SERVER_URL || 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
