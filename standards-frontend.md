---
trigger: always_on
---

This project uses React 19 + Vite + JavaScript (NOT TypeScript).

Styling is done with Tailwind CSS v4 and shadcn/ui.

Global state management is Redux Toolkit with createAsyncThunk.

Routing is done with react-router-dom.

Icons are from lucide-react.

Animations are from framer-motion.

Notifications use sonner.

API calls use axios.

SEO handled with react-helmet-async.

shadcn/ui Rules (VERY IMPORTANT):

NEVER write custom UI components (Button, Input, Card, Dialog, etc.) from scratch.

ALWAYS install shadcn/ui components using the CLI command: npx shadcn@latest add <component-name> (e.g., npx shadcn@latest add button).

After installing, import them from @/components/ui/<component-name>.

Before building any UI section, first check if the required shadcn component is already installed in src/components/ui/. If not, install it first with the CLI, then use it.

Do not modify files inside src/components/ui/ unless absolutely necessary. If customization is needed, wrap the shadcn component in a new component inside src/components/common/.

Styling Rules:

Global CSS and theme variables (Light/Dark) live in src/styles/index.css.

All theme colors, fonts, radius must be defined as CSS variables in :root and .dark.

Never use inline styles. Never use hardcoded hex colors in components. Always use Tailwind classes that reference theme variables.

Project Structure Rules:

Follow a feature-based folder structure (features/auth, features/reports, features/horoscope, features/jyotish, features/compatibility, features/user).

Redux slices live inside their respective feature folder (e.g., features/auth/authSlice.js).

API thunk files live inside their feature folder (e.g., features/auth/authApi.js).

Global layouts go in src/components/layout/.

Reusable custom components go in src/components/common/.

Page-level components go in src/pages/.

Helper functions go in src/lib/ (api-client.js, utils.js, constants.js).

Custom hooks go in src/hooks/.

Code Quality Rules:

Write clean, reusable functional components.

Use @/ path alias for all imports (e.g., import { Button } from '@/components/ui/button').

Use async/await inside createAsyncThunk. Handle loading, success, and error states properly.

Always add loading skeletons and error states for API-driven UI.