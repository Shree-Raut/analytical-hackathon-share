# Run First Checklist

Use this checklist when opening from GitHub clone or ZIP.

1. Open terminal in this folder.
2. Run `npm install`.
3. Run `cp .env.example .env`.
4. Fill required AI keys in `.env` (`OPENAI_API_KEY` or `LITELLM_API_KEY`).
5. Run `npx prisma generate`.
6. Run `npx prisma db push`.
7. Run `npm run dev`.
8. Open `http://localhost:3000/fast-pass`.

If `localhost:3000` is already in use, run:

```bash
npm run dev -- --port 3001
```
