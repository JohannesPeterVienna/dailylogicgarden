# Old addresses → new (dailylogicgarden.com)

Stand: 2.11.2026. The previous site was a small nonogram page (ten boards rotating every ten days). Its exact URL list could not be checked from the build environment (no web access), so the standard old legal/info addresses are covered. Each file below exists in `docs/` as a `noindex` page with `meta refresh` and `canonical` pointing to the new address (never to `/`).

| Old URL | New URL |
|---|---|
| /about.html | /about/ |
| /imprint.html | /imprint/ |
| /privacy.html | /privacy/ |
| /advertise.html | /contact/ |
| /contact.html | /contact/ |
| /guides/logic-puzzles-for-seniors/ | /guides/logic-puzzles-for-beginners/#comfort |

## Nonogram boards
Nonograms are no longer published here (they belong to raetsellotse.de, see the concept). Any old nonogram URLs will now return the site's 404 page. If Search Console shows old nonogram URLs with traffic, add redirect pages pointing to the closest new page (for example `/flower-beds/`, never `/`) – check first which URLs existed.

## Subdomains
The concept names no subdomains of dailylogicgarden.com. If any exist at the DNS provider from the old setup, remove those records after the domain points to GitHub Pages.

## 18.11.2026
The guide “Logic puzzles for seniors” was merged into “Logic puzzles for beginners” (section “Comfortable play”). The old address stays as a `noindex` page with `meta refresh` and `canonical` to the beginners guide and is not in the sitemap.
