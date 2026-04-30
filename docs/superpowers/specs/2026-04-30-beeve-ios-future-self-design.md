# Beeve iOS Future Self Design

## Summary

Beeve is a native iOS app that helps ordinary workers stop feeling like each day was wasted. It acts as a quiet note from a clearer future self: it nudges the user to pick one meaningful focus, capture what actually happened during the day, and close the day with a short achievement card plus a lighter plan for tomorrow.

The first version is not a full productivity suite. It avoids project management, habit tracking, complex GTD flows, and broad AI chat. The product succeeds if a user can describe it as: "It reminds me that I was not just busy. I did move something forward today."

## Target User

The target user is an ordinary office worker whose day is fragmented by meetings, messages, shifting priorities, and small interruptions. They may not identify as a productivity enthusiast. They will not configure a complicated system, maintain tags, or keep a perfect task database.

Their repeated pain is simple:

- They are busy all day.
- They cannot clearly say what mattered.
- They end the day with guilt or mental residue.
- They need tomorrow to feel smaller, not more optimized.

## Product Positioning

Beeve is "future-you for the workday."

The app should feel like tomorrow's calmer self leaving small notes for today's overloaded self. It should not sound like a coach, boss, secretary, or generic assistant. The tone is concise, grounded, and gently corrective.

Core promise:

> Before the day ends, Beeve helps you see that today was not wasted and makes tomorrow lighter.

## Core Loop

1. Morning: Beeve asks the user to choose one meaningful focus for the day.
2. Daytime: The user captures quick work fragments with one sentence at a time.
3. Late afternoon: Beeve reminds the user to stop opening new loops and collect what is already in motion.
4. Evening: Beeve generates an achievement card from completed work, interruptions, and tomorrow notes.
5. Next morning: Beeve carries forward one to three tomorrow priorities from the previous evening.

## MVP Scope

### Onboarding

The first launch asks only for:

- Preferred name.
- Usual work start time.
- Usual work end time.
- Reminder tone from a fixed set of "future self" styles.

The app asks for notification permission only after explaining the daily rhythm in plain language. Onboarding should finish in under one minute.

### Today Screen

The Today screen is the product. It answers one question: "What should I collect or continue right now?"

Required sections:

- Future-self note: one short note tied to the current time of day.
- Today's focus: the single thing worth moving forward.
- Day log: three compact groups for wins, interruptions, and tomorrow notes.
- Primary action: a prominent "Log one thing" action.

The Today screen should not look like a dashboard. It should be a calm working surface with one obvious next action.

### Quick Log

The log flow has three modes:

- Done: "I moved this forward."
- Interrupted: "This pulled me away, but it still counts."
- Tomorrow: "Future me should remember this."

Each mode accepts a single text entry. Voice input and share sheet support are desirable later, but not part of the initial implementation.

### Reminders

The app schedules three local notifications:

- Morning focus reminder after the user's work start time.
- Late afternoon collection reminder before the user's work end time.
- Evening achievement reminder after work.

The notification copy uses future-self language. It should be practical rather than motivational.

Example morning copy:

"Today's future-you only needs one real move. Pick it before the day picks for you."

Example afternoon copy:

"Do not open another loop yet. Collect what already happened and make tonight lighter."

Example evening copy:

"Before you call the day wasted, write down what actually moved."

### Achievement Card

The achievement card is the shareable object and the emotional payoff.

It includes:

- A plain-language title for the day.
- Three to five concrete things that moved forward.
- A short note that reframes interruptions as real work when appropriate.
- One to three priorities for tomorrow.
- One final future-self sentence.

The first version can generate the card locally with deterministic templates. AI generation is a later enhancement unless an API boundary is already available and stable.

### History

The app keeps past achievement cards in a simple history list. History is for reflection, not analytics. The first version does not need charts, streaks, heatmaps, or productivity scores.

### Settings

Settings include:

- Preferred name.
- Work start and end times.
- Notification toggles.
- Tone option.
- Data reset.

