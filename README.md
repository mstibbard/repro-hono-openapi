# Reproduction for hono-openapi

## Setup

1. Clone repo
2. Install deps

## Issue 1 - Cloudflare Workers/Wrangler errors

Run `bun dev-wrangler` to view errors

## Issue 2 - Generated OpenAPI Components Schemas behaviour

1. Run `bun dev` (works)
2. Visit localhost:3000/#models or localhost:3000/openapi (and view the components.schemas). 

If working correctly you should see 3 models/schemas: 
- ErrorResponse
- User (broken, does not appear)
- Product

I'm guessing it's something to do with the reusable ErrorResponse schema -- if you simply remove the ref definition for ErrorResponse the others all appear correctly. It's always the first route in src/index.ts which does not appear.
