# Plan

## 1. Fix "/" showing Not Found in preview

The splash route exists but the preview shows 404. Most likely cause: the Lovable preview iframe sometimes deep-links to `/` while the route is still cold and `useNavigate` runs before the router is ready, or the splash renders fine but the auto-redirect lands on `/dashboard` cleanly elsewhere. To make `/` bulletproof:

- Keep `src/routes/index.tsx` as the splash, but render the splash unconditionally (no redirect-on-mount race) and use a `<Link>`-based fallback plus `router.navigate` after the timeout.
- Confirm there is no stray `src/routes/_app/index.tsx` or other file claiming `/` (would cause routing conflict). Audit `routeTree.gen.ts` references.
- Ensure `__root.tsx` renders `<Outlet />` (via `WorkspaceShell`) for `/` — verified.

## 2. Auto-close sidebar on mobile/tablet nav click

In `WorkspaceShell.tsx` `AppSidebar`, each `SidebarMenuButton` wraps a `Link`. On mobile, `useSidebar().setOpenMobile(false)` must fire on link click. Add an `onClick` handler on each `Link` that calls `setOpenMobile(false)` when `isMobile` is true. Apply the same to the logo link.

## 3. PWA support (manifest-only, installable on Android/iOS)

Per Lovable PWA guidance, ship a manifest-only PWA (no service worker) so the app is installable on Android & iOS without breaking the preview iframe.

