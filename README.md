# melgart.net

This is the repo for my personal site. 

# Initializing

When starting a new codespace, make sure to run `npm install`

# Developing

When developing, use `npm run dev`

I recommend creating a codespace and working in VS Code. 

## Reaching the dev server over Tailscale

On Miranda I sometimes want the dev server reachable from my phone or another
machine on the tailnet, not just localhost:

```bash
npx astro dev --host $(tailscale ip -4) --allowed-hosts .ts.net --background
```

Then open `http://<machine>.<tailnet>.ts.net:4321`. Why each flag:

- `--host $(tailscale ip -4)` binds only the Tailscale interface. Bare `--host`
  binds every interface including the LAN, which I don't want.
- `--allowed-hosts .ts.net` is required. Without it Vite answers the MagicDNS
  hostname with `403 Blocked request` and only the raw `100.x.y.z` address works.
- `--background` detaches the server so it survives closing the terminal.

Manage a backgrounded server with `npx astro dev status`, `npx astro dev logs
--follow`, and `npx astro dev stop`.

All commits to the main branch are automatically built and pushed to production which you can find at [melgart.net](https://melgart.net).