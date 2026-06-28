# Hostel Management System — Detailed Plan

Status: **Draft, awaiting alignment**. Nothing has been coded yet.
Last updated: 2026-06-28.

---

## 1. Goal

One sentence: **every hostel task has an owner, a time window, and a proof — and management sees one daily dashboard that answers "is the hostel running properly today?"**

Success looks like:
- A warden cannot fake or backdate a task — camera-only, time-locked.
- Management gets a single mobile screen with green/yellow/red status for the day.
- Outings cannot happen without parent OTP + multi-staff approval.
- Sick students, laundry items, and supplies are all counted and recorded.

---

## 2. Roles

| Role | Who | Count (initial) | What they do |
|------|-----|-----------------|--------------|
| **Management** | Hostel owners | 3 | Dashboard, alerts, approve special-day outings, configure staff/wardens/approvers/schedule |
| **Warden** | On-ground supervisors | 3–4 | Complete daily tasks, take 5 attendances, upload photos, log sick students, distribute laundry, **handle kitchen tasks + supply deliveries (vegetables, monthly items, water pump, food wastage)** |
| **Staff** | Outing approvers only | 2–3 | Approve outing requests. No daily-task duties. |
| **Student** | Residents | ~150 | Stored as a lightweight registry record (name, class, dorm, gender, parent name, parent phone). No app login in Phase 1. |
| **Parent** | Parents of students | One per student | Verified via OTP at gate for outings. Receives WhatsApp/SMS notifications (sick, outing approval). **No app, no view links.** |

Each warden has a fixed set of tasks they own. Tasks can be reassigned by management at any time. If a warden is off duty, management or another warden can reassign for that day.

---

## 3. Languages

**Phase 1–4: English only.** All roles see English UI and English notifications.

**Phase 5 (later):** Add Telugu (for wardens/staff) and Hindi (for management) as a toggle. We will build the codebase with i18n-ready string keys from day one so this is a config change later, not a rewrite.

---

## 4. Authentication

| User | Login method | Why |
|------|--------------|-----|
| Management | Phone + OTP | Highest privilege, infrequent login |
| Warden | Phone + 4-digit PIN (after one-time OTP setup) | Daily use; OTP every time is friction |
| Staff | Phone + 4-digit PIN | Same as warden |
| Student | Phone + OTP (optional Phase 1) | Read-only, low-frequency |
| Parent | OTP at gate only — no app login | Pickup verification, not an account |

Session: 30-day rolling on warden/staff devices (they re-PIN daily on app open).

---

## 5. Core data model (entities)

```
Hostel (1)
 ├─ Student (N) — name, roll no, class, dorm, gender, primary_parent_phone, emergency_contact_phone, photo, is_active
 ├─ Parent   (N) — name, phone, relation (mother/father/guardian/emergency), linked_student_id(s)
 ├─ User     (N) — name, phone, role (mgmt/warden/staff/student), pin_hash, language
 ├─ TaskTemplate (N) — name, slot_time, upload_window_minutes, proof_type, default_assignee
 ├─ TaskInstance (N per day) — template_id, date, assignee_id, status, proof_url, submitted_at
 ├─ Attendance (5 per day) — slot (1–5), boys_present, girls_present, absent_with_perm, absent_without_perm, submitted_by, submitted_at
 ├─ Outing (N) — student_id, parent_id, date, type (regular/special/sick_pickup), reason_preset (Sick/Family event/Doctor visit/Family emergency/Other), reason_note, expected_return_at, approvals_received, status, otp_verified_at, picked_up_at, returned_at
 ├─ SickLog (N) — student_id, symptoms, onset_time, parent_called_at, status (resting/sent_home), closed_at
 ├─ LaundryBatch (N) — vendor, pickup_date, return_date
 ├─ LaundryItem (N) — batch_id, student_id, picked_count, returned_count, unclaimed_count, complaints[]
 ├─ Supply (N) — type (weekly_veg/monthly_item), date, status, photo_url, acknowledged_by
 ├─ Alert (N) — type, severity, related_entity, created_at, acknowledged_at
 └─ Config — approver_user_ids[], outing_default_day, schedule, retention_days
```