- Update `public/manifest.json`: add proper `name`, `short_name`, `description`, `start_url: "/dashboard"`, `display: "standalone"`, `theme_color`, `background_color`, icons (192 + 512, plus maskable). Already mostly present — verify and add a 192 icon entry.
- Update `index.html`: ensure `<link rel="manifest">`, `<meta name="theme-color">`, Apple-specific tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`, `apple-mobile-web-app-title`). Most already exist — add `status-bar-style` and a 180x180 apple-touch-icon if missing.
- No `vite-plugin-pwa`, no service worker (avoids preview cache problems).
- Tell the user that install prompt only appears on the published `.lovable.app` URL, not in the editor preview.

## 4. Rewrite README.md

Replace template README with a human-written one:

- Title: **Student Success Prediction System**
- Description as provided
- Features list (Student management, Performance prediction, Analytics dashboard, Student reports, Visualization)
- Tech stack (React, TypeScript, Supabase, Tailwind, Vite)
- Short Getting Started (`bun install`, `bun dev`) and project structure note
- Conversational tone, not boilerplate

## Files to change

- `src/routes/index.tsx` — harden splash navigation
- `src/components/WorkspaceShell.tsx` — auto-close mobile sidebar on link click
- `public/manifest.json` — finalize PWA manifest
- `index.html` — Apple PWA meta tags
- `README.md` — rewrite  
  
You are upgrading an existing Student Success Prediction System into an advanced production-style application.
  CRITICAL RULES — DO NOT VIOLATE
  1. DO NOT remove existing features.
  2. DO NOT change existing workflow.
  3. DO NOT change navigation behavior.
  4. DO NOT break routes.
  5. DO NOT modify existing prediction logic unless instructed below.
  6. Preserve all current UI screens and functionality.
  7. Extend functionality without replacing existing functionality.
  8. Existing pages should continue to work exactly as before.
  9. Maintain responsiveness across mobile, tablet and desktop.
  10. Follow clean architecture.
  Use:
  Frontend:
  - React
  - TypeScript
  - Tailwind
  - Existing chart library
  Backend:
  - Supabase
  - Edge functions where needed
  - FastAPI (for future ML integration)
  - Python
  - Scikit-learn
  Folder architecture:
  src/
      features/
      services/
      hooks/
      validation/
      layouts/
      constants/
      shared/
  ------------------------------------------------
  FEATURE 1: AI PREDICTION IMPROVEMENTS
  FRONTEND:
  Enhance prediction output section.
  Current:
  Input → Prediction score
  Upgrade to:
  Prediction Result Card:
  Predicted Score:
  Risk Level:
  Weak Subjects:
  Attendance Analysis:
  Improvement Suggestions:
  Recommended Study Hours:
  Performance Trend:
  Confidence Score:
  Display examples:
  Predicted Score: 79%
  Risk Level:
  High
  Weak Subjects:
  Mathematics
  Physics
  Attendance Analysis:
  Attendance below recommended threshold
  Improvement Suggestions:
  Increase study hours by 2 hours/day
  Improve mathematics practice
  Maintain attendance above 85%
  Performance Trend:
  Moderately improving
  Confidence Score:
  87%
  Use badges and visual indicators.
  Color rules:
  High Risk → red
  Medium → yellow
  Low → green
  BACKEND:
  Create:
  services/predictionService.ts
  Create helper functions:
  calculateRisk()
  detectWeakSubjects()
  generateRecommendations()
  calculateConfidence()
  Store results in database.
  ------------------------------------------------
  FEATURE 2: ADVANCED ANALYTICS DASHBOARD
  FRONTEND:
  Create dashboard cards:
  Average Class Performance
  Average Attendance
  Total Students
  Pass Percentage
  Weak Students Count
  Top Performers
  Charts:
  Bar chart:
  Subject performance
  Line chart:
  Monthly trends
  Pie chart:
  Pass/fail ratio
  Heatmap:
  Attendance patterns
  Leaderboard section:
  Top Students
  Weak Students
  Recent Trends
  BACKEND:
  Create:
  analyticsService.ts
  Fetch:
  Average score
  Attendance averages
  Student counts
  Monthly performance
  Pass/fail calculations
  ------------------------------------------------
  FEATURE 3: CSV + EXCEL UPLOAD
  FRONTEND:
  Create upload page.
  Allow:
  CSV upload
  Excel upload
  UI:
  Drag and drop zone
  Upload progress bar
  File validation
  Preview table before submit
  Success notification
  Error notification
  BACKEND:
  Parse:
  CSV
  XLSX
  Automatically:
  Validate rows
  Store data in database
  Generate predictions automatically
  Log upload activity
  ------------------------------------------------
  FEATURE 4: SMART SEARCH AND FILTERS
  FRONTEND:
  Add search bar.
  Search fields:
  Student Name
  Register Number
  Email
  Department
  Add filters:
  Department
  Semester
  Attendance %
  Marks range
  Risk level
  Status
  Include:
  multi-select filters
  reset filters button
  BACKEND:
  Create optimized query logic.
  ------------------------------------------------
  FEATURE 5: REAL-TIME NOTIFICATIONS
  FRONTEND:
  Notification bell in navbar
  Dropdown panel:
  Attendance alerts
  Prediction alerts
  System alerts
  Student alerts
  Display unread counts.
  BACKEND:
  Use Supabase realtime.
  Generate alerts:
  Attendance <75%
  New student added
  Multiple high-risk students detected
  Prediction generated
  ------------------------------------------------
  FEATURE 6: REPORT GENERATION
  FRONTEND:
  Student profile page:
  Buttons:
  Download PDF
  Export Excel
  Generate Student Card
  Preview report modal
  BACKEND:
  Generate:
  PDF reports
  Excel files
  Student report cards
  Include:
  Student details
  Prediction results
  Attendance
  Suggestions
  Charts
  ------------------------------------------------
  FEATURE 7: ACTIVITY HISTORY
  FRONTEND:
  Create Recent Activity panel.
  Display:
  Teacher uploaded marks
  Prediction generated
  Student profile updated
  Attendance modified
  Filter by:
  Date
  Activity type
  User
  BACKEND:
  Create activity_logs table.
  Store:
  action
  timestamp
  user id
  details
  ------------------------------------------------
  FEATURE 8: CHATBOT PLACEHOLDER
  IMPORTANT:
  DO NOT implement actual AI chatbot logic.
  FRONTEND:
  Create floating chatbot button.
  Requirements:
  Position:
  Bottom-left corner
  Behavior:
  Hover animation
  Draggable by mouse
  Movable across page
  Rounded design
  Small shadow effect
  Persistent across all pages
  Click action:
  Open chatbot popup
  Popup content:
  --------------------------------
  AI Assistant
  This feature is currently under development.
  Coming Soon 🚀
  Future features:
  • Performance guidance
  • Study suggestions
  • Prediction explanations
  • AI support assistant
  --------------------------------
  Close button required.
  BACKEND:
  No backend implementation.
  No API calls.
  No AI logic.
  Placeholder only.
  ------------------------------------------------
  FEATURE 9: DARK/LIGHT MODE
  FRONTEND:
  Add theme switch in navbar.
  Requirements:
  Dark mode
  Light mode
  Save preference locally
  Persist after refresh
  Smooth transitions
  BACKEND:
  No backend needed.
  ------------------------------------------------
  FEATURE 10: STUDENT PROFILE SYSTEM
  FRONTEND:
  Student profile page includes:
  Profile photo
  Name
  Department
  Semester
  CGPA
  Skills
  Achievements
  Performance summary
  Prediction history
  Recent activity
  BACKEND:
  Create profile storage tables.
  ------------------------------------------------
  FEATURE 11: PERFORMANCE COMPARISON
  FRONTEND:
  Comparison card:
  Student vs Class Average
  Metrics:
  Attendance
  Study Hours
  Predicted Score
  Marks
  Display:
  progress bars
  comparison charts
  difference indicators
  BACKEND:
  Calculate averages dynamically.
  ------------------------------------------------
  FEATURE 12: FUTURE ML MODEL STRUCTURE
  DO NOT implement complete ML prediction now.
  Prepare architecture only.
  Backend structure:
  backend/
  FastAPI/
  models/
  prediction/
  training/
  Create placeholders for:
  RandomForest
  DecisionTree
  XGBoost
  Scikit-learn setup
  Create API interfaces only.
  No model training yet.
  ------------------------------------------------
  FINAL VERIFICATION
  Before completion verify:
  ✓ Existing functionality preserved
  ✓ Existing routes preserved
  ✓ Existing UI preserved
  ✓ No broken imports
  ✓ Mobile responsive
  ✓ No console errors
  ✓ New features integrated correctly
  ✓ Chatbot only placeholder
  ✓ Existing prediction still works
  ✓ Backend services separated correctly

## Out of scope

- Offline support / service worker (intentionally avoided)
- Push notifications