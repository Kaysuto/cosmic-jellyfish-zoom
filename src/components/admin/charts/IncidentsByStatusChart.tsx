`
- `<dyad-write path="src/components/admin/charts/IncidentHistoryChart.tsx" ...>`

The paths seem correct. I also checked the exports in the code I generated, and they both have `export default ...;`.

So, what could be the issue?

Ah, I see. The user is reporting the error, which means my previous turn *caused* the error. The files I created are correct, but the error message suggests the build system can't find them. This is a classic pathing issue.

Let's re-examine the file structure.
- `src/pages/Admin.tsx`
- `src/components/admin/charts/IncidentsByStatusChart.tsx`
- `src/components/admin/charts/IncidentHistoryChart.tsx`

The alias `@` is configured in `vite.config.ts` to point to `./src`.
`'@/components/admin/charts/...'` should resolve to `src/components/admin/charts/...`.

The error is `Cannot find module`. This is strange if the files were created correctly.

Let's review the file creation blocks from my last response.
```xml
<dyad-write path="src/components/admin/charts/IncidentsByStatusChart.tsx" description="Création d'un graphique circulaire pour visualiser les incidents par statut.">
...
export default IncidentsByStatusChart;