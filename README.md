# Spectra Studio — Sakib Hossen Portfolio

Modern SaaS-style portfolio for **Sakib Hossen (Shanto / Steve)**  
Brand: **Spectra Studio** · Colors: `#2E1248` `#4B1E73` `#8C5BFF` `#0F0F14`

**Project location (F: drive):** `F:\spectra-portfolio`

---

## Preview locally (no Docker)

Double-click `index.html`  
or in PowerShell:

```powershell
start F:\spectra-portfolio\index.html
```

Or serve with Node:

```powershell
cd F:\spectra-portfolio
npx --yes serve -l 5500
```

Then open: http://localhost:5500

---

## Deploy on Coolify

Docker is **not** installed on this PC yet. Coolify needs a Linux server (VPS) with Docker.

### 1. Get a cheap VPS
Recommended: Hetzner / DigitalOcean / Contabo — Ubuntu 22.04+, 1–2 GB RAM is enough.

### 2. Install Coolify on the server
SSH into the VPS and run:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Open: `http://YOUR_SERVER_IP:8000` and finish setup.

### 3. Deploy this portfolio

**Option A — Git (best)**  
1. Push `F:\spectra-portfolio` to GitHub/GitLab.  
2. In Coolify: **+ New Resource → Public/Private Repository**.  
3. Select this repo.  
4. Build pack: **Dockerfile** (auto-detected).  
5. Port: **80**.  
6. Deploy. Add your domain + free SSL.

**Option B — Docker Compose upload / server path**  
1. Upload the folder to the server (SFTP / `scp`).  
2. Coolify → **Docker Compose** empty or Dockerfile deploy pointing at the folder.  
3. Port **80** (or map as needed).

**Option C — Static site (if Coolify static build)**  
Build command: none · Publish directory: project root · uses nginx Dockerfile above.

### 4. Local Docker test (after installing Docker Desktop on Windows)

```powershell
cd F:\spectra-portfolio
docker compose up --build -d
```

Open: http://localhost:8080

---

## Install Coolify later (summary)

| Step | Action |
|------|--------|
| 1 | Buy Ubuntu VPS |
| 2 | Run Coolify install script |
| 3 | Push this folder to Git |
| 4 | Coolify → New → Dockerfile → Port 80 |
| 5 | Point domain DNS to server |

Self-hosted Coolify is free; you only pay for the VPS.

---

## Project structure

```
F:\spectra-portfolio\
  index.html
  css\styles.css
  js\main.js
  assets\work\          ← your designs copied from F:\Designs for portfolio
  Dockerfile
  docker-compose.yml
  nginx.conf
  README.md
```

## Contact wired in

- WhatsApp: +8801406313103  
- Email: Shantomds422@gmail.com  
- Social: Facebook, Spectra Studio FB, Behance, Instagram, Pinterest  

## Sections

1. About / Hero  
2. Dashboard  
3. Experience  
4. Work showcase (filters + lightbox)  
5. Pricing (discuss-based)  
6. Contact  

Glass buttons + moving purple gradients match your SaaS references.
