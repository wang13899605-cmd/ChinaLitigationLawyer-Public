# Reminder policy

## Matter-level confirmation

At Matter creation, ask once whether proactive reminders are authorized. Record:

- authorization status: `unconfirmed`, `authorized`, or `disabled`;
- lawyer who confirmed and confirmation time;
- recipients;
- delivery method supported by the current product;
- covered deadline types;
- any excluded matters or deadline classes.

When `authorized`, later lawyer-confirmed deadlines within scope may create or update reminders without another permission question. A material change to recipient, method, scope, or external destination requires a new confirmation. `disabled` and `unconfirmed` mean registry and risk-list maintenance only.

## Default schedule

- Critical: 14, 7, 3, and 1 day before the official due time.
- Ordinary: 7, 3, and 1 day before the official due time.
- Under seven days: notify immediately, then retain only future reminder points.
- Expired or possibly expired: notify the lawyer immediately; do not describe it as an ordinary reminder.

Adjust the plan for hour-based deadlines, internal due dates, weekends, holidays, availability, signature/seal circulation, client approval, and platform risk. Reminder time is an internal risk-control choice and must not be presented as the legal due time.

## Creating a proactive reminder

Only create one if all are true:

1. Matter policy is `authorized` and covers the deadline.
2. The deadline is lawyer-confirmed or otherwise meets the recorded confirmation threshold.
3. Recipient, method, due time, timezone, and reminder points are known.
4. The reminder prompt identifies Matter, Deadline ID, due time, required action, source path, and what evidence will prove completion.

Use the product's scheduled-task capability in the desktop app for local project reminders. Record the returned task identifier and status in `REMINDER_REGISTER.yaml`. If the tool is unavailable or fails, record `planned_not_created`; never claim a reminder was created. Local scheduled tasks require the computer and desktop app to be available when they run, so the register remains the authoritative audit trail rather than the notification mechanism alone.

When a deadline changes, update or cancel the old scheduled reminder and preserve its prior identifier and state. When completion proof is recorded, cancel unnecessary future reminders and record that action.
