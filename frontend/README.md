TrustLens Frontend (React + Vite + TypeScript)

Production-ready scaffold with routing, layouts, services, state store, and styles.

Scripts
- dev: start local dev server
- build: type-check and build production bundle
- preview: preview production build

Env
- Set `VITE_API_BASE_URL` to your backend base URL.

Structure
- src/main.tsx: app entry
- src/routes: router and protected route
- src/layouts: Root and Dashboard layouts
- src/pages: pages (Home, Features, About, Results, NotFound)
- src/components: shared UI
- src/lib: env and http client
- src/services: API service modules
- src/store: Zustand stores
- src/queries: custom hooks
- src/styles: global styles

Backend integration
- HTTP client adds `Authorization: Bearer <token>` if present in `useSessionStore`.
- Update `src/services/*` endpoints to match backend contracts.

trustlens.me
iteration1.trustlens.me
iteration2.trustlens.me
https://iteration3.trustlens.me/
