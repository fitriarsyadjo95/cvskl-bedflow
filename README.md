# CVSKL Bed Flow & Patient Coordination Platform

A coordination layer for Vesalius. Real-time bed visibility, cross-department
workflow, and capacity intelligence — without replacing your EMR.

This repository contains an **interactive, no-database demo** of the
platform proposed by BlackGrid Digital for Cardiac Vascular Sentral Kuala
Lumpur (CVSKL). It's built as a single Next.js app that runs anywhere
Next.js runs, and it's ready to deploy to Railway with no env vars.

> Status: design demo. All data lives in memory. Refresh the page to
> reset. Not for production clinical use.

---

## What's in the demo

Ten screens covering the full role surface area of the proposal:

| Route               | Persona            | What it answers                                |
| ------------------- | ------------------ | ---------------------------------------------- |
| `/`                 | Marketing landing  | What this thing is                             |
| `/login`            | Role switcher      | Pick a persona, no auth                        |
| `/bed-manager`      | Bed Manager        | "What's free in the next 4 hours?"             |
| `/ward`             | Ward Nurse         | "Whose paperwork is moving?"                   |
| `/housekeeping`     | Housekeeping       | "Which beds matter most right now?"            |
| `/business-office`  | Business Office    | "Where are we stuck on GL?"                    |
| `/executive`        | Executive          | "Are we burning bed-hours?"                    |
| `/patient/[id]`     | Drill-down         | Event-sourced timeline + GL + clinical summary |
| `/settings`         | Profile/theme      | Light, persona, integrations (decorative)      |

The seven-state bed lifecycle from the proposal is modelled end-to-end:

```
Vacant Ready → Reserved → Occupied → Discharge Ordered
            ↓                                       ↓
        Cleaning ← Bed Released ← Pending GL ←─────┘
```

### Interactivity

Cross-screen reactivity is the whole point of the demo:

- Click any bed on `/bed-manager` to **advance its state** (cycles through
  the seven-state lifecycle). Tooltip explains.
- Approve a GL on `/business-office` to **release the bed** — Housekeeping
  queue updates, Executive KPIs recalculate, the patient timeline gains an
  audit event, all in real time.
- Admit a patient from the incoming queue on `/bed-manager` to **occupy a
  reserved bed**.
- Mark a bed clean on `/housekeeping` to **return it to Vacant Ready**.

Every state change emits an event into the in-memory audit trail with author
+ timestamp and a Sonner toast.

### Density toggle ("see it all on one screen")

Both `/bed-manager` and `/ward` have a **Compact / Detail** toggle in the
page header. Compact is the default — all 60 beds fit in a single viewport
without scrolling on desktop. Switch to Detail for full tiles with patient
names.

---

## Stack

| Layer          | Choice                                                       |
| -------------- | ------------------------------------------------------------ |
| Framework      | Next.js 16 (App Router) + React 19                           |
| Language       | TypeScript                                                   |
| Styling        | Tailwind v4                                                  |
| UI components  | shadcn/ui (`base-nova` preset on `@base-ui/react`)           |
| Icons          | Lucide                                                       |
| Charts         | Recharts (Executive view)                                    |
| Toasts         | Sonner                                                       |
| Dark mode      | next-themes                                                  |
| Command palette| cmdk (`⌘K` / `Ctrl+K` from anywhere)                         |
| Data           | In-memory React Context + reducer · no database              |

There is **no persistence**. State is per-session per-tab. Refresh = reset.

---

## Run locally

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

For a production build:

```bash
pnpm build
pnpm start
```

---

## Deploy to Railway

This repo is Railway-ready. Two ways to ship it:

### Option A — via Railway dashboard (no CLI)

1. Push this repo to GitHub (this README assumes you already have).
2. Go to <https://railway.app/new> → **Deploy from GitHub repo**.
3. Pick this repo. Railway auto-detects Next.js and uses the supplied
   `railway.json` for build/start commands.
4. No environment variables are required.
5. Once the build finishes (~2 min), Railway issues a public URL.

### Option B — via Railway CLI

```bash
brew install railway      # or curl-installer per Railway docs
railway login
railway init              # link to a new project
railway up                # deploys current branch
```

---

## Repo structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout + providers
│   ├── page.tsx              # Landing
│   ├── login/                # Role switcher
│   └── (app)/                # App shell group
│       ├── layout.tsx        # Top nav + ⌘K + role switcher
│       ├── bed-manager/      # Flagship live bed map
│       ├── ward/             # Patient cards / dense table
│       ├── housekeeping/     # Priority cleaning queue
│       ├── business-office/  # GL kanban + blocked list
│       ├── executive/        # KPIs + Recharts analytics
│       ├── patient/[id]/     # Drill-down + event timeline
│       └── settings/         # Profile / theme / integrations
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── shell/                # Nav, logo, ⌘K palette, theme
│   ├── bed/                  # BedTile, BedMap, state badge
│   ├── kpi/                  # KpiCard
│   └── shared/               # Page header, time, density toggle
└── lib/
    ├── types.ts              # Bed, Patient, GL, Role
    ├── mock-data.ts          # 60 beds, ~45 patients, GL queue
    ├── store.tsx             # Context + reducer + selectors
    ├── format.ts             # RM currency, hours-from-now
    └── use-mounted.ts        # SSR-safe mount hook
```

---

## Design choices worth knowing

- **Mobile-first for Ward + Housekeeping.** Those staff don't sit at desks;
  card- and queue-based layouts work well on phones and tablets.
- **Dashboard-first for Bed Manager + Executive + Business Office.** Those
  roles live at a screen and need information density.
- **One palette across roles.** Surgical blue accent + semantic state
  colours (emerald/sky/indigo/amber/rose/violet/fuchsia). Dark mode is a
  first-class citizen.
- **No premature abstractions.** All routes are simple files. The reducer
  is a single switch. There's no service layer because there's no service.
- **The shape mirrors the real product.** When the real Coordination Layer
  (n8n + Supabase + Vesalius adapter) is built, the interface code can move
  over with minimal change — the Context is the boundary.

---

## Roadmap (what the real platform would add)

- **Vesalius read adapter** (events + patient master + discharge orders)
- **Supabase event store** with row-level security and audit
- **n8n workflow runner** for state-transition side effects (notifications,
  housekeeping queue rebuilds, etc.)
- **Chatwoot** for per-patient threaded comms
- **Metabase** for executive self-serve analytics
- **PWA install** for ward + housekeeping tablets/phones

See the Commercial Proposal in the parent folder for full detail.

---

## Credits

Designed and built by [BlackGrid Digital](https://blackgridseo.com) for
Cardiac Vascular Sentral Kuala Lumpur.

© 2026 BlackGrid Digital Sdn Bhd. Demo build.
