# A'POSH BIZHUB — Step by Step Setup Guide (Windows)
# Your folder: C:\Users\USER\Documents\GitHub\aposh-bizhub
# Follow every step in order. Do not skip anything.

═══════════════════════════════════════════════════════
PART 1 — BEFORE YOU START (Do this first, one time only)
═══════════════════════════════════════════════════════

You need 3 things. All free.

── 1. Anthropic API Key ──────────────────────────────
   This is what pays for the AI to crawl data.

   a. Go to: https://console.anthropic.com
   b. Sign up or log in
   c. Click "API Keys" in the left menu
   d. Click "Create Key"
   e. Copy the key — it looks like: sk-ant-api03-xxxxxxxx
   f. Save it somewhere (Notepad, email to yourself, etc.)
      ⚠️  You will NOT be able to see it again after closing that page

── 2. GitHub Account ────────────────────────────────
   This is where your website will live.

   a. Go to: https://github.com
   b. Sign up (if you don't have an account)
   c. Remember your username — you'll need it later

── 3. Claude Code ───────────────────────────────────
   This is the app that does all the work.

   a. Go to: https://claude.ai/code
   b. Download the Windows version
   c. Install it (just click Next, Next, Finish)
   d. Open it — it looks like a black terminal window


═══════════════════════════════════════════════════════
PART 2 — SAVE THE FILES
═══════════════════════════════════════════════════════

You already have your folder at:
   C:\Users\USER\Documents\GitHub\aposh-bizhub

Save both files from this conversation into that folder:
   ✓ CLAUDE_CODE_PROMPT.md   ← the instructions for Claude Code
   ✓ crawler.js              ← the data collection script

Your folder should look like this:
   C:\Users\USER\Documents\GitHub\aposh-bizhub\
   ├── CLAUDE_CODE_PROMPT.md
   └── crawler.js


═══════════════════════════════════════════════════════
PART 3 — RUN CLAUDE CODE
═══════════════════════════════════════════════════════

── Step 1: Open Claude Code ─────────────────────────
   Open the Claude Code app you installed.
   You will see a black window with a > prompt.

── Step 2: Navigate to your folder ──────────────────
   Type EXACTLY this and press Enter:

   cd C:\Users\USER\Documents\GitHub\aposh-bizhub

── Step 3: Start Claude Code with full permissions ──
   Type EXACTLY this and press Enter:

   claude --dangerously-skip-permissions

   This tells Claude Code to do everything automatically
   without asking you yes/no for every single action.

── Step 4: Paste the big prompt ─────────────────────
   a. Open the file CLAUDE_CODE_PROMPT.md
      (Right-click it → Open with → Notepad)
   b. Press Ctrl+A to select all text
   c. Press Ctrl+C to copy
   d. Click back on the Claude Code window
   e. Press Ctrl+V to paste
   f. Press Enter

   Claude Code will now start working automatically.


═══════════════════════════════════════════════════════
PART 4 — THE ONE THING YOU MUST DO YOURSELF
═══════════════════════════════════════════════════════

Claude Code will pause and say it needs your API key.
It will have created a file called .env in your folder.

Do this:
   a. Open File Explorer
   b. Go to: C:\Users\USER\Documents\GitHub\aposh-bizhub
   c. You might not see .env — if so:
      → In File Explorer, click View → check "Hidden items"
   d. Right-click .env → Open with → Notepad
   e. You will see:   ANTHROPIC_API_KEY=
   f. Paste your key right after the = with no spaces:
      ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
   g. Save the file (Ctrl+S)
   h. Go back to Claude Code and type:  done
   i. Press Enter

Claude Code will continue automatically from there.


═══════════════════════════════════════════════════════
PART 5 — LOG IN TO GITHUB WHEN ASKED
═══════════════════════════════════════════════════════

At some point Claude Code will open a browser window
asking you to log in to GitHub.

Just log in with your GitHub account.
Then come back — Claude Code will continue on its own.


═══════════════════════════════════════════════════════
PART 6 — WAIT (~5 MINUTES)
═══════════════════════════════════════════════════════

Claude Code will do all of this by itself:
   ✓ Install Node.js and required tools
   ✓ Run the crawler (collects building data, ~2 min)
   ✓ Build the website (index.html)
   ✓ Create your GitHub repo
   ✓ Upload everything to GitHub
   ✓ Turn on GitHub Pages (makes it a live website)
   ✓ Set up monthly auto-refresh

When finished it will show you:
   YOUR WEBSITE: https://YOUR-USERNAME.github.io/aposh-bizhub


═══════════════════════════════════════════════════════
PART 7 — LAST STEP: ADD API KEY TO GITHUB
═══════════════════════════════════════════════════════

This lets the website refresh itself every month for free.
Takes 1 minute.

   a. Go to (replace YOUR-USERNAME with your GitHub username):
      https://github.com/YOUR-USERNAME/aposh-bizhub/settings/secrets/actions

   b. Click "New repository secret"

   c. Fill in:
      Name:   ANTHROPIC_API_KEY
      Secret: sk-ant-api03-xxxxxxxx  (your API key)

   d. Click "Add secret"

Done! Your website will now update itself on the 1st of every month.


═══════════════════════════════════════════════════════
YOUR FINAL URLS
═══════════════════════════════════════════════════════

🌐 Your website:
   https://YOUR-GITHUB-USERNAME.github.io/aposh-bizhub

📁 Your GitHub repo:
   https://github.com/YOUR-GITHUB-USERNAME/aposh-bizhub

⚙️  Anthropic API console:
   https://console.anthropic.com


═══════════════════════════════════════════════════════
HOW TO REFRESH DATA MANUALLY (ANYTIME)
═══════════════════════════════════════════════════════

Option A — From GitHub (easiest, no computer setup needed):
   1. Go to your repo on GitHub
   2. Click the "Actions" tab
   3. Click "Monthly Recrawl" on the left
   4. Click "Run workflow" button → "Run workflow"
   5. Wait 2 minutes. Website updates automatically.

Option B — From your computer:
   1. Open Claude Code
   2. Type: cd C:\Users\USER\Documents\GitHub\aposh-bizhub
   3. Type: node crawler.js
   4. When done, type: git add data.json && git commit -m "update" && git push


═══════════════════════════════════════════════════════
COMMON PROBLEMS & FIXES
═══════════════════════════════════════════════════════

❌ "node is not recognized"
   Fix: Claude Code installs Node automatically.
   If it doesn't, go to https://nodejs.org and download the LTS version.

❌ Website shows "Data not loaded yet"
   Fix: data.json wasn't uploaded. Run:
   node crawler.js
   then: git add data.json && git commit -m "data" && git push

❌ Website shows 404 error
   Fix: GitHub Pages takes 2-5 minutes. Wait and refresh.
   If still broken: go to your repo → Settings → Pages
   → Source: Deploy from branch → Branch: main → Folder: / → Save

❌ API key error / "invalid API key"
   Fix: Open .env and check there are NO spaces:
   ✓ Correct:  ANTHROPIC_API_KEY=sk-ant-xxxx
   ✗ Wrong:    ANTHROPIC_API_KEY = sk-ant-xxxx

❌ "gh: command not found"
   Fix: Claude Code will install GitHub CLI automatically.
   If it can't, go to https://cli.github.com and install manually.

❌ Permission denied pushing to GitHub
   Fix: Run:  gh auth login
   Follow the prompts to log in, then try again.


═══════════════════════════════════════════════════════
STILL STUCK?
═══════════════════════════════════════════════════════

Copy the exact error message you see and paste it here.
I will tell you exactly what to do.
