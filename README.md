# Manox

**Manox** is a lightweight task management and team collaboration tool built with the **T3 Stack**, **SST (Serverless Stack)**, and **Supabase**.

## 🧪 Try the App

Test the app using the credentials below or sign up with your own.

* **Live URL**: [https://d11xdryd8jvubz.cloudfront.net/](https://d11xdryd8jvubz.cloudfront.net/)
* **Email**: `test@gmail.com`
* **Password**: `123456789`

---

## 📚 Table of Contents

- [🏗️ Project Architecture](#️-project-architecture)
- [🧰 Tech Stack](#-tech-stack)
- [🛠️ Local Setup Steps](#️-local-setup-steps)
- [⚙️ Supabase Setup](#️-supabase-setup)
- [🧾 Environment Variable Configuration](#️environment-variable-configuration)
- [🧬 Push Prisma Schema](#️-push-prisma-schema)
- [🎨 Install Shadcn UI (Optional)](#️-install-shadcn-ui-optional)
- [🚀 SST Deployment on AWS](#️-sst-deployment-on-aws)
- [🧪 Running and Testing Locally](#️-running-and-testing-locally)
- [✅ Running Unit Tests](#️-running-unit-tests)

---

## 🏠 Project Architecture

The application uses the T3 Stack:

* **Frontend**: Next.js (App Router), Tailwind CSS, Shadcn/UI, Lucide-react

  * `src/app` – Pages and layouts
  * `src/components` – UI components
  * `src/trpc/react.tsx` – tRPC client integration

* **API Layer**: tRPC

  * `src/server/api/routers` – Router definitions
  * `src/server/api/trpc.ts` – Server setup
  * Served via Next.js API routes: `src/app/api/`

* **Authentication**: NextAuth.js (with Supabase)

  * `src/server/auth.ts` – NextAuth config

* **Database**: Supabase (PostgreSQL) + Prisma

  * `prisma/schema.prisma` – DB schema
  * `src/server/db.ts` – Prisma client instance

* **Deployment**: SST (Serverless Stack)

  * `sst.config.ts` – SST configuration
  * Deploys app to AWS Lambda + API Gateway

---

## 🛠️ Tech Stack

| Layer                  | Technology                         |
| ---------------------- | ---------------------------------- |
| Framework              | Next.js (App Router)               |
| Language               | TypeScript                         |
| Styling                | Tailwind CSS (Dark Theme)          |
| UI Components          | Shadcn/UI                          |
| Icons                  | Lucide-react                       |
| Authentication         | NextAuth.js (via Supabase)         |
| API Layer              | tRPC                               |
| ORM                    | Prisma                             |
| Database               | Supabase (PostgreSQL)              |
| Backend Infrastructure | SST (AWS Lambda & API Gateway)     |
| Hosting (Backend)      | AWS Lambda via SST                 |
| Hosting (Frontend)     | AWS CloudFront via SST (or Vercel) |
| Unit Testing           | Vitest                             |

---

## 🛠️ Local Setup Steps

### Clone the Repository

```bash
git clone https://github.com/Mandeepsinghmar/project-management-app.git
cd project-management-app
```

### Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### Set Up Supabase

See [Supabase Setup](#⚙%ef%b8%8f-supabase-setup) below for detailed steps.

---

## ⚙️ Supabase Setup

### Create a Project

* Go to [Supabase Dashboard](https://app.supabase.com/) and create a new project.
* Set a strong password and save it securely.

### Get Connection String

* Navigate to **Project Settings > Database**
* Copy the **URI** under the **Connection string** tab.
* Replace `[YOUR-PASSWORD]` in the URI with your database password → use as `DATABASE_URL`.

### Get Supabase URL & Keys

* Go to **Project Settings > API**:

  * Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  * Copy the **Anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * Copy the **Service Role Key** (same page) → `SUPABASE_SERVICE_ROLE_KEY`

### Enable Email/Password Auth

* Go to **Authentication > Providers**
* Enable **Email** provider
  (Disable email confirmation for development, but recommended to enable for production)

---

## Environment Variable Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### Fill in the following:

```env
# Prisma / Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# NextAuth.js
NEXTAUTH_SECRET="your-secret" # use: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

---

## 🧬 Push Prisma Schema

Ensure `DATABASE_URL` is correct, then run:

```bash
npx prisma db push
```

---

## 🎨 Install Shadcn UI (Optional)

If UI components are missing:

```bash
pnpm dlx shadcn-ui@latest init
# Follow prompts:
# - Style: new-york
# - globals.css path: src/app/globals.css
# - Tailwind config: tailwind.config.ts

npx shadcn@latest add button card input dialog select avatar dropdown-menu label textarea popover date-picker checkbox command
```

---

## 🚀 SST Deployment on AWS

Make sure AWS CLI is configured. Then:

```bash
pnpm sst deploy
```

This will deploy your Next.js app (API + frontend) to AWS via Lambda & CloudFront.

---

## 🔪 Running and Testing Locally

```bash
pnpm dev
# or
npm run dev
```

Visit `http://localhost:3000`

---

## ✅ Running Unit Tests

```bash
pnpm test
# or
npm run test
```