**Why we need a student registry (lightweight: name, class/dorm, gender, parent name, primary parent phone, emergency contact phone):**

| Feature | Why student record is needed |
|---------|------------------------------|
| Outings | Parent OTP must go to the right number; pickup audit log shows which student left and when |
| Sick bay | Dashboard says "Ravi (Class 8) — sick since 2pm, parent not called yet" instead of "1 sick student somewhere" |
| Laundry | Per-student pickup/return count is the whole vendor accountability story |
| Attendance | Stays **count-based** — no per-student check-in needed |
| Daily tasks, supply, water pump | Not student-tied; registry not used |

Setup: all 150 students added manually via admin screen (no CSV import). New admissions added the same way.

---

## 6. Feature modules

### 6.1 Daily task scheduler

The core of Phase 1.

**Daily schedule (defaults — fully editable per hostel):**

| Time | Task | Proof | Upload window |
|------|------|-------|---------------|
| **5:00 am** | **Wake-up — lights/fans/main switch OFF check** | **Tap done** | **5:00–7:00 am** |
| 5:15–5:45 am | Yoga session | Photo (camera only) | 5:15–7:45 am |
| **5:00 am** | **Bore pump ON** (paired session, see 6.7) | Photo | 4:50–5:30 am |
| **6:00 am** | **Bore pump OFF** | Photo | 5:50–6:30 am |
| 6:30 am | Study hall start — **Attendance #1** | Count entry | 6:30–8:30 am |
| **6:30 am** | **Room lock confirmation** (all dorms locked) | **Tap done** | **6:30–8:30 am** |
| 8:00–8:30 am | Breakfast (optional attendance) | Optional count | 8:00–10:00 am |
| **9:00–11:00 am** | **Breakfast wastage photo** | Photo + Low/Med/High tag | 9:00–11:00 am |
| Morning interval | **Attendance #2** | Count entry | within 2hr of interval |
| Lunch | **Attendance #3** (with cross-warden verification) | Count entry | within 2hr of lunch |
| **2:00–4:00 pm** | **Lunch wastage photo** | Photo + Low/Med/High tag | 2:00–4:00 pm |
| 5:00–6:00 pm | Snacks, games, sick check | Sick log if any | 5:00–7:00 pm |
| 6:00 pm | **Attendance #4** + sick log | Count entry | 6:00–8:00 pm |
| **6:00–8:00 pm** | **Snacks wastage photo** | Photo + Low/Med/High tag | 6:00–8:00 pm |
| 8:00–9:00 pm | Evening study hall | None | — |
| 9:00 pm | Dining hall + Learning hall clean | 2 photos | 9:00–11:00 pm |
| 9:00–9:30 pm | Laundry distribution | Count per student | 9:00–11:00 pm |
| 9:30 pm | **Attendance #5** (close day) | Count entry | 9:30–11:00 pm |
| **9:30–11:30 pm** | **Dinner wastage photo** | Photo + Low/Med/High tag | 9:30–11:30 pm |

**Recurring (not part of daily schedule):**
- Water pump ON / OFF — photo per event, against schedule
- Weekly vegetables — yes/no + photo
- Monthly supplies checklist — per-item acknowledgement
- Food wastage — ad-hoc photo log

**Rules:**
- Camera-only upload (gallery access disabled at PWA level).
- Default upload buffer = task time + 2 hours. After that, task locks and logs as **missed**.
- Holidays / school closed days: schedule auto-skips school-interval attendance; toggle in admin.
- Each task is assigned to a specific warden; reassignable per day.

### 6.2 Attendance

