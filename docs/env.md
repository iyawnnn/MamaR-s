# Environment Variables (Phase 1)

Store these locally in `.env` (do not commit) and add equivalents in Render/Vercel secrets.

- MONGODB_URI (mongodb+srv://user:pass@cluster0.mongodb.net/dbname)
- JWT_SECRET (strong random string)
- NODE_ENV (development|production)
- PORT (optional, default 5000)
- VERCEL/RENDER will configure their own environment variables for production.

Add `.env.example` with placeholders:
