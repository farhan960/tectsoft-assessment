# toggle-favorite

Toggles a favorite for the authenticated user and a given `item_id`.

## Behavior

- Requires a valid Supabase JWT in the `Authorization` header.
- Reads `user_id` from `auth.getUser()` — never from the request body.
- If a favorite row exists for `(user_id, item_id)`, it deletes it and returns `favorited: false`.
- Otherwise it inserts a row and returns `favorited: true`.

## Request

`POST` with JSON body:

```json
{ "item_id": "uuid-of-item" }
```

## Response

```json
{ "item_id": "uuid-of-item", "favorited": true }
```

## Deploy

```bash
supabase functions deploy toggle-favorite
```

Set secrets in the Supabase project (service role is available automatically in Edge Functions as `SUPABASE_SERVICE_ROLE_KEY`).

## Test locally

```bash
supabase functions serve toggle-favorite --env-file .env.local
```

```bash
curl -X POST 'http://127.0.0.1:54321/functions/v1/toggle-favorite' \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"item_id":"YOUR_ITEM_UUID"}'
```

## Test from the app

Sign in, open an item, tap **Add to favorites** / **Remove from favorites**. The client calls `supabase.functions.invoke('toggle-favorite', { body: { item_id } })` only — it does not insert or delete on `favorites` directly.
