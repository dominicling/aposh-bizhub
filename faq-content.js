// ============================================================
// ALL NEW FAQ ENTRIES — TENANT + INVESTOR INTENT
// A'POSH BIZHUB — March 2026
// ============================================================
// These supplement the existing 6 visitor FAQs.
// Format matches the existing JS FAQ array in index.html.
// ============================================================

// ── TENANT FAQs (8 questions) ─────────────────────────────

const TENANT_FAQS = [
  {
    q: "What unit sizes are available at A'POSH BIZHUB?",
    a: "Units range from approximately 76 sqft to 2,831 sqft across 7 floors. Most available units for rent are between 76–200 sqft for compact workshop or storage needs. Larger units up to 2,831 sqft are available for sale. Exact availability changes frequently — check the Find Space tab for current listings or see all units on CommercialGuru."
  },
  {
    q: "Can I use a unit at A'POSH BIZHUB as a pure office, without any industrial activity?",
    a: "A'POSH BIZHUB is zoned B1 Light Industrial under URA's Master Plan. Ancillary office use within a B1 unit is permitted — many tenants operate IT, design, and consulting businesses here. However, the predominant use must remain industrial or related to industrial operations. Units cannot be used as a standalone office with no connection to industrial activity. If in doubt, check with URA or contact OKH Global at +65 6748 9111 before signing a lease."
  },
  {
    q: "Is subletting allowed at A'POSH BIZHUB?",
    a: "Subletting policy is governed by individual tenancy agreements with the unit owner, not the building management. As a strata-titled building, each unit is privately owned. Some owners permit subletting; others do not. Always clarify subletting rights directly with the unit owner or their agent before signing a lease. OKH Global (+65 6748 9111) can advise on building management rules that apply to all units."
  },
  {
    q: "What is the minimum lease term for rental units at A'POSH BIZHUB?",
    a: "Minimum lease terms are set by individual unit owners, not the building. Typical minimum lease terms in B1 industrial buildings in Singapore range from 12 to 24 months. Some owners offer shorter terms at a premium. Current rental listings on CommercialGuru show available units — contact the listed agent for each unit's minimum term."
  },
  {
    q: "Who do I contact to arrange a viewing of an available unit?",
    a: "Each listed unit has its own agent. For rental units, contact the agent listed on CommercialGuru or PropertyGuru for that specific unit. For building management matters (maintenance, access, loading bay bookings), contact OKH Global Ltd at +65 6748 9111. There is no central leasing office for the building — each unit owner manages their own letting."
  },
  {
    q: "Is there a goods lift large enough for heavy equipment and furniture?",
    a: "Yes. A'POSH BIZHUB has 6 cargo lifts across the building, in addition to 4 passenger lifts and 1 service lift. The building also has 40-foot container ramp-up access on the ground floor for large deliveries. Floor loading is rated at 7.5 kN/sqm — suitable for heavy machinery, racking systems, and industrial equipment. Contact OKH Global at +65 6748 9111 to confirm cargo lift dimensions and loading bay booking procedures."
  },
  {
    q: "Can I carry out renovation or fit-out works on a rented unit?",
    a: "Minor fit-out works (painting, shelving, partitioning) are generally permitted with the unit owner's consent. Structural works, changes affecting fire safety systems, or alterations to electrical supply require written approval from OKH Global building management and may require BCA permits. Get written approval from your landlord and the building management before commencing any works. OKH Global: +65 6748 9111."
  },
  {
    q: "What business types are not allowed at A'POSH BIZHUB?",
    a: "As a B1 Light Industrial building, A'POSH BIZHUB does not permit heavy industries, pollutive or hazardous uses, or residential occupation. Specific prohibited uses under B1 zoning include: heavy manufacturing, chemical processing, waste management facilities, and uses that generate significant noise, smell, or vibration. Pure retail (selling direct to public as primary use) is also not permitted in industrial units. For a full list of permitted and prohibited uses, refer to URA's Use Groups under the Master Plan or consult OKH Global."
  }
];

// ── INVESTOR FAQs (9 questions) ───────────────────────────

