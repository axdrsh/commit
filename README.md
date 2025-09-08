# commit

a dating app for programmers.

stack: minimal next.js + supabase.

## setup

1. create a supabase project
2. .env.local:
   - NEXT_PUBLIC_SUPABASE_URL=
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=
3. supabase → sql editor → run supabase.sql
4. (optional) enable github oauth

## dev

```
npm i
npm run dev
```

deploy: vercel
