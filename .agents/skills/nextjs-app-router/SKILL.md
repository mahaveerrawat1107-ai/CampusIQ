---
name: nextjs-app-router
description: Guidance and best practices for developing with Next.js 14 App Router, React Server Components (RSC), Client Components, and static prerendering in CampusIQ.
---

# Next.js 14 App Router Engineering Skill

This skill guides the implementation and refactoring of routes, layouts, and components in Next.js 14.

## Key Rules
1. **Server vs. Client Components:**
   - Default to Server Components for data fetching and static markup.
   - Use `"use client"` only when user interactivity (event listeners, hooks like `useState`, `useEffect`, `useContext`) is required.
2. **Context Providers:**
   - Keep context providers wrapped in a dedicated Client Component tree in `src/app/layout.tsx`.
3. **Static Optimization:**
   - Ensure dynamic parameters and search parameters do not unintentionally break static prerendering during `npm run build`.
