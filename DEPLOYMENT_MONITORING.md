# Deployment Monitoring

## Auto-Monitoring aktiviert ✅

Nach jedem `git push`:
1. Sofort Feedback: "Deploy läuft..."
2. Background Monitoring alle 5 Sekunden
3. Alert bei ERROR oder READY
4. Keine unnötigen Nachrichten (kein Spam)

## Vercel API Integration

- Personal Access Token: `.env.local` (VERCEL_TOKEN)
- Project ID: `prj_UzdYh9ZqSnXCyKdntgUMhfvItAlU`
- Endpoint: `https://api.vercel.com/v6/deployments`

## Status States

- `BUILDING` → Silent (monitoriere)
- `READY` → ✅ Live Notification
- `ERROR` → 🔴 Error Alert + Details

## Performance

- Non-blocking background tasks
- Minimal API calls (5sec intervals)
- Lazy-load build logs only on error
- No large JSON parsing unless needed
