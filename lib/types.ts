export type DealStatus = "won" | "active" | "targeted" | "competitor" | "untouched";
export type Vertical = "FSI" | "PublicSector" | "Telco" | "Retail" | "Resources" | "Manufacturing" | "TechSaaS" | "Healthcare";
export type AccountSize = "GlobalEnterprise" | "Enterprise" | "UpperMidMarket";
export type CrmStatus = "cold" | "contacted" | "meeting_held" | "champion" | "detractor";
export type EdgeType = "co_worked" | "alumni" | "board" | "co_author" | "co_panelist";
export type Seniority = "C" | "VP" | "Director" | "Manager";
export type IntelSignal = "positive" | "negative" | "neutral";

export interface Country {
  code: string;
  name: string;
  captureRate: number;
  captureRatePrev: number;
  status: DealStatus;
  tamUSD: number;
  quotaUSD: number;
  repCapacity: number;
  aiReadinessIndex: number;
  lighthouseCount: number;
  wonCount: number;
  activeCount: number;
  notes: string;
  weeklyCapture: number[];
}

export interface Account {
  id: string;
  countryCode: string;
  name: string;
  isLighthouse: boolean;
  rank: number;
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
  stakeholderIds: string[];
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

export interface Person {
  id: string;
  accountId: string;
  countryCode: string;
  name: string;
  title: string;
  seniority: Seniority;
  vertical: Vertical;
  tenureYears: number;
  priorEmployers: string[];
  education: string;
  boardSeats: string[];
  publicStance: string;
  crmStatus: CrmStatus;
  influenceScore: number;
  lastEngagement: string | null;
  engagementCount: number;
}

export interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  strength: 1 | 2 | 3;
  provenance: string;
}

export interface Intel {
  id: string;
  accountId: string;
  date: string;
  author: string;
  body: string;
  signal: IntelSignal;
}

export interface WarmPath {
  path: string[]; // person IDs, first = source champion, last = target
  score: number;
  hops: number;
}
