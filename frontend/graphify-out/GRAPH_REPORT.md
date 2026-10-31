# Graph Report - frontend  (2026-10-30)

## Corpus Check
- Corpus is ~2,515 words - fits in a single context window. You may not need a graph.

## Summary
- 98 nodes · 167 edges · 7 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Build & Dev Dependencies
- TypeScript Compiler Config
- Auth & Routing Layer
- Admin Panel Components
- HTTP Client & Runtime Deps
- App Entry & Fonts
- Vite / Node TS Config

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `react` - 8 edges
3. `useAuth()` - 7 edges
4. `Admin()` - 7 edges
5. `Restaurante Dos Palmeras` - 7 edges
6. `AppRoutes()` - 6 edges
7. `compilerOptions` - 6 edges
8. `react-router-dom` - 5 edges
9. `Google Fonts` - 5 edges
10. `scripts` - 4 edges

## Surprising Connections (you probably didn't know these)
- `AppRoutes()` --calls--> `Carta()`  [EXTRACTED]
  src/App.tsx → src/pages/Carta.tsx
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  src/App.tsx → src/contexts/AuthContext.tsx
- `AppRoutes()` --calls--> `Admin()`  [EXTRACTED]
  src/App.tsx → src/pages/Admin.tsx
- `AppRoutes()` --calls--> `Login()`  [EXTRACTED]
  src/App.tsx → src/pages/Login.tsx
- `App()` --calls--> `AuthProvider()`  [EXTRACTED]
  src/App.tsx → src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "Build & Dev Dependencies"
Cohesion: 0.13
Nodes (18): devDependencies, @types/react@^18.2.45, @types/react-dom@^18.2.18, typescript@^5.3.3, vite@^5.0.8, @vitejs/plugin-react@^4.2.1, name, scripts (+10 more)

### Community 1 - "TypeScript Compiler Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 2 - "Auth & Routing Layer"
Cohesion: 0.30
Nodes (11): react-router-dom, App(), AppRoutes(), ProtectedRoute(), AuthContext, AuthContextType, AuthProvider(), useAuth() (+3 more)

### Community 3 - "Admin Panel Components"
Cohesion: 0.23
Nodes (13): AddItemForm(), AddItemFormProps, DailySlot(), formatPrice(), ItemRow(), ItemRowProps, SectionAccordion(), SectionAccordionProps (+5 more)

### Community 4 - "HTTP Client & Runtime Deps"
Cohesion: 0.19
Nodes (11): dependencies, axios@^1.6.2, react@^18.2.0, react-dom@^18.2.0, react-router-dom@^6.21.0, axios, react, react-dom (+3 more)

### Community 5 - "App Entry & Fonts"
Cohesion: 0.36
Nodes (7): Dancing Script, Oswald, Playfair Display, Raleway, Google Fonts, Restaurante Dos Palmeras, root div

### Community 6 - "Vite / Node TS Config"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `HTTP Client & Runtime Deps` to `Build & Dev Dependencies`, `Auth & Routing Layer`, `Admin Panel Components`, `App Entry & Fonts`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Should `Build & Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Auth & Routing Layer` to `Build & Dev Dependencies`, `Admin Panel Components`, `HTTP Client & Runtime Deps`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `TypeScript Compiler Config` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._