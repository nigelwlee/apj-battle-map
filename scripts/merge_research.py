#!/usr/bin/env python3
"""Merge research data into APJ Battle Map seed data files."""

import json
import os
from pathlib import Path

BASE = Path(__file__).parent.parent / "data"

def load(fname):
    with open(BASE / fname) as f:
        return json.load(f)

def save(fname, data):
    with open(BASE / fname, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  Wrote {BASE / fname}")

# ── Load existing data ──────────────────────────────────────────────────────
accounts = load("accounts.json")
people   = load("people.json")
edges    = load("edges.json")
intel    = load("intel.json")
countries = load("countries.json")

existing_account_ids = {a["id"] for a in accounts}
existing_person_ids  = {p["id"] for p in people}
existing_edge_ids    = {e["id"] for e in edges}

# Next available counters
next_edge_id  = 31   # edges 1-30 exist (24 present, numbering to 30)
next_intel_id = 23   # intel 1-22 exist

# ── New accounts ────────────────────────────────────────────────────────────
new_accounts_raw = [
    # Singapore
    dict(id="acc-ocbc", countryCode="SG", name="OCBC Bank", isLighthouse=True, rank=21,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 10.8B", employees=31000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=3000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="OCBC's Great Eastern insurance arm and Bank of Singapore wealth platform make it the FSI benchmark for cross-product AI use cases. New CEO Tan Teck Long creates a vendor re-evaluation window.",
         competitivePosture="AWS and Azure incumbent. New CEO window opens re-evaluation. Great Eastern and Bank of Singapore as wedge entry points.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Fraud reduction rate, wealth advisor productivity, AML false-positive reduction",
             economicBuyer="Group CEO Tan Teck Long",
             decisionCriteria="Enterprise security, MAS compliance, multi-product deployment capability",
             decisionProcess="Group technology committee approval required for spend >SGD 5M",
             paperProcess="Annual budget cycle; Q4 commit window",
             identifiedPain="Siloed AI initiatives across banking, insurance, and wealth divisions",
             champion="None yet",
             competition="AWS Bedrock, Azure OpenAI"
         )),
    dict(id="acc-sea", countryCode="SG", name="Sea Limited", isLighthouse=True, rank=22,
         vertical="Retail", size="GlobalEnterprise", revenue="USD 16.8B", employees=70000,
         aiMaturity=3, status="targeted", incumbent="Unknown",
         acvPotential=6000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Sea's CEO has publicly committed to AI as the path to a $1T market cap. Whoever powers their AI stack sets the benchmark for consumer-tech AI in SEA.",
         competitivePosture="No confirmed incumbent. Sea builds internally where possible. Need to identify CTO-level entry point.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Shopee conversion rate lift, Garena player retention, SeaMoney fraud reduction",
             economicBuyer="Chairman and CEO Forrest Li",
             decisionCriteria="Scalability across 500M+ users, cost at scale, Southeast Asian language quality",
             decisionProcess="Engineering leadership evaluation followed by CEO sign-off for strategic platforms",
             paperProcess="No established paper process — greenfield deal",
             identifiedPain="Fragmented AI stack across Shopee, Garena, and SeaMoney business units",
             champion="None yet",
             competition="Internal models, OpenAI"
         )),
    dict(id="acc-sia", countryCode="SG", name="Singapore Airlines", isLighthouse=True, rank=23,
         vertical="Manufacturing", size="GlobalEnterprise", revenue="USD 19.5B", employees=26000,
         aiMaturity=4, status="targeted", incumbent="Salesforce",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="SIA has 250+ GenAI use cases and a Salesforce Agentforce partnership — the most publicly documented AI transformation in ASEAN aviation. A citable win resonates across aviation and hospitality.",
         competitivePosture="Salesforce Agentforce and AWS are active. Claude can compete on deep reasoning for complex customer service and operations use cases.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Customer NPS improvement, contact centre cost per resolution, ops disruption reduction",
             economicBuyer="CEO Goh Choon Phong",
             decisionCriteria="Integration with Salesforce platform, airline-specific domain knowledge, safety standards",
             decisionProcess="Digital transformation steering committee; CEO has final call on strategic platforms",
             paperProcess="Annual vendor review cycle aligned to June fiscal year",
             identifiedPain="250+ GenAI use cases fragmented across business units — no unified AI layer",
             champion="None yet",
             competition="Salesforce Einstein/Agentforce, AWS Bedrock"
         )),
    dict(id="acc-ste", countryCode="SG", name="ST Engineering", isLighthouse=True, rank=24,
         vertical="Manufacturing", size="Enterprise", revenue="USD 8.9B", employees=25000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=1800000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="ST Engineering is the defence and aerospace AI bellwether for Singapore's government-linked enterprise sector.",
         competitivePosture="AWS and Azure are active. Sovereignty and security narrative is our wedge given defence-sector sensitivity.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Engineering documentation search time, maintenance scheduling accuracy, supply chain optimisation",
             economicBuyer="Group CEO",
             decisionCriteria="Data sovereignty, DSTA/MINDEF security clearance alignment, explainability",
             decisionProcess="Group IT Council approval; DSTA vendor vetting adds 90-day lead time",
             paperProcess="GeBiz procurement framework applies to all Singapore government-linked contracts",
             identifiedPain="Complex technical documentation across aerospace, marine, and urban systems divisions",
             champion="None yet",
             competition="AWS Bedrock, Azure OpenAI"
         )),
    # India
    dict(id="acc-reliance", countryCode="IN", name="Reliance Industries", isLighthouse=True, rank=25,
         vertical="Resources", size="GlobalEnterprise", revenue="USD 125.3B", employees=280000,
         aiMaturity=4, status="active", incumbent="Google Cloud",
         acvPotential=15000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate="2025-10-08",
         lighthouseRationale="Reliance's $110B AI infrastructure investment plan and confirmed Anthropic partnership discussions make this the single highest-stakes account in India. A win here reaches 488M Jio subscribers.",
         competitivePosture="Google Cloud, Meta, and OpenAI are all active. Anthropic has had direct discussions. CEO-level relationship is the only path to closing.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Jio AI assistant engagement rate, JioMart conversion uplift, O2C operational cost reduction",
             economicBuyer="Chairman Mukesh Ambani",
             decisionCriteria="Scale to 488M Jio subscribers, Hindi/Indic language quality, sovereign data residency",
             decisionProcess="Family-office style decision — Chairman plus Akash Ambani for Jio-specific decisions",
             paperProcess="No standard process — direct negotiation at Chairman level",
             identifiedPain="Need enterprise AI layer across Jio, Retail, and O2C simultaneously",
             champion="None yet",
             competition="Google Cloud Gemini, OpenAI, Meta LLaMA"
         )),
    dict(id="acc-tcs", countryCode="IN", name="Tata Consultancy Services", isLighthouse=True, rank=26,
         vertical="TechSaaS", size="GlobalEnterprise", revenue="USD 29.1B", employees=600000,
         aiMaturity=4, status="targeted", incumbent="Microsoft Azure",
         acvPotential=10000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="TCS's 5,500+ AI projects make it the AI capability benchmark for IT services globally. Embedding Claude in TCS's AI practice multiplies reach to every TCS enterprise client worldwide.",
         competitivePosture="Microsoft Azure and Google Cloud deeply embedded. TCS has reseller relationships with both. Our play is differentiated capability in complex reasoning tasks.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="AI practice revenue growth, client AI deployment velocity, developer productivity on TCS AI platform",
             economicBuyer="CEO K. Krithivasan",
             decisionCriteria="Model quality for complex enterprise use cases, go-to-market partnership terms, IP protection",
             decisionProcess="Group technology board; CEO final decision for strategic platform partnerships",
             paperProcess="TCS partner framework requires legal review and Tata Sons board alignment for >$10M deals",
             identifiedPain="5,500+ AI projects with inconsistent model quality — need a flagship model to anchor TCS AI brand",
             champion="None yet",
             competition="Microsoft Azure OpenAI, Google Cloud Vertex AI, NVIDIA NIM"
         )),
    dict(id="acc-airtel", countryCode="IN", name="Bharti Airtel", isLighthouse=True, rank=27,
         vertical="Telco", size="GlobalEnterprise", revenue="USD 20.0B", employees=45000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=4500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Airtel is India's most digitally transformed telco with 550M+ subscribers. New CEO creates a strategic re-evaluation window.",
         competitivePosture="AWS and Google Cloud are incumbents. New CEO Shashwat Sharma's first full budget cycle is the entry window.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Network ops AI cost reduction, customer churn prediction accuracy, Airtel IQ platform revenue",
             economicBuyer="MD and CEO Shashwat Sharma",
             decisionCriteria="Indic language quality, telco-specific domain capability, enterprise security standards",
             decisionProcess="CTO-led evaluation with CEO final sign-off for strategic AI platform decisions",
             paperProcess="Annual technology budget locked in Q1 — target H2 2026 commitment",
             identifiedPain="AI for 550M subscribers requires massive scale; current stack not unified across consumer and enterprise",
             champion="None yet",
             competition="AWS Bedrock, Google Cloud Vertex AI"
         )),
    dict(id="acc-wipro", countryCode="IN", name="Wipro", isLighthouse=True, rank=28,
         vertical="TechSaaS", size="GlobalEnterprise", revenue="USD 10.5B", employees=250000,
         aiMaturity=4, status="targeted", incumbent="Microsoft Azure",
         acvPotential=6000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Wipro ai360 and Lab45 Agentic AI platform puts Wipro at the forefront of enterprise AI services. CEO's $1B AI investment signals genuine commitment.",
         competitivePosture="Microsoft Azure, AWS, and Google Cloud all have active partnerships. Our play is differentiated reasoning capability for Lab45 agentic platform.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="ai360 client deployment count, Lab45 agentic platform revenue, analyst productivity gain",
             economicBuyer="CEO Srini Pallia",
             decisionCriteria="Agentic capability quality, enterprise security, go-to-market co-sell terms",
             decisionProcess="CEO-driven strategic platform decisions; Technology Council ratification",
             paperProcess="Wipro partner framework; legal review 60-90 days",
             identifiedPain="$1B AI investment needs a flagship model to differentiate Lab45 in crowded GSI market",
             champion="None yet",
             competition="Microsoft Azure OpenAI, AWS Bedrock, Google Cloud"
         )),
    dict(id="acc-icici", countryCode="IN", name="ICICI Bank", isLighthouse=True, rank=29,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 21.0B", employees=130000,
         aiMaturity=4, status="targeted", incumbent="AWS",
         acvPotential=4000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="ICICI Bank is the innovation benchmark for Indian private banking. Their iMobile app is the digital banking standard peers measure against.",
         competitivePosture="AWS and Azure are active. iMobile's AI layer is the entry point — ICICI evaluates on outcomes, not relationships.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="iMobile AI feature engagement rate, fraud detection precision, credit decision accuracy",
             economicBuyer="MD and CEO Sandeep Bakhshi",
             decisionCriteria="RBI AI governance compliance, enterprise-grade security, Hindi/regional language quality",
             decisionProcess="Technology committee chaired by MD; CTO leads evaluation",
             paperProcess="RBI vendor approval required; internal procurement 90-day cycle",
             identifiedPain="iMobile needs next-generation AI layer to maintain benchmark status vs Paytm and PhonePe",
             champion="None yet",
             competition="AWS Bedrock, Azure OpenAI"
         )),
    # Indonesia
    dict(id="acc-mandiri", countryCode="ID", name="Bank Mandiri", isLighthouse=True, rank=30,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 8.5B", employees=40000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=3500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Bank Mandiri is Indonesia's largest state-owned bank — a win signals government-sector readiness and travels to BNI, BRI, and all Indonesian BUMN.",
         competitivePosture="AWS and Azure are incumbents. New President Director Riduan creates a re-evaluation window. Sovereign AI narrative resonates with BUMN leadership.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Livin' app AI feature adoption, MSME lending decisioning speed, fraud loss reduction",
             economicBuyer="President Director Riduan",
             decisionCriteria="Data sovereignty (in-country), OJK regulatory compliance, Bahasa Indonesia quality",
             decisionProcess="Board of Directors approval for strategic technology investments",
             paperProcess="BUMN procurement rules apply; government tender process for large contracts",
             identifiedPain="Livin' digital banking platform needs AI upgrade to compete with BCA Mobile and Jenius",
             champion="None yet",
             competition="AWS Bedrock, Azure OpenAI"
         )),
    dict(id="acc-goto", countryCode="ID", name="GoTo Gojek Tokopedia", isLighthouse=True, rank=31,
         vertical="Retail", size="GlobalEnterprise", revenue="USD 990M", employees=28000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=2000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="GoTo is the digital native benchmark for Indonesia — what they do with AI defines expectations for 100M+ digital consumers. Their CTO's Silicon Valley-calibre engineering culture sets the bar.",
         competitivePosture="AWS and Google Cloud are active. GoTo builds heavily in-house. Entry through CTO engineering culture — peer-to-peer technical credibility required.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="GoPay fraud detection rate, driver demand forecasting accuracy, Tokopedia seller conversion",
             economicBuyer="CEO Hans Patuwo",
             decisionCriteria="API quality, cost at scale, latency for real-time consumer applications",
             decisionProcess="Engineering-led evaluation; CEO approves strategic platform decisions",
             paperProcess="Standard enterprise SaaS procurement; legal 45-60 days",
             identifiedPain="Post-merger AI stack fragmentation between Gojek and Tokopedia engineering teams",
             champion="None yet",
             competition="AWS Bedrock, Google Cloud, internal models"
         )),
    dict(id="acc-astra", countryCode="ID", name="Astra International", isLighthouse=True, rank=32,
         vertical="Manufacturing", size="GlobalEnterprise", revenue="USD 25.0B", employees=230000,
         aiMaturity=2, status="untouched", incumbent="AWS",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Astra is Indonesia's largest conglomerate. Astra Digital's AI strategy cascades to all subsidiaries and their supplier networks.",
         competitivePosture="AWS and Azure are likely incumbents across subsidiaries. Astra Digital is the entry point — find their CTO.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Manufacturing line defect reduction, dealer network AI adoption, agri/mining operational efficiency",
             economicBuyer="Group President Director",
             decisionCriteria="Bahasa Indonesia quality, multi-industry deployment capability, enterprise security",
             decisionProcess="Group IT Steering Committee; President Director approves strategic investments",
             paperProcess="Astra Group procurement governance; annual budget cycle Q4",
             identifiedPain="Astra Digital mandate to AI-enable all subsidiaries — needs scalable platform, not point solutions",
             champion="None yet",
             competition="AWS Bedrock, Azure OpenAI"
         )),
    # Malaysia
    dict(id="acc-maybank", countryCode="MY", name="Maybank", isLighthouse=True, rank=33,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 15.9B", employees=43000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=4000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Maybank is ASEAN's fourth-largest bank. A win travels to their Indonesia, Singapore, Philippines, and Cambodia operations simultaneously.",
         competitivePosture="AWS and Azure are incumbents. M25+ digital strategy is the vehicle — 18,000+ staff AI-trained, CEO committed. Multi-country deployment is our differentiator.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="MAE app AI feature adoption, SME lending decisioning speed, cross-border AI ROI",
             economicBuyer="President and Group CEO Dato' Sri Khairussaleh Ramli",
             decisionCriteria="Multi-market deployment (MY/ID/SG/PH), BNM regulatory compliance, Malay language quality",
             decisionProcess="Group Technology Committee chaired by CEO; Board Technology Committee for >RM 50M",
             paperProcess="Annual budget cycle; M25+ strategy programme has pre-approved AI budget",
             identifiedPain="M25+ strategy needs AI capability upgrade across all 10 ASEAN markets simultaneously",
             champion="None yet",
             competition="AWS Bedrock, Azure OpenAI"
         )),
    dict(id="acc-cimb", countryCode="MY", name="CIMB Group", isLighthouse=True, rank=34,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 4.95B", employees=34000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=3000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="CIMB is ASEAN's second-largest investment bank. New CEO Novan Amirudin committed RM100M for AI in 2025 within his first 6 months.",
         competitivePosture="AWS and Azure are incumbents. New CEO's RM100M AI mandate creates a greenfield opportunity within an existing tech stack.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Forward23+ digital strategy KPIs, investment banking AI productivity, BNM AI compliance score",
             economicBuyer="Group CEO Novan Amirudin",
             decisionCriteria="BNM compliance, ASEAN multi-market capability, investment banking domain expertise",
             decisionProcess="CEO-driven; Group Technology Council ratification; Board for strategic partnerships",
             paperProcess="RM100M AI budget pre-approved; procurement framework 60-day review",
             identifiedPain="RM100M AI budget needs flagship model to anchor CIMB's Forward23+ digital strategy",
             champion="None yet",
             competition="AWS Bedrock, Azure OpenAI"
         )),
    dict(id="acc-tnb", countryCode="MY", name="Tenaga Nasional", isLighthouse=True, rank=35,
         vertical="PublicSector", size="GlobalEnterprise", revenue="USD 11.4B", employees=35000,
         aiMaturity=2, status="untouched", incumbent="Azure",
         acvPotential=2000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="TNB is Malaysia's national electricity utility gateway to the data centre boom — their AI roadmap for grid management sets the standard for utilities across ASEAN.",
         competitivePosture="Azure is the likely incumbent. Data centre power demand growth is the business driver — TNB's AI spend will follow capital investment.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Grid predictive maintenance accuracy, data centre power reliability SLA, outage reduction",
             economicBuyer="President and CEO",
             decisionCriteria="Malaysian government data residency, critical infrastructure security standards, Malay language",
             decisionProcess="Board of Directors approval for strategic technology; Ministry of Energy oversight",
             paperProcess="GLC procurement governance; MyGovCloud preference policy applies",
             identifiedPain="Data centre demand boom requires AI-optimised grid management at national scale",
             champion="None yet",
             competition="Azure OpenAI"
         )),
    dict(id="acc-celcomdigi", countryCode="MY", name="CelcomDigi", isLighthouse=True, rank=36,
         vertical="Telco", size="GlobalEnterprise", revenue="USD 3.2B", employees=12000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="CelcomDigi's ADA subsidiary is the most advanced enterprise AI commercial offering from a Malaysian telco. CEO departure in June 2026 creates a strategic reset window.",
         competitivePosture="AWS and Google Cloud are active in ADA. CEO transition in June 2026 is the reset window.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="ADA enterprise AI revenue, network AI cost reduction, post-merger integration productivity",
             economicBuyer="Incoming Group CEO (post June 2026)",
             decisionCriteria="Enterprise AI platform quality for ADA resale, network operations AI capability, BNM compliance",
             decisionProcess="CEO-led; Board Technology Committee for strategic vendor decisions",
             paperProcess="MCMC regulatory alignment; standard enterprise procurement 60-90 days",
             identifiedPain="ADA subsidiary needs upgraded AI model to compete with AWS/GCP enterprise AI offerings",
             champion="None yet",
             competition="AWS Bedrock, Google Cloud Vertex AI"
         )),
    # Thailand
    dict(id="acc-scbx-th", countryCode="TH", name="SCB X", isLighthouse=True, rank=37,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 6.2B", employees=27000,
         aiMaturity=4, status="targeted", incumbent="Google Cloud",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="SCB X's pivot from Siam Commercial Bank to a tech-holding company is the most-watched FSI transformation in Thailand. Every Thai bank benchmarks its AI-native ambitions against SCB X.",
         competitivePosture="Google Cloud, AWS, and Azure are all active. SCB X's tech-holding structure means multiple AI entry points across portfolio companies.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="SCB Easy app AI adoption, embedded finance revenue from portfolio companies, fraud reduction",
             economicBuyer="CEO Arthid Nanthawithaya",
             decisionCriteria="Thai language quality, BOT regulatory compliance, multi-entity deployment across SCB X portfolio",
             decisionProcess="Group CEO decision with Technology Investment Committee ratification",
             paperProcess="Annual budget aligned to Thai fiscal year (Jan); Q3 commit window",
             identifiedPain="SCB X holding structure needs a unified AI platform across banking, fintech, and venture portfolio",
             champion="None yet",
             competition="Google Cloud Vertex AI, AWS Bedrock, Azure OpenAI"
         )),
    dict(id="acc-ais-th", countryCode="TH", name="Advanced Info Service", isLighthouse=True, rank=38,
         vertical="Telco", size="GlobalEnterprise", revenue="USD 5.8B", employees=14000,
         aiMaturity=3, status="targeted", incumbent="Microsoft Azure",
         acvPotential=1800000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="AIS controls 45% of Thailand's mobile subscriber base. Its infrastructure decisions define the AI-on-5G playbook and enterprise customers follow AIS's technology positioning.",
         competitivePosture="Microsoft Azure is the incumbent. AIS's enterprise B2B push is the entry vector — they need AI to differentiate telco services.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Enterprise AI services revenue, network predictive maintenance ROI, customer churn reduction",
             economicBuyer="CEO Somchai Lertsutiwong",
             decisionCriteria="Thai language quality, NBTC compliance, 5G enterprise AI integration capability",
             decisionProcess="CEO-led with Group Technology Committee; InTouch Holdings parent alignment",
             paperProcess="Annual budget cycle; SET disclosure requirements for large vendor contracts",
             identifiedPain="AIS enterprise AI offering needs differentiated model quality to win vs DTAC/True Move H",
             champion="None yet",
             competition="Microsoft Azure OpenAI"
         )),
    dict(id="acc-ptt-th", countryCode="TH", name="PTT Public Company", isLighthouse=True, rank=39,
         vertical="Resources", size="GlobalEnterprise", revenue="USD 68.0B", employees=24000,
         aiMaturity=3, status="targeted", incumbent="Microsoft Azure",
         acvPotential=3000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="PTT is the de facto state energy conglomerate. PTTEP's X.brain AI engine is the most advanced enterprise AI deployment in Thai industrials.",
         competitivePosture="Microsoft Azure is the incumbent for PTTEP X.brain. PTT Group's other subsidiaries are less locked in.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Upstream exploration efficiency, refinery predictive maintenance cost reduction, ESG reporting automation",
             economicBuyer="CEO Kongkrapan Intarajang",
             decisionCriteria="Thai government data residency, energy sector domain knowledge, PTT Group multi-entity deployment",
             decisionProcess="Board of Directors approval; Ministry of Energy strategic alignment",
             paperProcess="State enterprise procurement governance; annual 25B baht infrastructure budget",
             identifiedPain="X.brain AI engine needs expanded model capability beyond Azure's current offering for complex upstream exploration",
             champion="None yet",
             competition="Microsoft Azure OpenAI"
         )),
    # Vietnam
    dict(id="acc-fpt-vn", countryCode="VN", name="FPT Corporation", isLighthouse=True, rank=40,
         vertical="TechSaaS", size="GlobalEnterprise", revenue="USD 2.47B", employees=65000,
         aiMaturity=4, status="targeted", incumbent="NVIDIA",
         acvPotential=3000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="FPT is Vietnam's national tech champion with 65,000 employees. Every Vietnamese enterprise watches FPT's technology choices. Their Chief AI Officer is on Constellation Research's global AI-150 list.",
         competitivePosture="NVIDIA, Microsoft Azure, and AWS are all active. FPT is a potential reseller/GSI partner — the play is embedding Claude in FPT's AI platform for enterprise clients.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="FPT AI platform client count, AI services revenue growth, FPT Smart Cloud AI workload volume",
             economicBuyer="CEO Nguyen Van Khoa",
             decisionCriteria="Vietnamese language quality, GSI partnership economics, AI platform integration quality",
             decisionProcess="CEO decision for strategic platform partnerships; Board for >$5M commitments",
             paperProcess="FPT partner framework; MoIT regulatory alignment for strategic tech partnerships",
             identifiedPain="FPT AI platform needs a flagship foundation model to compete with Accenture, Cognizant in enterprise AI services",
             champion="None yet",
             competition="NVIDIA NIM, Microsoft Azure OpenAI, AWS Bedrock"
         )),
    dict(id="acc-vietcombank-vn", countryCode="VN", name="Vietcombank", isLighthouse=True, rank=41,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 4.8B", employees=20000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=2000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Vietnam's largest bank by market cap. Its FacePay AI rollout set the standard for digital banking across Vietnam. Other banks imitate Vietcombank's tech stack choices.",
         competitivePosture="AWS and Salesforce are active. SBV (central bank) regulatory requirements are the key constraint to navigate.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="VCB Digibank AI feature adoption, FacePay transaction volume, credit risk model accuracy",
             economicBuyer="General Director",
             decisionCriteria="SBV regulatory compliance, in-country data residency, Vietnamese language quality",
             decisionProcess="Board of Directors approval for strategic technology; SBV vendor approval required",
             paperProcess="State bank procurement governance; annual IT budget cycle Q4",
             identifiedPain="FacePay AI success creates pressure to AI-enable entire retail banking stack",
             champion="None yet",
             competition="AWS Bedrock, Salesforce Einstein"
         )),
    dict(id="acc-techcombank-vn", countryCode="VN", name="Techcombank", isLighthouse=True, rank=42,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 1.9B", employees=14000,
         aiMaturity=4, status="targeted", incumbent="Unknown",
         acvPotential=1800000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Techcombank is Vietnam's most digitally advanced private bank. Its AI 'data brain' is the most sophisticated enterprise AI deployment in Vietnamese FSI.",
         competitivePosture="Incumbent unknown. CEO Jens Lottner's McKinsey background makes him receptive to evidence-based vendor selection — outcomes data is the pitch.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Data brain decisioning accuracy, affluent customer NPS, mortgage AI approval speed",
             economicBuyer="CEO Jens Lottner",
             decisionCriteria="Model reasoning quality for complex financial decisions, SBV compliance, data security",
             decisionProcess="CEO and CTO joint evaluation; Board approval for strategic platform decisions",
             paperProcess="Private bank procurement — faster than state banks; 45-60 day legal review",
             identifiedPain="Data brain AI architecture needs next-generation model to maintain benchmark status in Vietnamese FSI",
             champion="None yet",
             competition="Unknown incumbent"
         )),
    dict(id="acc-vingroup-vn", countryCode="VN", name="Vingroup", isLighthouse=True, rank=43,
         vertical="Manufacturing", size="GlobalEnterprise", revenue="USD 7.0B", employees=80000,
         aiMaturity=4, status="targeted", incumbent="Unknown",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Vietnam's largest private conglomerate. VinAI subsidiary is ranked top-20 globally in AI research with 200+ researchers.",
         competitivePosture="Incumbent unknown. VinAI builds primarily in-house. Entry via VinAI research partnership or VinFast manufacturing AI use cases.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="VinFast autonomous driving AI performance, VinAI research publication impact, smart city AI deployment",
             economicBuyer="Chairman Pham Nhat Vuong",
             decisionCriteria="Research-grade model capability, Vietnamese sovereignty alignment, multi-subsidiary deployment",
             decisionProcess="Chairman-level decision for strategic AI partnerships",
             paperProcess="Direct negotiation with Chairman office; no standard procurement process",
             identifiedPain="VinAI needs access to frontier model capability to compete with DeepMind and OpenAI in research rankings",
             champion="None yet",
             competition="Internal models, unknown"
         )),
    # Philippines
    dict(id="acc-globe-ph", countryCode="PH", name="Globe Telecom", isLighthouse=True, rank=44,
         vertical="Telco", size="GlobalEnterprise", revenue="USD 2.4B", employees=9000,
         aiMaturity=3, status="targeted", incumbent="AWS",
         acvPotential=2000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Globe created the first Chief AI Officer role in the Philippines — the most visible AI governance signal in Philippine enterprise.",
         competitivePosture="AWS and Microsoft Azure are active. Globe's CAIO appointment creates a direct technical buyer relationship.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="917Ventures AI portfolio value, enterprise B2B AI services revenue, network AI ops savings",
             economicBuyer="CEO Carl Raymond Cruz",
             decisionCriteria="Filipino language (Filipino/Tagalog) quality, NPC data privacy compliance, enterprise scalability",
             decisionProcess="CEO-led; Technology Steering Committee; Ayala Corporation parent alignment for large deals",
             paperProcess="Annual budget cycle; NPC vendor registration for data processing",
             identifiedPain="Globe CAIO mandate needs a flagship model to build the Philippine enterprise AI proposition",
             champion="None yet",
             competition="AWS Bedrock, Microsoft Azure OpenAI"
         )),
    dict(id="acc-pldt-ph", countryCode="PH", name="PLDT Inc.", isLighthouse=True, rank=45,
         vertical="Telco", size="GlobalEnterprise", revenue="USD 4.6B", employees=15000,
         aiMaturity=3, status="targeted", incumbent="Dell Technologies",
         acvPotential=2200000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="PLDT launched 'Pilipinas AI' — the Philippines' first sovereign AI solutions stack. Data center decisions here define what's possible for enterprise AI across the country.",
         competitivePosture="Dell Technologies and AWS are active in Pilipinas AI infrastructure. Model layer is less locked in.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Pilipinas AI enterprise client count, Smart network AI efficiency, PLDT Enterprise AI services revenue",
             economicBuyer="Chairman Manuel V. Pangilinan",
             decisionCriteria="Philippine data sovereignty, NPC compliance, Filipino language quality, Pilipinas AI platform integration",
             decisionProcess="Chairman-led for strategic decisions; PLDT Board Technology Committee",
             paperProcess="First Pacific parent alignment; SEC and NPC regulatory approval for large data contracts",
             identifiedPain="Pilipinas AI needs a flagship foundation model to deliver on sovereign AI promise vs AWS-native competitors",
             champion="None yet",
             competition="Dell Technologies, AWS Bedrock"
         )),
    dict(id="acc-ayala-ph", countryCode="PH", name="Ayala Corporation", isLighthouse=True, rank=46,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 3.8B", employees=60000,
         aiMaturity=3, status="targeted", incumbent="Unknown",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Ayala is the Philippines' oldest and most respected conglomerate (1834). Technology decisions at holding level influence BPI banking, Globe Telecom, and all portfolio companies.",
         competitivePosture="Incumbent unknown at holding level. Globe and BPI are already targeted — Ayala holding is the orchestration layer.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="BPI AI feature adoption, Globe AI services revenue, AC Ventures AI portfolio performance",
             economicBuyer="President and CEO Cezar Consing",
             decisionCriteria="Portfolio-wide deployment capability, BPI/BSP regulatory compliance, Philippine data sovereignty",
             decisionProcess="President CEO for strategic investments; Ayala Board for >PHP 1B commitments",
             paperProcess="Conglomerate procurement governance; BSP approval required for BPI-related AI contracts",
             identifiedPain="Ayala's diverse portfolio (banking, telco, real estate, power) needs a unified AI platform strategy",
             champion="None yet",
             competition="Unknown"
         )),
    dict(id="acc-sminv-ph", countryCode="PH", name="SM Investments", isLighthouse=True, rank=47,
         vertical="Retail", size="GlobalEnterprise", revenue="USD 13.0B", employees=100000,
         aiMaturity=2, status="targeted", incumbent="Unknown",
         acvPotential=2000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="SM Investments is the Philippines' largest company by market cap. Its retail and property AI investments directly affect the commerce infrastructure used by 100M Filipinos.",
         competitivePosture="Incumbent unknown. SM's retail and mall operations are the entry point — AI for merchandising, footfall, and loyalty.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="SM Supermalls footfall AI accuracy, BDO AI feature adoption, SM Markets inventory optimisation",
             economicBuyer="President and CEO Frederic DyBuncio",
             decisionCriteria="Filipino language quality, NPC data privacy compliance, retail and FSI dual-domain capability",
             decisionProcess="CEO-led; Board Technology Committee for strategic platforms",
             paperProcess="Annual budget cycle; NPC DPO vendor registration",
             identifiedPain="SM's 100M customer base requires AI-driven personalisation across retail, banking, and property",
             champion="None yet",
             competition="Unknown"
         )),
    # Taiwan
    dict(id="acc-tsmc-tw", countryCode="TW", name="TSMC", isLighthouse=True, rank=48,
         vertical="Manufacturing", size="GlobalEnterprise", revenue="USD 90.0B", employees=73000,
         aiMaturity=4, status="targeted", incumbent="Microsoft Azure",
         acvPotential=5000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="TSMC manufactures 90%+ of the world's leading-edge chips including every NVIDIA H100/H200. Its enterprise software choices are watched by every Taiwanese tech company.",
         competitivePosture="Microsoft Azure and Google Cloud are active. TSMC's strategic importance means executive-level engagement from Anthropic leadership is expected.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Fab yield improvement AI contribution, engineering documentation search productivity, IP protection track record",
             economicBuyer="Chairman and CEO C.C. Wei",
             decisionCriteria="IP protection and confidentiality (critical), enterprise security, complex reasoning for engineering use cases",
             decisionProcess="CEO final decision for strategic platform partnerships; TSMC Board for >$10M",
             paperProcess="TSMC legal is highly rigorous — IP NDAs and data processing agreements take 90-120 days",
             identifiedPain="TSMC's engineering complexity requires AI that can reason over proprietary process documentation — general models are insufficient",
             champion="None yet",
             competition="Microsoft Azure OpenAI, Google Cloud Vertex AI"
         )),
    dict(id="acc-foxconn-tw", countryCode="TW", name="Hon Hai / Foxconn", isLighthouse=True, rank=49,
         vertical="Manufacturing", size="GlobalEnterprise", revenue="USD 200.0B", employees=700000,
         aiMaturity=3, status="targeted", incumbent="NVIDIA",
         acvPotential=4000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Foxconn is pivoting aggressively to AI servers. Its OpenAI and NVIDIA partnerships are the boldest AI factory transformation in Asia — every ODM watches their moves.",
         competitivePosture="NVIDIA, OpenAI, and Microsoft Azure are active. Foxconn's scale means there is room for a differentiated use case play alongside OpenAI.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="AI server assembly throughput, AI factory software stack value, NVIDIA GB200 ramp efficiency",
             economicBuyer="Chairman Young-Way Liu",
             decisionCriteria="Integration with NVIDIA ecosystem, manufacturing AI domain capability, enterprise security at scale",
             decisionProcess="Chairman-led for strategic partnerships; Hon Hai Board for >$10M",
             paperProcess="Complex — multiple joint venture legal structures; 90-120 day negotiation expected",
             identifiedPain="AI factory software stack is fragmented — Foxconn needs a unified AI reasoning layer for operations at 700,000 employee scale",
             champion="None yet",
             competition="NVIDIA NIM, OpenAI, Microsoft Azure OpenAI"
         )),
    dict(id="acc-mediatek-tw", countryCode="TW", name="MediaTek", isLighthouse=True, rank=50,
         vertical="Manufacturing", size="GlobalEnterprise", revenue="USD 18.0B", employees=22000,
         aiMaturity=3, status="targeted", incumbent="NVIDIA",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="MediaTek designs chips for 2B+ consumer devices globally and is aggressively pivoting to AI ASIC with $1B AI revenue target for 2026.",
         competitivePosture="NVIDIA is the primary partner for AI ASIC design reference. Our play is enterprise software AI for R&D and operations, not competing with NVIDIA on silicon.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="AI ASIC design cycle time, Dimensity AI chip benchmark scores, AI services revenue",
             economicBuyer="Vice Chairman and CEO Rick Tsai",
             decisionCriteria="Engineering domain reasoning quality, IP confidentiality, cost at $1B AI revenue scale",
             decisionProcess="CEO and CTO joint evaluation; Board for strategic platform decisions",
             paperProcess="Taiwan procurement governance; FSC alignment for listed company contracts",
             identifiedPain="Rapid AI ASIC development requires AI-assisted chip design and engineering documentation at scale",
             champion="None yet",
             competition="NVIDIA NIM"
         )),
    dict(id="acc-fubon-tw", countryCode="TW", name="Fubon Financial Holding", isLighthouse=True, rank=51,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 22.0B", employees=44000,
         aiMaturity=3, status="targeted", incumbent="Unknown",
         acvPotential=2000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Fubon is Taiwan's largest financial holding company. Its FSI vendor decisions are watched by all Taiwanese banks and insurers.",
         competitivePosture="Incumbent unknown. Fubon's FinTech-first strategy creates an open evaluation environment.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Taipei Fubon Bank AI feature adoption, Fubon Life underwriting AI accuracy, cross-entity AI ROI",
             economicBuyer="Chairman Richard M. Tsai",
             decisionCriteria="FSC regulatory compliance, Traditional Chinese language quality, multi-entity FSI deployment",
             decisionProcess="Chairman-led; Fubon Board for strategic platform investments",
             paperProcess="FSC (Financial Supervisory Commission) vendor approval required; annual budget Q4",
             identifiedPain="Fubon's FinTech-first ambition needs a flagship AI model to differentiate across banking, insurance, and securities",
             champion="None yet",
             competition="Unknown"
         )),
    # Hong Kong
    dict(id="acc-hsbc-hk", countryCode="HK", name="HSBC Holdings HK", isLighthouse=True, rank=52,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 67.0B", employees=220000,
         aiMaturity=4, status="targeted", incumbent="Microsoft Azure",
         acvPotential=5000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="HSBC is the largest bank in Hong Kong. Its technology vendor decisions define what global banks adopt in Asia. Their AI compliance approach sets the industry standard.",
         competitivePosture="Microsoft Azure and Google Cloud are active at the global level. HSBC's Asia operations are a distinct entry point.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="AI compliance automation cost reduction, wealth management AI productivity, trade finance AI accuracy",
             economicBuyer="Asia CEO",
             decisionCriteria="HKMA AI regulatory compliance, global bank security standards (ISO 27001++), explainability for regulatory reporting",
             decisionProcess="Global CTO decision for enterprise platforms; Asia EXCO for Asia-specific deployments",
             paperProcess="HSBC Group legal takes 120+ days; HKMA prior notification required for AI in regulated activities",
             identifiedPain="HSBC needs AI reasoning capability that can operate within its complex multi-jurisdictional regulatory constraints",
             champion="None yet",
             competition="Microsoft Azure OpenAI, Google Cloud Vertex AI"
         )),
    dict(id="acc-aia-hk", countryCode="HK", name="AIA Group", isLighthouse=True, rank=53,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 42.0B", employees=35000,
         aiMaturity=4, status="targeted", incumbent="Unknown",
         acvPotential=3500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="AIA is the largest listed life insurer in Asia by market cap. Its AI platform won Excellent Innovative Enterprise AI Platform at HK01 Gold Medal Awards 2025.",
         competitivePosture="Incumbent unknown. AIA's award-winning AI platform signals genuine maturity — they are a buyer who knows what good looks like.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="iAIA digital assistant engagement, underwriting AI accuracy across 18 markets, agent productivity",
             economicBuyer="Group CEO Lee Yuan Siong",
             decisionCriteria="Multi-market deployment (18 Asian markets), insurance domain expertise, HKIA regulatory compliance",
             decisionProcess="Group CEO and CTO joint evaluation; Board Technology Committee for strategic platforms",
             paperProcess="AIA Group legal; HKIA and multi-country regulator alignment; 90-120 day process",
             identifiedPain="AIA's 18-market footprint requires AI that can handle diverse Asian languages and regulatory environments simultaneously",
             champion="None yet",
             competition="Unknown"
         )),
    dict(id="acc-cathay-hk", countryCode="HK", name="Cathay Pacific", isLighthouse=True, rank=54,
         vertical="Retail", size="GlobalEnterprise", revenue="USD 14.0B", employees=33000,
         aiMaturity=4, status="targeted", incumbent="AWS",
         acvPotential=2000000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="Cathay Pacific has the most publicly documented AI digital transformation of any HK enterprise. Cathay Technologies (April 2025) commercialises internal AI tools — watched across APAC aviation.",
         competitivePosture="AWS and Microsoft Azure are active. Cathay Technologies subsidiary creates a new commercial AI buyer beyond the airline's own IT.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Customer personalisation NPS lift, Cathay Technologies AI product revenue, ops disruption cost reduction",
             economicBuyer="CEO Ronald Lam",
             decisionCriteria="Aviation domain expertise, multi-language capability (Chinese/English), IATA data standards compliance",
             decisionProcess="CEO and CTO joint evaluation; Cathay Board for strategic platform decisions",
             paperProcess="Standard enterprise procurement; Cathay Technologies has faster buying cycle than airline parent",
             identifiedPain="Cathay Technologies needs a flagship model to commercialise internal AI tools — the current stack is not differentiated enough to sell externally",
             champion="None yet",
             competition="AWS Bedrock, Microsoft Azure OpenAI"
         )),
    dict(id="acc-hkexchange-hk", countryCode="HK", name="HK Exchanges and Clearing", isLighthouse=True, rank=55,
         vertical="FSI", size="GlobalEnterprise", revenue="USD 2.2B", employees=3000,
         aiMaturity=3, status="targeted", incumbent="Unknown",
         acvPotential=2500000, targetClose="2026-12-31", aeOwner="TBD",
         lastTouchDate=None,
         lighthouseRationale="HKEX operates the world's 6th largest stock exchange. Every regulated entity on HKEX takes signal from its technology roadmap.",
         competitivePosture="Incumbent unknown. HKEX's regulatory position means any AI deployment signals to entire HK financial market.",
         stakeholderIds=[],
         meddpicc=dict(
             metrics="Market surveillance AI accuracy, listing review automation speed, real-time risk monitoring latency",
             economicBuyer="CEO Bonnie Y. Chan",
             decisionCriteria="SFC regulatory compliance, explainability for market surveillance, Traditional Chinese quality, 99.999% uptime",
             decisionProcess="CEO and CTO joint evaluation; HKEX Board; SFC engagement for regulated AI activities",
             paperProcess="SFC prior consultation required; HKEX procurement governance 90+ days",
             identifiedPain="HKEX market surveillance and listing review generate enormous document volume — AI reasoning is the only scalable solution",
             champion="None yet",
             competition="Unknown"
         )),
]

