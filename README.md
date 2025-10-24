# AchieveHub - Showcase Your Achievements

AchieveHub is a platform for students to showcase their academic and extracurricular achievements, get them verified by faculty, and inspire their peers. It also provides a dedicated section for students and faculty to post and manage opportunities like hackathons, projects, and internships.

## Project Features

*   **Achievement Showcase:** Students can submit their achievements with details, tags, and media.
*   **Faculty Verification:** Faculty members can review, approve, reject, and feature student achievements.
*   **Opportunities Board:** Students and faculty can post various opportunities (hackathons, internships, projects).
*   **Opportunity Approval Workflow:** Faculty-posted opportunities are auto-approved; student-posted opportunities require faculty approval.
*   **Faculty Dashboard:** A dedicated dashboard for faculty to manage both achievements and opportunities.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/419326b9-cd1a-4bff-aeed-e3720cb0e261) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/puneetk0/my-uni.git

# Step 2: Navigate to the project directory.
cd my-uni

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up Supabase (see section below).

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Supabase Setup

This project uses Supabase for its backend. You'll need to set up your Supabase project and configure the environment variables.

1.  **Create a Supabase Project:** Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Configure Environment Variables:** Create a `.env` file in the root of your project and add the following:
    ```
    VITE_SUPABASE_PROJECT_ID="YOUR_SUPABASE_PROJECT_ID"
    VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_ANON_KEY"
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
    ```
    You can find these values in your Supabase project settings under `API`. The `SUPABASE_SERVICE_ROLE_KEY` is a sensitive key and should not be exposed in client-side code.
3.  **Run Migrations:** Apply the database migrations to set up the necessary tables and RLS policies.
    ```sh
    npx supabase db push
    ```
    *Note: If you encounter issues with `supabase db push`, ensure your Supabase CLI is up to date and you are authenticated (`supabase login`).*

## What technologies are used for this project?

This project is built with:

-   Vite
-   TypeScript
-   React
-   shadcn-ui
-   Tailwind CSS
-   Supabase (Backend as a Service)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/419326b9-cd1a-4bff-aeed-e3720cb0e261) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)