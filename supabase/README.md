# MoonStore Supabase scaffold

`schema.sql` contains the initial relational model for the MoonStore creator-commerce product. It covers profiles, stores, editable store blocks, products, product files, customers, orders, order items, delivery tokens, coupons, analytics events, settings, timestamps, indexes, enums, and baseline Row Level Security policies.

The current WebDev project intentionally remains frontend-first and uses localStorage for the demo experience. When connecting Supabase, apply `schema.sql` in the Supabase SQL editor, configure Storage for product files, then replace the repository functions in `client/src/lib/storage.ts` with authenticated Supabase queries.
