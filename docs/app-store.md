# App Store submission kit — Dignivirtus

Everything pre-written for App Store Connect. Blocked only on the Apple Developer
Program enrollment (Individual, $99/yr) being approved.

## App record
- **Name:** Dignivirtus
- **Subtitle (30 chars):** `Your fitness, one Overall`
- **Bundle ID:** com.dignivirtus.app
- **SKU:** dignivirtus
- **Primary category:** Health & Fitness · Secondary: Lifestyle
- **Age rating:** 4+ (no objectionable content)
- **Privacy policy URL:** https://dignivirtus.com/privacy
- **Support URL:** https://dignivirtus.com

## Description (draft)
You didn't lack discipline. You lacked proof.

Dignivirtus gives your fitness one number — an Overall rating built from five
attributes: Strength, Endurance, Mobility, Recovery and Speed. Every set, run,
step, meal and night of sleep moves it. Stop showing up and it falls. Nothing
is given; every tier has to be kept.

- 24 collectible badges across every body part, endurance, mobility, recovery,
  nutrition and speed — Bronze to Legend
- Tiers are earned with consecutive weeks of work, never a single big session
- Banked consistency: every week you hold your level banks a week of cover
- Automatic step tracking from Apple Health
- GPS run tracking with automatic 20m/50m sprint detection
- Calorie targets built from your own resting metabolic rate — cut or build
- Daily targets with reminders that keep you honest
- A live Crew leaderboard of real players

## Keywords (100 chars)
`fitness,rating,badges,gym,workout,streak,steps,running,calories,consistency,overall,tracker`

## App Privacy questionnaire answers
| Data | Collected? | Linked to user | Tracking |
|---|---|---|---|
| Email address | Yes (account) | Yes | No |
| Health & fitness (steps, workouts logged) | Yes | Yes | No |
| Precise location | Yes — during tracked runs only; processed on device, coordinates never stored | No (only derived distance/sprints saved) | No |
| Other user content (game logs) | Yes | Yes | No |
No third-party advertising, no tracking across apps, no data sold.

## Review notes (paste into "Notes" for the reviewer)
- Test account: create one free from the app (email confirmation is off), or use
  the demo login provided in the review notes field at submission time.
- HealthKit: read-only step count, used to update the Endurance rating and the
  Ten-K Club badge. Prompted on first launch after onboarding.
- Location (when-in-use): only while the user runs the in-app Run tracker;
  used to compute distance and sprint counts, coordinates are discarded.
- Reminders use local notifications only (no push).

## Screenshots needed (capture in simulator before submission)
- 6.9" (iPhone 16/17 Pro Max, 1320×2868): Player screen, Badges grid,
  Badge detail (banked weeks), Run tracker, Fuel screen — 5 shots
- Optional 6.5" set reuses the same captures letterboxed by Apple

## Submission steps (once enrolled)
1. Xcode → Signing & Capabilities → Team = the new paid team (Claude does this)
2. Device selector → "Any iOS Device (arm64)" → Product → Archive
3. Organizer → Distribute App → App Store Connect → Upload
4. appstoreconnect.apple.com → My Apps → + New App (fields above)
5. Fill listing + privacy + screenshots, select the processed build
6. TestFlight first (recommended): add testers by email, iterate ~2 weeks
7. Submit for Review

## Updates after launch
1. Bump version in Xcode (e.g. 1.0.1) — build number must always increase
2. `npm run build && npx cap sync ios`
3. Archive → Upload (same as steps 2–3)
4. App Store Connect → new version → What's New → select build → Submit
