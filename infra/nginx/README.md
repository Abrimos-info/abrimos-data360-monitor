# nginx config for data360-monitor

Basic auth gate for the **staging deployment of the Node monitor** (dashboard, articles, chat UI). Does **not** proxy or protect the Data360 MCP server — MCP stays on localhost and is called only by the monitor process.

## Files

- `.htpasswd` — bcrypt hash for the demo credentials. Committed because
  the only account is a public placeholder (`demo` / `demo`). Replace
  with stronger credentials before a public release.
- `data360.example.conf` — sample nginx server block. Drop into
  `/etc/nginx/sites-available/`, edit the `server_name`, certificates,
  and the absolute path to `.htpasswd`, then enable with `nginx -t &&
  systemctl reload nginx`.

## Regenerate the htpasswd hash

```bash
htpasswd -nbB <user> <password> > infra/nginx/.htpasswd
```

The `-B` flag uses bcrypt, which is what we want.

## Credentials

| User  | Password |
| ----- | -------- |
| demo  | demo     |

These are intentionally weak — the gate is for "this is still a
prototype" friction, not security. Do not reuse for production.