const INVESTOR_FAQS = [
  {
    q: "Is A'POSH BIZHUB exempt from Additional Buyer's Stamp Duty (ABSD)?",
    a: "Yes. Industrial properties including B1 factory units like A'POSH BIZHUB are not subject to ABSD. This applies to Singapore citizens, PRs, and foreigners alike — making industrial units significantly more tax-efficient than residential property, where foreigners currently pay 60% ABSD and citizens pay 20% on a second property. Confirm with a licensed conveyancing lawyer before transacting."
  },
  {
    q: "Does Seller's Stamp Duty (SSD) apply to A'POSH BIZHUB units?",
    a: "Yes. SSD applies to B1 industrial factory units in Singapore. If you sell within 1 year of purchase: 15% SSD. Within 2 years: 10%. Within 3 years: 5%. After 3 years: 0%. A'POSH BIZHUB is best suited to investors with a minimum 3-year holding period. Always verify current SSD rates with IRAS or your conveyancing lawyer, as rates can be adjusted by government policy."
  },
  {
    q: "How many years remain on the A'POSH BIZHUB lease?",
    a: "A'POSH BIZHUB sits on a 60-year leasehold from 2010, leaving approximately 44 years remaining as of 2026. This is in line with the other three B1 buildings on Yishun Industrial Street 1 (North Spring ~45 years, North Point ~46 years). Banks progressively apply stricter Loan-to-Value ratios as remaining lease approaches 40 years — buyers should discuss financing terms with their bank early in the process."
  },
  {
    q: "Can foreigners buy a unit at A'POSH BIZHUB?",
    a: "Yes. Unlike residential property, most B1 industrial units in Singapore carry no foreign ownership restrictions. Singapore PRs, Employment Pass holders, and foreign companies can purchase A'POSH BIZHUB units without special approvals. There is no ABSD and no Qualifying Certificate requirement. Verify your specific eligibility with a licensed conveyancing lawyer."
  },
  {
    q: "What is the current gross rental yield at A'POSH BIZHUB?",
    a: "Based on current listings (March 2026), gross rental yields at A'POSH BIZHUB range from approximately 4.0% to 5.5% depending on unit size and purchase price. Example: a unit purchased at S$800,000 renting for S$3,000/month = 4.5% gross yield. A unit at S$900,000 renting for S$3,800/month = 5.1% gross yield. Use the yield calculator on the Invest tab to model your specific scenario. Gross yield does not include property tax (~10% of Annual Value), maintenance charges (~S$200–400/month), or vacancy periods."
  },
  {
    q: "What have A'POSH BIZHUB units actually transacted for recently?",
    a: "Based on URA transaction data via EdgeProp: units transacted at S$632–S$690 psf in the last 12 months (May–November 2025). This is the highest transacted PSF among the four B1 buildings on Yishun Industrial Street 1, ahead of North Spring (S$567 psf), North Point (S$332–588 psf), and North View (S$221–295 psf). Current asking prices range from S$691–S$860 psf. For exact historical transactions by unit and date, see EdgeProp's A'POSH BIZHUB transaction page."
  },
  {
    q: "How does A'POSH BIZHUB compare to North Spring, North Point, and North View Bizhub?",
    a: "A'POSH BIZHUB commands the highest transacted PSF on Yishun Industrial Street 1, justified by its superior specifications: 454 units (the largest building — more liquidity when reselling), 6 cargo lifts (most in the cluster), 40-ft container ramp-up access, and 7.5 kN/sqm floor loading. North View Bizhub has dramatically lower PSF (S$221–295) due to its 30-year lease with only ~16 years remaining — buyers today would face significant financing and resale difficulties. See the full comparison table on the Invest tab."
  },
  {
    q: "What financing options are available for buying an industrial unit?",
    a: "Most Singapore banks offer commercial property loans for B1 industrial units with Loan-to-Value ratios up to 80%, subject to credit assessment. Interest rates vary — current commercial property loan rates are typically SORA + 1.0–1.5% p.a. As the remaining lease decreases below 40 years, some banks apply more conservative LTV ratios. With ~44 years remaining at A'POSH, financing is still generally available at standard LTV. Consult DBS, OCBC, UOB, or a licensed mortgage broker for current rates and eligibility."
  },
  {
    q: "What are the ongoing costs of owning a unit at A'POSH BIZHUB?",
    a: "Key ongoing costs for unit owners: (1) Property tax — approximately 10% of Annual Value, assessed by IRAS; (2) Building maintenance / management fee — approximately S$200–400/month depending on unit size, paid to OKH Global; (3) Sinking fund contributions — for major building repairs, levied by the MCST; (4) Insurance — fire and contents insurance recommended; (5) Mortgage interest if financing. When vacant, costs continue while rental income stops — factor in a vacancy buffer of 1–2 months per year when calculating net yield."
  }
];

// ── COMBINED EXPORT (add to existing FAQ array in index.html) ────

const ALL_NEW_FAQS = [
  // ─ Separator item (not a real FAQ, just a visual section divider in HTML) ─
  // Add this heading between existing visitor FAQs and new tenant/investor FAQs:
  // <h3 style="...">For Tenants</h3>
  ...TENANT_FAQS,
  // <h3 style="...">For Investors</h3>
  ...INVESTOR_FAQS
];

module.exports = { TENANT_FAQS, INVESTOR_FAQS, ALL_NEW_FAQS };
