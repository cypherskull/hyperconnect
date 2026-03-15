# RETROSPECTIVE PRD (Product Requirements Document)

## Executive Summary
**HyperConnect** is a robust, B2B networking platform connecting professionals, businesses (sellers/enterprises), and investors across various industries, value chains, and geographies. The platform bridges the gap between solutions and seekers by enabling users to browse intelligent feeds, engage dynamically with sellers, discover events, communicate seamlessly, and manage end-to-end B2B sales cycles with due-diligence data in an immersive, high-usability ecosystem.

---

## User Personas

1. **The Solution Seeker (Buyer/Browser/Investor):**
   - **Goal:** Discover relevant enterprises, browse case studies/collaterals, interact with sellers via messaging or meetings, and assess businesses securely (Due Diligence).
   - **Needs:** Intelligent network discovery, feed-based updates, personalized bookmarks, and streamlined communication flows.

2. **The Provider (Seller/Enterprise Admin):**
   - **Goal:** Market their active solutions, host and broadcast events, publish thought-leadership posts with media, and respond to incoming requests.
   - **Needs:** Profile management dashboards, "Manage" tabs for active solutions, custom field generation, client testimonial integrations, and inbox request orchestration.
   
3. **The Administrator (Platform Admin):**
   - **Goal:** Oversee platform telemetry, manage system-wide settings, access granular business controls across sellers, and maintain application integrity.
   - **Needs:** A global dashboard, impersonation capabilities (admin mode), analytics overview, and unrestricted moderation privileges.

---

## Actionable Features (Currently Implemented)

### Social & Networking Engine
- **Immersive Feed:** Rich interactive posts including media attachments, text descriptions, likes, comments, and bookmarking.
- **Connections Module:** Users can send, accept, and archive connection requests.
- **Global Network Discovery:** Advanced search algorithms to find leading sellers or prospective buyers across global industries and geographies.
- **Favourites:** Direct access to saved and booked marked posts and sellers.

### Comprehensive Seller/Business Management
- **Seller Profiles:** Configurable profile cards including offerings, industries, metrics (score, tracking).
- **Solutions Hub:** Multi-solution capability per seller covering Case Studies, Testimonials, PodCasts/Events, and Document Collaterals.
- **Dynamic Events:** Internal event creation linking locations, virtual details, industry ties, and auto-publishing to followers.
- **Due Diligence:** Protected data vaults integrated with Prisma's JSON mapping, tailored for enterprise transparency to potential investors.

### Communication & Inbox
- **Synchronous Inbox:** Centralised request handling for "Meeting Requests", "Engagements", "Sales Inquiries", "Message/Connection Requests".
- **Action Statuses:** Pending, Actioned, and Archived tracking.

### Platform Infrastructure
- **Role-Based Access Control (RBAC):** Native logic isolating viewing scopes depending on whether the auth scope is generic, a connection, a seller owner, or a platform admin.
- **State Handling Engine:** React unified Context layering (`AuthContext`, `DataContext`, `UIContext`) providing real-time UI hydration.

---

## Technical Architecture

### Frontend Architecture
- **Framework:** React 19 / Vite
- **Styling:** TailwindCSS invoked via runtime CDN embedded locally (`index.html`) with extended bespoke design systems (`brand-primary`, `glass-effect`).
- **State Management:** Custom React Context bridging API services to component views using hooks and facade patterns.
- **Routing:** Component-level switch routing unified under `App.tsx` handling views (`userProfile`, `sellerProfile`, `network`, `feed`, etc.).

### Backend Architecture
- **Server:** Node.js with Express.js mapped to strict RESTful standards.
- **ORM / Database:** Prisma ORM connected to PostgreSQL.
- **Authentication:** JWT paired with bcrypt tokenization.
- **Storage Integrations:** Remote file uploads scaling linearly using `multer-s3` (AWS S3 bounds).

### Data Flow Example (Solution Event Creation)
> **Component (`EventsManager`) -> Context (`DataContext::handleUpdateSolutions`) -> API Service (`updateSolutions` performing `PUT`) -> Express Route (`/sellers/:id/solutions`) -> Prisma upsert (`Event`) -> Down-stream Refetch full seller tree -> UI Hydrates.**

---

## UI/UX Audit
- **Design Language:** A modern "glassmorphism" overlay merged with strict dark/light UI paradigms (`dark:` tailwind abstractions handled gracefully via `index.html` runtime logic). Soft semantic branding (`#4D96FF` primary accents).
- **Navigation Patterns:** Immersive top-level static navigation spanning `Home`, `Favourites`, `Inbox`, `Network`, and `Admin`. Sub-architectures are nested safely via horizontal sliding `TabButton`s.
- **Accessibility:** Semantic HTML rendering fallback. State hooks dynamically mount/unmount modals and complex UI interfaces minimizing DOM pollution. Tooltips and interaction indicators proactively prevent mis-clicks.

---

## Definition of Done (DoD)
To successfully merge a feature into the `main` stable branch of this repository, the following must hold true:

1. **Type Synchronization:** `npx tsc --noEmit` cleanly compiles for both React Frontend and Express Backend indicating zero prop or object-literal drift.
2. **E2E & Functional Testing:** Features pass through autonomous headless unit verification (e.g. Playwright testing). All E2E files pass `npm test`.
3. **Data Integrity:** Schema patches are cleanly run through `prisma migrate dev` with successful introspection mappings.
4. **Code Quality:** Absence of unhandled console errors, unformatted promises, or rogue nested payload requests impacting Context mappings (demonstrating smooth offline/mock payload fallbacks).
