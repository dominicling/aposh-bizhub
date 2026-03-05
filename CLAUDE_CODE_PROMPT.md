Do everything below automatically without asking for permission. Use --dangerously-skip-permissions mode. Do not pause to confirm any file writes, installs, or shell commands. If something fails, fix it and continue.

My folder is: C:\Users\USER\Documents\GitHub\aposh-bizhub
All files should go inside this folder.

---

## STEP 1 — Project setup

Run these commands:

```
cd C:\Users\USER\Documents\GitHub\aposh-bizhub
npm init -y
npm install node-fetch
```

Add `"type": "module"` into package.json.

Create `.gitignore`:
```
node_modules/
.env
```

Create `.env`:
```
ANTHROPIC_API_KEY=
```

---

## STEP 2 — Crawler script

Create `crawler.js` with this exact content:

```js
import fetch from "node-fetch";
import fs from "fs";

try {
  const env = fs.readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("ERROR: Add your ANTHROPIC_API_KEY to the .env file then run again.");
  process.exit(1);
}

async function askClaude(prompt) {
  const messages = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 8; turn++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const toolUse = data.content.filter((b) => b.type === "tool_use");
    if (data.stop_reason === "end_turn" || !toolUse.length) {
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      const m = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (!m) throw new Error("No JSON in response");
      return JSON.parse(m[0]);
    }
    messages.push({ role: "assistant", content: data.content });
    messages.push({
      role: "user",
      content: toolUse.map((b) => ({
        type: "tool_result",
        tool_use_id: b.id,
        content: b.output ? JSON.stringify(b.output) : "No results",
      })),
    });
  }
  throw new Error("Too many turns");
}

function dedup(existing, incoming) {
  const seen = new Set(existing.map((c) => c.name?.toLowerCase().trim()).filter(Boolean));
  for (const c of incoming) {
    const k = c.name?.toLowerCase().trim();
    if (k && !seen.has(k)) { seen.add(k); existing.push(c); }
  }
  return existing;
}

const PASSES = [
  {
    label: "Building details",
    prompt: `Search "A'POSH BIZHUB" at 11 Yishun Industrial Street 1, Singapore 768089. Return ONLY valid JSON no markdown: {"address":"11 Yishun Industrial Street 1, Singapore 768089","developer":"","tenure":"","totalUnits":"454","floors":"","completionYear":"","type":"","description":"","psf":"","nearbyMRT":[],"busList":[],"amenities":[]}`,
    key: "building", merge: (acc, r) => r,
  },
  {
    label: "Companies — Yellow Pages / Google Maps",
    prompt: `Search Singapore Yellow Pages, Google Maps, Streetdirectory for companies at "11 Yishun Industrial Street 1" A'POSH BIZHUB Singapore. Return ONLY JSON array no markdown: [{"name":"","unit":"","industry":"","phone":"","website":""}]`,
    key: "companies", merge: (acc, r) => dedup(acc, Array.isArray(r) ? r : []),
  },
  {
    label: "Companies — business registries",
    prompt: `Search sgpbusiness.com and bizfile.acra.gov.sg for companies at "11 Yishun Industrial Street 1" or "A'POSH BIZHUB" Singapore. Return ONLY JSON array no markdown: [{"name":"","unit":"","industry":"","phone":"","website":""}]`,
    key: "companies", merge: (acc, r) => dedup(acc, Array.isArray(r) ? r : []),
  },
  {
    label: "Companies — LinkedIn / directories",
    prompt: `Search LinkedIn and business directories for companies at "A'POSH BIZHUB" or "11 Yishun Industrial Street 1" Singapore. Return ONLY JSON array no markdown: [{"name":"","unit":"","industry":"","phone":"","website":""}]`,
    key: "companies", merge: (acc, r) => dedup(acc, Array.isArray(r) ? r : []),
  },
  {
    label: "Companies — more searches",
    prompt: `Search for manufacturing, logistics, trading companies at "aposh bizhub" or "768089" Singapore. Return ONLY JSON array no markdown: [{"name":"","unit":"","industry":"","phone":"","website":""}]`,
    key: "companies", merge: (acc, r) => dedup(acc, Array.isArray(r) ? r : []),
  },
  {
    label: "Property listings",
    prompt: `Search PropertyGuru, 99.co, EdgeProp for units at "A'POSH BIZHUB" Singapore. Return ONLY valid JSON no markdown: {"forSale":[{"unit":"","size":"","price":"","psf":""}],"forRent":[{"unit":"","size":"","monthlyRent":"","psf":""}],"marketInsights":{"avgSalePsf":"","avgRentPsf":"","trend":""}}`,
    key: "listings", merge: (acc, r) => r,
  },
  {
    label: "F&B nearby",
    prompt: `Search Google Maps for food within 500m of "11 Yishun Industrial Street 1" Singapore. Return ONLY JSON array no markdown: [{"name":"","type":"","cuisine":"","distance":"","openHours":"","priceRange":"","inBuilding":false}]`,
    key: "fnb", merge: (acc, r) => Array.isArray(r) ? r : [],
  },
];

