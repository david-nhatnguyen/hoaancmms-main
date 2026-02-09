# Vercel Deployment Configuration

## Project Settings
- **Framework Preset**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `yarn build` (or `npm run build`)
- **Output Directory**: `dist`
- **Install Command**: `yarn install` (or `npm install`)

## Environment Variables (Frontend)
These variables must be set in the Vercel Project Settings:

1. `VITE_API_URL`: Use the URL of your deployed backend (e.g., `https://your-backend-app.onrender.com/api`)
   - *Note:* Do NOT include a trailing slash.
   - *Example:* `https://hoaancmms-api.onrender.com/api`

## Deployment Steps
1. Push your code to a Git provider (GitHub/GitLab/Bitbucket).
   - *Note:* I have already fixed the build errors in `CorrectiveMaintenanceList.tsx` and `useEquipmentFilters.ts` that would have caused deployment failure.
2. Import the project in Vercel.
3. Select the `apps/web` directory as the Root Directory.
4. Configure the Build and Output settings as specified above.
5. Add the `VITE_API_URL` environment variable.
6. Click Deploy.

## Backend Deployment (Option 2 - Risk of Data Loss)
For the backend, you will need a service that supports Node.js/Docker, such as Render, Railway, or Fly.io.
- **Root Directory**: `apps/api`
- **Build Command**: `yarn build`
- **Start Command**: `yarn start:prod`
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string (Use Neon.tech or Supabase for free database)
  - `JWT_SECRET`: A strong secret key
  - `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://your-project.vercel.app`)
  - `PORT`: 3000 (usually default, or 8080 depending on provider)

**Important Note**: Since you chose Option 2, uploaded images will be stored in the container's ephemeral file system. They will be deleted whenever the backend redeploys or restarts.
