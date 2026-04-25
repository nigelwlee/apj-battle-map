export interface CourtPressPlay {
  accountId: string;
  generated: string;
  targetPeople: Array<{
    name: string;
    title: string;
    why: string;
    warmPath: string;
    nextAction: string;
    objectionAngle: string;
  }>;
  timeline: Array<{ phase: string; weeks: string; milestone: string; metric: string }>;
  draftExecEmail: string;
}

export const COURT_PRESS_PLAYBOOKS: Record<string, CourtPressPlay> = {
  "acc-telstra": {
    accountId: "acc-telstra",
    generated: "2026-04-25",
    targetPeople: [
      {
        name: "Linda Park (Chief AI Officer)",
        title: "Chief AI Officer",
        why: "Linda is the internal champion who controls the AI vendor decision. Her prior Google role means she understands foundation models — but her frustration with Google response times is our opening.",
        warmPath: "Chen Wei (Macquarie, champion) → Priya Sharma (Atlassian, champion, co-panelist) → Sarah Morrison (Macquarie) → Linda Park (co-panelist at CIO AI Leaders Summit)",
        nextAction: "Request exec briefing via Priya Sharma intro — frame it around contact-center deflection benchmark data vs. Google Vertex",
        objectionAngle: "Linda is skeptical of vendor lock-in. Lead with: Claude API is model-agnostic and we commit to 3-year pricing stability. Show deflection rate: our 40% target vs Google's current 28%.",
      },
      {
        name: "Ben Wu (Head of Customer Intelligence)",
        title: "Head of Customer Intelligence",
        why: "Ben is running the current pilot. He's seeing 28% deflection vs. the 40% target — this gap is our opening. Win him and he surfaces the data to Linda.",
        warmPath: "Direct — Ben is already in meeting_held status. Escalate to a structured POC comparison.",
        nextAction: "Share Claude contact-center benchmark data for telco sector. Offer side-by-side comparison on Telstra's own pilot transcripts (with their approval).",
        objectionAngle: "Ben's focus is the metric gap. Show the data: Claude achieves 41% deflection in comparable telco deployments. Offer to run a 2-week parallel test on live traffic.",
      },
      {
        name: "Michael Ackland (CCO)",
        title: "Chief Commercial Officer",
        why: "CCO owns the NPS and care cost targets that the AI pilot feeds. Economic buyer with the authority to sign a $2.4M commitment. Linda reports to him.",
        warmPath: "Linda Park (after exec briefing) → Michael Ackland (Linda champions internally)",
        nextAction: "Prepare board-ready business case: $60M annual care cost reduction, +18 NPS points. Request 30-min CCO briefing after Linda's endorsement.",
        objectionAngle: "Ackland will ask: 'Why not stay with Google who we already have a relationship with?' Answer: Google's pilot is underperforming by 12 points on deflection. The cost of staying is $60M/year.",
      },
    ],
    timeline: [
      { phase: "Weeks 1–2", weeks: "1-2", milestone: "Priya Sharma intro arranged → Linda exec briefing booked", metric: "Briefing confirmed on calendar" },
      { phase: "Weeks 3–4", weeks: "3-4", milestone: "Side-by-side POC on live Telstra traffic approved; baseline deflection locked", metric: "Parallel test running" },
      { phase: "Weeks 5–7", weeks: "5-7", milestone: "POC results: Claude shows 41% vs Google 28% deflection. Ben Wu champions internally", metric: "Results deck delivered to Ben" },
      { phase: "Weeks 8–9", weeks: "8-9", milestone: "CCO business case meeting. Linda recommends; Ackland approves scoping", metric: "Verbal commitment from Ackland" },
      { phase: "Weeks 10–12", weeks: "10-12", milestone: "Contract signed. Salesforce integration scoped. Q4 go-live target confirmed", metric: "PO received — $2.4M ACV" },
    ],
    draftExecEmail: `Subject: Telstra AI contact center — $60M opportunity, 12-week window

Hi [Anthropic Exec],

Telstra is running a parallel AI pilot in their contact center right now. Current results: 28% deflection vs. their 40% target. Google is the incumbent — but underperforming.

Our intel: Linda Park (CAIO) is frustrated with Google's response times and wants an alternative validated before CCO review in June.

I need 30 minutes with you on a call with Linda Park to establish exec-to-exec credibility before we go into a POC comparison. The data wins from there.

The prize: $2.4M ACV, 30M Australian customers, and the first telco lighthouse win in AU that puts us ahead of Google in the vertical.

Can you do a 30-min call with Linda the week of May 5?

Thanks,
[AE Name]`,
  },

  "acc-dbs": {
    accountId: "acc-dbs",
    generated: "2026-04-25",
    targetPeople: [
      {
        name: "Raj Menon (Group CDTO)",
        title: "Group Chief Data & Transformation Officer",
        why: "Raj is our champion and has proactively requested CEO-level engagement. He controls the AI roadmap and has already internally championed Claude's expansion from wealth management to institutional banking.",
        warmPath: "Raj Menon is an active champion — direct relationship. Escalate to CEO-to-CEO.",
        nextAction: "Arrange Dario-to-Piyush Gupta call. Raj will set the agenda. Frame: DBS institutional banking expansion worth $1.5M incremental ACV.",
        objectionAngle: "No strong objection from Raj — he's the champion. The risk is OpenAI exploiting Piyush's US board connections. Pre-empt with a Dario call before OpenAI escalates.",
      },
      {
        name: "Piyush Gupta (Group CEO)",
        title: "Group CEO",
        why: "Piyush Gupta is the most influential AI-first banking CEO in Asia. A personal commitment from him to Anthropic locks the account for 3+ years. He responds to vision, not ROI decks.",
        warmPath: "Raj Menon champions → Dario Amodei to Piyush Gupta direct",
        nextAction: "CEO-to-CEO call. Lead with: DBS as Anthropic's flagship SEA banking reference. Offer co-authoring a paper on AI-first banking for the Asian Banker Summit.",
        objectionAngle: "Piyush will ask about OpenAI. Answer: Claude's constitutional AI approach aligns with MAS TRM requirements in ways GPT-4 cannot. Position it as the regulatory-safe choice for a public company.",
      },
      {
        name: "Andy Lim (MD Institutional Banking Technology)",
        title: "MD, Institutional Banking Technology",
        why: "Andy controls technology spend in the institutional banking division — the upsell target. He's currently Cold (0 engagements). Raj can warm-introduce.",
        warmPath: "Raj Menon (champion, direct manager relationship) → Andy Lim",
        nextAction: "Raj-facilitated introduction. Technical deep-dive on Claude's performance on fixed-income documentation and trade confirmation workflows.",
        objectionAngle: "Andy will care about latency and reliability. Share: Claude API P95 latency under 200ms with 99.9% uptime SLA. Offer dedicated capacity commitment.",
      },
    ],
    timeline: [
      { phase: "Week 1", weeks: "1", milestone: "Dario-to-Piyush call arranged via Raj. Institutional banking intro set with Andy Lim.", metric: "CEO call confirmed" },
      { phase: "Weeks 2–3", weeks: "2-3", milestone: "CEO-to-CEO call completed. Vision alignment on DBS as regional AI reference. Andy Lim briefing done.", metric: "Piyush verbal commitment to expand" },
      { phase: "Weeks 4–6", weeks: "4-6", milestone: "Institutional banking POC defined: trade confirmation and fixed-income research synthesis.", metric: "POC scope agreed" },
      { phase: "Weeks 7–9", weeks: "7-9", milestone: "POC results: 60% reduction in trade confirmation time. Co-authored paper submitted to Asian Banker.", metric: "Paper submitted; POC approved" },
      { phase: "Weeks 10–12", weeks: "10-12", milestone: "Expanded contract signed: $3.2M ACV (from $1.8M). Institutional banking + wealth management.", metric: "PO received — expansion signed" },
    ],
    draftExecEmail: `Subject: DBS CEO briefing — flagship SEA banking reference, $1.5M expansion

Hi Dario,

DBS is our strongest SEA win and they want to go bigger. Raj Menon (Group CDTO) has proactively asked for a CEO-level call with Piyush Gupta.

Piyush's ask: he wants Anthropic to co-position DBS as the global benchmark for AI-first banking. In exchange, he's ready to expand from wealth management into institutional banking ($1.5M ACV expansion, total $3.2M).

He responds to vision, not numbers. The framing: DBS + Anthropic jointly shape the MAS regulatory framework for AI in banking — every SEA FSI follows. This is worth more than one contract.

OpenAI is watching. Sam Altman has board-level connections via Piyush's US advisory relationships. We need to anchor Piyush before that conversation happens.

Can you do 30 minutes with Piyush the week of May 12?

Thanks,
Wei Lin`,
  },

  "acc-toyota": {
    accountId: "acc-toyota",
    generated: "2026-04-25",
    targetPeople: [
      {
        name: "Hiroshi Yamamoto (GM, Connected AI)",
        title: "General Manager, Connected AI Division",
        why: "Hiroshi is our champion — he's running the 3-vendor evaluation. He controls the engineering documentation use case that is our primary entry point. Win him with superior Japanese language quality.",
        warmPath: "Hiroshi Yamamoto is active champion. Reinforce with Japanese LLM benchmark data.",
        nextAction: "Share Claude's Japanese language benchmark vs. GPT-4o and Gemini on Toyota's actual document types. Offer to run side-by-side eval on 100 real engineering docs.",
        objectionAngle: "Hiroshi will test Japanese quality rigorously. Pre-position: Claude scores 97/100 on the JP-LLM-Eval benchmark. Offer dedicated Japanese language support team.",
      },
      {
        name: "Keiko Sato (Chief Digital Officer)",
        title: "Chief Digital Officer",
        why: "New CDO from McKinsey who prefers non-Microsoft AI vendors. She's Cold (0 engagements) but arriving with a mandate to accelerate AI. Get intro before she forms vendor relationships.",
        warmPath: "Yuki Tanaka (SoftBank, contacted) → Keiko Sato (Harvard alumni connection, Kennedy School network)",
        nextAction: "Request intro via Yuki Tanaka (Harvard Kennedy School alumni network). First meeting: frame Anthropic's enterprise AI approach vs. Microsoft's platform lock-in narrative.",
        objectionAngle: "Keiko will ask: 'Why not Microsoft — we already have Azure?' Answer: Azure OpenAI is a distribution layer, not a differentiated model. Claude's reasoning capability on complex manufacturing documents is 40% better on Toyota's own benchmark.",
      },
      {
        name: "Masahiro Yamamoto (CIO)",
        title: "CIO",
        why: "Economic buyer for any AI spend >¥1B. Hiroshi's champion path leads through the CIO before President's office. Need to brief him before Q3 steering committee.",
        warmPath: "Hiroshi Yamamoto (champion) → CIO briefing (internal Toyota chain)",
        nextAction: "Hiroshi-facilitated CIO briefing. Bring: data residency architecture for Toyota IP protection, on-premise deployment option overview, and $40M OPEX saving projection.",
        objectionAngle: "CIO will ask about IP protection and on-premise. Answer: Claude Enterprise supports customer-managed keys and VPC isolation. No Toyota IP in training data — we can sign a data processing addendum in Week 1.",
      },
    ],
    timeline: [
      { phase: "Week 1", weeks: "1", milestone: "Japanese LLM benchmark results delivered to Hiroshi. Yuki Tanaka intro to Keiko Sato arranged.", metric: "Benchmark delivered; intro confirmed" },
      { phase: "Weeks 2–4", weeks: "2-4", milestone: "Side-by-side eval on 100 Toyota engineering docs. Keiko first meeting done. IP data addendum signed.", metric: "Eval running; Keiko engaged" },
      { phase: "Weeks 5–7", weeks: "5-7", milestone: "Eval results: Claude +40% vs. GPT-4o on JP engineering doc retrieval. Hiroshi recommends to steering committee.", metric: "Steering committee recommendation submitted" },
      { phase: "Weeks 8–10", weeks: "8-10", milestone: "CIO briefing. $40M OPEX saving projection validated. Board-ready case prepared.", metric: "CIO verbal approval" },
      { phase: "Weeks 11–16", weeks: "11-16", milestone: "President's office review. Contract signed by January for FY27 budget cycle. On-premise pilot scoped.", metric: "¥1B+ commitment — signed" },
    ],
    draftExecEmail: `Subject: Toyota AI — 3-vendor eval underway, CDO intro window open now

Hi [Anthropic Exec],

Toyota is in a 3-vendor AI evaluation right now: Microsoft Azure OpenAI, Google, and us. Decision is Q3.

Our champion Hiroshi Yamamoto (GM Connected AI) is running the eval on engineering documentation search — 13 million docs across 12 systems. We're winning on Japanese language quality.

The time-sensitive piece: new CDO Keiko Sato just arrived from McKinsey. She's known to prefer non-Microsoft AI vendors and she hasn't formed any vendor relationships yet. Yuki Tanaka at SoftBank (Harvard Kennedy School alumni connection) can make the intro within 2 weeks.

If Keiko becomes a champion alongside Hiroshi, the CIO and steering committee approval is near-certain. If Microsoft gets to her first, we're in a 2v1 situation.

I need an exec touch with Keiko within 30 days. Can we do a Tokyo visit the week of May 19?

Thanks,
[AE Name]`,
  },
};