## Out Of Scope

The first version explicitly excludes:

- Full task management.
- Projects, tags, labels, and folders.
- Habit tracking.
- Pomodoro and focus timers.
- Calendar sync.
- Server sync.
- Login.
- Team or collaboration features.
- General AI chat.
- Complex natural-language scheduling.

These may return later only if they strengthen the core loop.

## Information Architecture

The app uses three top-level areas:

- Today: the primary daily working surface.
- Cards: past achievement cards.
- Settings: preferences, notifications, and data management.

The Today tab must remain visually dominant. Cards and Settings are supporting surfaces.

## Visual Direction

Beeve should feel like a restrained, premium product surface translated into native iOS:

- System fonts only.
- Neutral backgrounds with subtle section separation.
- Flat surfaces and crisp 1px-equivalent dividers.
- Compact but comfortable spacing.
- Blue used only for primary actions, active state, focus, and links.
- No glassmorphism, glow, heavy shadows, purple gradients, or decorative blobs.
- No nested cards unless the content needs a real frame.

The interface should feel calm, sharp, and useful on first launch. It must not look like a meditation app, a corporate dashboard, or a motivational quote app.

## Native iOS Approach

Build with SwiftUI, SwiftData, Observation, and UserNotifications.

The app should be local-first. SwiftData stores user preferences, daily entries, daily focuses, and achievement cards. Local notifications drive the active daily rhythm. Server integration can be added later through the existing Beeve monorepo, but the MVP must run without authentication or network access.

## Data Model

Use four core model concepts:

- UserPreferences: preferred name, work start time, work end time, tone, onboarding completion.
- DailyFocus: date, title, creation date, completion state.
- DayEntry: date, kind, text, creation date.
- AchievementCard: date, title, summary bullets, interruption reframe, tomorrow priorities, future-self closing line.

Entry kind is one of:

- done
- interrupted
- tomorrow

## AI Boundary

The first version should be AI-shaped, not AI-dependent.

Template generation is acceptable for the MVP because it keeps the app fast, private, and testable. The code should isolate generation behind a small service so a future AI implementation can replace deterministic text generation without rewriting views or persistence.

The generator takes:

- User preferences.
- Today's focus.
- Done entries.
- Interrupted entries.
- Tomorrow entries.

It returns:

- Future-self note.
- Achievement card title.
- Summary bullets.
- Interruption reframe.
- Tomorrow priorities.
- Closing line.

## Error Handling

Because the MVP is local-first, most failures are local state issues:

- Missing onboarding values: fall back to default times and neutral tone.
- Empty day: generate a gentle empty card that asks the user to record one real thing, not a fake summary.
- Notification denied: keep the app usable and show a quiet Settings prompt.
- SwiftData save failure: show a compact inline error and preserve the user's typed text in memory.

## Testing Strategy

Unit tests should cover:

- Daily entry grouping by date and kind.
- Future-self note selection by time of day.
- Achievement card generation for normal, interrupted, and empty days.
- Tomorrow priority extraction from tomorrow entries and unfinished focus.

UI-level verification should cover:

- First launch onboarding flow.
- Logging one done entry.
- Logging one interruption.
- Generating an achievement card.
- Editing notification preferences.

## Success Criteria

The MVP is successful when:

- A user can complete onboarding in under one minute.
- A user can log a work fragment in under ten seconds after opening the app.
- The Today screen always shows one clear next action.
- The app schedules the three daily notifications after permission is granted.
- The evening card can be generated without network access.
- The product can be explained in one sentence: "Beeve helps me see what I actually moved forward today."

## Implementation Bias

Start smaller than the old Beeve app. Rebuild only the pieces needed for the new loop. Keep every module replaceable:

- Views should not know how card text is generated.
- Generation should not know SwiftUI.
- Persistence should not know notification copy.
- Notifications should not generate business content.

This keeps the first version focused while leaving room for AI, share sheets, widgets, and auth later.
