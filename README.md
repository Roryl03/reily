# Reily

A mobile-first web app helping parents and carers of children with additional needs discover suitable services, activities and accessible venues near their location — focused on Northern Ireland.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

## Features

- **Location-aware discovery** — browser geolocation or town/postcode search
- **Explore & map views** — filter, sort and browse 13 demo services across NI
- **Service details** — accessibility badges, opening hours, directions, reports
- **Add & manage services** — 5-step form with LocalStorage persistence
- **Favourites & preferences** — saved locally, no registration required

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Leaflet / OpenStreetMap
- Radix UI primitives (shadcn-style components)
- Lucide icons
- LocalStorage data layer (Supabase-ready structure)

## Demo data

All pre-loaded services are **fictional demonstration listings** clearly labelled as demo data. They are not verified real-world venues.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