- 5 mandatory roll-calls per day (#1, #2, #3, #4, #5). #2 may auto-skip on holidays.
- Each entry captures: total boys enrolled, total girls enrolled, boys present, girls present, absent with permission (auto-filled from approved outings), absent without permission (auto-calculated), submitted by, submitted at.
- Dashboard shows latest figure + variance from previous count.
- Discrepancy flag if (present + absent_with_perm + absent_without_perm) ≠ enrolled.

**Verification — cross-warden count at lunch (#3):**

- The lunch (Attendance #3) slot is double-entered. The assigned warden enters their count; a second warden independently enters theirs.
- System compares the two counts:
  - **Match** → Attendance #3 marked verified ✅
  - **Mismatch** → both wardens get a "please recount and resubmit" alert; if still different after 1 retry, escalates to management
- The second warden is assigned by rotation (e.g., the warden on duty for the next slot).
- Cost: ~30 seconds of a second warden's time per day. Removes the only blind spot in count-based attendance.

### 6.3 Outings

**Rule:** Outings allowed only on the 2nd Saturday of each month by default. Any other day = "special request" → escalates to management.

**Standard outing flow (OTP first, then staff approval — in this order):**

1. Parent arrives at gate.
2. Warden/gate staff opens outing request screen → picks student from roster.
3. System auto-sends OTP to registered parent phone.
4. Parent reads OTP aloud → warden types it in. **Parent identity verified.**
5. Request fans out to all configured staff approvers via push notification.
6. **Any one staff approver taps Approve.** Outing authorized.
7. Student released. System auto-marks student as "absent with permission" for that day's attendance.
8. Optional: log return time when student is back.

**Why this order:** OTP answers "is this really the parent?" (identity). Staff answers "is this outing allowed?" (authorization). Identity must be confirmed before authorization — otherwise staff could end up approving a release to a stranger.

**Special-day request flow:**
- Steps 1–4 (parent at gate → OTP verified) same as regular flow.
- Staff approver must pick a **reason preset** before tapping Approve:
  - 🤒 Sick · 👨‍👩‍👧 Family event · 🏥 Doctor visit · 🚨 Family emergency · 📝 Other (free text required)
- Any one staff approver can release. Management is auto-notified — no management approval required.
- **Outing surfaces as a 🔴 red alert block on the management dashboard** with student name + reason.

**Sick-pickup outing (auto-created when warden picks "🏠 Sent home" in sick bay):**
- Reason is auto-filled from the SickLog symptoms (no preset to pick).
- OTP + staff approval still required (parent must be verified).
- Also surfaces as a 🔴 red alert block on the management dashboard, tagged 🏥, with the symptoms as the reason ("Sent home — fever, headache").

**Why red blocks for both:** Special-day and sick-pickup outings are exceptions to the normal rule. Management needs to see them at a glance, not dig into a list. Regular 2nd-Saturday outings just go into the daily count, no alert.

**Configurable:** Default outing day, number of approvers, which staff are approvers. Default rule: **any one approver can release the student** (per management decision — fastest path, all approvals still logged with name + timestamp for audit).

### 6.4 Sick bay

**Flow:**

1. Warden taps "Add sick student" → picks student from roster, enters symptoms, time reported (auto-stamped, editable).
2. Record created → status: **Reported**. 1-hour parent-call countdown starts. Management dashboard sick-today count increases.
3. Warden calls primary parent (tap-to-dial from the app). Taps **📞 Parent called** when done → status: **Parent called**.
   - If primary parent unreachable: warden tries **emergency contact phone**. Both attempts logged with timestamp.
   - If both unreachable after 2 hours → red alert to management.
4. Based on parent's response, pick outcome:
   - **🛏 Resting in hostel** — stays on active list, daily follow-up required
   - **🏠 Sent home** — triggers the **full outing flow** (OTP + staff approval), then closes the sick log
   - **🏥 Sent to doctor / hospital** — stays on active list with location note
   - **✓ Recovered** — closes the log
5. Daily 6 pm sick check window — warden reviews active list, updates each one. Active cases roll forward to next day until closed.

**Rules:**
- A log stays "open" until status reaches a terminal outcome (`Recovered`, `Sent home`, or returned from doctor).
- In-hostel resting students stay on the active list until marked `Recovered` — management can see "5 resting · 2 at doctor · 1 sent home" at a glance.

**Alerts:**
- 🔴 Parent not called within 1 hour → warden + management
- 🔴 Primary + emergency both unreachable after 2 hours → management
- 🔴 Resting more than 3 days → **management only** (consider doctor visit / check for pattern)

**What we deliberately skip:**
- No photo proof for sick logs (feels invasive for sick kids)
- No medical category dropdown — symptoms stay as free text (warden describes what they see)

### 6.5 Laundry

- **Pickup:** Warden opens batch, selects each student, enters count of items picked. One photo of the loaded batch.
- **Return:** Warden matches each student's returned count vs. pickup count. Difference flagged as missing.
- **Distribution (9:00–9:30 pm window):** Per-student tick-off. At 9:30 pm, untickets auto-mark as "unclaimed (N items)" with student name.
- **Complaints:** Warden or management can file complaint against a batch (missing item, damaged item, etc.). Tied to vendor for trend reports.
- **Vendor scorecard:** Total complaints, missing items, return accuracy %, over weekly/monthly windows.

**Edge cases:**

| Situation | Handling |
|-----------|----------|
| Student **resting in hostel** (sick but present) | Normal pickup/return/distribution |
| Student **sent home / sent to hospital** | No items logged for them in that batch; system skips them automatically based on sick-bay status |
| Student **on approved outing** during distribution | Items auto-marked "unclaimed (N items)" and held |
| Student **absent without permission** during distribution | Same as above + management notified |
| Items missing at vendor return | Per-student delta flagged → counts toward vendor's complaint score |
| Student joins mid-batch | Added to next pickup |
| Student leaves hostel | Final batch returned before exit; flagged as final |
| Unclaimed items sitting >24 hrs | Management dashboard shows "N unclaimed laundry items pending" |

### 6.6 Supply & kitchen (warden-owned)

- **Weekly vegetables:** Recurring task. Warden taps Yes/No + uploads delivery photo. Missed = alert to management.
- **Monthly supplies:** Checklist of items (configurable). Each item acknowledged separately with optional photo. Any unchecked item by deadline = alert.
- **Food wastage:** 4 scheduled photo slots per day (not ad-hoc). Each is a regular time-locked task:
  - Breakfast wastage: 9:00 – 11:00 am
  - Lunch wastage: 2:00 – 4:00 pm
  - Snacks wastage: 6:00 – 8:00 pm
  - Dinner wastage: 9:30 – 11:30 pm
  - Each upload requires a photo of the wastage bin/trays + a quick **level tag** picked manually by the warden (🟢 Low / 🟡 Medium / 🔴 High) + optional note.
  - Tag is a qualitative judgement, not measured. In-app tooltip guides the warden:
    - 🟢 Low — barely any wastage, most kids finished
    - 🟡 Medium — noticeable wastage, ~a quarter of one item left
    - 🔴 High — significant wastage, half+ of one item or one dish almost untouched
  - Photo is the actual evidence; tag is the index for trend searches ("show all High wastage meals this month").
  - Missed slot = 🔴 alert. Captures a daily wastage record so management can spot patterns (e.g., "egg curry day always high").

### 6.7 Water pump & infrastructure (warden-owned)

**Paired-session model.** Each pump run is one logical **session** with two stages (ON → OFF), not two independent tasks. System auto-tracks duration vs. target and flags anomalies.

**Default schedule:**
- **Bore pump (morning):** 5:00 am ON → 6:00 am OFF · target duration: 1 hour · tolerance: ±15 min · assigned to morning warden
- Additional pump sessions configurable in admin (e.g., filter pump, evening bore run).

**Session lifecycle:**

| Stage | Window | Action | Status after |
|-------|--------|--------|--------------|
| 1. Turn ON | 4:50 – 5:30 am | Warden takes photo of pump ON | Running |
| 2. Turn OFF | 5:50 – 6:30 am | Warden takes photo of pump OFF (button unlocked at 5:50) | Done |

While running, warden's home screen shows a live "Bore pump · Running · 38 min" card with a countdown to OFF.

**Auto-detected anomalies:**

| Flag | Trigger | Severity |
|------|---------|----------|
| ON missed | ON window closes with no photo | 🔴 Red |
| OFF missed | OFF window closes with no photo, session still running | 🔴 Red |
| Ran too short | Duration < 80% of target | 🟡 Yellow |
| Ran too long | Duration > 120% of target | 🟡 Yellow (possible water wastage) |
| Late ON | Photo within window but >15 min after target | 🟡 Yellow |
| Abandoned session | No OFF photo by next morning | 🔴 Red — escalate to management |

**Manual interruption:** If power cuts mid-session, warden taps "Interrupted" with optional photo + reason. Session closes with `interrupted` status — doesn't count as anomaly but logged for follow-up.

**Data model:**
```
PumpSchedule — id, name, target_on_time, target_off_time, target_duration, tolerance,
               on_window, off_window, assigned_warden, days_active

PumpSession — id, schedule_id, date,
              on_photo_url, on_at, on_by_warden,
              off_photo_url, off_at, off_by_warden,
              duration_minutes (computed), status, anomaly_flags[]
```

### 6.8 Food wastage log

- Covered in 6.6 above. Single-photo entry, no required schedule.

---

## 7. Notifications

| Trigger | Channel | Recipient | Language |
|---------|---------|-----------|----------|
| Task window opens | WhatsApp + in-app push | Assigned warden | Telugu |
| Task overdue 30 min before close | WhatsApp + push | Warden + management | Telugu / English |
| Task missed | Push | Management | English/Hindi |
| Outing request | Push | All configured approvers | Telugu |
| Outing approved/rejected | Push | Originating warden + parent (SMS) | Telugu |
| Sick log without parent contact > 1 hr | Push | Warden + management | Telugu / English/Hindi |
| Attendance discrepancy | Push | Management | English/Hindi |
| Weekly supply missed | Push | Management | English/Hindi |

**Channel choice:** WhatsApp Business API is the right long-term choice. Setup takes ~1–2 weeks (Meta verification + Twilio template approval) and costs ~₹0.40/message. For Phase 1, we can use in-app push (free, instant) and add WhatsApp in Phase 5 as the doc says.

---

## 8. Dashboards

### 8.1 Management dashboard (daily)

Single screen, mobile first. Top to bottom:

1. **Date + hostel name** with a refresh time.
2. **Summary cards (4) — live counters, not end-of-day:**
   - **Tasks: X of Y · 🔴 N missed** — where Y = tasks whose window has *already opened*, not the full day. Sub-text shows "N more due later today."
   - **Attendance: X of Y** — where Y = attendance slots whose target time has *already passed*.
   - **Sick: N** — open sick logs (resting + at doctor). Sub-text breakdown.
   - **Outings: N** — away today. Sub-text flags if any are exceptions.
   - **Rule:** denominators grow through the day. A task whose window hasn't opened yet does NOT count against the warden. End of day, all cards reach the full-day total.
3. **Needs attention feed** — red and orange only:
   - 🔴 Exception outings (sick pickup, special-day) — always shown when present
   - 🔴 Missed tasks / SLA breaches
   - 🟡 Window closing soon (optional — can hide if too noisy)
   - Each row: tappable to see details + proof
4. **Activity log** — top-right link. Audit trail of everything that completed (green items live here, not on Today tab).

**What deliberately moved off the Today tab:**
- Per-warden scorecards → **Wardens** tab
- Food wastage daily strip → **Trends / This week** tab
- Latest attendance breakdown → tap the Attendance card to drill in
- Green "all good" confirmations → Activity log

**Tabs:**
| Tab | Purpose |
|-----|---------|
| **Today** | At-a-glance status + only what needs your attention |
| **Trends** (week/month) | Wastage patterns, attendance averages, missed-task rates, warden reliability |
| **Wardens** | Per-warden scorecards (today + week reliability %) |
| **Settings** | Schedule, students, approvers, etc. |

### 8.2 Management dashboard (trends)

Tab from main dashboard. Weekly/monthly:
- **Warden reliability scorecard** — ranked list: Lakshmi 100% (28/28), Suresh 96%, Priya 79% etc. Drives accountability conversations. Score includes task completion + attendance on-time + sick-call-on-time + supply acks.
- Missed task count per warden
- Attendance averages
- Laundry complaint count
- Sick frequency by student
- Supply delivery hit rate

### 8.3 Warden home

- Today's tasks in time order. Each card: time, name, status badge (Upcoming / **Open now** / Done / Missed).
- Tapping an open task → action screen (camera or count form).
- Outside-window tasks: greyed out, label "Locked" or "Missed."
- Bottom nav: Tasks · Attendance · Sick · Laundry · Profile.

### 8.4 Staff approval screen

- Inbox of pending outing requests.
- Each: student, parent, time, "needs X more approvals."
- Approve / Reject buttons.
- History tab.

---

## 9. Admin / configuration

Management-only screens:

- **Students:** Add/edit/disable students. Bulk import via CSV. Fields: name, roll no, class, dorm, gender, parent name, parent phone, photo.
- **Users:** Add/edit wardens, staff, management users. Assign role. Set language.
- **Approvers:** Pick which staff are outing approvers. Pick approval rule (all must approve / any N of M).
- **Schedule:** Edit task templates, times, upload windows, default assignee.
- **Holiday calendar:** Mark school holidays so attendance #2 auto-skips.
- **Outing rules:** Default permitted day (2nd Saturday), number of approvers, special-day approver (default: management).
- **Notification preferences:** Channels per role.

---

## 10. UI principles

- Mobile-first PWA. Add-to-home-screen on Android/iPhone.
- Large tap targets (min 48 px), high contrast.
- One primary action per screen.
- Telugu/Hindi/English string toggle per user.
- No nested menus more than 2 deep.
- Camera launches inline, not via "choose file."
- Number entry uses on-screen number pad, not the full keyboard.
- Offline-friendly: tasks queue locally and sync when online.

---

## 11. Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React PWA (Next.js) | One codebase for Android + iPhone, no app store |
| Backend | Supabase (Postgres + Auth + Storage) | Auth, DB, file storage, RLS — minimal ops |
| Push notifications | WhatsApp Business API via Twilio (from day one) + Web Push fallback | WhatsApp setup (Meta verification + template approval) starts in parallel with Phase 1 coding. In-app push works immediately as fallback. |
| SMS (parent OTP) | Twilio or MSG91 (India) | Reliable Telugu OTP delivery |
| Hosting | Vercel (frontend), Supabase Cloud (backend) | Generous free tiers, scales easily |
| Storage retention | Supabase Storage with 30-day cleanup job | Photos auto-deleted after 30 days |

Estimated monthly cost at 100 students, 5 wardens, 3 staff:
- Vercel: free tier
- Supabase: ~$25 (Pro tier for backups + Storage > 1 GB)
- SMS OTPs (~30/mo for outings): ~₹100
- WhatsApp (when added): ~₹1,500–2,000 for ~5,000 notifications/mo
- **Total: ~$25 + ₹2,000/mo (~₹4,000/mo all-in)**

---

## 12. Photo & data handling

- **Capture:** `<input type="file" accept="image/*" capture="environment">` — opens device camera, no gallery.
- **Compression:** Resize to max 1280px on the long edge, JPEG quality 75, before upload. Keeps files ~100–300 KB.
- **Storage:** Supabase Storage, private bucket. URLs signed per request.
- **Retention:** Cron job deletes photos older than 30 days. Database rows keep the metadata indefinitely (which task, when, who) — only the image is purged.
- **Privacy:** Student photos only visible to management and wardens. Not shared with parents.

---

## 13. Offline & low-connectivity

- PWA service worker caches the app shell.
- Task submissions (photo + form) queue locally if offline; auto-uploads when back online.
- Attendance entries the same.
- Dashboard requires network (always-fresh view).

---

## 14. Edge cases & exception flows

| Case | Handling |
|------|----------|
| Warden off duty | Management reassigns task for the day from admin screen. |
| School holiday | Attendance #2 (school-interval) auto-skips per holiday calendar. |
| Parent phone wrong / unreachable for OTP | Warden can request management override; logged with reason. |
| Outing approver also off duty | Management can act as fallback approver; logged. |
| Power/network outage during yoga photo time | 2-hour window covers most outages. If still no upload, task logs as missed; warden can submit a "late with reason" request for management review. |
| Student new admission mid-month | Added to roster from admin; counted in enrolled total from that date. |
| Student leaves hostel | Marked inactive; excluded from enrolled total. |
| Duplicate sick log for same student | Allowed but flagged. |
| Late-night corrections (e.g., attendance count wrong) | Warden can edit within the window; outside the window only management can edit, and edits are logged with reason. |

---

## 15. Phased rollout

| Phase | Scope | Why first |
|-------|-------|-----------|
| **1** | Daily task checklist + camera-only photo upload + 2-hour time lock + missed-task alerts + management dashboard (basic) | Highest value: stops manual paper tracking immediately |
| **2** | Attendance module (all 5 slots, auto-calc, dashboard summary) | Next-most-visible to management |
| **3** | Outings: OTP parent check-in, multi-approver, auto-link to attendance | Replaces the riskiest manual process |
| **4** | Sick bay + laundry + supply (weekly veg + monthly checklist + food wastage) | Operational coverage |
| **5** | Telugu (warden/staff) + Hindi (management) localization, trend dashboards | Localization deferred until core flow is proven |

Each phase is ~2–3 weeks of build + a week of dogfood at the hostel before the next phase starts.

---

## 16. Assumptions (please confirm or correct)

1. Single hostel, **~150 students**, co-ed (separate boys/girls counts).
2. **3–4 wardens, 2–3 staff approvers, 3 management users.**
3. Wardens have Android phones with a working camera and intermittent 4G.
4. Existing student data lives in an Excel sheet that we can import once.
5. Parent phone numbers are known and current for at least 90% of students.
6. One outsourced laundry vendor.
7. School is closed on Sundays and second Saturdays (attendance #2 skips).
8. Budget for cloud + SMS + WhatsApp is acceptable up to ~₹5,000/mo all-in.

---

## 17. Open questions (these block coding — please answer)

1. **Approval rule:** Do you want all 2–3 staff approvers to approve outings, or any majority (e.g., 2 of 3)?
2. **Special-day outing approver:** Just you (management), or staff + management?
3. **Staff vs. warden distinction:** Are staff and wardens different people, or do some folks wear both hats?
4. **Student app:** Phase 1 has no student-facing app. Do you want students to be able to see laundry status / their attendance in Phase 4? Or is parent-via-link enough?
5. **WhatsApp now or later:** WhatsApp Business API takes 1–2 weeks to set up. OK to start with in-app push and add WhatsApp in Phase 5, or do you want WhatsApp from day one?
6. **Hostel scale:** Roughly how many students, wardens, and staff are we sizing for?
7. **Existing data:** Do you have a student list (Excel/Google Sheet) we can import, or do we add students one by one?
8. **Holiday handling:** Is the daily schedule the same on Sundays / school holidays, or does it shrink (e.g., no school interval attendance, study hall later)?
9. **Special-day outing rule:** Is the 2nd Saturday the only auto-permitted day, or should festivals / specific dates also be auto-permitted?
10. **Photo retention:** 30 days confirmed?

Once these are answered, we can move to UI mockups (screen-by-screen), then start Phase 1 coding.
