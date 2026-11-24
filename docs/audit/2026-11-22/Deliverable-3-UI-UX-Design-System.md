# Deliverable 3: UX & UI Design System Compliance

## Design Tokens & Visual Consistency

### Tailwind CSS Color Tokens Used
- `bg-surface` — card backgrounds, input backgrounds
- `bg-background` — page container backgrounds
- `text-navy` — primary headings and major text
- `border-neutral-border` — input/border borders
- `bg-indigo` — primary action buttons
- `text-semantic-success` — success banner text
- `bg-semantic-success-subtle` — success banner backgrounds
- `bg-indigo-subtle` — subtle indigo backgrounds (demo cards)
- `bg-neutral-light` — light neutral backgrounds
- `bg-neutral-border` — neutral border strokes
- `text-neutral-secondary` — secondary/placeholder text
- `text-indigo` — accent indigo text

### Layout Patterns
- **AppShell**: Wraps all pages with consistent sidebar/header/footer structure.
- **Responsive Grids**: 
  - `grid-cols-1 md:grid-cols-3` — three-column layouts on desktop, single column on mobile
  - `flex flex-col sm:flex-row` — stacked mobile, horizontal desktop
  - `grid grid-cols-2 gap-2` — two-column selector grids
- **Page Containers**: `max-w-4xl w-full mx-auto` centered content maximum width.

### Accessibility & Interactive Elements
- ** aria-pressed**: Present on toggle buttons (Present/Absent, Present/Absent segmented controls in MarkAttendanceCard).
- **Disabled States**: `disabled:opacity-50`, `disabled:cursor-not-appear` on all interactive buttons.
- **Loading Indicators**: `isSaving` state shows "Saving..." text and disables save button; `CheckCircle2` / `AlertCircle` success/error icons in feedback banners.
- **Focus Rings**: `focus-visible:ring-2 focus-visible:ring-indigo/20` on all focusable inputs and buttons.

### Component-Level Evidence
- **MarkAttendanceCard**: Segmented toggle buttons with `aria-pressed`, loading state, success/error banners.
- **Notes PDF Modals**: Image preview modals with close accessibility; PDF preview viewer supports keyboard navigation.
- **Assignment Cards**: Hover states, delete modals with confirmation, status badges.
- **Profile Cards**: Appearance preferences toggles, feedback modals, logout confirmations.

---
*End of Deliverable 3*