---
name: Expo Router + persisted state pitfalls
description: Crash loops from render-time navigation and corrupted persisted phase state in the mobile game
---

- Never call `router.replace()` in a component's render body — it throws "Cannot update a component while rendering another" and loops. Put guards/redirects in `useEffect`.
- **Why:** Two separate white-screen/error-page incidents came from this plus its follow-on: a persisted `phase` pointing at a screen whose guard redirected back, creating an infinite redirect loop ("Maximum update depth exceeded").
- **How to apply:** Any screen keyed off persisted state must (1) redirect only inside `useEffect`, and (2) the state loader must sanitize on load — roll `phase` back if required data (player/company) is missing.
- Also: multiple context setters calling `save({...state,...})` from the same closure overwrite each other; always use functional `setState(prev => ...)` for every action.
- react-native-svg elements (Ellipse, etc.) crash on native if rendered outside `<Svg>` — web may tolerate it, device won't.

## Animation/timer pitfalls (added 2026-08-03)
- Don't memoize "just spawned" flags on Date.now() — track a ref Set of seen IDs at scene mount; anything not in the set is new. Avoids replayed spawn animations on remount.
- Toast auto-dismiss: one timer per toast id; a shared batch timer gets cancelled by effect cleanup when new events arrive, leaving stale toasts.
- To visually verify post-onboarding screens on web (empty storage), temporarily seed INITIAL_STATE with a test phase/data, screenshot, then revert.
