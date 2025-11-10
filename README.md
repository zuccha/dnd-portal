# D&D Portal

A web application for browsing, managing, and sharing **Dungeons & Dragons (5e 2024)** content.
Players and Game Masters can explore and edit game resources such as **spells**, **weapons**, **creatures**, and more.

## Core Features

1. **User authentication** (Discord, Google, etc.)
2. **Campaign creation and invitations** (TODO)
3. **Resource browsing**
   - Toggle between **table** and **card** layouts
   - **Filtering and sorting** (server + client)
4. **Resource management (for GMs)**
   - Create, edit, and delete resources
5. **Multi-language support**
   - Interface + resource translations
6. **Unit system toggle**
   - Metric / Imperial
7. **Zod-based schema validation**
8. **RPC-driven data layer**
   - All logic in Supabase SQL functions (no Node backend)

## Overview

### 👥 User Roles & Authentication

- **Auth Providers:** Sign up or log in using **Discord** (via Supabase Auth).
- **Campaign System:**
  - Any user can create a campaign (TODO).
  - The campaign creator automatically becomes its **Game Master (GM)**.
  - GMs can invite others via invitation links (TODO).
  - Invited users become **Players**.
- **Permissions:**
  - **GMs:** create, edit, and delete resources.
  - **Players:** browse and filter resources only.

### 📚 Resources

Initial supported resource types:

- **Creatures** (WIP)
- **Eldritch Invocations**
- **Spells**
- **Weapons**

Each resource:

- Can be viewed as either:
  - A **table view**, or
  - A **card grid** (similar to Magic: The Gathering cards).
- Supports filtering and search:
  - **Server-side filters** for complex or indexed fields (e.g., level, rarity, type).
  - **Client-side filters** for lightweight fields (e.g., name).
- Includes **multi-language content**, initially:
  - **English (EN)** and **Italian (IT)**
- Supports **unit systems** for distances and weights:
  - **Metric** and **Imperial**

### 🧾 Data Model

Each resource includes:

| Category                 | Example Fields                       |
| ------------------------ | ------------------------------------ |
| **Language-independent** | `level`, `range`, `damage`, `school` |
| **Language-dependent**   | `name`, `description`                |
| **Common fields**        | `id`, `name`, `visibility`           |

Multi-language data is stored in translation tables such as:

- `spell_translations`
- `weapon_translations`
- `creature_translations`

Each translation is linked by `resource_id` and `lang`.

### 🧰 Technical Stack

| Layer                | Technology                              |
| -------------------- | --------------------------------------- |
| **Frontend**         | React 19 + Vite 7                       |
| **Language**         | TypeScript 5.8                          |
| **UI Library**       | Chakra UI 3                             |
| **State Management** | Custom stores + TanStack React Query 5  |
| **Validation**       | Zod 4                                   |
| **Database & Auth**  | Supabase (Postgres + Auth + Storage)    |
| **API Layer**        | Supabase **RPC (Postgres functions)**   |
| **Localization**     | Built-in UI + data translations (EN/IT) |
| **Icons**            | lucide-react                            |
| **Themes**           | next-themes                             |
| **Build System**     | TypeScript + Vite SWC                   |

## Project Status

| Feature                                      | Status                               |
| -------------------------------------------- | ------------------------------------ |
| **Spells**                                   | ✅ Fully functional                  |
| **Weapons**                                  | ✅ Fully functional                  |
| **Eldritch Invocations**                     | ✅ Fully functional                  |
| **Creatures**                                | 🚧 WIP (schema complete, UI pending) |
| **Campaign Creation**                        | 📋 Planned                           |
| **Campaign Invitations**                     | 📋 Planned                           |
| **Additional Auth Providers** (Google, etc.) | 📋 Planned                           |

## Development

### Prerequisites

- **Node.js** 18 or higher
- **Supabase** account with a configured project

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Available Scripts

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```
