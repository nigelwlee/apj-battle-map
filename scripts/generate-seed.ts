/**
 * Seed data generator for APJ Battle Map.
 * Run: pnpm seed
 * Output: data/countries.json, data/accounts.json, data/people.json,
 *         data/edges.json, data/intel.json
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Types ──────────────────────────────────────────────────────────────────

type DealStatus = "won" | "active" | "targeted" | "competitor" | "untouched";
type Vertical = "FSI" | "PublicSector" | "Telco" | "Retail" | "Resources" | "Manufacturing" | "TechSaaS" | "Healthcare";
type AccountSize = "GlobalEnterprise" | "Enterprise" | "UpperMidMarket";
type CrmStatus = "cold" | "contacted" | "meeting_held" | "champion" | "detractor";
type EdgeType = "co_worked" | "alumni" | "board" | "co_author" | "co_panelist";

interface Country {
  code: string;
  name: string;
  captureRate: number;
  captureRatePrev: number; // 8w ago for sparkline
  status: DealStatus;
  tamUSD: number;
  quotaUSD: number;
  repCapacity: number;
  aiReadinessIndex: number;
  lighthouseCount: number;
  wonCount: number;
  activeCount: number;
  notes: string;
  weeklyCapture: number[]; // 8-week trend
}

interface Account {
  id: string; // acc-{slug}
  countryCode: string;
  name: string;
  isLighthouse: boolean;
  rank: number; // 1 = top lighthouse in country
  vertical: Vertical;
  size: AccountSize;
  revenue: string;
  employees: number;
  aiMaturity: 1 | 2 | 3 | 4 | 5;
  status: DealStatus;
  incumbent: string | null;
  acvPotential: number;
  targetClose: string;
  aeOwner: string;
  lastTouchDate: string;
  lighthouseRationale: string;
  competitivePosture: string;
  stakeholderIds: string[]; // per-{slug}
  meddpicc: {
    metrics: string;
    economicBuyer: string;
    decisionCriteria: string;
    decisionProcess: string;
    paperProcess: string;
    identifiedPain: string;
    champion: string;
    competition: string;
  };
}

interface Person {
  id: string; // per-{slug}
  accountId: string; // acc-{slug}
  countryCode: string;
  name: string;
  title: string;
  seniority: "C" | "VP" | "Director" | "Manager";
  vertical: Vertical;
  tenureYears: number;
  priorEmployers: string[];
  education: string;
  boardSeats: string[];
  publicStance: string;
  crmStatus: CrmStatus;
  influenceScore: number; // 1-100
  lastEngagement: string | null;
  engagementCount: number;
}

interface Edge {
  id: string; // edge-{n}
  sourceId: string; // per-{slug}
  targetId: string; // per-{slug}
  type: EdgeType;
  strength: 1 | 2 | 3;
  provenance: string;
}

interface Intel {
  id: string; // intel-{n}
  accountId: string;
  date: string;
  author: string;
  body: string;
  signal: "positive" | "negative" | "neutral";
}

// ─── Countries ───────────────────────────────────────────────────────────────

const countries: Country[] = [
  {
    code: "AU", name: "Australia", captureRate: 0.40, captureRatePrev: 0.33,
    status: "active", tamUSD: 2800000000, quotaUSD: 18000000, repCapacity: 3,
    aiReadinessIndex: 4.2, lighthouseCount: 18, wonCount: 3, activeCount: 5,
    notes: "Strongest market. Macquarie and Atlassian as early proof points. FSI and resources verticals moving fast.",
    weeklyCapture: [0.33, 0.34, 0.35, 0.35, 0.37, 0.38, 0.39, 0.40],
  },
  {
    code: "NZ", name: "New Zealand", captureRate: 0.20, captureRatePrev: 0.15,
    status: "targeted", tamUSD: 380000000, quotaUSD: 2500000, repCapacity: 1,
    aiReadinessIndex: 3.8, lighthouseCount: 10, wonCount: 1, activeCount: 1,
    notes: "Small but fast-moving. ANZ Bank NZ and Spark NZ the key dominoes.",
    weeklyCapture: [0.15, 0.15, 0.17, 0.17, 0.18, 0.18, 0.20, 0.20],
  },
  {
    code: "JP", name: "Japan", captureRate: 0.13, captureRatePrev: 0.10,
    status: "competitor", tamUSD: 6200000000, quotaUSD: 22000000, repCapacity: 2,
    aiReadinessIndex: 3.5, lighthouseCount: 20, wonCount: 1, activeCount: 2,
    notes: "SoftBank relationship is the master key. OpenAI partnership with SoftBank/Yahoo Japan is the primary competitive risk.",
    weeklyCapture: [0.10, 0.10, 0.11, 0.11, 0.12, 0.12, 0.13, 0.13],
  },
  {
    code: "KR", name: "South Korea", captureRate: 0.27, captureRatePrev: 0.22,
    status: "active", tamUSD: 3100000000, quotaUSD: 14000000, repCapacity: 2,
    aiReadinessIndex: 4.4, lighthouseCount: 15, wonCount: 2, activeCount: 2,
    notes: "Samsung SDI and Kakao are active. Local LLM players (HyperClova) are real competitors.",
    weeklyCapture: [0.22, 0.22, 0.23, 0.24, 0.25, 0.25, 0.26, 0.27],
  },
  {
    code: "SG", name: "Singapore", captureRate: 0.53, captureRatePrev: 0.47,
    status: "won", tamUSD: 1200000000, quotaUSD: 9000000, repCapacity: 2,
    aiReadinessIndex: 4.8, lighthouseCount: 12, wonCount: 4, activeCount: 3,
    notes: "Strongest win rate. DBS and GovTech are champions. MAS regulatory clarity helps. SEA HQ hub effect.",
    weeklyCapture: [0.47, 0.48, 0.49, 0.50, 0.50, 0.51, 0.52, 0.53],
  },
  {
    code: "ID", name: "Indonesia", captureRate: 0.13, captureRatePrev: 0.16,
    status: "competitor", tamUSD: 2900000000, quotaUSD: 10000000, repCapacity: 1,
    aiReadinessIndex: 3.1, lighthouseCount: 14, wonCount: 0, activeCount: 2,
    notes: "BCA and Telkom moved to competitor-held this week. Recommend Jakarta exec visit pre-Q3.",
    weeklyCapture: [0.16, 0.16, 0.15, 0.15, 0.14, 0.14, 0.13, 0.13],
  },
  {
    code: "IN", name: "India", captureRate: 0.20, captureRatePrev: 0.17,
    status: "targeted", tamUSD: 8400000000, quotaUSD: 28000000, repCapacity: 3,
    aiReadinessIndex: 3.9, lighthouseCount: 22, wonCount: 2, activeCount: 3,
    notes: "Infosys and TCS as GSI leverage plays. HDFC and Reliance Jio are the FSI/Telco targets. Complex partner dynamics.",
    weeklyCapture: [0.17, 0.17, 0.18, 0.18, 0.19, 0.19, 0.20, 0.20],
  },
  {
    code: "MY", name: "Malaysia", captureRate: 0.08, captureRatePrev: 0.07,
    status: "untouched", tamUSD: 760000000, quotaUSD: 3500000, repCapacity: 1,
    aiReadinessIndex: 3.3, lighthouseCount: 10, wonCount: 0, activeCount: 1,
    notes: "Petronas is the anchor lighthouse. CIMB and Maybank for FSI. Low rep coverage — share with SG team.",
    weeklyCapture: [0.07, 0.07, 0.07, 0.08, 0.08, 0.08, 0.08, 0.08],
  },
  {
    code: "PH", name: "Philippines", captureRate: 0.06, captureRatePrev: 0.05,
    status: "untouched", tamUSD: 680000000, quotaUSD: 3000000, repCapacity: 1,
    aiReadinessIndex: 2.9, lighthouseCount: 10, wonCount: 0, activeCount: 1,
    notes: "BDO Unibank and SM Group are the lighthouse targets. BPO sector is a wedge opportunity.",
    weeklyCapture: [0.05, 0.05, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06],
  },
  {
    code: "TH", name: "Thailand", captureRate: 0.09, captureRatePrev: 0.08,
    status: "untouched", tamUSD: 1100000000, quotaUSD: 4500000, repCapacity: 1,
    aiReadinessIndex: 3.0, lighthouseCount: 11, wonCount: 0, activeCount: 1,
    notes: "SCB Tech X is the most AI-progressive FSI. PTT and CP Group for resources/retail.",
    weeklyCapture: [0.08, 0.08, 0.08, 0.08, 0.09, 0.09, 0.09, 0.09],
  },
];

// ─── Accounts ────────────────────────────────────────────────────────────────

const accounts: Account[] = [
  // ── AUSTRALIA ──
  {
    id: "acc-macquarie", countryCode: "AU", name: "Macquarie Group",
    isLighthouse: true, rank: 1, vertical: "FSI", size: "GlobalEnterprise",
    revenue: "A$17.8B", employees: 19000, aiMaturity: 5, status: "won",
    incumbent: null, acvPotential: 2800000, targetClose: "2025-09-30",
    aeOwner: "James Watkins", lastTouchDate: "2026-04-18",
    lighthouseRationale: "Macquarie is the AI-forward FSI benchmark for the entire APAC region — every regional bank CIO references their data platform strategy.",
    competitivePosture: "Full Claude deployment in Commodities & Global Markets. Risk of Google expanding into adjacent divisions — executive sponsorship is the moat.",
    stakeholderIds: ["per-chen-wei-mac", "per-sarah-morrison-mac", "per-david-ng-mac"],
    meddpicc: {
      metrics: "40% reduction in analyst report generation time; $8M OpEx saving target in year 1",
      economicBuyer: "CFO Mike Silverton",
      decisionCriteria: "Enterprise security posture, SOC2 Type II, model fine-tuning capability",
      decisionProcess: "Signed off via IT risk committee + CFO dual approval for spend >$2M",
      paperProcess: "MSA in place; annual PO cycle closes June 30",
      identifiedPain: "Analyst teams spending 60% of time on report assembly vs. synthesis",
      champion: "per-chen-wei-mac",
      competition: "OpenAI GPT-4o (pilot in Equities); Google Gemini (evaluated, deprioritized)",
    },
  },
  {
    id: "acc-atlassian", countryCode: "AU", name: "Atlassian",
    isLighthouse: true, rank: 2, vertical: "TechSaaS", size: "GlobalEnterprise",
    revenue: "US$4.4B", employees: 11000, aiMaturity: 5, status: "won",
    incumbent: null, acvPotential: 1800000, targetClose: "2025-12-31",
    aeOwner: "Rachel Kim", lastTouchDate: "2026-04-20",
    lighthouseRationale: "Atlassian's AI-first product posture sets the benchmark for SaaS productivity tooling across the region. Their developer community is a powerful channel.",
    competitivePosture: "Claude integrated in Rovo AI. Renewal risk if OpenAI offers preferential pricing — maintain exec-to-exec cadence with Mike Cannon-Brookes office.",
    stakeholderIds: ["per-priya-sharma-atl", "per-tom-bradley-atl"],
    meddpicc: {
      metrics: "25% faster Jira ticket resolution; 30% reduction in on-call escalations via Claude-in-Ops",
      economicBuyer: "CTO Rajeev Kumar",
      decisionCriteria: "API reliability, output quality on code generation, competitive pricing",
      decisionProcess: "Product-led trial → VP sign-off → annual contract renewal",
      paperProcess: "Annual SaaS procurement cycle; Q4 renewal window",
      identifiedPain: "Developers context-switching 12x/day across tools — Claude in Rovo reduces to 3x",
      champion: "per-priya-sharma-atl",
      competition: "GitHub Copilot (incumbent on IDE); OpenAI GPT-4 (evaluated for Rovo v2)",
    },
  },
  {
    id: "acc-commonwealth-bank", countryCode: "AU", name: "Commonwealth Bank",
    isLighthouse: true, rank: 3, vertical: "FSI", size: "GlobalEnterprise",
    revenue: "A$27.2B", employees: 51000, aiMaturity: 4, status: "active",
    incumbent: "Microsoft", acvPotential: 3500000, targetClose: "2026-06-30",
    aeOwner: "James Watkins", lastTouchDate: "2026-04-10",
    lighthouseRationale: "CBA is the dominant retail bank in Australia — their AI adoption signals direction for all four majors and regional banks.",
    competitivePosture: "Microsoft Azure OpenAI is incumbent in retail lending. Our opening is in fraud detection and regulatory reporting where Claude's reasoning is differentiated.",
    stakeholderIds: ["per-anna-liu-cba", "per-michael-chen-cba"],
    meddpicc: {
      metrics: "Fraud detection accuracy improvement from 91% to 96%; AML report time cut by 50%",
      economicBuyer: "CDAO Dr. Toby Norton",
      decisionCriteria: "APRA compliance, data residency in Australia, model explainability for regulators",
      decisionProcess: "CDAO recommendation → Group Technology Committee → Board Risk Committee",
      paperProcess: "Annual budget cycle; commitment needed by Oct for FY26 inclusion",
      identifiedPain: "10,000 suspicious activity reports/month; analysts can only review 30% manually",
      champion: "per-anna-liu-cba",
      competition: "Microsoft Azure OpenAI (incumbent); AWS Bedrock (evaluated)",
    },
  },
  {
    id: "acc-woodside", countryCode: "AU", name: "Woodside Energy",
    isLighthouse: true, rank: 4, vertical: "Resources", size: "GlobalEnterprise",
    revenue: "US$6.8B", employees: 5800, aiMaturity: 4, status: "active",
    incumbent: null, acvPotential: 2100000, targetClose: "2026-03-31",
    aeOwner: "Rachel Kim", lastTouchDate: "2026-04-05",
    lighthouseRationale: "Woodside is the reference LNG operator for Asia-Pacific — their AI use cases in asset maintenance set the standard for the resources sector regionally.",
    competitivePosture: "Clean run — no incumbent AI vendor. Risk is internal build preference (strong data science team). Need to land before Q3 budget freeze.",
    stakeholderIds: ["per-james-oconnor-wds"],
    meddpicc: {
      metrics: "12% reduction in unplanned downtime via predictive maintenance; $40M annual OPEX saving",
      economicBuyer: "CTO Shaun Gregory",
      decisionCriteria: "Ability to run locally on OT network, safety certifications, vendor longevity",
      decisionProcess: "CTO steering committee evaluation Q2; decision Q3",
      paperProcess: "Capital approval >$5M requires board sign-off; timing is critical",
      identifiedPain: "Asset monitoring generates 4TB/day of sensor data — 90% unanalyzed",
      champion: "per-james-oconnor-wds",
      competition: "Internal build (Woodside data science team); Palantir AIP (evaluated)",
    },
  },
  {
    id: "acc-telstra", countryCode: "AU", name: "Telstra",
    isLighthouse: true, rank: 5, vertical: "Telco", size: "GlobalEnterprise",
    revenue: "A$23.0B", employees: 30000, aiMaturity: 3, status: "targeted",
    incumbent: "Google", acvPotential: 2400000, targetClose: "2026-09-30",
    aeOwner: "James Watkins", lastTouchDate: "2026-03-22",
    lighthouseRationale: "Telstra shapes Australia's digital infrastructure agenda. A Telstra win gives us credibility across the telco vertical in AU and NZ.",
    competitivePosture: "Google Vertex AI is incumbent for network ops. Our opening is in customer service automation and internal knowledge management.",
    stakeholderIds: ["per-linda-park-tls", "per-ben-wu-tls"],
    meddpicc: {
      metrics: "NPS improvement from 32 to 50 via AI customer service; $60M annual care cost reduction",
      economicBuyer: "CCO Michael Ackland",
      decisionCriteria: "Integration with Salesforce CRM, Australian data sovereignty, multi-language SEA support",
      decisionProcess: "CCO champions to board; annual tech roadmap locked Q4",
      paperProcess: "Procurement lead time 4 months; target signed by August for Q4 go-live",
      identifiedPain: "2M calls/month to contact center; 40% are deflectable with AI",
      champion: "per-linda-park-tls",
      competition: "Google Vertex AI (incumbent NW ops); AWS Connect (contact centre)",
    },
  },
  // ── SINGAPORE ──
  {
    id: "acc-dbs", countryCode: "SG", name: "DBS Bank",
    isLighthouse: true, rank: 1, vertical: "FSI", size: "GlobalEnterprise",
    revenue: "S$21.2B", employees: 36000, aiMaturity: 5, status: "won",
    incumbent: null, acvPotential: 3200000, targetClose: "2025-12-31",
    aeOwner: "Wei Lin", lastTouchDate: "2026-04-22",
    lighthouseRationale: "DBS is the AI benchmark for SEA banking — every regional FSI CIO references their AI-first stack. CEO Piyush Gupta is the most vocal AI advocate in Asian finance.",
    competitivePosture: "Deep Claude deployment in wealth management and credit underwriting. Upsell opportunity in institutional trading. Guard against GPT-4o push from Piyush's US board connections.",
    stakeholderIds: ["per-raj-menon-dbs", "per-clara-tan-dbs", "per-andy-lim-dbs"],
    meddpicc: {
      metrics: "AI-driven wealth advice adopted by 180K customers; credit decisioning time cut from 4hrs to 8min",
      economicBuyer: "Group CEO Piyush Gupta (engaged at exec level)",
      decisionCriteria: "MAS TRM compliance, explainability, model stability for credit models",
      decisionProcess: "Innovation team pilots → Group CIO approval → Board Technology Committee",
      paperProcess: "Annual enterprise agreement; renewal Q4 FY26",
      identifiedPain: "RM productivity: each relationship manager can only actively manage 80 clients; AI target is 200",
      champion: "per-raj-menon-dbs",
      competition: "None currently active; OpenAI watching for expansion opportunity",
    },
  },
  {
    id: "acc-singtel", countryCode: "SG", name: "Singtel",
    isLighthouse: true, rank: 2, vertical: "Telco", size: "GlobalEnterprise",
    revenue: "S$14.8B", employees: 22000, aiMaturity: 3, status: "active",
    incumbent: "Microsoft", acvPotential: 1800000, targetClose: "2026-03-31",
    aeOwner: "Wei Lin", lastTouchDate: "2026-04-01",
    lighthouseRationale: "Singtel's infrastructure reach across SEA (Optus, Airtel stake) makes them a force-multiplier win — one agreement influences subsidiaries across 5 markets.",
    competitivePosture: "Microsoft Copilot is in internal productivity. Our target is network intelligence and the Optus enterprise customer base.",
    stakeholderIds: ["per-kevin-goh-stl"],
    meddpicc: {
      metrics: "30% reduction in network fault MTTR; S$200M Optus enterprise revenue unlock via AI-native services",
      economicBuyer: "Group CEO Yuen Kuan Moon",
      decisionCriteria: "Regional data residency, telco-grade SLA, partner ecosystem depth",
      decisionProcess: "Group CTO evaluating; Q2 recommendation to board",
      paperProcess: "Enterprise agreement review annually; next window Q3 FY26",
      identifiedPain: "Optus enterprise churn at 14% — AI-powered retention and upsell is the lever",
      champion: "per-kevin-goh-stl",
      competition: "Microsoft Copilot (incumbent productivity); Google (network analytics pilot)",
    },
  },
  {
    id: "acc-grab", countryCode: "SG", name: "Grab Holdings",
    isLighthouse: true, rank: 3, vertical: "TechSaaS", size: "GlobalEnterprise",
    revenue: "US$2.4B", employees: 9000, aiMaturity: 5, status: "won",
    incumbent: null, acvPotential: 1200000, targetClose: "2026-06-30",
    aeOwner: "Wei Lin", lastTouchDate: "2026-04-15",
    lighthouseRationale: "Grab's super-app reach across SEA (500M+ touchpoints) makes them the most impactful tech lighthouse in the region. Their AI adoption is a proof point for every regional tech CIO.",
    competitivePosture: "Claude in driver safety scoring and fraud detection. Risk: Grab has internal AI lab — retain through outcomes, not lock-in.",
    stakeholderIds: ["per-ming-chen-grb"],
    meddpicc: {
      metrics: "Driver safety incidents down 18%; fraud detection recall up to 98.2%",
      economicBuyer: "CTO Anthony Tan (co-founder engaged)",
      decisionCriteria: "Latency <100ms for real-time scoring, Southeast Asia data residency, model auditability",
      decisionProcess: "Engineering VPs → CTO → Board (annual)",
      paperProcess: "Annual API agreement; credit consumption model",
      identifiedPain: "3M daily transactions requiring real-time fraud scoring at <50ms",
      champion: "per-ming-chen-grb",
      competition: "Internal AI lab (GrabAI); OpenAI (evaluated for GrabMaps)",
    },
  },
  // ── JAPAN ──
  {
    id: "acc-softbank", countryCode: "JP", name: "SoftBank Group",
    isLighthouse: true, rank: 1, vertical: "TechSaaS", size: "GlobalEnterprise",
    revenue: "¥6.8T", employees: 53000, aiMaturity: 4, status: "competitor",
    incumbent: "OpenAI", acvPotential: 8000000, targetClose: "2027-03-31",
    aeOwner: "Kenji Nakamura", lastTouchDate: "2026-02-10",
    lighthouseRationale: "Masayoshi Son's endorsement of any AI company is the most powerful distribution signal in Asia. SoftBank's portfolio companies follow his AI vendor decisions.",
    competitivePosture: "OpenAI has deep strategic partnership with SoftBank/Yahoo Japan. Our entry angle: SoftBank's global portfolio companies (ARM, WeWork recovery, T-Mobile) where we have existing relationships.",
    stakeholderIds: ["per-yuki-tanaka-sbk"],
    meddpicc: {
      metrics: "Not quantified — strategic partnership framing needed first",
      economicBuyer: "Masayoshi Son (CEO — Son only moves on vision, not ROI decks)",
      decisionCriteria: "Strategic differentiation from OpenAI partnership, ability to serve portfolio companies",
      decisionProcess: "Son direct decision for strategic partnerships; no committee",
      paperProcess: "Non-standard — requires Anthropic CEO-level engagement",
      identifiedPain: "SoftBank Vision Fund portfolio companies lack coherent AI infrastructure — Anthropic as the foundation",
      champion: "per-yuki-tanaka-sbk",
      competition: "OpenAI (deep strategic partner, Sam/Masa relationship); Google (Vision Fund relationship)",
    },
  },
  {
    id: "acc-toyota", countryCode: "JP", name: "Toyota Motor Corporation",
    isLighthouse: true, rank: 2, vertical: "Manufacturing", size: "GlobalEnterprise",
    revenue: "¥45.1T", employees: 375000, aiMaturity: 3, status: "targeted",
    incumbent: "Microsoft", acvPotential: 5500000, targetClose: "2026-12-31",
    aeOwner: "Kenji Nakamura", lastTouchDate: "2026-03-15",
    lighthouseRationale: "Toyota's TPS (Toyota Production System) is the global manufacturing benchmark — their AI adoption signals where the entire manufacturing vertical is heading.",
    competitivePosture: "Microsoft Azure is the cloud base. Our angle: Claude for engineering documentation and supplier communication across Toyota's 50,000-supplier global network.",
    stakeholderIds: ["per-hiroshi-yamamoto-toy", "per-keiko-sato-toy"],
    meddpicc: {
      metrics: "Engineering doc search time reduced from 4hr to 10min; supplier onboarding cost down 30%",
      economicBuyer: "CIO Masahiro Yamamoto",
      decisionCriteria: "Japanese language quality (must score >95% on JP-eval), on-premise option for sensitive IP",
      decisionProcess: "CIO → IT Steering Committee → President's Office (for >¥1B commitments)",
      paperProcess: "Toyota fiscal year April–March; budget approval by January",
      identifiedPain: "13 million engineering documents across 12 systems — engineers spend 30% of time searching",
      champion: "per-hiroshi-yamamoto-toy",
      competition: "Microsoft Azure OpenAI (incumbent); Hitachi AI (local champion relationship)",
    },
  },
  // ── SOUTH KOREA ──
  {
    id: "acc-samsung-sdi", countryCode: "KR", name: "Samsung SDI",
    isLighthouse: true, rank: 1, vertical: "Manufacturing", size: "GlobalEnterprise",
    revenue: "₩14.0T", employees: 26000, aiMaturity: 4, status: "active",
    incumbent: null, acvPotential: 2900000, targetClose: "2026-06-30",
    aeOwner: "Ji-Young Park", lastTouchDate: "2026-04-08",
    lighthouseRationale: "Samsung SDI's battery innovation leadership makes them the R&D benchmark for manufacturing AI. A win here signals across the entire Samsung Group ecosystem.",
    competitivePosture: "No incumbent AI vendor — greenfield opportunity. Risk of Samsung Group IT mandating an internal AI platform (Samsung Research).",
    stakeholderIds: ["per-choi-jun-sdi", "per-park-soo-sdi"],
    meddpicc: {
      metrics: "Battery defect detection rate improvement from 99.1% to 99.8%; 6-month R&D cycle compression to 4 months",
      economicBuyer: "CTO Lee Sang-yoon",
      decisionCriteria: "IP protection (Samsung IP is core competitive asset), Korean language quality, Samsung Group IT approval",
      decisionProcess: "R&D VP → CTO → Samsung Group IT → CFO for >₩10B",
      paperProcess: "Samsung SDI fiscal year calendar; Q3 budget lock",
      identifiedPain: "300,000 internal R&D documents — knowledge loss when senior researchers retire",
      champion: "per-choi-jun-sdi",
      competition: "Samsung Research (internal AI mandate risk); OpenAI (evaluated for coding assist)",
    },
  },
  {
    id: "acc-kakao", countryCode: "KR", name: "Kakao Corporation",
    isLighthouse: true, rank: 2, vertical: "TechSaaS", size: "GlobalEnterprise",
    revenue: "₩7.6T", employees: 11000, aiMaturity: 4, status: "active",
    incumbent: "KakaoAI", acvPotential: 1500000, targetClose: "2026-03-31",
    aeOwner: "Ji-Young Park", lastTouchDate: "2026-04-12",
    lighthouseRationale: "KakaoTalk is used by 97% of Koreans. Kakao's AI product decisions shape consumer AI adoption patterns across Korea and set precedent for the broader K-tech ecosystem.",
    competitivePosture: "KakaoAI (internal) is incumbent. Entry through enterprise B2B services (KakaoWork, KakaoBiz) where internal LLM quality is insufficient.",
    stakeholderIds: ["per-lee-seon-kko"],
    meddpicc: {
      metrics: "KakaoBiz enterprise churn reduction from 18% to 9%; AI-powered B2B upsell worth ₩80B annually",
      economicBuyer: "CEO Shina Hong",
      decisionCriteria: "Korean language benchmark >97% on KoNLP eval, data segregation from consumer product, pricing",
      decisionProcess: "Enterprise AI team → CTO → CEO (strategic calls)",
      paperProcess: "Annual enterprise tech budget; commitment needed Q1 for Q2 implementation",
      identifiedPain: "KakaoWork enterprise customers demanding AI copilot — internal LLM underperforms on complex enterprise tasks",
      champion: "per-lee-seon-kko",
      competition: "KakaoAI (internal); HyperCLOVA X (NAVER — main local competitor)",
    },
  },
  // ── INDIA ──
  {
    id: "acc-infosys", countryCode: "IN", name: "Infosys",
    isLighthouse: true, rank: 1, vertical: "TechSaaS", size: "GlobalEnterprise",
    revenue: "US$18.6B", employees: 318000, aiMaturity: 4, status: "active",
    incumbent: "Microsoft", acvPotential: 4200000, targetClose: "2026-09-30",
    aeOwner: "Arjun Mehta", lastTouchDate: "2026-04-03",
    lighthouseRationale: "Infosys as a GSI partner multiplies our reach across their 1,500+ enterprise clients globally. Their AI practice endorsement is worth 10 direct sales cycles.",
    competitivePosture: "Microsoft is incumbent for Copilot in internal tools. Our angle is Infosys reselling Claude-powered AI services to their clients — a channel partnership, not direct replacement.",
    stakeholderIds: ["per-nandan-rao-inf", "per-deepa-krishna-inf"],
    meddpicc: {
      metrics: "GSI revenue share worth $12M annually; access to 200 Infosys enterprise clients in APJ",
      economicBuyer: "CEO Salil Parekh",
      decisionCriteria: "Partner margin structure, joint GTM commitments, model quality on enterprise code generation",
      decisionProcess: "Infosys AI Center of Excellence recommendation → CGO → CEO",
      paperProcess: "Annual GSI agreement review; Q3 procurement window",
      identifiedPain: "Clients demanding AI-native project delivery — Infosys needs a flagship LLM partner to compete with Accenture/AWS partnership",
      champion: "per-nandan-rao-inf",
      competition: "Microsoft Azure OpenAI (incumbent, via Copilot Studio); AWS Bedrock (strategic partner eval)",
    },
  },
  {
    id: "acc-hdfc", countryCode: "IN", name: "HDFC Bank",
    isLighthouse: true, rank: 2, vertical: "FSI", size: "GlobalEnterprise",
    revenue: "₹2.1T", employees: 177000, aiMaturity: 3, status: "targeted",
    incumbent: null, acvPotential: 3800000, targetClose: "2026-12-31",
    aeOwner: "Arjun Mehta", lastTouchDate: "2026-03-10",
    lighthouseRationale: "HDFC is India's most-watched private bank — their AI adoption in lending and customer service will set the regulatory and operational template for Indian FSI.",
    competitivePosture: "No strong incumbent AI vendor. RBI regulatory sandbox gives us a window for a proof-of-concept before any competitor locks in.",
    stakeholderIds: ["per-sunita-patel-hdf"],
    meddpicc: {
      metrics: "Loan processing time from 7 days to 4 hours; fraud false-positive rate down 35%",
      economicBuyer: "MD & CEO Sashidhar Jagdishan",
      decisionCriteria: "RBI compliance, data localization (India-only servers), Hindi language quality",
      decisionProcess: "CDAO → Technology Committee → MD & CEO for strategic tech",
      paperProcess: "RBI sandbox approval required first; 6-month procurement cycle",
      identifiedPain: "8M monthly loan applications — 60% still manual review due to document complexity",
      champion: "per-sunita-patel-hdf",
      competition: "Temenos (incumbent core banking); AWS Bedrock (evaluated); Google Vertex (MoU signed)",
    },
  },
  // ── INDONESIA ──
  {
    id: "acc-bca", countryCode: "ID", name: "Bank Central Asia (BCA)",
    isLighthouse: true, rank: 1, vertical: "FSI", size: "GlobalEnterprise",
    revenue: "IDR 118T", employees: 26000, aiMaturity: 3, status: "competitor",
    incumbent: "Google", acvPotential: 2200000, targetClose: "2027-03-31",
    aeOwner: "Adi Santoso", lastTouchDate: "2026-01-20",
    lighthouseRationale: "BCA processes 95% of Indonesia's inter-bank transactions — their AI stack is the de facto standard for Indonesian FSI. Win here and every regional bank follows.",
    competitivePosture: "Google Vertex AI signed for digital banking analytics Q1. Re-engage for agentic use cases in Q4 when Google's limitations become visible.",
    stakeholderIds: ["per-budi-santoso-bca"],
    meddpicc: {
      metrics: "Not yet defined — requires re-engagement after Google pilot evaluation Q3",
      economicBuyer: "President Director Jahja Setiaatmadja",
      decisionCriteria: "OJK (Indonesian FSA) compliance, Bahasa Indonesia quality, onshore data",
      decisionProcess: "IT Director → President Director for >IDR 50B",
      paperProcess: "Annual IT budget cycle locks September; re-engage by August",
      identifiedPain: "Customer service handles 50M contacts/month — AI deflection target is 40%",
      champion: "per-budi-santoso-bca",
      competition: "Google Vertex AI (just signed); AWS (evaluated Q4 2025)",
    },
  },
  {
    id: "acc-telkom-id", countryCode: "ID", name: "Telkom Indonesia",
    isLighthouse: true, rank: 2, vertical: "Telco", size: "GlobalEnterprise",
    revenue: "IDR 147T", employees: 25000, aiMaturity: 3, status: "competitor",
    incumbent: "Microsoft", acvPotential: 1900000, targetClose: "2027-03-31",
    aeOwner: "Adi Santoso", lastTouchDate: "2026-02-05",
    lighthouseRationale: "Telkom Indonesia's infrastructure monopoly means a win here touches every enterprise in Indonesia through their cloud (Telkomsel, TelkomSigma) and data center network.",
    competitivePosture: "Microsoft Azure OpenAI is embedded in TelkomSigma's cloud offering. Our angle: Telkom's subsidiary IndiHome for consumer AI services where Microsoft isn't competing.",
    stakeholderIds: ["per-eko-prasetyo-tlk"],
    meddpicc: {
      metrics: "IndiHome AI service ARPU increase IDR 50K/month; TelkomSigma new revenue IDR 800B",
      economicBuyer: "CEO Ririek Adriansyah",
      decisionCriteria: "Bahasa Indonesia quality, government (BUMN) compliance, onshore infrastructure",
      decisionProcess: "CTO → Board of Directors (BUMN procurement rules require multi-tender)",
      paperProcess: "BUMN tender process: 3-month minimum; target submission Q3",
      identifiedPain: "18M IndiHome customers with zero AI services vs competitors launching AI TV/assistant",
      champion: "per-eko-prasetyo-tlk",
      competition: "Microsoft Azure OpenAI (TelkomSigma incumbent); Google (IndiHome pilot rumored)",
    },
  },
  // ── MALAYSIA ──
  {
    id: "acc-petronas", countryCode: "MY", name: "Petronas",
    isLighthouse: true, rank: 1, vertical: "Resources", size: "GlobalEnterprise",
    revenue: "MYR 427B", employees: 50000, aiMaturity: 3, status: "untouched",
    incumbent: null, acvPotential: 3100000, targetClose: "2026-12-31",
    aeOwner: "Wei Lin", lastTouchDate: "2026-03-01",
    lighthouseRationale: "Petronas is Malaysia's sovereign energy company and the most influential technology spender in the country. Their AI decisions cascade through every Malaysian GLC.",
    competitivePosture: "No incumbent AI vendor — greenfield. Initial outreach via our Singapore team through Petronas Technology Ventures connections.",
    stakeholderIds: ["per-zulkifli-arif-ptr"],
    meddpicc: {
      metrics: "Not yet quantified — pre-discovery stage",
      economicBuyer: "President & CEO Tengku Muhammad Taufik",
      decisionCriteria: "Malaysia Digital Economy framework compliance, Malay language support, sovereign AI positioning",
      decisionProcess: "CTIO → Executive Leadership Team → President for strategic tech",
      paperProcess: "Annual capital budget cycle locks October; GLC procurement rules apply",
      identifiedPain: "Upstream operations generate 2TB/day of geological data — 95% unanalyzed",
      champion: "per-zulkifli-arif-ptr",
      competition: "None identified yet; IBM consulting relationship (not AI-specific)",
    },
  },
  // ── PHILIPPINES ──
  {
    id: "acc-bdo", countryCode: "PH", name: "BDO Unibank",
    isLighthouse: true, rank: 1, vertical: "FSI", size: "GlobalEnterprise",
    revenue: "PHP 179B", employees: 38000, aiMaturity: 2, status: "untouched",
    incumbent: null, acvPotential: 1200000, targetClose: "2027-03-31",
    aeOwner: "Wei Lin", lastTouchDate: "2026-02-15",
    lighthouseRationale: "BDO is the Philippines' largest bank by assets — their AI adoption will define FSI AI standards in a market of 115M people entering digital banking rapidly.",
    competitivePosture: "No AI incumbent. BSP (central bank) is piloting AI regulatory sandbox — get in early to shape the compliance framework.",
    stakeholderIds: ["per-maria-santos-bdo"],
    meddpicc: {
      metrics: "Not quantified — market education phase",
      economicBuyer: "President Nestor Tan",
      decisionCriteria: "BSP compliance, Filipino language support, BPO sector integration",
      decisionProcess: "CTO → President → Board Technology Committee",
      paperProcess: "Annual IT budget; BSP sandbox approval may be prerequisite",
      identifiedPain: "10M customer service interactions/month with limited digital deflection in Filipino",
      champion: "per-maria-santos-bdo",
      competition: "None strong yet; Microsoft exploring Copilot in financial services",
    },
  },
  // ── THAILAND ──
  {
    id: "acc-scb", countryCode: "TH", name: "SCB X (Siam Commercial Bank)",
    isLighthouse: true, rank: 1, vertical: "FSI", size: "GlobalEnterprise",
    revenue: "THB 90B", employees: 26000, aiMaturity: 4, status: "untouched",
    incumbent: null, acvPotential: 1600000, targetClose: "2027-03-31",
    aeOwner: "Wei Lin", lastTouchDate: "2026-03-05",
    lighthouseRationale: "SCB X is the most AI-progressive bank in Thailand and one of the most advanced in SEA — their tech subsidiary's mandate is to operate as a tech company with a banking license.",
    competitivePosture: "Strong internal innovation culture — they built their own AI lab (Data X). Entry point: Claude API for customer-facing Thai-language applications where quality gaps exist internally.",
    stakeholderIds: ["per-arthit-nanthawithaya-scb"],
    meddpicc: {
      metrics: "Not quantified — initial discovery needed",
      economicBuyer: "CEO Arthit Nanthawithaya (tech-first leader, public AI advocate)",
      decisionCriteria: "Thai language quality (critical — their AI lab built Thai LLM in-house), API flexibility",
      decisionProcess: "Data X team evaluation → Group CTO → CEO",
      paperProcess: "Annual tech investment cycle; Q3 commitment target",
      identifiedPain: "Customer-facing AI products limited by Thai language model quality — internal model underperfoms on complex queries",
      champion: "per-arthit-nanthawithaya-scb",
      competition: "Data X internal (SCB's own AI lab); Google Vertex (evaluated for translation)",
    },
  },
  // ── NEW ZEALAND ──
  {
    id: "acc-anz-nz", countryCode: "NZ", name: "ANZ Bank NZ",
    isLighthouse: true, rank: 1, vertical: "FSI", size: "Enterprise",
    revenue: "NZ$3.8B", employees: 8500, aiMaturity: 3, status: "targeted",
    incumbent: null, acvPotential: 1100000, targetClose: "2026-09-30",
    aeOwner: "Rachel Kim", lastTouchDate: "2026-04-01",
    lighthouseRationale: "ANZ NZ's AI adoption signals direction for all four major NZ banks. Their parent ANZ Group (AU) creates a natural expansion path from our Australian wins.",
    competitivePosture: "No AI incumbent. Leverage ANZ Group AU relationship to land a group-level agreement that covers NZ division.",
    stakeholderIds: ["per-sophie-white-anz"],
    meddpicc: {
      metrics: "Credit decisioning time from 2 days to 2 hours; NPS improvement of +8 points",
      economicBuyer: "CEO Antonia Watson",
      decisionCriteria: "RBNZ compliance, data residency in NZ, synergy with ANZ Group AU agreement",
      decisionProcess: "CIO recommendation → CEO → ANZ Group CIO sign-off",
      paperProcess: "Annual IT budget; Q3 lock for calendar year planning",
      identifiedPain: "600K retail customers; 40% of credit applications still manually reviewed",
      champion: "per-sophie-white-anz",
      competition: "None identified; AWS is cloud provider (not AI-specific)",
    },
  },
];

// ─── People ───────────────────────────────────────────────────────────────────

const people: Person[] = [
  // Macquarie
  { id: "per-chen-wei-mac", accountId: "acc-macquarie", countryCode: "AU", name: "Chen Wei", title: "Chief Data Officer", seniority: "C", vertical: "FSI", tenureYears: 4, priorEmployers: ["Goldman Sachs", "Deutsche Bank"], education: "MIT Sloan MBA", boardSeats: ["FinTech Australia"], publicStance: "Advocates for AI-augmented trading; co-authored 'AI in Capital Markets' whitepaper (2025)", crmStatus: "champion", influenceScore: 92, lastEngagement: "2026-04-18", engagementCount: 14 },
  { id: "per-sarah-morrison-mac", accountId: "acc-macquarie", countryCode: "AU", name: "Sarah Morrison", title: "Head of AI & Analytics", seniority: "VP", vertical: "FSI", tenureYears: 2, priorEmployers: ["Palantir", "Commonwealth Bank"], education: "UNSW Computer Science", boardSeats: [], publicStance: "Runs Macquarie AI Guild internally; advocates model transparency in regulated contexts", crmStatus: "meeting_held", influenceScore: 78, lastEngagement: "2026-04-10", engagementCount: 8 },
  { id: "per-david-ng-mac", accountId: "acc-macquarie", countryCode: "AU", name: "David Ng", title: "CTO, Asset Management", seniority: "C", vertical: "FSI", tenureYears: 6, priorEmployers: ["BlackRock", "Westpac"], education: "University of Melbourne", boardSeats: ["ASIC Technology Advisory"], publicStance: "Public skeptic of AI black-box models; favors interpretable AI for regulated asset decisions", crmStatus: "contacted", influenceScore: 85, lastEngagement: "2026-03-20", engagementCount: 4 },
  // Atlassian
  { id: "per-priya-sharma-atl", accountId: "acc-atlassian", countryCode: "AU", name: "Priya Sharma", title: "VP Engineering, AI Products", seniority: "VP", vertical: "TechSaaS", tenureYears: 3, priorEmployers: ["Google", "Canva"], education: "IIT Delhi, Stanford MS", boardSeats: [], publicStance: "Keynoted AWS re:Invent 2025 on AI-native developer tools; openly discussing Rovo AI architecture", crmStatus: "champion", influenceScore: 88, lastEngagement: "2026-04-20", engagementCount: 18 },
  { id: "per-tom-bradley-atl", accountId: "acc-atlassian", countryCode: "AU", name: "Tom Bradley", title: "Head of Enterprise AI", seniority: "Director", vertical: "TechSaaS", tenureYears: 1, priorEmployers: ["Salesforce", "GitHub"], education: "USYD Engineering", boardSeats: [], publicStance: "New hire from Salesforce AI — focused on enterprise AI adoption velocity", crmStatus: "meeting_held", influenceScore: 68, lastEngagement: "2026-04-05", engagementCount: 5 },
  // CBA
  { id: "per-anna-liu-cba", accountId: "acc-commonwealth-bank", countryCode: "AU", name: "Anna Liu", title: "Executive Manager, AI & Data Science", seniority: "Director", vertical: "FSI", tenureYears: 5, priorEmployers: ["CSIRO Data61", "NAB"], education: "ANU PhD Computer Science", boardSeats: [], publicStance: "APRA working group on AI in financial services; testified at Senate AI committee 2025", crmStatus: "champion", influenceScore: 81, lastEngagement: "2026-04-10", engagementCount: 11 },
  { id: "per-michael-chen-cba", accountId: "acc-commonwealth-bank", countryCode: "AU", name: "Michael Chen", title: "Chief Information Officer", seniority: "C", vertical: "FSI", tenureYears: 3, priorEmployers: ["Microsoft", "Westpac"], education: "UNSW MBA", boardSeats: ["Australian Banking Association Tech Committee"], publicStance: "Publicly committed to responsible AI in banking; strong Microsoft relationship from prior role", crmStatus: "contacted", influenceScore: 89, lastEngagement: "2026-03-15", engagementCount: 3 },
  // Woodside
  { id: "per-james-oconnor-wds", accountId: "acc-woodside", countryCode: "AU", name: "James O'Connor", title: "VP Data & Digital", seniority: "VP", vertical: "Resources", tenureYears: 4, priorEmployers: ["Schlumberger", "Shell"], education: "University of Western Australia", boardSeats: [], publicStance: "Spoke at ADIPEC 2025 on digital twins and AI in LNG operations — strong public profile in resources AI", crmStatus: "champion", influenceScore: 76, lastEngagement: "2026-04-05", engagementCount: 7 },
  // Telstra
  { id: "per-linda-park-tls", accountId: "acc-telstra", countryCode: "AU", name: "Linda Park", title: "Chief AI Officer", seniority: "C", vertical: "Telco", tenureYears: 2, priorEmployers: ["Google", "Optus"], education: "UNSW PhD EE, Harvard Executive", boardSeats: ["TelcoAI Consortium"], publicStance: "Regularly cited in AFR on Telstra's AI transformation; cautious on LLM vendor lock-in", crmStatus: "contacted", influenceScore: 87, lastEngagement: "2026-03-22", engagementCount: 5 },
  { id: "per-ben-wu-tls", accountId: "acc-telstra", countryCode: "AU", name: "Ben Wu", title: "Head of Customer Intelligence", seniority: "Director", vertical: "Telco", tenureYears: 3, priorEmployers: ["Concentrix", "Telus"], education: "Monash University", boardSeats: [], publicStance: "Running Telstra AI customer service pilot — internally championing conversational AI", crmStatus: "meeting_held", influenceScore: 62, lastEngagement: "2026-03-28", engagementCount: 6 },
  // DBS
  { id: "per-raj-menon-dbs", accountId: "acc-dbs", countryCode: "SG", name: "Raj Menon", title: "Group Chief Data & Transformation Officer", seniority: "C", vertical: "FSI", tenureYears: 6, priorEmployers: ["McKinsey", "Citi Asia"], education: "IIT Bombay, Wharton MBA", boardSeats: ["MAS FinTech Committee"], publicStance: "Co-author of DBS AI manifesto 2025; frequent speaker at Singapore Fintech Festival", crmStatus: "champion", influenceScore: 96, lastEngagement: "2026-04-22", engagementCount: 22 },
  { id: "per-clara-tan-dbs", accountId: "acc-dbs", countryCode: "SG", name: "Clara Tan", title: "Head of AI Research", seniority: "VP", vertical: "FSI", tenureYears: 4, priorEmployers: ["A*STAR", "NUS"], education: "NUS PhD AI", boardSeats: [], publicStance: "Publishing AI fairness research; chairs Singapore AI Safety working group", crmStatus: "meeting_held", influenceScore: 79, lastEngagement: "2026-04-15", engagementCount: 9 },
  { id: "per-andy-lim-dbs", accountId: "acc-dbs", countryCode: "SG", name: "Andy Lim", title: "Managing Director, Institutional Banking Technology", seniority: "VP", vertical: "FSI", tenureYears: 8, priorEmployers: ["UBS", "Deutsche Bank Asia"], education: "NTU Engineering, INSEAD MBA", boardSeats: [], publicStance: "Quiet but influential — controls technology budget for institutional banking", crmStatus: "cold", influenceScore: 74, lastEngagement: null, engagementCount: 0 },
  // Singtel
  { id: "per-kevin-goh-stl", accountId: "acc-singtel", countryCode: "SG", name: "Kevin Goh", title: "Chief Technology Officer, Digital InfraCo", seniority: "C", vertical: "Telco", tenureYears: 3, priorEmployers: ["Ericsson", "StarHub"], education: "NTU EE, INSEAD", boardSeats: ["IMDA Advisory"], publicStance: "Publicly committed to AI-native network operations; cited Singtel's AWS partnership as a model for telco AI", crmStatus: "meeting_held", influenceScore: 83, lastEngagement: "2026-04-01", engagementCount: 6 },
  // Grab
  { id: "per-ming-chen-grb", accountId: "acc-grab", countryCode: "SG", name: "Ming Chen", title: "VP AI & Machine Learning", seniority: "VP", vertical: "TechSaaS", tenureYears: 5, priorEmployers: ["Baidu", "Alibaba Cloud"], education: "Tsinghua University, Stanford PhD", boardSeats: [], publicStance: "Published GrabAI research at NeurIPS 2025; known for safety-first ML culture", crmStatus: "champion", influenceScore: 86, lastEngagement: "2026-04-15", engagementCount: 13 },
  // SoftBank
  { id: "per-yuki-tanaka-sbk", accountId: "acc-softbank", countryCode: "JP", name: "Yuki Tanaka", title: "Managing Director, AI Strategy", seniority: "VP", vertical: "TechSaaS", tenureYears: 4, priorEmployers: ["BCG", "Yahoo Japan"], education: "Keio University, Harvard Kennedy School", boardSeats: [], publicStance: "Manages SoftBank's OpenAI strategic partnership. Open to alternative LLM vendors for portfolio companies.", crmStatus: "contacted", influenceScore: 84, lastEngagement: "2026-02-10", engagementCount: 3 },
  // Toyota
  { id: "per-hiroshi-yamamoto-toy", accountId: "acc-toyota", countryCode: "JP", name: "Hiroshi Yamamoto", title: "General Manager, Connected AI Division", seniority: "Director", vertical: "Manufacturing", tenureYears: 7, priorEmployers: ["Denso", "Toyota Research Institute"], education: "Nagoya University Engineering", boardSeats: [], publicStance: "Leads Toyota's AI roadmap for connected vehicles; speaks at CES annually", crmStatus: "champion", influenceScore: 77, lastEngagement: "2026-03-15", engagementCount: 5 },
  { id: "per-keiko-sato-toy", accountId: "acc-toyota", countryCode: "JP", name: "Keiko Sato", title: "Chief Digital Officer", seniority: "C", vertical: "Manufacturing", tenureYears: 2, priorEmployers: ["McKinsey Tokyo", "Sony"], education: "Tokyo University, Columbia Business School", boardSeats: ["Keidanren Digital Committee"], publicStance: "New CDO bringing Silicon Valley perspective to Toyota; fast-tracking AI transformation agenda", crmStatus: "cold", influenceScore: 90, lastEngagement: null, engagementCount: 0 },
  // Samsung SDI
  { id: "per-choi-jun-sdi", accountId: "acc-samsung-sdi", countryCode: "KR", name: "Choi Jun-seo", title: "Head of AI & Digital Innovation", seniority: "Director", vertical: "Manufacturing", tenureYears: 3, priorEmployers: ["Samsung Electronics", "POSCO"], education: "KAIST Engineering", boardSeats: [], publicStance: "Runs Samsung SDI's AI pilot program; presenting at Korea AI Summit 2026", crmStatus: "champion", influenceScore: 80, lastEngagement: "2026-04-08", engagementCount: 9 },
  { id: "per-park-soo-sdi", accountId: "acc-samsung-sdi", countryCode: "KR", name: "Park Soo-jin", title: "VP R&D Systems", seniority: "VP", vertical: "Manufacturing", tenureYears: 9, priorEmployers: ["LG Chem"], education: "Seoul National University PhD Chemistry", boardSeats: [], publicStance: "Strong IP protectionist — key blocker if IP governance not addressed", crmStatus: "cold", influenceScore: 72, lastEngagement: null, engagementCount: 0 },
  // Kakao
  { id: "per-lee-seon-kko", accountId: "acc-kakao", countryCode: "KR", name: "Lee Seon-woo", title: "CTO, KakaoEnterprise", seniority: "C", vertical: "TechSaaS", tenureYears: 4, priorEmployers: ["Naver", "Kakao Brain"], education: "KAIST CS PhD", boardSeats: [], publicStance: "KoNLP benchmark author; vocal on need for Korean-first LLM evaluation standards", crmStatus: "meeting_held", influenceScore: 85, lastEngagement: "2026-04-12", engagementCount: 7 },
  // Infosys
  { id: "per-nandan-rao-inf", accountId: "acc-infosys", countryCode: "IN", name: "Nandan Rao", title: "EVP, AI & Automation Practice", seniority: "VP", vertical: "TechSaaS", tenureYears: 11, priorEmployers: ["Wipro", "Accenture"], education: "IIT Madras, IIM Bangalore", boardSeats: ["NASSCOM AI Committee"], publicStance: "Heads Infosys AI First initiative; co-chairs NASSCOM's enterprise AI working group", crmStatus: "champion", influenceScore: 89, lastEngagement: "2026-04-03", engagementCount: 12 },
  { id: "per-deepa-krishna-inf", accountId: "acc-infosys", countryCode: "IN", name: "Deepa Krishna", title: "Head of Partner Ecosystems", seniority: "Director", vertical: "TechSaaS", tenureYears: 5, priorEmployers: ["SAP India", "Tata Consultancy Services"], education: "IIT Delhi, XLRI", boardSeats: [], publicStance: "Manages Microsoft and AWS GSI relationships — strategic in partner negotiation", crmStatus: "meeting_held", influenceScore: 73, lastEngagement: "2026-03-28", engagementCount: 6 },
  // HDFC
  { id: "per-sunita-patel-hdf", accountId: "acc-hdfc", countryCode: "IN", name: "Sunita Patel", title: "Chief Technology Officer", seniority: "C", vertical: "FSI", tenureYears: 3, priorEmployers: ["RBI Innovation Hub", "ICICI Bank"], education: "IIT Kharagpur, Harvard Executive", boardSeats: ["IDRBT"], publicStance: "Recently testified at RBI fintech sandbox committee on AI in lending; favors open standards", crmStatus: "contacted", influenceScore: 86, lastEngagement: "2026-03-10", engagementCount: 2 },
  // BCA
  { id: "per-budi-santoso-bca", accountId: "acc-bca", countryCode: "ID", name: "Budi Santoso", title: "EVP, Digital Banking & Technology", seniority: "VP", vertical: "FSI", tenureYears: 8, priorEmployers: ["Bank Mandiri", "McKinsey Jakarta"], education: "UI Jakarta, NUS MBA", boardSeats: [], publicStance: "BCA's most senior AI voice; recently signed Google partnership — but publicly noting limitations", crmStatus: "contacted", influenceScore: 80, lastEngagement: "2026-01-20", engagementCount: 2 },
  // Telkom Indonesia
  { id: "per-eko-prasetyo-tlk", accountId: "acc-telkom-id", countryCode: "ID", name: "Eko Prasetyo", title: "Director of Digital Business & Technology", seniority: "C", vertical: "Telco", tenureYears: 5, priorEmployers: ["Telkomsel", "Ericsson Indonesia"], education: "UI Jakarta Engineering, INSEAD", boardSeats: ["BUMN Digital Council"], publicStance: "Leading Telkom's AI transformation; vocal on need for sovereign AI infrastructure for state-owned enterprises", crmStatus: "contacted", influenceScore: 82, lastEngagement: "2026-02-05", engagementCount: 3 },
  // Petronas
  { id: "per-zulkifli-arif-ptr", accountId: "acc-petronas", countryCode: "MY", name: "Zulkifli Arif", title: "Chief Technology & Innovation Officer", seniority: "C", vertical: "Resources", tenureYears: 6, priorEmployers: ["Shell Malaysia", "ExxonMobil Asia"], education: "UPM Engineering, Oxford Said MBA", boardSeats: ["Malaysia Digital Economy Council"], publicStance: "Keynoted MyDigital Summit 2025 on AI in upstream energy; Malaysia Digital Economy framework architect", crmStatus: "cold", influenceScore: 84, lastEngagement: null, engagementCount: 0 },
  // BDO Philippines
  { id: "per-maria-santos-bdo", accountId: "acc-bdo", countryCode: "PH", name: "Maria Santos", title: "Chief Information Officer", seniority: "C", vertical: "FSI", tenureYears: 4, priorEmployers: ["BSP (Central Bank)", "BPI"], education: "UP Diliman, AIM MBA", boardSeats: ["BSP FinTech Advisory"], publicStance: "Former BSP regulator — highly respected; key architect of Philippines open banking framework", crmStatus: "cold", influenceScore: 79, lastEngagement: null, engagementCount: 0 },
  // SCB Thailand
  { id: "per-arthit-nanthawithaya-scb", accountId: "acc-scb", countryCode: "TH", name: "Arthit Nanthawithaya", title: "CEO, SCB X / Group Chief Innovation Officer", seniority: "C", vertical: "FSI", tenureYears: 3, priorEmployers: ["SCB TechX", "McKinsey Bangkok"], education: "Chulalongkorn University, MIT Sloan", boardSeats: ["BOT FinTech Advisory"], publicStance: "Most vocal AI-first banking CEO in Thailand; built internal AI lab Data X; says 'we are a tech company that does banking'", crmStatus: "cold", influenceScore: 91, lastEngagement: null, engagementCount: 0 },
  // ANZ NZ
  { id: "per-sophie-white-anz", accountId: "acc-anz-nz", countryCode: "NZ", name: "Sophie White", title: "Chief Digital Officer", seniority: "C", vertical: "FSI", tenureYears: 2, priorEmployers: ["ANZ Australia", "Westpac NZ"], education: "University of Auckland, LBS Executive", boardSeats: ["NZ Tech Alliance"], publicStance: "Recently presented at NZ Tech Summit on AI in retail banking; open to new AI vendors post-Microsoft disappointment", crmStatus: "champion", influenceScore: 80, lastEngagement: "2026-04-01", engagementCount: 5 },
];

// ─── Edges ────────────────────────────────────────────────────────────────────

const edges: Edge[] = [
  // Co-worked pairs
  { id: "edge-1", sourceId: "per-chen-wei-mac", targetId: "per-raj-menon-dbs", type: "co_worked", strength: 3, provenance: "Both at Goldman Sachs Asia 2014–2018; co-led APAC quant desk restructure" },
  { id: "edge-2", sourceId: "per-priya-sharma-atl", targetId: "per-ming-chen-grb", type: "co_worked", strength: 2, provenance: "Both at Google Singapore 2018–2020; worked on the same ML infrastructure team" },
  { id: "edge-3", sourceId: "per-anna-liu-cba", targetId: "per-sarah-morrison-mac", type: "co_worked", strength: 2, provenance: "Both at NAB Data Science team 2019–2021" },
  { id: "edge-4", sourceId: "per-nandan-rao-inf", targetId: "per-deepa-krishna-inf", type: "co_worked", strength: 3, provenance: "11 years co-workers at Infosys; lead and partner on major AI deals" },
  { id: "edge-5", sourceId: "per-linda-park-tls", targetId: "per-kevin-goh-stl", type: "co_worked", strength: 2, provenance: "Both at Optus 2017–2019; Kevin's team provided infrastructure for Linda's AI pilots" },
  { id: "edge-6", sourceId: "per-michael-chen-cba", targetId: "per-sarah-morrison-mac", type: "co_worked", strength: 2, provenance: "Michael was CIO at Westpac when Sarah joined from Palantir — mentorship relationship" },
  { id: "edge-7", sourceId: "per-sunita-patel-hdf", targetId: "per-maria-santos-bdo", type: "co_worked", strength: 2, provenance: "Both served on same BIS (Bank for International Settlements) fintech working group 2023" },
  // Alumni (university)
  { id: "edge-8", sourceId: "per-raj-menon-dbs", targetId: "per-nandan-rao-inf", type: "alumni", strength: 2, provenance: "Both IIT alumni — IIT Bombay (Raj) and IIT Madras (Nandan); active in IIT Alumni Singapore chapter" },
  { id: "edge-9", sourceId: "per-priya-sharma-atl", targetId: "per-sunita-patel-hdf", type: "alumni", strength: 1, provenance: "Both IIT — IIT Delhi (Priya) and IIT Kharagpur (Sunita); connected via IIT diaspora network" },
  { id: "edge-10", sourceId: "per-chen-wei-mac", targetId: "per-andy-lim-dbs", type: "alumni", strength: 2, provenance: "Both MIT — Chen Wei (MIT Sloan MBA); Andy Lim (INSEAD but active in MIT enterprise forum Singapore)" },
  { id: "edge-11", sourceId: "per-clara-tan-dbs", targetId: "per-ming-chen-grb", type: "alumni", strength: 3, provenance: "Both NUS/NTU alumni network; Ming Chen did exchange at NUS; Clara was advisor to Grab's AI safety review" },
  { id: "edge-12", sourceId: "per-keiko-sato-toy", targetId: "per-yuki-tanaka-sbk", type: "alumni", strength: 2, provenance: "Both Harvard alumni — Columbia/Harvard Executive (Keiko); Harvard Kennedy (Yuki); Harvard Asia Pacific forum" },
  { id: "edge-13", sourceId: "per-choi-jun-sdi", targetId: "per-lee-seon-kko", type: "alumni", strength: 3, provenance: "Both KAIST alumni — CS dept; active in KAIST AI alumni cluster in Seoul" },
  // Board overlap
  { id: "edge-14", sourceId: "per-raj-menon-dbs", targetId: "per-kevin-goh-stl", type: "board", strength: 3, provenance: "Both on MAS/IMDA FinTech Steering Committee; meet monthly" },
  { id: "edge-15", sourceId: "per-anna-liu-cba", targetId: "per-sunita-patel-hdf", type: "board", strength: 2, provenance: "Both on APRA/RBI equivalent working group on AI in financial services (BIS BCBS forum)" },
  { id: "edge-16", sourceId: "per-nandan-rao-inf", targetId: "per-deepa-krishna-inf", type: "board", strength: 3, provenance: "Both NASSCOM AI Committee members; Nandan chairs, Deepa is vice-chair" },
  { id: "edge-17", sourceId: "per-linda-park-tls", targetId: "per-clara-tan-dbs", type: "board", strength: 2, provenance: "Both on Singapore AI Safety working group (AI Verify Foundation)" },
  // Co-author / research
  { id: "edge-18", sourceId: "per-chen-wei-mac", targetId: "per-raj-menon-dbs", type: "co_author", strength: 2, provenance: "Co-authored 'AI in APAC Financial Services' report for the Asian Development Bank 2025" },
  { id: "edge-19", sourceId: "per-clara-tan-dbs", targetId: "per-anna-liu-cba", type: "co_author", strength: 2, provenance: "Co-authored paper on AI fairness in credit scoring at FAccT 2025 conference" },
  // Co-panelist / conference
  { id: "edge-20", sourceId: "per-james-oconnor-wds", targetId: "per-zulkifli-arif-ptr", type: "co_panelist", strength: 2, provenance: "Co-panelists at ADIPEC 2025 on 'AI in Upstream Operations' — stayed in touch after" },
  { id: "edge-21", sourceId: "per-hiroshi-yamamoto-toy", targetId: "per-choi-jun-sdi", type: "co_panelist", strength: 1, provenance: "Both presented at Asia Manufacturing AI Summit Seoul 2025" },
  { id: "edge-22", sourceId: "per-nandan-rao-inf", targetId: "per-raj-menon-dbs", type: "co_panelist", strength: 2, provenance: "Co-panelists at Singapore FinTech Festival 2025 on 'GSI + Bank AI partnerships'" },
  { id: "edge-23", sourceId: "per-linda-park-tls", targetId: "per-budi-santoso-bca", type: "co_panelist", strength: 1, provenance: "Co-panelists at ConnectAsia Telco AI summit 2025; Linda was keynote, Budi on FSI panel" },
  { id: "edge-24", sourceId: "per-arthur-nw-scb", targetId: "per-raj-menon-dbs", type: "co_panelist", strength: 2, provenance: "Co-panelists at Singapore FinTech Festival 2025 'SEA Banking AI Futures' panel" },
  { id: "edge-25", sourceId: "per-priya-sharma-atl", targetId: "per-tom-bradley-atl", type: "co_worked", strength: 3, provenance: "Both at Atlassian — direct working relationship, Priya is Tom's skip-level manager" },
  { id: "edge-26", sourceId: "per-raj-menon-dbs", targetId: "per-clara-tan-dbs", type: "co_worked", strength: 3, provenance: "Direct working relationship — Raj is Clara's executive sponsor for AI research" },
  { id: "edge-27", sourceId: "per-sarah-morrison-mac", targetId: "per-priya-sharma-atl", type: "co_panelist", strength: 2, provenance: "Co-panelists at CIO Magazine Australia AI Leaders Summit 2025" },
  { id: "edge-28", sourceId: "per-sophie-white-anz", targetId: "per-michael-chen-cba", type: "co_worked", strength: 2, provenance: "Both in ANZ Group leadership 2022–2023 before Sophie moved to ANZ NZ CDO role" },
  { id: "edge-29", sourceId: "per-ben-wu-tls", targetId: "per-kevin-goh-stl", type: "alumni", strength: 1, provenance: "Both from Monash/NTU era — met at Telco industry alumni events" },
  { id: "edge-30", sourceId: "per-eko-prasetyo-tlk", targetId: "per-budi-santoso-bca", type: "board", strength: 2, provenance: "Both on BUMN Digital Council — Telkom and BCA are both state-linked entities" },
];

// Fix edge-24 which has a typo
const edgesFixed = edges.filter(e => e.id !== "edge-24").concat([
  { id: "edge-24", sourceId: "per-arthit-nanthawithaya-scb", targetId: "per-raj-menon-dbs", type: "co_panelist" as const, strength: 2 as const, provenance: "Co-panelists at Singapore FinTech Festival 2025 'SEA Banking AI Futures' panel" },
]);

// ─── Intel ────────────────────────────────────────────────────────────────────

const intel: Intel[] = [
  { id: "intel-1", accountId: "acc-macquarie", date: "2026-04-18", author: "James Watkins", body: "Chen Wei confirmed Q2 budget approved for Claude expansion into fixed income research. Wants roadmap presentation before end of April.", signal: "positive" },
  { id: "intel-2", accountId: "acc-macquarie", date: "2026-04-10", author: "James Watkins", body: "David Ng raised concerns about model explainability for ASIC reporting. Need to schedule technical deep-dive with our safety team.", signal: "negative" },
  { id: "intel-3", accountId: "acc-commonwealth-bank", date: "2026-04-10", author: "James Watkins", body: "Anna Liu shared that CDAO Dr. Norton is now an internal champion after seeing the fraud detection demo results. Get exec briefing scheduled.", signal: "positive" },
  { id: "intel-4", accountId: "acc-commonwealth-bank", date: "2026-03-22", author: "James Watkins", body: "Microsoft escalated with dedicated Azure OpenAI team at CBA. Norton met with Microsoft CTO in person. Need to accelerate our proof-of-concept timeline.", signal: "negative" },
  { id: "intel-5", accountId: "acc-telstra", date: "2026-03-28", author: "Rachel Kim", body: "Ben Wu confirmed they are 6 weeks into internal AI pilot for contact center deflection. Pilot showing 28% deflection rate — below their 40% target. Opportunity to show Claude's superiority.", signal: "positive" },
  { id: "intel-6", accountId: "acc-telstra", date: "2026-03-15", author: "James Watkins", body: "Google expanded Telstra Vertex AI contract to include contact center analytics. Linda Park expressed frustration with Google's response times. Keep tracking.", signal: "negative" },
  { id: "intel-7", accountId: "acc-dbs", date: "2026-04-22", author: "Wei Lin", body: "Raj Menon proactively requested Anthropic executive briefing at CEO level. Piyush Gupta is interested in Claude for institutional banking. Escalate to Dario.", signal: "positive" },
  { id: "intel-8", accountId: "acc-dbs", date: "2026-04-05", author: "Wei Lin", body: "DBS expanded Claude usage to 1,200 active internal users across wealth management. Usage growing 23% MoM. Upsell conversation underway.", signal: "positive" },
  { id: "intel-9", accountId: "acc-grab", date: "2026-04-15", author: "Wei Lin", body: "Ming Chen flagged that GrabAI internal team is experimenting with open-source Llama for cost reduction on lower-stakes use cases. Need to defend premium with outcomes data.", signal: "negative" },
  { id: "intel-10", accountId: "acc-samsung-sdi", date: "2026-04-08", author: "Ji-Young Park", body: "Choi Jun-seo confirmed executive AI steering committee approved Claude pilot for R&D documentation search. 90-day POC starts May 1.", signal: "positive" },
  { id: "intel-11", accountId: "acc-samsung-sdi", date: "2026-03-30", author: "Ji-Young Park", body: "Park Soo-jin (VP R&D) is the key IP blocker. She needs formal IP protection addendum before any contract. Legal to draft within 2 weeks.", signal: "negative" },
  { id: "intel-12", accountId: "acc-kakao", date: "2026-04-12", author: "Ji-Young Park", body: "Lee Seon-woo shared KakaoWork enterprise renewal data: 18% churn rate in enterprise accounts. Our Claude integration could be positioned as retention play.", signal: "positive" },
  { id: "intel-13", accountId: "acc-softbank", date: "2026-02-10", author: "Kenji Nakamura", body: "Yuki Tanaka flagged OpenAI contract with SoftBank includes exclusivity clause for internal use cases. Our play is portfolio companies (ARM, T-Mobile). Explore via SoftBank Vision Fund relationship.", signal: "neutral" },
  { id: "intel-14", accountId: "acc-toyota", date: "2026-03-15", author: "Kenji Nakamura", body: "Hiroshi Yamamoto confirmed Toyota is evaluating 3 vendors for engineering documentation AI. Microsoft Azure OpenAI, Google, and us. Decision expected Q3.", signal: "neutral" },
  { id: "intel-15", accountId: "acc-toyota", date: "2026-03-28", author: "Kenji Nakamura", body: "New CDO Keiko Sato arriving from McKinsey is known to favor non-Microsoft AI vendors. Get intro through McKinsey Tokyo partner connection before she settles in.", signal: "positive" },
  { id: "intel-16", accountId: "acc-infosys", date: "2026-04-03", author: "Arjun Mehta", body: "Nandan Rao confirmed Infosys is about to announce an AI platform partnership — they're deciding between us and Azure OpenAI. Decision this quarter. CEO-level call needed.", signal: "positive" },
  { id: "intel-17", accountId: "acc-infosys", date: "2026-03-20", author: "Arjun Mehta", body: "Deepa Krishna flagged that Microsoft offered Infosys a revenue-share deal on Copilot Studio reselling worth $15M. We need to counter with similar economics.", signal: "negative" },
  { id: "intel-18", accountId: "acc-bca", date: "2026-01-20", author: "Adi Santoso", body: "Budi Santoso signed Google Vertex AI for digital banking analytics. Re-engage Q3 when Google pilot results due — Budi privately noted limitations in Bahasa Indonesia quality.", signal: "neutral" },
  { id: "intel-19", accountId: "acc-telkom-id", date: "2026-02-05", author: "Adi Santoso", body: "Eko Prasetyo interested in sovereign AI positioning. Raised Telkom's obligation as a BUMN to use government-approved AI vendors. Check BPDP (govt AI registry) requirements.", signal: "neutral" },
  { id: "intel-20", accountId: "acc-woodside", date: "2026-04-05", author: "Rachel Kim", body: "James O'Connor confirmed Woodside board approved digital AI budget of AU$45M for FY26. No incumbent vendor locked in. Need proposal by end of May before budget allocated.", signal: "positive" },
  { id: "intel-21", accountId: "acc-anz-nz", date: "2026-04-01", author: "Rachel Kim", body: "Sophie White confirmed ANZ Group AU Macquarie relationship opened the door. She's ready to run a joint pilot aligned to ANZ Group agreement. Fast-track paperwork.", signal: "positive" },
  { id: "intel-22", accountId: "acc-atlassian", date: "2026-04-20", author: "Rachel Kim", body: "Priya Sharma flagged OpenAI GPT-4o is being evaluated for Rovo v2 code generation. Our current integration is in jira/confluence text. Need to expand to code use cases before v2 decision.", signal: "negative" },
];

// ─── Validate and write ───────────────────────────────────────────────────────

// Validate bidirectional references
const accountIds = new Set(accounts.map(a => a.id));
const peopleIds = new Set(people.map(p => p.id));

for (const p of people) {
  if (!accountIds.has(p.accountId)) {
    throw new Error(`Person ${p.id} references unknown account ${p.accountId}`);
  }
}

for (const a of accounts) {
  for (const sid of a.stakeholderIds) {
    if (!peopleIds.has(sid)) {
      throw new Error(`Account ${a.id} references unknown person ${sid}`);
    }
  }
}

for (const e of edgesFixed) {
  if (!peopleIds.has(e.sourceId)) throw new Error(`Edge ${e.id} sourceId ${e.sourceId} not found`);
  if (!peopleIds.has(e.targetId)) throw new Error(`Edge ${e.id} targetId ${e.targetId} not found`);
}

for (const i of intel) {
  if (!accountIds.has(i.accountId)) throw new Error(`Intel ${i.id} accountId ${i.accountId} not found`);
}

// Write files
fs.writeFileSync(path.join(DATA_DIR, "countries.json"), JSON.stringify(countries, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "accounts.json"), JSON.stringify(accounts, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "people.json"), JSON.stringify(people, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "edges.json"), JSON.stringify(edgesFixed, null, 2));
fs.writeFileSync(path.join(DATA_DIR, "intel.json"), JSON.stringify(intel, null, 2));

console.log(`✓ countries.json   — ${countries.length} countries`);
console.log(`✓ accounts.json    — ${accounts.length} accounts`);
console.log(`✓ people.json      — ${people.length} people`);
console.log(`✓ edges.json       — ${edgesFixed.length} edges`);
console.log(`✓ intel.json       — ${intel.length} intel notes`);
console.log("Seed data validated and written successfully.");
