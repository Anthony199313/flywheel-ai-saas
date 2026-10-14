# Flywheel AI SaaS

Scaffolded implementation of the Balanced Hybrid production architecture (Next.js App Router + Supabase + Google Gemini + live scraping).

What I added
- Project scaffold (Next.js app router)
- Core server libs: supabase client, scraping with SSRF protections
- API routes: /api/intel and /api/chat (server-only implementations)
- Client pages: landing, client dashboard, admin hub, editor (UI from the guide)
- Export utilities and example .env

Next steps
1. Add your secrets to Vercel / .env.local using .env.example variables.
2. Run `npm install` locally, then `npm run dev`.
3. Test API endpoints server-side first (they use SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY).
4. Implement payment/credits enforcement and additional RLS policies in Supabase as needed.

Security notes (must address before production)
- SUPABASE_SERVICE_ROLE_KEY must only be set on server environments.
- Enforce strict URL validation and DNS/IP checks (implemented basic checks; consider adding allowlist).
- Do not expose admin client on the public web; protect admin routes with role checks.

