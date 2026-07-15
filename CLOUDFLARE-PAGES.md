# Deploy Spectra Portfolio → Cloudflare Pages

Your site is static (`index.html` + `css/` + `js/` + `assets/`).  
**Build command:** leave empty  
**Output directory:** `/` (root)

---

## Method A — GitHub + Cloudflare (recommended)

### 1) Create a GitHub account (if needed)
https://github.com/signup

### 2) Create a new repository
- Name example: `spectra-portfolio`
- Public
- **Do not** add README (you already have files)

### 3) Push this folder from PowerShell

```powershell
cd F:\spectra-portfolio
git init
git add .
git commit -m "Spectra Studio portfolio for Cloudflare Pages"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spectra-portfolio.git
git push -u origin main
```

(Replace `YOUR_USERNAME` with your GitHub username.)

### 4) Connect Cloudflare Pages
1. Go to https://dash.cloudflare.com → sign up / log in (free)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Authorize GitHub → select `spectra-portfolio`
4. Settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
5. **Save and Deploy**

### 5) Your free URL
Something like:
`https://spectra-portfolio.pages.dev`

### 6) Custom domain (optional later)
Pages → your project → **Custom domains** → add domain → follow DNS steps.

---

## Method B — Direct upload (no GitHub)

### With Wrangler (CLI)
```powershell
cd F:\spectra-portfolio
npx --yes wrangler pages deploy . --project-name=spectra-studio-portfolio
```
Browser opens to log in to Cloudflare once.

### With dashboard drag-and-drop
1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages**
2. **Upload assets**
3. Zip or select: `index.html`, `css`, `js`, `assets` (and brand files inside assets)
4. Deploy

---

## After deploy checklist
- [ ] Open site on phone
- [ ] Test WhatsApp buttons
- [ ] Test Day/Night mode
- [ ] Test work lightbox images load
- [ ] Add custom domain when ready

---

## Project path
`F:\spectra-portfolio`
