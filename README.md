# Matrusri Hostel Management System

Mobile-first PWA for hostel daily operations: time-locked task tracking,
attendance, outings with parent OTP, sick bay, laundry, supplies, and
management dashboard.

**Stage:** Phase 1 demo — UI screens working end-to-end with mock data.
Backend (Supabase) and real auth still to come.

---

## Repo layout

```
matrusri/
├─ PLAN.md          ← Full product plan (locked decisions, data model, flows)
├─ wireframes/      ← Static HTML mockups (legacy — kept for reference)
└─ matrusri-app/    ← Next.js app (the real codebase from here on)
```

## Roles

- **Management** (3 users) — daily dashboard, alerts, configure schedule
- **Warden** (3–4 users) — daily tasks, attendance, sick bay, laundry
- **Staff approver** (2–3 users) — outing approvals only
- **Parent** — receives OTPs + WhatsApp/SMS notifications, no app login
- **Student** (~150 people) — no app in Phase 1

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Storage) — not yet wired
- WhatsApp Business API via Twilio for notifications (Phase 5)
- SMS (Twilio / MSG91) for OTPs

## Running locally

```
cd matrusri-app
npm install
npm run dev
```

Then open http://localhost:3000

## Phases

| Phase | Scope |
|-------|-------|
| 1 | Daily tasks + photos + time lock + management dashboard ← *current* |
| 2 | Full attendance module |
| 3 | Outings with OTP + multi-approver |
| 4 | Sick bay + laundry + supplies |
| 5 | Telugu/Hindi localization + WhatsApp + trends |
