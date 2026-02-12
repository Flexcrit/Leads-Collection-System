# Lead Collection System

A clean, professional internal lead collection web application built with Next.js and Tailwind CSS.

## Features

- **Dashboard**: Clean interface with leads table and add lead functionality
- **Modal Form**: Centered modal for adding new leads with validation
- **Data Persistence**: Leads are stored in a local JSON file
- **Responsive Design**: Works seamlessly on mobile and desktop devices
- **Professional UI**: Corporate, minimal design with neutral color palette

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Inter Font**

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically create a `data` directory and `leads.json` file when you add your first lead.

## Project Structure

```
lead-collection-system/
├── app/
│   ├── api/
│   │   └── leads/
│   │       └── route.ts          # API routes for leads
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard page
├── components/
│   ├── AddLeadModal.tsx          # Modal form component
│   └── LeadsTable.tsx            # Leads table component
├── data/
│   └── leads.json                # Leads data storage (auto-created)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Deployment to Vercel

### Using Vercel CLI

1. Install Vercel CLI globally (if not already installed):

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy from the project root with explicit project name:

```bash
vercel --name lead-collection-system
```

Or for production deployment:

```bash
vercel --prod --name lead-collection-system
```

**Important:** The project name must be lowercase and can only contain letters, digits, dots, underscores, and hyphens. The folder name "Lead Collection System" contains spaces, so you must specify the project name explicitly using `--name lead-collection-system`.

4. If you're deploying for the first time, follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (for first deployment)
   - Project name? **lead-collection-system** (or press Enter if you used --name flag)
   - Directory? **./** (current directory)
   - Override settings? **No**

### Project Configuration

The project includes a `vercel.json` file with the correct configuration. The project name in `package.json` is set to `lead-collection-system` which meets Vercel's requirements.

### Important Notes for Vercel Deployment

- **Supabase Integration**: The project uses Supabase for data storage. Your Supabase credentials are configured in `lib/supabase.ts`.
- The project is fully configured for Vercel deployment with Next.js App Router.
- All dependencies are properly configured in `package.json`.

### Environment Variables

The Supabase credentials are currently hardcoded in `lib/supabase.ts`. For production, consider moving these to environment variables:

1. In Vercel Dashboard, go to your project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Update `lib/supabase.ts` to use `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Data Storage

Leads are currently stored in `data/leads.json`. This file is:
- Automatically created when the first lead is added
- Included in `.gitignore` to prevent committing sensitive data
- Suitable for development and small-scale internal use

For production deployments, consider using a proper database solution.

## License

Internal use only.

