# Epitrello Frontend read.me

Next.js-based React application for the Epitrello project management platform.

## Technology Stack

| Component       | Technology              |
| --------------- | ----------------------- |
| Framework       | Next.js 16 (App Router) |
| Language        | TypeScript              |
| Styling         | Tailwind CSS            |
| Package Manager | pnpm                    |

## Prerequisites

- Node.js 20 or higher
- pnpm (package manager)
- Backend API running (see [backend README](../backend/README.md))

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

**Configuration Scenarios:**

#### Backend in Docker + Frontend Local

If your backend is running in Docker and frontend is local:

1. **Backend Docker Configuration** (in your `.env` file at project root):

   ```env
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```

2. **Frontend Local Configuration** (in `frontend/.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
   ```

   **Important:** Use `localhost` (not `postgres` or container name) because you're accessing the backend from outside Docker. The port mapping `${PORT}:4000` in `docker-compose.yml` exposes the backend on `localhost:4000`.

3. **Start the backend in Docker:**

   ```bash
   # From project root
   docker-compose up -d backend
   ```

4. **Verify backend is accessible:**
   ```bash
   curl http://localhost:4000/graphql
   ```

#### Both Backend and Frontend Local

If both are running locally (not in Docker):

1. **Frontend Configuration** (in `frontend/.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
   ```

2. **Backend Configuration** (in `backend/.env`):
   ```env
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The page auto-updates as you edit the files.

### 4. Build for Production

```bash
pnpm build
pnpm start
```

## Development

### Available Scripts

| Command      | Description                              |
| ------------ | ---------------------------------------- |
| `pnpm dev`   | Start development server with hot-reload |
| `pnpm build` | Build the application for production     |
| `pnpm start` | Start the production server              |
| `pnpm lint`  | Run ESLint to check code quality         |

### Project Structure

```
frontend/
├── app/              # Next.js App Router pages and layouts
├── public/           # Static assets
├── .env.local        # Environment variables (not committed)
└── package.json      # Dependencies and scripts
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it:

```bash
pnpm dev -- -p 3001
```

### Backend Connection Issues

- **Verify backend is running:**

  ```bash
  curl http://localhost:4000/graphql
  ```

- **Check environment variables:**

  - Frontend: `NEXT_PUBLIC_API_URL` in `frontend/.env.local` should be `http://localhost:4000/graphql`
  - Backend (Docker): `FRONTEND_URL` in root `.env` should be `http://localhost:3000`
  - Backend (Local): `FRONTEND_URL` in `backend/.env` should be `http://localhost:3000`

- **CORS errors:**

  - If you see CORS errors, verify that `FRONTEND_URL` in the backend matches your frontend URL
  - For Docker backend: Check the `FRONTEND_URL` variable in your root `.env` file
  - The backend CORS is configured to accept requests from `FRONTEND_URL` (default: `http://localhost:3000`)

- **Backend in Docker not accessible:**
  - Check if the port is mapped correctly: `docker ps` should show `0.0.0.0:4000->4000/tcp`
  - Verify the backend container is running: `docker-compose ps`
  - Check backend logs: `docker-compose logs backend`

## Project Structure

```
frontend/
├── app/              # Next.js App Router pages and layouts
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── public/           # Static assets
├── .env.local        # Environment variables (not committed)
└── package.json      # Dependencies and scripts
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn Tutorial](https://nextjs.org/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Deployment

For production deployment, see the main [README.md](../README.md) and [DOCKER.md](../DOCKER.md) for Docker-based deployment instructions.
