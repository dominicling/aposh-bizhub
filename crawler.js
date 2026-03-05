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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function askClaude(prompt) {
  const messages = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 8; turn++) {
    // Retry up to 4 times on rate limit
    let res;
    for (let attempt = 0; attempt < 4; attempt++) {
      res = await fetch("https://api.anthropic.com/v1/messages", {
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
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("retry-after") || "0", 10);
        const wait = Math.max(retryAfter * 1000, 120000); // at least 2 minutes
        console.log(`    ⏳ Rate limited — waiting ${Math.round(wait/1000)}s then retrying... (attempt ${attempt+1}/4)`);
        await sleep(wait);
        continue;
      }
      break;
    }
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
    if (i > 0) {
      console.log("  ⏳ Waiting 2min between passes...");
      await sleep(120000);
    }
    console.log(`[${i+1}/${PASSES.length}] ${p.label}...`);
    try {
      const result = await askClaude(p.prompt);
      acc[p.key] = p.merge(acc[p.key], result);
      if (p.key === "companies") console.log(`  → ${acc.companies.length} companies total`);
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
