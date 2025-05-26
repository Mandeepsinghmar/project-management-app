# Manox

Manox is a lightweight task management and team collaboration tool built with the T3 Stack, SST (Serverless Stack), and Supabase.

## Test the app using the below credentials or use your own.
- https://d11xdryd8jvubz.cloudfront.net/
- email: test@gmail.com
- password: 123456789

## Table of Contents

- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Local Setup Steps](#local-setup-steps)
- [Environment Variable Configuration](#environment-variable-configuration)
- [Supabase Setup](#supabase-setup)
- [SST Deployment on AWS](#sst-deployment-on-aws)
- [Running and Testing Locally](#running-and-testing-locally)
- [Running Unit Tests](#running-unit-tests)

## Project Architecture

The application follows the T3 Stack architecture, with a Next.js frontend (App Router) and a tRPC API layer. The backend leverages SST for serverless deployment on AWS Lambda, and Supabase (PostgreSQL) serves as the database.

-   **Frontend**: Next.js (App Router), Tailwind CSS, Shadcn/UI, Lucide-react
    -   `src/app` for pages and layouts.
    -   `src/components` for UI components.
    -   `src/trpc/react.tsx` for tRPC client integration.
-   **API**: tRPC
    -   `src/server/api/routers` for tRPC router definitions.
    -   `src/server/api/trpc.ts` for tRPC server setup.
    -   API routes served via Next.js API routes (`src/app/api/`).
-   **Authentication**: NextAuth.js with Supabase for Email/Password authentication.
    -   `src/server/auth.ts` for NextAuth configuration.
-   **Database**: Supabase (PostgreSQL) with Prisma ORM.
    -   `prisma/schema.prisma` for database schema.
    -   `src/server/db.ts` for Prisma client instance.
-   **Deployment**: SST (Serverless Stack)
    -   `sst.config.ts` for SST deployment configuration.
    -   Deploys the Next.js application (including API routes) to AWS Lambda and API Gateway.

## Tech Stack

| Layer                 | Technology                               |
| --------------------- | ---------------------------------------- |
| Framework             | Next.js (with App Router)                |
| Language              | TypeScript                               |
| Styling               | Tailwind CSS (Dark Theme)                |
| UI Components         | Shadcn/UI                                |
| Icons                 | Lucide-react                             |
| Authentication        | NextAuth.js (Email/Password via Supabase)|
| API Layer             | tRPC                                     |
| ORM                   | Prisma                                   |
| Database              | Supabase (PostgreSQL)                    |
| Backend Infrastructure| SST (Serverless Stack on AWS)            |
| Hosting (Backend)     | AWS Lambda via SST                       |
| Hosting (Frontend)    | AWS CloudFront via SST (or Vercel)       |
| Unit Testing          | Vitest                                   |

## Local Setup Steps

1.  **Clone the app:**
    Clone this repository.*

2.  **Install Dependencies:**
    ```
    pnpm install 
    # or npm install / yarn install
    ```

3.  **Set up Supabase:** (See [Supabase Setup](#supabase-setup) section below)

## Create a Supabase Project

- Go to Supabase Dashboard and create a new project.
- Choose a strong password for your database. Save it securely.

## Get Database Connection String

- In your Supabase project dashboard, go to **Project Settings > Database**.
- Under **Connection string**, select the **URI** tab.
- Copy the URI and replace `[YOUR-PASSWORD]` with the database password you set. This is your `DATABASE_URL`.

## Get Supabase URL and Anon Key

- Go to **Project Settings > API**.
- Copy the **Project URL**. This is your `NEXT_PUBLIC_SUPABASE_URL`.
- Copy the **Project API key** (the public anon key). This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- copy it from the same API settings page. This would be `SUPABASE_SERVICE_ROLE_KEY`.

## Enable Email/Password Authentication Provider

- In your Supabase project dashboard, go to **Authentication > Providers**.
- Enable the **Email** provider. You can configure options like "Confirm email" if desired. For this setup, "Confirm email" is assumed to be off for simplicity, but it's recommended for production.

## Database Schema

- The Prisma schema (`prisma/schema.prisma`) defines the tables for users, projects, tasks, etc.
- Run `npm run db:push` to create these tables in your Supabase database after configuring your `.env` file.
- Supabase's `auth.users` table will be used by Supabase for authentication.


4.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project and add the following variables:

    Copy `.env.example` to `.env` and fill in the required values.

# Prisma & Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-PROJECT-ID].supabase.co:5432/postgres"

# NextAuth.js
NEXTAUTH_SECRET="generate-a-strong-secret-here" # Use: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000" # For production, set to your deployed app's URL

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-SUPABASE-PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-SUPABASE-ANON-KEY]"
# SUPABASE_SERVICE_ROLE_KEY="[YOUR-SUPABASE-SERVICE-ROLE-KEY]" 


5.  **Push Prisma Schema to Supabase:**
    Ensure your `DATABASE_URL` in `.env` is correctly pointing to your Supabase PostgreSQL database.
    ```bash
       npx prisma db push
    ```

6.  **Install Shadcn UI Components (if not already present by cloning):**
    ```bash
    pnpm dlx shadcn-ui@latest init 
    # Follow prompts (e.g., new-york style, base color, globals.css path: src/app/globals.css, tailwind.config.js path, etc.)
    # Then add components as needed:
    npx shadcn@latest add button card input dialog select avatar dropdown-menu label textarea popover date-picker checkbox command
    ```




