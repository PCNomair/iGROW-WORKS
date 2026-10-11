# Natural Authentication System & GitHub Sync Implementation Plan

A robust, standard authentication system (Email/Password registration & login + seamless Google authentication) with zero user email exposure, comprehensive security, and direct GitHub Sync to a clean repository.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Zero Email Trace Guarantee**: Confirmed that your personal email is not and will never be present in any file, config, commit, or UI element. All default studio references use generic studio handles (`admin@igrowstudio.com`).
> - **Native GitHub Sync (No Downloads / No Zip)**: AI Studio connects directly to GitHub. Linking to a newly created empty repository pushes a single, pristine initial commit with zero previous commit history.
> - **Standard Authentication**: A clean in-app modal offering Email/Password account registration, secure login with validation, and an elegant Google Sign-In flow without intrusive browser `prompt()` alerts or iframe popup crashes.

- **Confirmed Decision 1**: Implement a natural, standard authentication workflow (Email + Password sign up and sign in) alongside reliable Google login.
- **Confirmed Decision 2**: Ensure all authentication error states (`auth/argument-error`, `auth/internal-error`, popup blocked) are gracefully handled in-app with clear, localized messages.
- **Confirmed Decision 3**: Provide step-by-step guidance exclusively using the top bar **GitHub Sync** button to sync directly to an empty private GitHub repository.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a polished, reliable Client Portal & Authentication experience for iGROW Works (Post-Production & Video Editing Studio). Clients can create personal accounts, sign in, submit raw footage briefs, and monitor editing stages on a live timeline.
- **Target Audience / Persona**: Creators, YouTubers, and filmmakers submitting project footage, as well as Studio Directors managing project delivery.
- **Key Value**: A smooth, error-free onboarding flow that respects privacy, eliminates technical console/popup errors, and provides instant syncing to GitHub.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Landing & Exploration**: Client explores cinematic editing portfolio and pricing tiers.
  2. **Auth Modal Trigger**: Clicking "Client Portal" or "Start a Project" opens the brutalist auth modal.
  3. **Natural Sign Up / Sign In**:
     - **Sign Up Tab**: Name, Email, Password (with minimum 6-character check, toggle password visibility, clear field validation).
     - **Sign In Tab**: Email, Password, with immediate inline feedback for invalid credentials.
     - **Google Sign-In Button**: One-click Google sign in with automatic fallback to seamless in-modal email verification if third-party cookies or iframe popups are restricted. Zero `prompt()` dialogs.
  4. **Authenticated Workspace**: Once signed in, the client sees their verified dashboard, project status pipeline (Queued → Ingest → Rough Cut → Color/Sound → Final Master), and footage upload form.
- **Visual Identity & Theme**:
  - *Aesthetic*: Editorial brutalist high-contrast studio style matching iGROW Works.
  - *Palette*: Deep black (`#000000`), studio paper (`#F5F5F0`), safety yellow (`#FFE600`), and clean monospace status tags.
  - *Typography*: Syne & Oswald for striking display titles, Plus Jakarta Sans & JetBrains Mono for data readouts.
- **Interactive Feedback**: In-modal error and success banners, animated state transitions, and toast notifications.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Elimination of Browser `prompt()` and Iframe Popup Crashes**
  - *Chosen Approach*: Replace any native browser alerts/prompts with styled in-modal form fields. Handle Google OAuth popup errors (`auth/internal-error`, `auth/argument-error`) gracefully with an inline fallback.
  - *Why*: In preview iframes and strict browser environments, popup windows and `window.prompt()` break user trust and cause unexpected errors.
  - *Alternatives Considered*: Native `prompt()` (rejected: ugly, causes confusion, breaks iframe constraints).

- **Decision 2: Dual Persistence (Firestore + Resilient Local Session)**
  - *Chosen Approach*: Accounts and project submissions sync to Firebase Firestore while maintaining an encrypted local session store.
  - *Why*: Ensures clients never lose access even during temporary network drops or Firebase rules propagation.

- **Decision 3: GitHub Sync Architecture**
  - *Chosen Approach*: Direct integration with AI Studio's native GitHub Sync.
  - *Why*: Completely avoids downloading zip files or manual git installations. Pushing to a fresh private repo ensures 100% clean history with zero traces of prior edits.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   iGROW Works Client                    │
├──────────────────────────┬─────────────────────────────┤
│   Sign In / Sign Up Modal│     Client Portal Pipeline  │
│   - Name / Email / Pass  │     - Active Projects       │
│   - Google OAuth Button  │     - Ingest / Status Tracks│
│   - In-modal Validation  │     - Deliverables & Links  │
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────────────────────────────────────┐
│               Unified Auth & Storage Layer             │
│   - Standard Email/Password validation                 │
│   - Safe Firebase Auth wrapper (try/catch safeguards)  │
│   - Firestore Database sync (`users` & `projects`)     │
│   - Local session caching (zero data loss fallback)    │
└────────────────────────────────────────────────────────┘
```

- **Interactive Handlers to Implement**:
  - Enhanced `email-auth-form` with clear state transitions between "Sign In" and "Create Account".
  - Secure credential validation with intuitive error messaging (e.g., duplicate email detection, password length requirement).
  - Robust Google Sign-In wrapper that safely catches iframe popup errors without crashing.
  - Safe logout and session switching for client and director roles.

---

### 5. Step-by-Step GitHub Sync Procedure (For the User)

Once we finalize and compile the code:
1. Open [GitHub](https://github.com) and create a **New Repository**.
2. Give it any name (e.g., `igrow-studio`) and set visibility to **Private**.
3. **Important**: Leave "Add a README" and all initialization checkboxes unchecked (keep it completely empty).
4. In the top navigation bar of Google AI Studio, click the **GitHub** button and select **GitHub Sync**.
5. Select your newly created repository and confirm the sync. AI Studio will push the current, clean codebase directly to your repository as the initial commit. Zero history of previous revisions, zero email exposure, completely secure and private.
