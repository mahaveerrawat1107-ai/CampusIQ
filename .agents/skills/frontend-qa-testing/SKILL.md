---
name: frontend-qa-testing
description: Playbook for systematically auditing and testing CampusIQ frontend features, attendance calculations, assignment workflows, notes filtering, and responsive mobile layouts.
---

# Frontend QA & Testing Engineering Skill

This skill guides manual and automated quality assurance across student and faculty modules.

## Testing Checklist
1. **Attendance Calculation Invariants:**
   - Safe status requires $\ge 75\%$.
   - Warning status requires $70\% \le \text{attendance} < 75\%$.
   - Critical status triggers below $70\%$.
   - Safe bunks formula: $\lfloor (P / 0.75) - T \rfloor$.
   - Recovery formula: $\lceil (0.75 \times T - P) / 0.25 \rceil$.
2. **Assignments:**
   - Students cannot create or delete course assignments (read & toggle completion status only).
   - Staff assignment prototype manages creations, edits, attachments, and draft/published flags.
3. **Notes Library:**
   - Hierarchy: Semester &rarr; Subject &rarr; Unit &rarr; PDF.
   - Students have read-only access to published notes.
4. **Verification Protocol:**
   - Always run `npm run build` after changes and confirm 0 TypeScript errors.