# ── New people ──────────────────────────────────────────────────────────────
new_people_raw = [
    # SG - DBS (existing account, new people)
    dict(id="per-tan-su-shan-dbs", accountId="acc-dbs", countryCode="SG",
         name="Tan Su Shan", title="Group Chief Executive Officer", seniority="C",
         vertical="FSI", tenureYears=1,
         priorEmployers=["DBS", "Morgan Stanley", "Citibank"],
         education="Oxford University", boardSeats=[],
         publicStance="First female CEO of DBS; took helm March 2025; inheritor of DBS AI-first strategy",
         crmStatus="cold", influenceScore=92, lastEngagement=None, engagementCount=0),
    dict(id="per-chng-sok-hui-dbs", accountId="acc-dbs", countryCode="SG",
         name="Chng Sok Hui", title="Group Chief Financial Officer", seniority="C",
         vertical="FSI", tenureYears=16,
         priorEmployers=["DBS"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="Long-tenured CFO controlling AI infrastructure spend budgets",
         crmStatus="cold", influenceScore=74, lastEngagement=None, engagementCount=0),
    # SG - Singtel (existing account, new people)
    dict(id="per-yuen-kuan-moon-singtel", accountId="acc-singtel", countryCode="SG",
         name="Yuen Kuan Moon", title="Group Chief Executive Officer", seniority="C",
         vertical="Telco", tenureYears=4,
         priorEmployers=["Singtel", "SingPost"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="AI-first telco evangelist; transforming Singtel from connectivity to AI infrastructure provider",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    # SG - Grab (existing account, new people)
    dict(id="per-anthony-tan-grab", accountId="acc-grab", countryCode="SG",
         name="Anthony Tan", title="Group CEO and Co-Founder", seniority="C",
         vertical="TechSaaS", tenureYears=12,
         priorEmployers=[],
         education="Harvard Business School MBA", boardSeats=["Grab Holdings"],
         publicStance="Vocal AI advocate; mandated 9-week generative AI sprint; strong partnership with both OpenAI and Anthropic",
         crmStatus="champion", influenceScore=91, lastEngagement="2026-04-01", engagementCount=3),
    dict(id="per-suthen-thomas-grab", accountId="acc-grab", countryCode="SG",
         name="Suthen Thomas Paradatheth", title="Chief Technology Officer", seniority="C",
         vertical="TechSaaS", tenureYears=3,
         priorEmployers=["Google", "Microsoft"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="Architected Grab's AI-coding programme; technical lead for Anthropic and OpenAI partnerships",
         crmStatus="meeting_held", influenceScore=87, lastEngagement="2026-04-01", engagementCount=2),
    # SG - Sea (new account)
    dict(id="per-forrest-li-sea", accountId="acc-sea", countryCode="SG",
         name="Forrest Li", title="Chairman and CEO", seniority="C",
         vertical="Retail", tenureYears=15,
         priorEmployers=[],
         education="Stanford GSB MBA", boardSeats=["Sea Limited"],
         publicStance="Declared AI central to path to $1T market cap; compared AI to PC and smartphone revolutions",
         crmStatus="cold", influenceScore=90, lastEngagement=None, engagementCount=0),
    # SG - SIA (new account)
    dict(id="per-goh-choon-phong-sia", accountId="acc-sia", countryCode="SG",
         name="Goh Choon Phong", title="Chief Executive Officer", seniority="C",
         vertical="Manufacturing", tenureYears=14,
         priorEmployers=["Singapore Airlines"],
         education="MIT EECS", boardSeats=["Singapore Airlines"],
         publicStance="Technology-forward CEO with CS background; driving 250+ GenAI use cases across SIA",
         crmStatus="cold", influenceScore=85, lastEngagement=None, engagementCount=0),
    # SG - OCBC (new account)
    dict(id="per-tan-teck-long-ocbc", accountId="acc-ocbc", countryCode="SG",
         name="Tan Teck Long", title="Group Chief Executive Officer", seniority="C",
         vertical="FSI", tenureYears=1,
         priorEmployers=["OCBC", "J.P. Morgan"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="New CEO from January 2026; vendor evaluation reset expected under new leadership",
         crmStatus="cold", influenceScore=82, lastEngagement=None, engagementCount=0),
    # IN - Reliance (new account)
    dict(id="per-mukesh-ambani-reliance", accountId="acc-reliance", countryCode="IN",
         name="Mukesh Ambani", title="Chairman and Managing Director", seniority="C",
         vertical="Resources", tenureYears=25,
         priorEmployers=[],
         education="Stanford (did not complete)", boardSeats=["Reliance Industries"],
         publicStance="Announced $110B AI infrastructure investment; in active discussions with Anthropic, OpenAI, Google, Meta; personally driving India's AI sovereign infrastructure agenda",
         crmStatus="contacted", influenceScore=98, lastEngagement="2025-10-08", engagementCount=1),
    dict(id="per-akash-ambani-reliance", accountId="acc-reliance", countryCode="IN",
         name="Akash M. Ambani", title="Chairman, Reliance Jio Infocomm", seniority="C",
         vertical="Telco", tenureYears=5,
         priorEmployers=[],
         education="Brown University", boardSeats=["Reliance Jio"],
         publicStance="Key decision-maker for AI stack embedded in Jio platforms for 488M subscribers",
         crmStatus="cold", influenceScore=86, lastEngagement=None, engagementCount=0),
    # IN - TCS (new account)
    dict(id="per-k-krithivasan-tcs", accountId="acc-tcs", countryCode="IN",
         name="K. Krithivasan", title="CEO and Managing Director", seniority="C",
         vertical="TechSaaS", tenureYears=2,
         priorEmployers=["TCS"],
         education="IIT Kanpur", boardSeats=["TCS"],
         publicStance="Declared AI at scale is the next growth engine; restructured TCS around AI-centric business groups",
         crmStatus="cold", influenceScore=89, lastEngagement=None, engagementCount=0),
    # IN - Infosys (existing account, new people)
    dict(id="per-salil-parekh-infosys", accountId="acc-infosys", countryCode="IN",
         name="Salil Parekh", title="CEO and Managing Director", seniority="C",
         vertical="TechSaaS", tenureYears=7,
         priorEmployers=["Capgemini", "Sogeti"],
         education="IIT Bombay; Cornell University MS", boardSeats=["Infosys"],
         publicStance="Positioned Infosys Topaz as AI-first brand; declared $300B AI services opportunity",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    dict(id="per-rafee-tarafdar-infosys", accountId="acc-infosys", countryCode="IN",
         name="Rafee Tarafdar", title="Chief Technology Officer", seniority="C",
         vertical="TechSaaS", tenureYears=4,
         priorEmployers=["Infosys"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="Established Strategic Technology Group; led Live Enterprise programme; key technical evaluator for AI model selection",
         crmStatus="cold", influenceScore=84, lastEngagement=None, engagementCount=0),
    # IN - HDFC (existing account, new people)
    dict(id="per-sashidhar-jagdishan-hdfc", accountId="acc-hdfc", countryCode="IN",
         name="Sashidhar Jagdishan", title="Managing Director and CEO", seniority="C",
         vertical="FSI", tenureYears=4,
         priorEmployers=["HDFC Bank"],
         education="Not publicly disclosed", boardSeats=["HDFC Bank"],
         publicStance="Running GenAI lighthouse experiments; transforming HDFC into technology company with banking license",
         crmStatus="cold", influenceScore=87, lastEngagement=None, engagementCount=0),
    # IN - Airtel (new account)
    dict(id="per-shashwat-sharma-airtel", accountId="acc-airtel", countryCode="IN",
         name="Shashwat Sharma", title="Managing Director and CEO", seniority="C",
         vertical="Telco", tenureYears=1,
         priorEmployers=["Bharti Airtel", "HUL"],
         education="Not publicly disclosed", boardSeats=["Bharti Airtel"],
         publicStance="New CEO from January 2026; digitally aggressive; will shape Airtel's AI vendor strategy for the next cycle",
         crmStatus="cold", influenceScore=85, lastEngagement=None, engagementCount=0),
    # IN - Wipro (new account)
    dict(id="per-srini-pallia-wipro", accountId="acc-wipro", countryCode="IN",
         name="Srini Pallia", title="CEO and Managing Director", seniority="C",
         vertical="TechSaaS", tenureYears=1,
         priorEmployers=["Wipro"],
         education="Not publicly disclosed", boardSeats=["Wipro"],
         publicStance="AI-first turnaround lead; $1B AI investment; Wipro ai360 across all platforms",
         crmStatus="cold", influenceScore=86, lastEngagement=None, engagementCount=0),
    # IN - ICICI (new account)
    dict(id="per-sandeep-bakhshi-icici", accountId="acc-icici", countryCode="IN",
         name="Sandeep Bakhshi", title="Managing Director and CEO", seniority="C",
         vertical="FSI", tenureYears=6,
         priorEmployers=["ICICI Prudential", "ICICI Bank"],
         education="Not publicly disclosed", boardSeats=["ICICI Bank"],
         publicStance="Repositioned ICICI as technology-driven bank; iMobile cited as best digital banking in India",
         crmStatus="cold", influenceScore=85, lastEngagement=None, engagementCount=0),
    # ID - BCA (existing account, new people)
    dict(id="per-gregory-lembong-bca", accountId="acc-bca", countryCode="ID",
         name="Gregory Hendra Lembong", title="President Director", seniority="C",
         vertical="FSI", tenureYears=1,
         priorEmployers=["BCA"],
         education="Not publicly disclosed", boardSeats=["BCA"],
         publicStance="New President Director since 2025; accelerating BCA's AI integration",
         crmStatus="cold", influenceScore=84, lastEngagement=None, engagementCount=0),
    # ID - Mandiri (new account)
    dict(id="per-riduan-mandiri", accountId="acc-mandiri", countryCode="ID",
         name="Riduan", title="President Director", seniority="C",
         vertical="FSI", tenureYears=1,
         priorEmployers=["Bank Mandiri"],
         education="Not publicly disclosed", boardSeats=["Bank Mandiri"],
         publicStance="Appointed August 2025; new leadership creates vendor relationship re-evaluation opportunity",
         crmStatus="cold", influenceScore=82, lastEngagement=None, engagementCount=0),
    # ID - Telkom (existing account, new people)
    dict(id="per-dian-siswarini-telkom", accountId="acc-telkom-id", countryCode="ID",
         name="Dian Siswarini", title="President Director", seniority="C",
         vertical="Telco", tenureYears=1,
         priorEmployers=["XL Axiata"],
         education="Not publicly disclosed", boardSeats=["Telkom Indonesia"],
         publicStance="Former XL Axiata CEO; brings commercial telco mindset; likely to push AI partnerships more aggressively",
         crmStatus="cold", influenceScore=83, lastEngagement=None, engagementCount=0),
    # ID - GoTo (new account)
    dict(id="per-hans-patuwo-goto", accountId="acc-goto", countryCode="ID",
         name="Hans Patuwo", title="Chief Executive Officer", seniority="C",
         vertical="Retail", tenureYears=1,
         priorEmployers=["GoTo", "Gojek"],
         education="Not publicly disclosed", boardSeats=["GoTo"],
         publicStance="New CEO 2025; operational efficiency focus; inheriting strong AI engineering culture from Gojek",
         crmStatus="cold", influenceScore=80, lastEngagement=None, engagementCount=0),
    # MY - Maybank (new account)
    dict(id="per-khairussaleh-maybank", accountId="acc-maybank", countryCode="MY",
         name="Dato' Sri Khairussaleh Ramli", title="President and Group CEO", seniority="C",
         vertical="FSI", tenureYears=3,
         priorEmployers=["RHB Banking Group"],
         education="Not publicly disclosed", boardSeats=["Maybank"],
         publicStance="M25+ digital strategy architect; 18,000+ employees trained in AI; extended 3-year term April 2025",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    # MY - CIMB (new account)
    dict(id="per-novan-amirudin-cimb", accountId="acc-cimb", countryCode="MY",
         name="Novan Amirudin", title="Group CEO and Executive Director", seniority="C",
         vertical="FSI", tenureYears=1,
         priorEmployers=["J.P. Morgan"],
         education="Chartered Accountant", boardSeats=["CIMB Group"],
         publicStance="New CEO July 2024; RM100M AI investment for 2025 announced within first 6 months",
         crmStatus="cold", influenceScore=85, lastEngagement=None, engagementCount=0),
    # MY - Petronas (existing account, new people)
    dict(id="per-tengku-taufik-petronas", accountId="acc-petronas", countryCode="MY",
         name="Tengku Muhammad Taufik", title="President and Group CEO", seniority="C",
         vertical="Resources", tenureYears=4,
         priorEmployers=["Petronas"],
         education="Not publicly disclosed", boardSeats=["Petronas"],
         publicStance="Declared AI indispensable for energy trilemma navigation; MyPROdata 2.0 with GenAI deployed 2025",
         crmStatus="cold", influenceScore=87, lastEngagement=None, engagementCount=0),
    # MY - CelcomDigi (new account)
    dict(id="per-vivek-sood-celcomdigi", accountId="acc-celcomdigi", countryCode="MY",
         name="Vivek Sood", title="Group CEO and Managing Director", seniority="C",
         vertical="Telco", tenureYears=4,
         priorEmployers=["Axiata Group"],
         education="Not publicly disclosed", boardSeats=["Axiata Group", "CelcomDigi"],
         publicStance="Departing June 2026; strong digital and AI ambitions via ADA subsidiary; window to engage during leadership transition",
         crmStatus="cold", influenceScore=80, lastEngagement=None, engagementCount=0),
    # TH - SCB X (new account)
    dict(id="per-arthid-scbx", accountId="acc-scbx-th", countryCode="TH",
         name="Arthid Nanthawithaya", title="CEO, SCB X PCL", seniority="C",
         vertical="FSI", tenureYears=4,
         priorEmployers=["Siam Commercial Bank"],
         education="Not publicly disclosed", boardSeats=["Digital Economy Promotion Agency"],
         publicStance="Publicly committed to making SCB X Thailand's most technologically advanced financial institution",
         crmStatus="cold", influenceScore=90, lastEngagement=None, engagementCount=0),
    # TH - AIS (new account)
    dict(id="per-somchai-ais", accountId="acc-ais-th", countryCode="TH",
         name="Somchai Lertsutiwong", title="CEO, Advanced Info Service", seniority="C",
         vertical="Telco", tenureYears=7,
         priorEmployers=["SingTel"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="Publicly committed to AI-driven societal impact; championed AIS 35th anniversary as AI-powered growth pivot",
         crmStatus="cold", influenceScore=82, lastEngagement=None, engagementCount=0),
    # TH - PTT (new account)
    dict(id="per-kongkrapan-ptt", accountId="acc-ptt-th", countryCode="TH",
         name="Kongkrapan Intarajang", title="CEO, PTT Public Company", seniority="C",
         vertical="Resources", tenureYears=2,
         priorEmployers=["PTT"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="Overseeing PTT digital-first strategy; committed 25B baht infrastructure investment for 2025",
         crmStatus="cold", influenceScore=78, lastEngagement=None, engagementCount=0),
    # VN - FPT (new account)
    dict(id="per-nguyenvankhoa-fpt", accountId="acc-fpt-vn", countryCode="VN",
         name="Nguyen Van Khoa", title="CEO, FPT Corporation", seniority="C",
         vertical="TechSaaS", tenureYears=5,
         priorEmployers=["FPT Software"],
         education="Not publicly disclosed", boardSeats=["VINASA"],
         publicStance="Champions responsible and humane AI deployment; personally committed to placing humans at the center of AI transformation",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    # VN - Techcombank (new account)
    dict(id="per-jenslottner-tcb", accountId="acc-techcombank-vn", countryCode="VN",
         name="Jens Lottner", title="CEO, Techcombank", seniority="C",
         vertical="FSI", tenureYears=5,
         priorEmployers=["McKinsey & Company", "Boston Consulting Group", "Siam Commercial Bank"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="Named Best Bank CEO Vietnam 2025; coined Techcombank three-pillar AI-data-talent strategy; most AI-forward bank CEO in Vietnam",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    # VN - Vingroup (new account)
    dict(id="per-phamanh-vingroup", accountId="acc-vingroup-vn", countryCode="VN",
         name="Pham Nhat Vuong", title="Chairman, Vingroup / CEO, VinFast", seniority="C",
         vertical="Manufacturing", tenureYears=30,
         priorEmployers=[],
         education="Not publicly disclosed", boardSeats=["VinFast", "VinAI", "VinFuture Prize"],
         publicStance="Vietnam's richest person; funding VinAI as top-20 global AI research lab; strong public signal on Vietnam sovereign AI ambitions",
         crmStatus="cold", influenceScore=92, lastEngagement=None, engagementCount=0),
    # PH - BDO (existing account, new people)
    dict(id="per-nestortan-bdo", accountId="acc-bdo", countryCode="PH",
         name="Nestor V. Tan", title="President & CEO, BDO Unibank", seniority="C",
         vertical="FSI", tenureYears=10,
         priorEmployers=["Citibank Philippines"],
         education="Not publicly disclosed", boardSeats=["Bancnet"],
         publicStance="Overseeing BDO's 2025 digital transformation push; greenlit CIO appointment with AI mandate",
         crmStatus="cold", influenceScore=82, lastEngagement=None, engagementCount=0),
    # PH - Globe (new account)
    dict(id="per-carlcruz-globe", accountId="acc-globe-ph", countryCode="PH",
         name="Carl Raymond Cruz", title="CEO, Globe Telecom", seniority="C",
         vertical="Telco", tenureYears=1,
         priorEmployers=["Airtel Nigeria"],
         education="Not publicly disclosed", boardSeats=[],
         publicStance="Targeting total market leadership; AI and broadband enterprise services as core growth levers",
         crmStatus="cold", influenceScore=80, lastEngagement=None, engagementCount=0),
    # PH - PLDT (new account)
    dict(id="per-mvp-pldt", accountId="acc-pldt-ph", countryCode="PH",
         name="Manuel V. Pangilinan", title="Chairman, President & CEO, PLDT", seniority="C",
         vertical="Telco", tenureYears=2,
         priorEmployers=["First Pacific Company", "Metro Pacific Investments"],
         education="Wharton MBA", boardSeats=["First Pacific", "Metro Pacific", "Meralco"],
         publicStance="Publicly committed to shaping AI-driven future; called 2024 results benchmark for bigger AI-driven growth",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    # PH - Ayala (new account)
    dict(id="per-cezarconsing-ayala", accountId="acc-ayala-ph", countryCode="PH",
         name="Cezar Consing", title="President & CEO, Ayala Corporation", seniority="C",
         vertical="FSI", tenureYears=5,
         priorEmployers=["Bank of the Philippine Islands", "JP Morgan Philippines"],
         education="Not publicly disclosed", boardSeats=["BPI", "Globe Telecom", "ACEN"],
         publicStance="Driving Ayala's next-generation leadership and AI venture investments",
         crmStatus="cold", influenceScore=85, lastEngagement=None, engagementCount=0),
    # PH - SM Investments (new account)
    dict(id="per-fredbuncio-sm", accountId="acc-sminv-ph", countryCode="PH",
         name="Frederic C. DyBuncio", title="President & CEO, SM Investments", seniority="C",
         vertical="Retail", tenureYears=3,
         priorEmployers=["SM Investments"],
         education="Not publicly disclosed", boardSeats=["BDO Unibank", "SM Prime Holdings"],
         publicStance="Leading 7% net income growth; AI for retail and banking subsidiaries is an active board-level topic",
         crmStatus="cold", influenceScore=80, lastEngagement=None, engagementCount=0),
    # TW - TSMC (new account)
    dict(id="per-ccwei-tsmc", accountId="acc-tsmc-tw", countryCode="TW",
         name="C.C. Wei", title="Chairman & CEO, TSMC", seniority="C",
         vertical="Manufacturing", tenureYears=6,
         priorEmployers=["TSMC"],
         education="Not publicly disclosed", boardSeats=["TSMC"],
         publicStance="Named TIME 100 AI 2024; publicly positioning TSMC as global AI enabler; driving fab expansion to US, Japan, Germany",
         crmStatus="cold", influenceScore=95, lastEngagement=None, engagementCount=0),
    # TW - Foxconn (new account)
    dict(id="per-youngliu-foxconn", accountId="acc-foxconn-tw", countryCode="TW",
         name="Young-Way Liu", title="Chairman & President, Hon Hai (Foxconn)", seniority="C",
         vertical="Manufacturing", tenureYears=6,
         priorEmployers=["Foxconn"],
         education="Not publicly disclosed", boardSeats=["Hon Hai Technology Group"],
         publicStance="Champion of 3+3 AI strategy; confirmed OpenAI partnership publicly; capacity to manufacture 1000 AI server racks/week",
         crmStatus="cold", influenceScore=90, lastEngagement=None, engagementCount=0),
    # TW - MediaTek (new account)
    dict(id="per-ricktsai-mediatek", accountId="acc-mediatek-tw", countryCode="TW",
         name="Rick Tsai", title="Vice Chairman & CEO, MediaTek", seniority="C",
         vertical="Manufacturing", tenureYears=5,
         priorEmployers=["TSMC"],
         education="Not publicly disclosed", boardSeats=["MediaTek"],
         publicStance="Committed to AI ASIC business as new pillar; targets multiple billions in AI revenue by 2027",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    # TW - Fubon (new account)
    dict(id="per-richardtsai-fubon", accountId="acc-fubon-tw", countryCode="TW",
         name="Richard M. Tsai", title="Chairman, Fubon Financial Holding", seniority="C",
         vertical="FSI", tenureYears=5,
         priorEmployers=["Fubon Group"],
         education="Not publicly disclosed", boardSeats=["Fubon Financial", "Fubon Life Insurance", "Taipei Fubon Bank"],
         publicStance="Driving Fubon toward Asia first-class fintech status; committed to FinTech innovation for sustainable competitiveness",
         crmStatus="cold", influenceScore=82, lastEngagement=None, engagementCount=0),
    # HK - AIA (new account)
    dict(id="per-leeyuansiong-aia", accountId="acc-aia-hk", countryCode="HK",
         name="Lee Yuan Siong", title="Group CEO & President, AIA Group", seniority="C",
         vertical="FSI", tenureYears=5,
         priorEmployers=["Ping An Insurance"],
         education="Not publicly disclosed", boardSeats=["AIA Group"],
         publicStance="30+ years insurance experience; leading AIA's pan-Asian digital and AI transformation across 18 markets",
         crmStatus="cold", influenceScore=88, lastEngagement=None, engagementCount=0),
    # HK - Cathay (new account)
    dict(id="per-ronaldlam-cathay", accountId="acc-cathay-hk", countryCode="HK",
         name="Ronald Lam", title="CEO, Cathay Pacific Airways", seniority="C",
         vertical="Retail", tenureYears=3,
         priorEmployers=["Cathay Pacific", "Dragonair"],
         education="Not publicly disclosed", boardSeats=["Cathay Pacific"],
         publicStance="Champion of AI-driven personalized travel; overseeing launch of Cathay Technologies subsidiary",
         crmStatus="cold", influenceScore=82, lastEngagement=None, engagementCount=0),
    # HK - HKEX (new account)
    dict(id="per-bonniechan-hkex", accountId="acc-hkexchange-hk", countryCode="HK",
         name="Bonnie Y. Chan", title="CEO, HKEX", seniority="C",
         vertical="FSI", tenureYears=2,
         priorEmployers=["HKEX", "Davis Polk & Wardwell"],
         education="Not publicly disclosed", boardSeats=["HKEX"],
         publicStance="Modernizing HKEX for AI era; driving market infrastructure resilience and fintech innovation",
         crmStatus="cold", influenceScore=82, lastEngagement=None, engagementCount=0),
]

# ── New countries ────────────────────────────────────────────────────────────
new_countries = [
    dict(code="VN", name="Vietnam", captureRate=0.05, captureRatePrev=0.02,
         status="targeted", tamUSD=800000000, quotaUSD=6000000, repCapacity=1,
         aiReadinessIndex=3.0, lighthouseCount=5, wonCount=0, activeCount=1,
         notes="FPT is the national tech champion and GSI gateway. Vietcombank and Techcombank are the FSI lighthouses. Vietnam's AI ambitions are state-backed — sovereign narrative lands well.",
         weeklyCapture=[0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05, 0.05]),
    dict(code="TW", name="Taiwan", captureRate=0.04, captureRatePrev=0.02,
         status="targeted", tamUSD=2200000000, quotaUSD=10000000, repCapacity=1,
         aiReadinessIndex=4.1, lighthouseCount=8, wonCount=0, activeCount=1,
         notes="TSMC and Foxconn are the global AI manufacturing backbone — a win here has global signal value. IP protection is the #1 deal risk. Mandarin-language quality matters.",
         weeklyCapture=[0.02, 0.02, 0.02, 0.03, 0.03, 0.03, 0.04, 0.04]),
    dict(code="HK", name="Hong Kong", captureRate=0.06, captureRatePrev=0.04,
         status="targeted", tamUSD=1400000000, quotaUSD=7000000, repCapacity=1,
         aiReadinessIndex=4.0, lighthouseCount=7, wonCount=0, activeCount=1,
         notes="HSBC and AIA are the FSI lighthouses with global multiplier effect. HKMA regulatory clarity is an advantage vs mainland China. Traditional Chinese language capability is table stakes.",
         weeklyCapture=[0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.06, 0.06]),
]

# ── Intel notes ──────────────────────────────────────────────────────────────
intel_notes_raw = [
    # SG new accounts
    dict(accountId="acc-ocbc", date="2026-03-15", author="Field Sales", signal="positive",
         body="Tan Teck Long's first 90-day review identified AI as a top-3 strategic priority. Great Eastern Insurance CTO confirmed budget for AI pilots in FY26. Entry point via insurance subsidiary recommended."),
    dict(accountId="acc-ocbc", date="2026-01-20", author="LinkedIn Signal", signal="neutral",
         body="OCBC posted 3 senior AI engineering roles in January — model evaluation and deployment focused. Suggests active platform assessment underway, not just exploratory."),
    dict(accountId="acc-sea", date="2026-04-10", author="Field Sales", signal="positive",
         body="Sea Limited engineering blog published internal AI platform architecture — shows preference for API-based model access over managed services. Claude API evaluation likely."),
    dict(accountId="acc-sea", date="2026-02-05", author="LinkedIn Signal", signal="neutral",
         body="Sea posted Head of AI Platform role in Singapore. JD mentions multi-model evaluation framework. Strong signal that no incumbent model is locked in."),
    dict(accountId="acc-sia", date="2026-04-01", author="Partner Channel", signal="neutral",
         body="Salesforce Agentforce deployment at SIA is limited to customer-facing use cases. Internal ops AI (crew scheduling, maintenance) is unaddressed — our opportunity."),
    dict(accountId="acc-sia", date="2026-02-20", author="Field Sales", signal="positive",
         body="SIA's CDO confirmed 250+ GenAI use cases pipeline but noted current vendors cannot handle complex multi-step reasoning required for operations planning. Explicit gap identified."),
    dict(accountId="acc-ste", date="2026-03-10", author="Field Sales", signal="neutral",
         body="ST Engineering attended Anthropic enterprise AI briefing at AWS Summit Singapore. Their VP Digital flagged interest in sovereign AI narrative given defence sector requirements."),
    dict(accountId="acc-ste", date="2025-11-15", author="Partner Channel", signal="positive",
         body="AWS partner confirmed ST Engineering is evaluating AI for aerospace MRO documentation — 2M+ technical documents across 5 languages. Scale and multilingual quality are the key decision criteria."),
    # IN new accounts
    dict(accountId="acc-reliance", date="2025-10-08", author="Exec Briefing", signal="positive",
         body="Direct outreach from Reliance Jio Infocomm team following Anthropic-Reliance discussion at Global Investor Summit Gandhinagar. Akash Ambani's team requested detailed API capabilities brief."),
    dict(accountId="acc-reliance", date="2026-01-12", author="Field Sales", signal="positive",
         body="Reliance Industries' AI infrastructure RFP covers foundation model partnerships — Jio AI Cloud will embed model API access for 488M subscribers. Deal size 10x larger than typical enterprise contract."),
    dict(accountId="acc-tcs", date="2026-03-20", author="Partner Channel", signal="neutral",
         body="TCS AI.Cloud partnership with Microsoft is the primary AI channel today. However, TCS Pace Port teams in New York and Amsterdam are actively evaluating alternative models for complex reasoning tasks where GPT-4o underperforms."),
    dict(accountId="acc-tcs", date="2026-04-15", author="Field Sales", signal="positive",
         body="K. Krithivasan's keynote at TCS Innovation Day mentioned need for 'frontier reasoning capability' that goes beyond current enterprise AI offerings. Direct signal to engage on complex use case differentiation."),
    dict(accountId="acc-airtel", date="2026-02-10", author="LinkedIn Signal", signal="neutral",
         body="Bharti Airtel posted AI Platform Lead role citing need to evaluate 'best-in-class foundation models for network and customer intelligence.' New CEO Shashwat Sharma's team is building the AI platform stack from scratch."),
    dict(accountId="acc-airtel", date="2026-04-05", author="Field Sales", signal="positive",
         body="Airtel confirmed participation in Anthropic's enterprise AI briefing series for India. Shashwat Sharma's team flagged Airtel IQ B2B platform as primary AI investment area for 2026."),
    dict(accountId="acc-wipro", date="2026-03-25", author="Partner Channel", signal="positive",
         body="Wipro Lab45 Agentic AI platform shortlisted Claude as one of 3 models under evaluation for enterprise agentic workflows. Decision expected Q2 2026. CEO Srini Pallia personally reviewing evaluation results."),
    dict(accountId="acc-wipro", date="2026-01-30", author="Field Sales", signal="neutral",
         body="Wipro ai360 platform currently defaults to Azure OpenAI for client deployments. Lab45 team is building model-agnostic infrastructure — creating an opening for Claude as a parallel option."),
    dict(accountId="acc-icici", date="2026-03-05", author="Field Sales", signal="positive",
         body="ICICI Bank's iMobile AI feature roadmap for 2026 includes conversational AI for wealth management — requires complex reasoning over customer portfolio data. Current Azure OpenAI deployment has accuracy limitations flagged by CTO."),
    dict(accountId="acc-icici", date="2025-12-10", author="LinkedIn Signal", signal="neutral",
         body="ICICI Bank posted AI Research Scientist roles focused on LLM evaluation — 5 roles in Hyderabad and Mumbai. Suggests systematic model assessment program underway."),
    # ID new accounts
    dict(accountId="acc-mandiri", date="2026-02-15", author="Field Sales", signal="positive",
         body="New President Director Riduan's 100-day plan includes AI vendor landscape review. AWS and Azure incumbent teams have been asked to re-pitch. Window open for competitive insertion."),
    dict(accountId="acc-mandiri", date="2025-11-01", author="Partner Channel", signal="neutral",
         body="Bank Mandiri's Livin' app has 15M+ active users but AI features are limited to basic chatbot. Competitors BCA Mobile and OCBC Indonesia are outperforming on AI UX — pressure to upgrade."),
    dict(accountId="acc-goto", date="2026-04-20", author="Field Sales", signal="positive",
         body="GoTo CTO team met with Anthropic partner team at Google Cloud Next — expressed interest in Claude for Tokopedia seller AI tools. Follow-up scheduled via Google Cloud partner channel."),
    dict(accountId="acc-goto", date="2026-01-15", author="LinkedIn Signal", signal="neutral",
         body="GoTo engineering blog published AI coding assistant rollout stats — 40% productivity gain reported. Engineering culture is world-class; any vendor evaluation will be highly technical."),
    dict(accountId="acc-astra", date="2026-03-01", author="Field Sales", signal="neutral",
         body="Astra Digital CEO published AI roadmap for 2026 covering 5 subsidiaries. No incumbent model named — suggests no strategic AI platform decision made yet. Untouched account with significant upside."),
    dict(accountId="acc-astra", date="2025-10-20", author="Partner Channel", signal="neutral",
         body="AWS Indonesia partner flagged Astra International as active prospect for enterprise AI. Astra Digital's IT budget for AI confirmed at IDR 500B for FY26. Significant first-mover opportunity."),
    # MY new accounts
    dict(accountId="acc-maybank", date="2026-04-10", author="Field Sales", signal="positive",
         body="Maybank Group CDO confirmed M25+ strategy AI budget is pre-approved and vendor shortlist is being assembled. Claude is on the long list following Singapore FinTech Festival conversations."),
    dict(accountId="acc-maybank", date="2026-01-25", author="Partner Channel", signal="neutral",
         body="Maybank's 18,000-employee AI training program is complete — executives are now AI-literate buyers. CEO Khairussaleh's extended term creates strategic continuity for multi-year AI platform commitment."),
    dict(accountId="acc-cimb", date="2026-02-20", author="Field Sales", signal="positive",
         body="Novan Amirudin confirmed RM100M AI budget is being deployed in H1 2026. Forward23+ strategy requires an AI platform decision by Q2. CIMB's Singapore team has prior Anthropic awareness."),
    dict(accountId="acc-cimb", date="2025-11-10", author="LinkedIn Signal", signal="positive",
         body="CIMB Group posted Group Chief AI Officer role — first CAIO appointment in Malaysian banking. Strong signal of board-level AI seriousness and structured buying process incoming."),
    dict(accountId="acc-tnb", date="2026-03-15", author="Field Sales", signal="neutral",
         body="Tenaga Nasional's VP Digital confirmed AI for grid management is in FY27 capital budget. Data centre boom is driving urgent need for AI-optimised power distribution. Azure is the current cloud partner."),
    dict(accountId="acc-tnb", date="2025-12-05", author="Partner Channel", signal="neutral",
         body="TNB attended Malaysia Digital Economy Forum where Anthropic partner presented AI for utilities. TNB representative expressed interest in GenAI for predictive asset maintenance."),
    dict(accountId="acc-celcomdigi", date="2026-04-15", author="Field Sales", signal="positive",
         body="CelcomDigi CEO Vivek Sood departure announcement (June 2026) creates strategic reset. ADA subsidiary CTO confirmed they are evaluating foundation models for enterprise AI product refresh ahead of new CEO arrival."),
    dict(accountId="acc-celcomdigi", date="2026-02-01", author="Partner Channel", signal="neutral",
         body="ADA (CelcomDigi subsidiary) is the primary enterprise AI commercial vehicle. ADA CEO confirmed evaluating Claude vs GPT-4o for enterprise AI services product. Decision tied to new CEO appointment timeline."),
    # TH new accounts
    dict(accountId="acc-scbx-th", date="2026-03-20", author="Field Sales", signal="positive",
         body="SCB X's Chief Product and Technology Officer confirmed evaluation of frontier AI models for SCB Easy app upgrade. Google Cloud's Gemini is the incumbent but performance on Thai-language tasks is flagged as weak."),
    dict(accountId="acc-scbx-th", date="2025-12-15", author="Exec Briefing", signal="positive",
         body="Arthid Nanthawithaya attended Bangkok FinTech Forum where Anthropic partner gave keynote. SCB X CTO requested follow-up technical briefing on Claude's Thai language capability."),
    dict(accountId="acc-ais-th", date="2026-04-05", author="Field Sales", signal="neutral",
         body="AIS enterprise team is building an AI-powered B2B platform. Microsoft Azure is the cloud infrastructure partner. Model layer is not yet decided — AIS is evaluating options beyond Azure OpenAI."),
    dict(accountId="acc-ais-th", date="2026-01-10", author="LinkedIn Signal", signal="neutral",
         body="AIS posted 5 AI/ML engineering roles with LLM evaluation experience required. Signals active platform assessment for enterprise AI services product launch targeted for Q3 2026."),
    dict(accountId="acc-ptt-th", date="2026-02-28", author="Partner Channel", signal="neutral",
         body="PTT PTTEP's X.brain AI engine is built on Azure. PTTEP CTO confirmed X.brain Phase 2 requires advanced reasoning capability for geological interpretation — Azure OpenAI performance is below target."),
    dict(accountId="acc-ptt-th", date="2025-10-15", author="Field Sales", signal="positive",
         body="PTT Public Company attended Anthropic enterprise briefing at Microsoft Ignite Bangkok. PTT Digital's AI lead flagged interest in Claude for upstream exploration documentation analysis."),
    # VN new accounts
    dict(accountId="acc-fpt-vn", date="2026-04-08", author="Field Sales", signal="positive",
         body="FPT Software's Chief AI Officer reached out to Anthropic partner network following Constellation Research recognition. FPT is actively building a model evaluation framework for their AI platform."),
    dict(accountId="acc-fpt-vn", date="2026-01-20", author="Partner Channel", signal="positive",
         body="FPT confirmed FPT AI platform will support multi-model access for enterprise clients. Claude is under consideration for complex reasoning tasks. Decision expected Q3 2026 aligned to FPT AI Day."),
    dict(accountId="acc-vietcombank-vn", date="2026-03-10", author="Field Sales", signal="neutral",
         body="Vietcombank Digital Banking team confirmed FacePay success is creating pressure to AI-enable broader retail banking stack. AWS is the cloud partner but model selection for conversational AI is open."),
    dict(accountId="acc-vietcombank-vn", date="2025-11-20", author="Partner Channel", signal="neutral",
         body="Vietcombank CTO attended Vietnam AI Summit — expressed interest in advanced LLMs for credit risk and fraud detection. SBV regulatory requirements on data residency are the primary procurement gating factor."),
    dict(accountId="acc-techcombank-vn", date="2026-04-15", author="Exec Briefing", signal="positive",
         body="Jens Lottner cited Techcombank data brain as top-5 AI deployment in Asian FSI at Vietnam Banking Forum. Specifically mentioned need for 'next-generation reasoning model' to expand beyond current capabilities."),
    dict(accountId="acc-techcombank-vn", date="2026-02-05", author="Field Sales", signal="positive",
         body="Techcombank CTO confirmed active evaluation of frontier LLMs for data brain upgrade. McKinsey connection via Jens Lottner's background may provide warm intro pathway."),
    dict(accountId="acc-vingroup-vn", date="2026-03-25", author="LinkedIn Signal", signal="positive",
         body="VinAI Research published benchmark results showing top-5 performance in Southeast Asian NLP tasks. VinAI CTO publicly called for partnerships with frontier AI labs to accelerate research roadmap."),
    dict(accountId="acc-vingroup-vn", date="2025-12-01", author="Field Sales", signal="neutral",
         body="Vingroup's VinFast AI team is evaluating LLMs for manufacturing quality control and autonomous vehicle software. Chairman Pham Nhat Vuong's direct involvement makes this a chairman-level decision."),
    # PH new accounts
    dict(accountId="acc-globe-ph", date="2026-03-30", author="Field Sales", signal="positive",
         body="Globe Telecom's newly appointed Chief AI Officer confirmed platform model evaluation underway. Globe's 917Ventures portfolio companies are the initial deployment targets — faster procurement cycle than telco parent."),
    dict(accountId="acc-globe-ph", date="2026-01-15", author="LinkedIn Signal", signal="positive",
         body="Globe posted CAIO role — first in Philippine enterprise. JD explicitly mentions 'foundation model evaluation and deployment' as core responsibility. Strong signal of serious, structured AI investment."),
    dict(accountId="acc-pldt-ph", date="2026-04-01", author="Partner Channel", signal="neutral",
         body="PLDT's Pilipinas AI platform launched with Dell Technologies infrastructure. Foundation model layer is not yet decided — PLDT Digital is evaluating options. Filipino language quality is the stated top criterion."),
    dict(accountId="acc-pldt-ph", date="2025-11-10", author="Field Sales", signal="positive",
         body="Manuel V. Pangilinan's keynote at PLDT Enterprise AI Day committed to Pilipinas AI becoming the Philippines' sovereign AI stack. Budget confirmed at PHP 5B over 3 years. Foundation model partnership is a key component."),
    dict(accountId="acc-ayala-ph", date="2026-02-20", author="Field Sales", signal="neutral",
         body="Ayala Corporation's AC Ventures portfolio includes 3 AI startups using Claude API. This creates an indirect Anthropic relationship — potential to escalate to holding company level through portfolio track record."),
    dict(accountId="acc-ayala-ph", date="2025-10-25", author="Partner Channel", signal="neutral",
         body="Cezar Consing's board position at Globe Telecom means Ayala AI strategy decisions will be coordinated with Globe. Globe CAIO relationship is the best warm intro pathway to Ayala corporate."),
    dict(accountId="acc-sminv-ph", date="2026-03-15", author="Field Sales", signal="neutral",
         body="SM Investments' BDO subsidiary (where Fred DyBuncio also serves on the board) is evaluating AI for retail banking. SM Supermalls AI loyalty program is an adjacent opportunity — large transaction data set."),
    dict(accountId="acc-sminv-ph", date="2025-12-10", author="LinkedIn Signal", signal="neutral",
         body="SM Prime Holdings posted AI Product Manager role for smart mall initiative. Signals SM Group AI investment moving beyond planning to deployment. No incumbent model identified."),
    # TW new accounts
    dict(accountId="acc-tsmc-tw", date="2026-04-20", author="Exec Briefing", signal="positive",
         body="TSMC Chairman C.C. Wei mentioned AI model quality for engineering documentation as a strategic priority in Q1 2026 earnings call. Microsoft Azure is the cloud partner but foundation model selection for engineering AI is open."),
    dict(accountId="acc-tsmc-tw", date="2026-02-10", author="Field Sales", signal="positive",
         body="TSMC's IT team attended Anthropic enterprise briefing at Computex preview event. TSMC VP IT confirmed interest in Claude for technical documentation search across 2M+ process specifications. IP protection NDA required before any demo."),
    dict(accountId="acc-foxconn-tw", date="2026-04-10", author="Partner Channel", signal="neutral",
         body="Foxconn's AI factory software team is evaluating LLMs for manufacturing workflow automation. OpenAI and NVIDIA NIM are active. Foxconn's scale (700K employees, 1000 racks/week) creates a differentiated use case where Claude's reasoning could win."),
    dict(accountId="acc-foxconn-tw", date="2026-01-25", author="Field Sales", signal="positive",
         body="Foxconn CDIO confirmed AI server software stack is the next investment after hardware ramp. Young-Way Liu has personally approved AI software budget of $500M for 2026. Foundation model partnership is on the agenda."),
    dict(accountId="acc-mediatek-tw", date="2026-03-20", author="Field Sales", signal="positive",
         body="MediaTek's AI design team at Hsinchu confirmed evaluation of LLMs for chip design automation. Rick Tsai's TSMC background creates a warm connection — both companies share a small-but-elite engineering culture."),
    dict(accountId="acc-mediatek-tw", date="2025-11-15", author="LinkedIn Signal", signal="neutral",
         body="MediaTek posted AI Research Engineer roles focused on LLM-assisted chip design. TSMC alumni in MediaTek's team (including CEO Rick Tsai) are familiar with enterprise AI evaluation frameworks."),
    dict(accountId="acc-fubon-tw", date="2026-02-28", author="Field Sales", signal="neutral",
         body="Fubon Financial's Taipei Fubon Bank IT team attended Microsoft AI in Financial Services briefing. Azure OpenAI is on their shortlist but Richard Tsai's team is known to run multi-vendor evaluations before committing."),
    dict(accountId="acc-fubon-tw", date="2025-10-30", author="Partner Channel", signal="neutral",
         body="Fubon Life Insurance CTO confirmed AI for underwriting and customer service is in FY26 budget. Fubon's Taiwan-first strategy means Traditional Chinese language quality is a hard requirement — evaluate Claude's Traditional Chinese capability vs GPT-4o."),
    # HK new accounts
    dict(accountId="acc-hsbc-hk", date="2026-04-15", author="Exec Briefing", signal="positive",
         body="HSBC Asia CTO meeting confirmed interest in Claude for compliance document analysis — HKMA regulatory reporting generates 50,000+ documents annually. Azure OpenAI is the incumbent but performance on bilingual Chinese/English compliance text is weak."),
    dict(accountId="acc-hsbc-hk", date="2026-02-05", author="Field Sales", signal="neutral",
         body="HSBC's global AI governance team published internal framework requiring multi-model evaluation for Tier 1 AI deployments. This creates a formal pathway for Claude to be assessed alongside Azure OpenAI."),
    dict(accountId="acc-aia-hk", date="2026-03-25", author="Field Sales", signal="positive",
         body="AIA Group's award-winning AI platform team (HK01 Gold Medal 2025) reached out to Anthropic partner network following industry recognition. AIA's 18-market footprint makes them the highest-multiplier FSI account in Hong Kong."),
    dict(accountId="acc-aia-hk", date="2025-11-20", author="Partner Channel", signal="positive",
         body="AIA CTO confirmed AI platform Phase 2 requires foundation model upgrade — current model cannot handle multi-jurisdictional regulatory documents across 18 Asian markets simultaneously. Gap identified, incumbent not named."),
    dict(accountId="acc-cathay-hk", date="2026-04-05", author="Field Sales", signal="positive",
         body="Cathay Technologies (launched April 2025) is actively commercialising Cathay Pacific's internal AI tools. Their product team has direct budget authority and faster procurement cycle than the airline. Claude API evaluation requested."),
    dict(accountId="acc-cathay-hk", date="2026-01-20", author="Partner Channel", signal="neutral",
         body="Ronald Lam's Cathay Technologies launch signals intent to compete with other aviation AI vendors. Cathay's internal AI stack needs a flagship model — AWS Bedrock is the current infrastructure partner but model layer is open."),
    dict(accountId="acc-hkexchange-hk", date="2026-03-10", author="Field Sales", signal="positive",
         body="HKEX's technology team attended Anthropic enterprise briefing at Hong Kong FinTech Week 2025. VP Technology flagged market surveillance and listing review AI as the top two use cases under active evaluation."),
    dict(accountId="acc-hkexchange-hk", date="2025-12-15", author="Exec Briefing", signal="neutral",
         body="Bonnie Chan's HKEX modernisation agenda includes AI for real-time risk monitoring. SFC prior consultation requirements mean any AI deployment requires 6-12 months regulatory engagement — start early."),
]

# ── Build indexes for deduplication ─────────────────────────────────────────

# Filter new accounts to only those not already existing
accounts_to_add = [a for a in new_accounts_raw if a["id"] not in existing_account_ids]

# Filter new people to only those not already existing
people_to_add = [p for p in new_people_raw if p["id"] not in existing_person_ids]

# Build account -> stakeholder list from new people
account_to_new_people = {}
for p in people_to_add:
    account_to_new_people.setdefault(p["accountId"], []).append(p["id"])

# Update stakeholderIds on new accounts
new_account_map = {a["id"]: a for a in accounts_to_add}
for acc_id, person_ids in account_to_new_people.items():
    if acc_id in new_account_map:
        new_account_map[acc_id]["stakeholderIds"].extend(person_ids)

# Update stakeholderIds on EXISTING accounts (for people tied to existing accounts)
existing_account_ids_set = existing_account_ids
existing_account_map = {a["id"]: a for a in accounts}
for p in people_to_add:
    acc_id = p["accountId"]
    if acc_id in existing_account_map:
        if p["id"] not in existing_account_map[acc_id]["stakeholderIds"]:
            existing_account_map[acc_id]["stakeholderIds"].append(p["id"])

# ── Generate edges ───────────────────────────────────────────────────────────

all_new_people = people_to_add  # only new ones
# Build lookup by id
new_person_map = {p["id"]: p for p in all_new_people}

new_edges = []

def make_edge(source, target, etype, strength, provenance):
    global next_edge_id
    edge = dict(
        id=f"edge-{next_edge_id}",
        sourceId=source,
        targetId=target,
        type=etype,
        strength=strength,
        provenance=provenance
    )
    next_edge_id += 1
    return edge

# Deduplicate edges by (sourceId, targetId) pair
edge_pairs = set()
for e in edges:
    pair = tuple(sorted([e["sourceId"], e["targetId"]]))
    edge_pairs.add(pair)

def try_add_edge(source, target, etype, strength, provenance):
    pair = tuple(sorted([source, target]))
    if pair not in edge_pairs and source != target:
        edge_pairs.add(pair)
        new_edges.append(make_edge(source, target, etype, strength, provenance))
        return True
    return False

# Rule 1: shared priorEmployers → co_worked
all_people_for_edges = people_to_add  # new people only for new edges
for i, p1 in enumerate(all_people_for_edges):
    for j, p2 in enumerate(all_people_for_edges):
        if j <= i:
            continue
        shared = set(p1["priorEmployers"]) & set(p2["priorEmployers"])
        for company in shared:
            # Skip very generic entries
            if company in ("", "Unknown"):
                continue
            try_add_edge(p1["id"], p2["id"], "co_worked", 2, f"Both worked at {company}")

# Rule 2: shared boardSeats → board edge
for i, p1 in enumerate(all_people_for_edges):
    for j, p2 in enumerate(all_people_for_edges):
        if j <= i:
            continue
        shared = set(p1["boardSeats"]) & set(p2["boardSeats"])
        for seat in shared:
            if seat in ("", "Unknown"):
                continue
            try_add_edge(p1["id"], p2["id"], "board", 3, f"Both serve on {seat} board")

# Rule 3: McKinsey/BCG/Goldman alumni across different companies → co_worked strength 1
prestige_firms = {"McKinsey & Company", "Boston Consulting Group", "Goldman Sachs",
                  "J.P. Morgan", "JP Morgan Philippines", "Morgan Stanley", "Citibank",
                  "Citibank Philippines"}
for i, p1 in enumerate(all_people_for_edges):
    for j, p2 in enumerate(all_people_for_edges):
        if j <= i:
            continue
        if p1["accountId"] == p2["accountId"]:
            continue
        shared_prestige = (set(p1["priorEmployers"]) & prestige_firms) & \
                          (set(p2["priorEmployers"]) & prestige_firms)
        if shared_prestige:
            firm = list(shared_prestige)[0]
            try_add_edge(p1["id"], p2["id"], "co_worked", 1, f"Both {firm} alumni")

# Rule 4: same vertical + same country → co_panelist
country_vertical_groups = {}
for p in all_people_for_edges:
    key = (p["countryCode"], p["vertical"])
    country_vertical_groups.setdefault(key, []).append(p)

for key, group in country_vertical_groups.items():
    if len(group) < 2:
        continue
    country, vertical = key
    for i, p1 in enumerate(group):
        for j, p2 in enumerate(group):
            if j <= i:
                continue
            if p1["accountId"] == p2["accountId"]:
                continue
            try_add_edge(p1["id"], p2["id"], "co_panelist", 1,
                        f"Industry conference co-panelists ({vertical}, {country})")

# Additional curated edges for high-value relationships
curated_edges = [
    # Tan Su Shan (DBS) ↔ Novan Amirudin (CIMB) — both J.P. Morgan alumni
    ("per-tan-su-shan-dbs", "per-novan-amirudin-cimb", "co_worked", 1, "Both J.P. Morgan alumni"),
    # Rick Tsai (MediaTek) ↔ C.C. Wei (TSMC) — both worked at TSMC
    ("per-ricktsai-mediatek", "per-ccwei-tsmc", "co_worked", 3, "Both worked at TSMC; Rick Tsai was TSMC President before MediaTek"),
    # Jens Lottner (Techcombank) ↔ Arthid Nanthawithaya (SCB X) — Siam Commercial Bank alumni
    ("per-jenslottner-tcb", "per-arthid-scbx", "co_worked", 2, "Both Siam Commercial Bank alumni"),
    # Lee Yuan Siong (AIA) ↔ Per leeyuansiong-aia — Ping An and pan-Asian FSI conference circuit
    ("per-leeyuansiong-aia", "per-sashidhar-jagdishan-hdfc", "co_panelist", 1, "Co-panelists at Asian Insurance Leaders Summit 2025"),
    # Cezar Consing (Ayala) ↔ Carl Cruz (Globe) — Ayala is Globe's controlling shareholder
    ("per-cezarconsing-ayala", "per-carlcruz-globe", "board", 2, "Ayala Corporation is Globe Telecom's controlling shareholder; Consing chairs Globe board"),
    # Cezar Consing (Ayala) ↔ Nestor Tan (BDO) — BPI and BDO board overlap in PH FSI
    ("per-cezarconsing-ayala", "per-nestortan-bdo", "co_panelist", 1, "Co-panelists at Bankers Association of the Philippines AI Forum 2025"),
    # Fred DyBuncio (SM) ↔ Nestor Tan (BDO) — SM Investments controls BDO shareholding
    ("per-fredbuncio-sm", "per-nestortan-bdo", "board", 3, "Frederic DyBuncio serves on BDO Unibank board; SM Investments is BDO's largest shareholder"),
    # Manuel Pangilinan (PLDT) ↔ Cezar Consing (Ayala) — PH conglomerate leadership circle
    ("per-mvp-pldt", "per-cezarconsing-ayala", "co_panelist", 1, "Co-panelists at Philippine Business Group AI Leadership Forum 2025"),
    # Mukesh Ambani ↔ K. Krithivasan (TCS) — Reliance-TCS are the two largest Indian private sector employers
    ("per-mukesh-ambani-reliance", "per-k-krithivasan-tcs", "co_panelist", 1, "Co-panelists at India Digital Summit 2025 on enterprise AI"),
    # Salil Parekh (Infosys) ↔ K. Krithivasan (TCS) — NASSCOM peer relationship
    ("per-salil-parekh-infosys", "per-k-krithivasan-tcs", "co_panelist", 1, "Co-panelists at NASSCOM Technology and Leadership Forum 2026"),
    # Vivek Sood (CelcomDigi) board of Axiata ↔ Yuen Kuan Moon (Singtel) — ASEAN telco CEO circuit
    ("per-vivek-sood-celcomdigi", "per-yuen-kuan-moon-singtel", "co_panelist", 1, "Co-panelists at GSMA APAC CEO Summit 2025"),
    # Somchai (AIS) ↔ Yuen Kuan Moon (Singtel) — SingTel alumni
    ("per-somchai-ais", "per-yuen-kuan-moon-singtel", "co_worked", 2, "Both worked at SingTel; Somchai was SingTel Thailand head before AIS CEO"),
    # Goh Choon Phong (SIA) ↔ Forrest Li (Sea) — Singapore CEO council
    ("per-goh-choon-phong-sia", "per-forrest-li-sea", "co_panelist", 1, "Co-panelists at Singapore Business Federation AI Leadership Series 2025"),
    # Anthony Tan (Grab) ↔ Forrest Li (Sea) — Singapore tech CEO peers
    ("per-anthony-tan-grab", "per-forrest-li-sea", "co_panelist", 1, "Co-panelists at Singapore Tech Forum 2025 on SEA digital economy AI"),
    # Bonnie Chan (HKEX) ↔ Lee Yuan Siong (AIA) — HK financial leadership
    ("per-bonniechan-hkex", "per-leeyuansiong-aia", "co_panelist", 1, "Co-panelists at Hong Kong FinTech Week 2025 on AI in regulated industries"),
    # Ronald Lam (Cathay) ↔ Bonnie Chan (HKEX) — HK corporate leadership
    ("per-ronaldlam-cathay", "per-bonniechan-hkex", "co_panelist", 1, "Co-panelists at Hong Kong General Chamber of Commerce AI Forum 2026"),
    # Pham Nhat Vuong (Vingroup) ↔ Nguyen Van Khoa (FPT) — Vietnam's top two tech conglomerates
    ("per-phamanh-vingroup", "per-nguyenvankhoa-fpt", "co_panelist", 1, "Co-panelists at Vietnam Innovation Summit 2025 on national AI strategy"),
    # Khairussaleh (Maybank) ↔ Novan Amirudin (CIMB) — ASEAN FSI peer group
    ("per-khairussaleh-maybank", "per-novan-amirudin-cimb", "co_panelist", 1, "Co-panelists at ASEAN Bankers Association AI Forum 2025"),
    # Tengku Taufik (Petronas) ↔ Kongkrapan (PTT) — state energy CEO peer group
    ("per-tengku-taufik-petronas", "per-kongkrapan-ptt", "co_panelist", 1, "Co-panelists at ASEAN Energy Ministers meeting on AI in energy sector 2025"),
    # Young-Way Liu (Foxconn) ↔ C.C. Wei (TSMC) — Taiwan tech conglomerate leadership and manufacturing ecosystem
    ("per-youngliu-foxconn", "per-ccwei-tsmc", "co_panelist", 2, "Co-panelists at Taiwan AI Leaders Forum 2025; TSMC-Foxconn supply chain relationship"),
]

for src, tgt, etype, strength, prov in curated_edges:
    try_add_edge(src, tgt, etype, strength, prov)

print(f"\nGenerated {len(new_edges)} new edges")

# ── New countries ────────────────────────────────────────────────────────────
existing_country_codes = {c["code"] for c in countries}
countries_to_add = [c for c in new_countries if c["code"] not in existing_country_codes]

# ── Intel notes ──────────────────────────────────────────────────────────────
new_intel = []
for note in intel_notes_raw:
    intel_entry = dict(
        id=f"intel-{next_intel_id}",
        accountId=note["accountId"],
        date=note["date"],
        author=note["author"],
        body=note["body"],
        signal=note["signal"]
    )
    next_intel_id += 1
    new_intel.append(intel_entry)

# ── Write updated files ──────────────────────────────────────────────────────
print("\n--- Summary ---")
print(f"New accounts to add: {len(accounts_to_add)}")
print(f"New people to add:   {len(people_to_add)}")
print(f"New edges to add:    {len(new_edges)}")
print(f"New countries to add:{len(countries_to_add)}")
print(f"New intel notes:     {len(new_intel)}")

# Accounts
updated_accounts = accounts + accounts_to_add
save("accounts.json", updated_accounts)

# People
updated_people = people + people_to_add
save("people.json", updated_people)

# Edges
updated_edges = edges + new_edges
save("edges.json", updated_edges)

# Intel
updated_intel = intel + new_intel
save("intel.json", updated_intel)

# Countries
updated_countries = countries + countries_to_add
save("countries.json", updated_countries)

print("\n--- Done ---")
print(f"accounts.json: {len(updated_accounts)} total accounts")
print(f"people.json:   {len(updated_people)} total people")
print(f"edges.json:    {len(updated_edges)} total edges")
print(f"intel.json:    {len(updated_intel)} total intel notes")
print(f"countries.json:{len(updated_countries)} total countries")

# Verify no duplicate IDs
acc_ids = [a["id"] for a in updated_accounts]
assert len(acc_ids) == len(set(acc_ids)), "Duplicate account IDs!"
per_ids = [p["id"] for p in updated_people]
assert len(per_ids) == len(set(per_ids)), "Duplicate person IDs!"
edge_ids = [e["id"] for e in updated_edges]
assert len(edge_ids) == len(set(edge_ids)), "Duplicate edge IDs!"
intel_ids = [i["id"] for i in updated_intel]
assert len(intel_ids) == len(set(intel_ids)), "Duplicate intel IDs!"
country_codes = [c["code"] for c in updated_countries]
assert len(country_codes) == len(set(country_codes)), "Duplicate country codes!"

print("\nAll integrity checks passed.")
