# bellimusik.de – Relaunch

- `site/` – die fertige Website (das wird hochgeladen, ca. 680 KB)
- `src/` – lesbarer Quellcode für CSS/JS (zum Bearbeiten)
- `build.sh` – minimiert `src/` nach `site/assets/` (braucht Node.js): `./build.sh`
- `dateiennn/` – Original-Fotos (nur lokal, nicht im Repo)
- `.github/workflows/pages.yml` – Deployment auf GitHub Pages

## Lokal ansehen

```bash
python3 -m http.server 8765 --directory site
```

Dann http://localhost:8765 öffnen.

## Vor dem Livegang

1. **Impressum** (`site/impressum.html`) – Name und ladungsfähige Anschrift eintragen (gelb markiert). Pflicht in Deutschland.
2. **Datenschutz** (`site/datenschutz.html`) – Verantwortliche/n und Hoster eintragen, Text prüfen lassen.
3. Deployment: Jeder Push auf `main` veröffentlicht den Ordner `site/` automatisch über GitHub Pages
   (Repo → Settings → Pages → Source: **GitHub Actions**).
4. Eigene Domain: `site/CNAME` enthält `bellimusik.de`. Beim Domain-Anbieter muss die Domain auf GitHub Pages zeigen
   (A-Records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `www` per CNAME auf `ohhbelli.github.io`).
   Danach in Settings → Pages „Enforce HTTPS“ aktivieren.

## Inhalte ändern

- Neues Video: in `site/index.html` einen `<article class="portal">`-Block kopieren, YouTube-ID in `data-yt` eintragen
  und ein Vorschaubild unter `site/assets/img/yt-<ID>.webp` ablegen (ca. 720 px breit).
- Links zu Spotify & Co. und die Booking-Adresse (`data-u` / `data-d`) stehen direkt in `site/index.html`.
- CSS/JS-Änderungen immer in `src/` machen und danach `./build.sh` ausführen.