async function main() {
  console.log("Starting A'POSH BIZHUB crawl...\n");
  const acc = { building: {}, companies: [], listings: {}, fnb: [] };
  for (let i = 0; i < PASSES.length; i++) {
    const p = PASSES[i];
    console.log(`[${i+1}/${PASSES.length}] ${p.label}...`);
    try {
      const result = await askClaude(p.prompt);
      acc[p.key] = p.merge(acc[p.key], result);
      if (p.key === "companies") console.log(`  → ${acc.companies.length} companies`);
    } catch (e) { console.warn(`  ✗ ${e.message}`); }
  }
  const out = {
    building: acc.building,
    companies: acc.companies,
    forSale: acc.listings.forSale || [],
    forRent: acc.listings.forRent || [],
    marketInsights: acc.listings.marketInsights || {},
    fnb: acc.fnb,
    crawledAt: new Date().toISOString(),
  };
  fs.writeFileSync("data.json", JSON.stringify(out, null, 2));
  console.log(`\nDone!`);
  console.log(`Companies: ${out.companies.length} | For sale: ${out.forSale.length} | For rent: ${out.forRent.length} | F&B: ${out.fnb.length}`);
  console.log(`Written to data.json`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
```

---

## STEP 3 — Check API key

Read the `.env` file.

If `ANTHROPIC_API_KEY=` has nothing after the `=`, stop and tell the user:

```
⏸  ACTION NEEDED — I need your Anthropic API key before I can crawl.

1. Open this file in Notepad:
   C:\Users\USER\Documents\GitHub\aposh-bizhub\.env

   (If you can't see .env in File Explorer:
    click View in the toolbar → check the box "Hidden items")

2. Change the line from:
   ANTHROPIC_API_KEY=

   To (paste your actual key):
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx

3. Save the file (Ctrl+S)

4. Come back here and type:  done
   Then press Enter.
```

Wait for user to type "done" before continuing.

---

## STEP 4 — Run the crawler

```
node crawler.js
```

Show all output to the user as it runs. This takes about 2 minutes.

---

## STEP 5 — Build index.html

Create `index.html` — a complete single-page website:

Requirements:
- Pure HTML + CSS + JavaScript. No frameworks. No npm. No build step.
- On load: fetch("data.json") — if it fails show: "Data not loaded yet. Please run the crawler."
- Top bar: black background, "🏭 A'POSH BIZHUB" in white bold, "11 Yishun Industrial Street 1, Singapore 768089" in grey, "Data updated: [crawledAt formatted as readable date]" on the right
- Sticky nav below top bar with 3 tab buttons: "Visit & Find" | "Find Space" | "Owners"
- Max content width 1080px, centered

TAB 1 — "Visit & Find":
- Hero block (dark bg): building name large, description text, stats row: Total Units / Floors / Year Built / Tenants
- Two-column row: left = address + directions link + MRT list + bus number chips; right = Google Maps iframe for "11 Yishun Industrial Street 1 Singapore 768089"
- Section "Find a Business": search input that filters company cards by name or industry in real time. Each card shows: name, unit number, industry badge (coloured by category), phone, website link
- Section "Food & Drink Nearby": cards showing name, type, cuisine, distance, price range, hours. Highlight in-building F&B with an orange border

TAB 2 — "Find Space":
- Intro paragraph
- Stats row: Avg Rent PSF / Avg Sale PSF / trend text
- Building specs table: address, type, developer, tenure, floors, total units, completed
- Amenities as tick list
- "For Rent" and "For Sale" toggle buttons
- Unit cards: unit number, size, price, PSF — each card links to PropertyGuru:
  For rent: https://www.propertyguru.com.sg/property-for-rent?search=true&listing_type=rent&freetext=aposh+bizhub
  For sale: https://www.propertyguru.com.sg/property-for-sale?search=true&listing_type=sale&freetext=aposh+bizhub
- "See all on PropertyGuru →" button at the bottom

TAB 3 — "Owners":
- Stats: Avg Sale PSF, Avg Rent PSF, units for sale count
- Market trend text block
- Sale comparables table: unit, size, price, PSF, PropertyGuru link
- Tenant mix: a card per industry category showing count, category name, and a horizontal bar (percentage of known tenants)
- Building facts grid of key/value boxes

Design:
- Colors: black #111, orange #C84B0F, light orange bg #FDF3ED, white, greys
- Font: system-ui, -apple-system, sans-serif
- Clean, professional, minimal. No gradients except the hero block.
- Industry badge colors: Manufacturing=#6B3FA0, Trading=#1560A8, Services=#1A7A4A, Logistics=#B35A00, Technology=#0A6E8A, F&B=#B52020, Retail=#A0238C, Others=#555
- Guess category from industry string: check for keywords (manufactur, trading, logistic, tech, food, retail, service)

---

## STEP 6 — Git init and GitHub repo

Check if git is initialized. If not:
```
git init
git add .
git commit -m "initial commit"
```

Check if `gh` CLI is installed: run `gh --version`

If NOT installed on Windows, run:
```
winget install --id GitHub.cli -e
```
If winget fails, tell the user:
"Please download GitHub CLI from https://cli.github.com, install it, then type 'done' to continue."

Once gh is available:
```
gh auth login
gh repo create aposh-bizhub --public --source=. --remote=origin --push
```

Enable GitHub Pages:
```
gh api repos/:owner/aposh-bizhub/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

If the Pages API call fails with an error, tell the user:
```
Please enable GitHub Pages manually (takes 1 minute):
1. Go to: https://github.com/YOUR-USERNAME/aposh-bizhub/settings/pages
2. Under "Source" select: Deploy from a branch
3. Branch: main  |  Folder: / (root)
4. Click Save
```

---

## STEP 7 — GitHub Actions workflow

Create folder and file `.github/workflows/recrawl.yml`:

```yaml
name: Monthly Recrawl
on:
  schedule:
    - cron: '0 2 1 * *'
  workflow_dispatch:
jobs:
  crawl:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: node crawler.js
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - name: Commit if changed
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add data.json
          git diff --staged --quiet || git commit -m "chore: recrawl $(date +'%Y-%m-%d')"
          git push
```

Commit and push:
```
git add .
git commit -m "add recrawl workflow"
git push
```

---

## STEP 8 — Final message to user

Print this summary (fill in the actual GitHub username):

```
╔══════════════════════════════════════════════════════════╗
║  ✅  ALL DONE!                                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  YOUR WEBSITE (live in ~3 minutes):                      ║
║  https://YOUR-USERNAME.github.io/aposh-bizhub            ║
║                                                          ║
║  YOUR GITHUB REPO:                                       ║
║  https://github.com/YOUR-USERNAME/aposh-bizhub           ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║  ONE LAST STEP — do this in your browser (1 minute):     ║
║                                                          ║
║  Add API key to GitHub for monthly auto-refresh:         ║
║  1. Go to:                                               ║
║     github.com/YOUR-USERNAME/aposh-bizhub/               ║
║     settings/secrets/actions                             ║
║  2. Click "New repository secret"                        ║
║  3. Name:   ANTHROPIC_API_KEY                            ║
║  4. Value:  (paste your sk-ant-xxxx key)                 ║
║  5. Click "Add secret"                                   ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║  TO REFRESH DATA ANYTIME:                                ║
║  Go to your repo → Actions → Monthly Recrawl             ║
║  → Run workflow                                          ║
╚══════════════════════════════════════════════════════════╝
```
