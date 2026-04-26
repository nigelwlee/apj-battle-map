#!/usr/bin/env python3
"""Merge JP/KR/AU/NZ research data into existing app data files."""

import json
import random
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

def load(name):
    with open(DATA_DIR / f"{name}.json") as f:
        return json.load(f)

def save(name, data):
    with open(DATA_DIR / f"{name}.json", "w") as f:
        json.dump(data, f, indent=2)
    print(f"  Saved {name}.json ({len(data)} records)")

# ── Load existing data ────────────────────────────────────────────────────────
accounts = load("accounts")
people = load("people")
edges = load("edges")
intel = load("intel")

existing_account_ids = {a["id"] for a in accounts}
existing_people_names = {p["name"].lower() for p in people}
existing_edge_pairs = {(e["sourceId"], e["targetId"]) for e in edges}
next_edge_id = len(edges) + 1

# ── Helper ────────────────────────────────────────────────────────────────────
def add_edge(source, target, label, strength=2):
    global next_edge_id
    pair = (source, target)
    pair_r = (target, source)
    if pair not in existing_edge_pairs and pair_r not in existing_edge_pairs:
        edges.append({"id": f"edge-{next_edge_id}", "sourceId": source, "targetId": target, "type": label.replace("-", "_"), "strength": strength, "provenance": label})
        existing_edge_pairs.add(pair)
        next_edge_id += 1

def add_account(acc):
    if acc["id"] not in existing_account_ids:
        accounts.append(acc)
        existing_account_ids.add(acc["id"])
        print(f"    + account: {acc['id']} ({acc['name']})")
        return True
    else:
        # Update status if provided
        for a in accounts:
            if a["id"] == acc["id"]:
                if acc.get("status"):
                    a["status"] = acc["status"]
        return False

def add_person(person):
    if person["name"].lower() not in existing_people_names:
        people.append(person)
        existing_people_names.add(person["name"].lower())
        print(f"    + person: {person['name']}")
        return True
    else:
        # Return the existing person's id
        for p in people:
            if p["name"].lower() == person["name"].lower():
                # Update CRM status if we have a better one
                if person.get("crmStatus") in ("champion", "meeting_held"):
                    p["crmStatus"] = person["crmStatus"]
                return False
    return False

def person_id(name):
    for p in people:
        if p["name"].lower() == name.lower():
            return p["id"]
    return None

# ── Update existing accounts with correct status ──────────────────────────────
print("\n[1] Updating existing account statuses...")
for a in accounts:
    if a["id"] == "acc-commonwealth-bank":
        a["status"] = "won"
        a["name"] = "Commonwealth Bank of Australia"
        print("    Updated acc-commonwealth-bank → won")
    elif a["id"] == "acc-softbank":
        a["status"] = "active"
        print("    Updated acc-softbank → active (upgrade from competitor)")

# ── JAPAN new accounts ────────────────────────────────────────────────────────
print("\n[2] Adding Japan accounts...")

jp_accounts = [
    {
        "id": "acc-mufg",
        "name": "Mitsubishi UFJ Financial Group",
        "countryCode": "JP",
        "vertical": "FSI",
        "size": "GlobalEnterprise",
        "status": "active",
        "isLighthouse": True,
        "rank": 1,
        "acvPotential": 8000000,
        "targetClose": "2026-09-30",
        "tamUSD": 4200000000,
        "revenue": "$16.8B",
        "employees": 170000,
        "aiMaturity": 3,
        "incumbent": "Microsoft Azure OpenAI",
        "notes": "Largest bank in Japan by assets. MUFG Digital Transformation Lab actively piloting GenAI for risk analytics and client advisory. CFO publicly committed to AI-driven efficiency target of ¥200B cost reduction by 2027.",
        "lighthouseRationale": "Every Japanese regional bank and securities firm benchmarks against MUFG's digital posture. A win here signals Anthropic credibility across the entire FSI vertical in Japan.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-03-10",
        "meddpicc": {"metrics": 3, "economicBuyer": 2, "decisionCriteria": 2, "decisionProcess": 2, "identifiedPain": 3, "champion": 2, "competition": 2}
    },
    {
        "id": "acc-ntt",
        "name": "NTT Corporation",
        "countryCode": "JP",
        "vertical": "Telco",
        "size": "GlobalEnterprise",
        "status": "active",
        "isLighthouse": True,
        "rank": 2,
        "acvPotential": 6500000,
        "targetClose": "2026-09-30",
        "tamUSD": 3800000000,
        "revenue": "$97.2B",
        "employees": 330000,
        "aiMaturity": 4,
        "incumbent": "Google Cloud Vertex AI",
        "notes": "NTT Group is investing heavily in AI infrastructure including their own LLM (tsuzumi). Building AI-native network operations. NTT DATA subsidiary has active GenAI consulting practice across Fortune 500.",
        "lighthouseRationale": "NTT's global footprint means an enterprise agreement cascades to NTT DATA clients across 50+ countries — a multiplier play, not just a single account.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-03-05",
        "meddpicc": {"metrics": 3, "economicBuyer": 2, "decisionCriteria": 3, "decisionProcess": 2, "identifiedPain": 3, "champion": 3, "competition": 2}
    },
    {
        "id": "acc-nec",
        "name": "NEC Corporation",
        "countryCode": "JP",
        "vertical": "TechSaaS",
        "size": "Enterprise",
        "status": "won",
        "isLighthouse": True,
        "rank": 3,
        "acvPotential": 4200000,
        "targetClose": "2026-04-01",
        "tamUSD": 2100000000,
        "revenue": "$26.0B",
        "employees": 110000,
        "aiMaturity": 5,
        "incumbent": None,
        "notes": "NEC signed a strategic partnership with Anthropic in April 2026 to co-develop enterprise AI solutions for Japanese government and critical infrastructure. Claude deployed in NEC's Smart City and biometrics platforms.",
        "lighthouseRationale": "NEC is the dominant IT integrator for Japanese government and public safety. Their endorsement opens the entire public sector vertical in Japan.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-04-15",
        "meddpicc": {"metrics": 5, "economicBuyer": 5, "decisionCriteria": 5, "decisionProcess": 5, "identifiedPain": 5, "champion": 5, "competition": 5}
    },
    {
        "id": "acc-sony",
        "name": "Sony Group Corporation",
        "countryCode": "JP",
        "vertical": "TechSaaS",
        "size": "GlobalEnterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 4,
        "acvPotential": 3800000,
        "targetClose": "2026-12-31",
        "tamUSD": 2800000000,
        "revenue": "$86.0B",
        "employees": 113000,
        "aiMaturity": 3,
        "incumbent": "AWS Bedrock",
        "notes": "Sony AI division building creative AI tools for entertainment and semiconductor design. PlayStation network generates 350M user interaction dataset — strong case for custom fine-tuning on Claude.",
        "lighthouseRationale": "Sony's creative AI work sets the benchmark for consumer-facing AI in Japan. A win in Sony's entertainment vertical opens doors across media and gaming regionally.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 2, "economicBuyer": 1, "decisionCriteria": 2, "decisionProcess": 1, "identifiedPain": 2, "champion": 1, "competition": 2}
    },
    {
        "id": "acc-fujitsu",
        "name": "Fujitsu Limited",
        "countryCode": "JP",
        "vertical": "TechSaaS",
        "size": "GlobalEnterprise",
        "status": "active",
        "isLighthouse": True,
        "rank": 5,
        "acvPotential": 5100000,
        "targetClose": "2026-09-30",
        "tamUSD": 3100000000,
        "revenue": "$23.9B",
        "employees": 124000,
        "aiMaturity": 4,
        "incumbent": "Microsoft Azure OpenAI",
        "notes": "Fujitsu Uvance AI platform launched as enterprise AI offering targeting Japanese corporations. Strong global delivery network means Fujitsu can be both a customer and a channel partner.",
        "lighthouseRationale": "Fujitsu is the IT outsourcing backbone for the Japanese enterprise — embedding Claude in Fujitsu Uvance is a platform play with multiplier effect across their 130,000+ corporate clients.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-02-20",
        "meddpicc": {"metrics": 3, "economicBuyer": 2, "decisionCriteria": 3, "decisionProcess": 2, "identifiedPain": 3, "champion": 2, "competition": 3}
    },
    {
        "id": "acc-keyence",
        "name": "Keyence Corporation",
        "countryCode": "JP",
        "vertical": "Manufacturing",
        "size": "Enterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 6,
        "acvPotential": 2800000,
        "targetClose": "2027-03-31",
        "tamUSD": 1600000000,
        "revenue": "$8.7B",
        "employees": 10000,
        "aiMaturity": 3,
        "incumbent": None,
        "notes": "Keyence is the world's most profitable industrial automation company by margin. Exploring Claude for technical documentation generation and factory quality inspection AI. Direct sales model means a single champion can drive rapid adoption.",
        "lighthouseRationale": "Keyence sets the standard for Japanese manufacturing AI. Their 300,000+ global customers watch Keyence's technology decisions closely.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 2, "economicBuyer": 1, "decisionCriteria": 1, "decisionProcess": 1, "identifiedPain": 2, "champion": 1, "competition": 1}
    },
]

for acc in jp_accounts:
    add_account(acc)

# ── JAPAN people ──────────────────────────────────────────────────────────────
print("\n[3] Adding Japan people...")

jp_people = [
    {"id": "pjp-morita", "name": "Takayuki Morita", "countryCode": "JP", "accountId": "acc-nec", "title": "President & CEO, NEC Corporation", "seniority": 10, "crmStatus": "champion", "influenceScore": 9.5, "priorEmployers": ["NEC"], "boardSeats": ["NEC"], "education": ["Osaka University"], "publicStance": "Anthropic strategic partner — publicly committed to Claude as NEC's primary AI platform for government and enterprise.", "lastEngagement": "2026-04-10", "engagementCount": 12},
    {"id": "pjp-ichikawa", "name": "Masahiro Ichikawa", "countryCode": "JP", "accountId": "acc-nec", "title": "Chief AI Officer, NEC Corporation", "seniority": 8, "crmStatus": "champion", "influenceScore": 8.8, "priorEmployers": ["IBM Japan", "NEC"], "boardSeats": [], "education": ["Tokyo University"], "publicStance": "Led NEC-Anthropic technical integration. Spoke at NEC C&C Forum on Claude's enterprise safety advantages.", "lastEngagement": "2026-04-15", "engagementCount": 18},
    {"id": "pjp-hirano", "name": "Jun Hirano", "countryCode": "JP", "accountId": "acc-mufg", "title": "President & Group CEO, MUFG", "seniority": 10, "crmStatus": "contacted", "influenceScore": 9.2, "priorEmployers": ["MUFG"], "boardSeats": ["MUFG", "Bank of Tokyo-Mitsubishi"], "education": ["Hitotsubashi University"], "publicStance": "Committed ¥200B AI efficiency target by 2027. Evaluating foundation model partners — needs enterprise security guarantees.", "lastEngagement": "2026-03-10", "engagementCount": 2},
    {"id": "pjp-hara", "name": "Katsunori Hara", "countryCode": "JP", "accountId": "acc-mufg", "title": "Chief Digital Transformation Officer, MUFG", "seniority": 8, "crmStatus": "meeting_held", "influenceScore": 8.5, "priorEmployers": ["McKinsey Japan", "MUFG"], "boardSeats": [], "education": ["Keio University", "Harvard Business School"], "publicStance": "Running MUFG's GenAI RFP process. Impressed by Claude's constitutional AI approach vs competitors' black-box models.", "lastEngagement": "2026-03-10", "engagementCount": 4},
    {"id": "pjp-shimada", "name": "Akira Shimada", "countryCode": "JP", "accountId": "acc-ntt", "title": "President & CEO, NTT Corporation", "seniority": 10, "crmStatus": "cold", "influenceScore": 9.0, "priorEmployers": ["NTT"], "boardSeats": ["NTT"], "education": ["Tohoku University"], "publicStance": "Publicly backing NTT's own 'tsuzumi' LLM. Needs strong commercial case for third-party models.", "lastEngagement": None, "engagementCount": 0},
    {"id": "pjp-nakamura", "name": "Yoko Nakamura", "countryCode": "JP", "accountId": "acc-ntt", "title": "Head of AI Research, NTT DATA", "seniority": 7, "crmStatus": "meeting_held", "influenceScore": 7.8, "priorEmployers": ["Google Japan", "NTT"], "boardSeats": [], "education": ["Tokyo University of Technology"], "publicStance": "Key technical evaluator for NTT DATA's enterprise AI platform. Attended Anthropic's Tokyo roadshow; asked detailed questions on context window and tool use APIs.", "lastEngagement": "2026-03-05", "engagementCount": 3},
    {"id": "pjp-yoshida", "name": "Kenichiro Yoshida", "countryCode": "JP", "accountId": "acc-sony", "title": "Chairman, Sony Group Corporation", "seniority": 10, "crmStatus": "cold", "influenceScore": 8.8, "priorEmployers": ["Sony"], "boardSeats": ["Sony", "Softbank"], "education": ["Waseda University"], "publicStance": "Sony AI strategy focused on creative tools. Open to foundation model partnerships but AWS Bedrock relationship is entrenched.", "lastEngagement": None, "engagementCount": 0},
    {"id": "pjp-suzuki", "name": "Makoto Suzuki", "countryCode": "JP", "accountId": "acc-fujitsu", "title": "President & CEO, Fujitsu", "seniority": 10, "crmStatus": "contacted", "influenceScore": 8.7, "priorEmployers": ["Fujitsu"], "boardSeats": ["Fujitsu"], "education": ["Kyoto University"], "publicStance": "Uvance AI platform is Fujitsu's growth vector for FY27. Evaluating whether to embed Claude in Uvance vs building on open-source. Warm to Anthropic's enterprise safety narrative.", "lastEngagement": "2026-02-20", "engagementCount": 1},
]

jp_added = []
for p in jp_people:
    result = add_person(p)
    jp_added.append(p)
    # Link to account
    for acc in accounts:
        if acc["id"] == p["accountId"] and p["id"] not in acc["stakeholderIds"]:
            acc["stakeholderIds"].append(p["id"])

# ── SOUTH KOREA new accounts ──────────────────────────────────────────────────
print("\n[4] Adding South Korea accounts...")

kr_accounts = [
    {
        "id": "acc-samsung-electronics",
        "name": "Samsung Electronics",
        "countryCode": "KR",
        "vertical": "TechSaaS",
        "size": "GlobalEnterprise",
        "status": "active",
        "isLighthouse": True,
        "rank": 1,
        "acvPotential": 9500000,
        "targetClose": "2026-09-30",
        "tamUSD": 5500000000,
        "revenue": "$200.7B",
        "employees": 270000,
        "aiMaturity": 4,
        "incumbent": "Google Cloud Vertex AI",
        "notes": "Samsung Electronics is piloting Claude for Gauss AI assistant embedded in Galaxy devices. Their semiconductor (DSLR) division exploring Claude for chip design documentation. Key competition with OpenAI's GPT-4o for consumer AI layer.",
        "lighthouseRationale": "Samsung Electronics is the bellwether for all Korean enterprise technology decisions — and their device footprint (600M Galaxy users) makes any AI partnership a platform play.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-03-20",
        "meddpicc": {"metrics": 3, "economicBuyer": 2, "decisionCriteria": 3, "decisionProcess": 2, "identifiedPain": 3, "champion": 3, "competition": 3}
    },
    {
        "id": "acc-skt",
        "name": "SK Telecom",
        "countryCode": "KR",
        "vertical": "Telco",
        "size": "GlobalEnterprise",
        "status": "won",
        "isLighthouse": True,
        "rank": 2,
        "acvPotential": 5800000,
        "targetClose": "2026-04-01",
        "tamUSD": 2800000000,
        "revenue": "$16.9B",
        "employees": 22000,
        "aiMaturity": 5,
        "incumbent": None,
        "notes": "SKT invested $100M in Anthropic and deployed TelClaude — a Claude-powered telecom AI agent across their 32M subscriber base. CEO publicly positioned SKT as Korea's AI carrier, anchored to Anthropic relationship.",
        "lighthouseRationale": "SKT's $100M investment and TelClaude deployment makes them a marquee strategic partner. Every Korean telco and conglomerate is watching SKT's AI bet.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-04-20",
        "meddpicc": {"metrics": 5, "economicBuyer": 5, "decisionCriteria": 5, "decisionProcess": 5, "identifiedPain": 5, "champion": 5, "competition": 5}
    },
    {
        "id": "acc-sk-hynix",
        "name": "SK Hynix",
        "countryCode": "KR",
        "vertical": "Manufacturing",
        "size": "GlobalEnterprise",
        "status": "active",
        "isLighthouse": True,
        "rank": 3,
        "acvPotential": 4200000,
        "targetClose": "2026-12-31",
        "tamUSD": 2300000000,
        "revenue": "$36.7B",
        "employees": 30000,
        "aiMaturity": 3,
        "incumbent": "AWS Bedrock",
        "notes": "SK Hynix supplies HBM3 memory for AI accelerators — deeply embedded in the AI infrastructure supply chain. Exploring Claude for semiconductor process documentation, defect analysis, and internal knowledge management.",
        "lighthouseRationale": "SK Hynix is the #2 memory chipmaker globally. Their AI adoption signals where the semiconductor industry is headed — and their AWS relationship creates a competitive opening.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-02-15",
        "meddpicc": {"metrics": 2, "economicBuyer": 1, "decisionCriteria": 2, "decisionProcess": 2, "identifiedPain": 2, "champion": 2, "competition": 2}
    },
    {
        "id": "acc-naver",
        "name": "NAVER Corporation",
        "countryCode": "KR",
        "vertical": "TechSaaS",
        "size": "Enterprise",
        "status": "competitor",
        "isLighthouse": True,
        "rank": 4,
        "acvPotential": 3100000,
        "targetClose": "2027-06-30",
        "tamUSD": 1800000000,
        "revenue": "$8.0B",
        "employees": 14000,
        "aiMaturity": 5,
        "incumbent": "HyperCLOVA X (own LLM)",
        "notes": "NAVER built HyperCLOVA X — their own Korean-language LLM with 82B parameters. Positioned as nationalistic alternative to US AI providers. However, their cloud subsidiary (NAVER Cloud) may be open to multi-model architecture.",
        "lighthouseRationale": "NAVER is Korea's dominant search and cloud platform. Converting NAVER Cloud to a Claude reseller would immediately distribute Anthropic's models to 700K+ Korean SMBs.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 1, "economicBuyer": 1, "decisionCriteria": 1, "decisionProcess": 1, "identifiedPain": 1, "champion": 1, "competition": 1}
    },
    {
        "id": "acc-kt-corp",
        "name": "KT Corporation",
        "countryCode": "KR",
        "vertical": "Telco",
        "size": "Enterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 5,
        "acvPotential": 3500000,
        "targetClose": "2026-12-31",
        "tamUSD": 1900000000,
        "revenue": "$22.3B",
        "employees": 22000,
        "aiMaturity": 3,
        "incumbent": "Microsoft Azure OpenAI",
        "notes": "KT launched 'Mi:dm' AI service powered by GPT-4 — now evaluating Claude for enterprise segment following SKT's success with TelClaude. CFO has signaled AI cost optimization is a priority.",
        "lighthouseRationale": "KT is South Korea's second telco. With SKT already an Anthropic strategic partner, landing KT creates a duopoly AI deal in Korea Telco — deeply defensible territory.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-03-01",
        "meddpicc": {"metrics": 2, "economicBuyer": 2, "decisionCriteria": 2, "decisionProcess": 2, "identifiedPain": 3, "champion": 2, "competition": 2}
    },
    {
        "id": "acc-hyundai-motor",
        "name": "Hyundai Motor Group",
        "countryCode": "KR",
        "vertical": "Manufacturing",
        "size": "GlobalEnterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 6,
        "acvPotential": 4800000,
        "targetClose": "2027-03-31",
        "tamUSD": 3200000000,
        "revenue": "$155.9B",
        "employees": 280000,
        "aiMaturity": 3,
        "incumbent": None,
        "notes": "Hyundai's Boston Dynamics acquisition and software-defined vehicle roadmap create massive AI demand. CEO Euisun Chung has made AI a board-level priority. GenAI use cases include design co-pilot, factory quality control, and connected car OS.",
        "lighthouseRationale": "Hyundai-Kia is Korea's most internationally recognized brand. An AI partnership here is a case study that travels — to every Korean manufacturing conglomerate and every global auto OEM watching Korea.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 2, "economicBuyer": 1, "decisionCriteria": 1, "decisionProcess": 1, "identifiedPain": 2, "champion": 1, "competition": 1}
    },
    {
        "id": "acc-lg-electronics",
        "name": "LG Electronics",
        "countryCode": "KR",
        "vertical": "Manufacturing",
        "size": "GlobalEnterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 7,
        "acvPotential": 3800000,
        "targetClose": "2027-03-31",
        "tamUSD": 2600000000,
        "revenue": "$54.6B",
        "employees": 74000,
        "aiMaturity": 3,
        "incumbent": "AWS Bedrock",
        "notes": "LG's ThinQ AI platform is being rebuilt with GenAI capabilities. Home appliances + OLED display + EV battery divisions all have distinct AI use cases. LG's B2B segment is fastest growing and most receptive to enterprise AI.",
        "lighthouseRationale": "LG Electronics sets the AI benchmark for Korean consumer electronics. A win cascades to LG affiliates (LGU+, LG Chem, LG Energy Solution) across multiple verticals.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 1, "economicBuyer": 1, "decisionCriteria": 1, "decisionProcess": 1, "identifiedPain": 2, "champion": 1, "competition": 2}
    },
]

for acc in kr_accounts:
    add_account(acc)

# ── SOUTH KOREA people ────────────────────────────────────────────────────────
print("\n[5] Adding South Korea people...")

kr_people = [
    {"id": "pkr-ryu", "name": "Ryu Young-sang", "countryCode": "KR", "accountId": "acc-skt", "title": "President & CEO, SK Telecom", "seniority": 10, "crmStatus": "champion", "influenceScore": 9.3, "priorEmployers": ["SK Telecom", "SK Group"], "boardSeats": ["SKT", "AI Safety Institute Korea"], "education": ["Yonsei University", "MIT Sloan"], "publicStance": "Positioned SKT as Korea's AI carrier via $100M Anthropic investment. Quotes Anthropic's safety-first approach in every keynote as a differentiator.", "lastEngagement": "2026-04-20", "engagementCount": 15},
    {"id": "pkr-ha", "name": "Ha Young-lim", "countryCode": "KR", "accountId": "acc-skt", "title": "Head of AI Strategy, SK Telecom", "seniority": 8, "crmStatus": "champion", "influenceScore": 8.5, "priorEmployers": ["McKinsey Seoul", "SK Telecom"], "boardSeats": [], "education": ["Seoul National University", "Columbia Business School"], "publicStance": "TelClaude product lead. Working with Anthropic engineering team on custom telecom fine-tuning pipeline.", "lastEngagement": "2026-04-22", "engagementCount": 22},
    {"id": "pkr-lee-jy", "name": "Lee Jae-yong", "countryCode": "KR", "accountId": "acc-samsung-electronics", "title": "Executive Chairman, Samsung Electronics", "seniority": 10, "crmStatus": "cold", "influenceScore": 9.8, "priorEmployers": ["Samsung"], "boardSeats": ["Samsung Electronics", "Samsung Foundation"], "education": ["Seoul National University", "Harvard Business School", "Keio University (MBA)"], "publicStance": "Controls Samsung's AI strategy at the conglomerate level. AI decisions require his approval. Access via Samsung corporate affairs team only.", "lastEngagement": None, "engagementCount": 0},
    {"id": "pkr-jun", "name": "Jun Jong-soo", "countryCode": "KR", "accountId": "acc-samsung-electronics", "title": "President, Samsung Research", "seniority": 9, "crmStatus": "meeting_held", "influenceScore": 8.9, "priorEmployers": ["Samsung"], "boardSeats": [], "education": ["KAIST", "Carnegie Mellon (PhD AI)"], "publicStance": "Heads Samsung's AI research. Interested in Claude for Gauss2 next-gen assistant — Google relationship is competitive but non-exclusive.", "lastEngagement": "2026-03-20", "engagementCount": 3},
    {"id": "pkr-kim-cy", "name": "Kim Chang-yong", "countryCode": "KR", "accountId": "acc-naver", "title": "CEO, NAVER Corporation", "seniority": 10, "crmStatus": "detractor", "influenceScore": 8.7, "priorEmployers": ["NAVER"], "boardSeats": ["NAVER"], "education": ["KAIST", "Stanford (PhD)"], "publicStance": "Public champion of HyperCLOVA X as Korean sovereign AI. Views US AI providers as competitors to Korean AI ecosystem. Needs partnership framing, not displacement.", "lastEngagement": None, "engagementCount": 0},
    {"id": "pkr-ahn", "name": "Ahn Sung-jin", "countryCode": "KR", "accountId": "acc-kt-corp", "title": "CEO, KT Corporation", "seniority": 9, "crmStatus": "contacted", "influenceScore": 8.4, "priorEmployers": ["KT", "Samsung Electronics"], "boardSeats": ["KT"], "education": ["Seoul National University"], "publicStance": "Evaluating AI model strategy post-SKT's Anthropic deal. Open to Claude for KT Enterprise segment — watching competitive dynamics.", "lastEngagement": "2026-03-01", "engagementCount": 1},
    {"id": "pkr-chung", "name": "Euisun Chung", "countryCode": "KR", "accountId": "acc-hyundai-motor", "title": "Executive Chair, Hyundai Motor Group", "seniority": 10, "crmStatus": "cold", "influenceScore": 9.1, "priorEmployers": ["Hyundai"], "boardSeats": ["Hyundai Motor", "Kia", "Boston Dynamics"], "education": ["Seoul National University", "University of San Francisco (MBA)"], "publicStance": "Software-defined vehicle is Hyundai's #1 strategic priority. AI decisions made by CDO office. Needs exec-level Anthropic relationship for board-level conversation.", "lastEngagement": None, "engagementCount": 0},
]

for p in kr_people:
    add_person(p)
    for acc in accounts:
        if acc["id"] == p["accountId"] and p["id"] not in acc["stakeholderIds"]:
            acc["stakeholderIds"].append(p["id"])

# ── AUSTRALIA new accounts ────────────────────────────────────────────────────
print("\n[6] Adding Australia accounts...")

au_accounts = [
    {
        "id": "acc-cba",
        "name": "Commonwealth Bank of Australia",
        "countryCode": "AU",
        "vertical": "FSI",
        "size": "GlobalEnterprise",
        "status": "won",
        "isLighthouse": True,
        "rank": 1,
        "acvPotential": 7500000,
        "targetClose": "2026-04-01",
        "tamUSD": 3800000000,
        "revenue": "$26.0B",
        "employees": 48000,
        "aiMaturity": 5,
        "incumbent": None,
        "notes": "CBA is an Anthropic strategic partner and equity investor. Claude deployed across retail banking, fraud detection, and internal knowledge management. CEO Matt Comyn is a vocal Anthropic champion at industry events.",
        "lighthouseRationale": "CBA is the most digitally advanced bank in the southern hemisphere. Every Australian FSI CIO models their AI strategy against CBA's. A strategic investment amplifies referral effect.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-04-20",
        "meddpicc": {"metrics": 5, "economicBuyer": 5, "decisionCriteria": 5, "decisionProcess": 5, "identifiedPain": 5, "champion": 5, "competition": 5}
    },
    {
        "id": "acc-bhp",
        "name": "BHP Group",
        "countryCode": "AU",
        "vertical": "Resources",
        "size": "GlobalEnterprise",
        "status": "active",
        "isLighthouse": True,
        "rank": 2,
        "acvPotential": 6200000,
        "targetClose": "2026-09-30",
        "tamUSD": 3200000000,
        "revenue": "$53.8B",
        "employees": 80000,
        "aiMaturity": 3,
        "incumbent": "Microsoft Azure OpenAI",
        "notes": "BHP launched 'BHP AI' internal platform in 2025 powered by Azure. Now expanding to consider best-of-breed models for critical safety and operational use cases. Key use cases: mine safety monitoring, geological analysis, predictive maintenance.",
        "lighthouseRationale": "BHP is the world's largest diversified miner. Their AI adoption signals the entire resources sector — Woodside, Rio Tinto, and Fortescue all watch BHP's technology decisions.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-03-15",
        "meddpicc": {"metrics": 3, "economicBuyer": 2, "decisionCriteria": 3, "decisionProcess": 2, "identifiedPain": 3, "champion": 2, "competition": 3}
    },
    {
        "id": "acc-csl",
        "name": "CSL Limited",
        "countryCode": "AU",
        "vertical": "Healthcare",
        "size": "GlobalEnterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 3,
        "acvPotential": 4100000,
        "targetClose": "2026-12-31",
        "tamUSD": 2100000000,
        "revenue": "$14.8B",
        "employees": 33000,
        "aiMaturity": 3,
        "incumbent": None,
        "notes": "CSL is the world's leading plasma products company and a top-5 global biotech. AI use cases span drug discovery, plasma donor optimization, clinical trial design, and regulatory documentation. No incumbent AI provider at enterprise level.",
        "lighthouseRationale": "CSL is Australia's most globally respected life sciences company. A win here signals Anthropic's ability to navigate regulated industries — a credential that transfers to pharmaceuticals across APAC.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-02-28",
        "meddpicc": {"metrics": 2, "economicBuyer": 1, "decisionCriteria": 2, "decisionProcess": 1, "identifiedPain": 2, "champion": 1, "competition": 1}
    },
    {
        "id": "acc-woolworths",
        "name": "Woolworths Group",
        "countryCode": "AU",
        "vertical": "Retail",
        "size": "Enterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 4,
        "acvPotential": 3200000,
        "targetClose": "2027-03-31",
        "tamUSD": 1700000000,
        "revenue": "$64.3B",
        "employees": 200000,
        "aiMaturity": 2,
        "incumbent": "Google Cloud Vertex AI",
        "notes": "Woolworths is building AI-powered supply chain optimization and personalized grocery recommendations. 200,000 employees make internal productivity tools a major opportunity. COO publicly referenced GenAI as a board priority.",
        "lighthouseRationale": "Woolworths is Australia's largest private employer. Their AI deployment at scale would be the definitive retail AI case study in the region — Coles, Wesfarmers, and Myer would follow.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 1, "economicBuyer": 1, "decisionCriteria": 1, "decisionProcess": 1, "identifiedPain": 2, "champion": 1, "competition": 2}
    },
]

# Note: acc-commonwealth-bank already exists and was updated above; acc-cba is new
for acc in au_accounts:
    add_account(acc)

# ── AUSTRALIA people ──────────────────────────────────────────────────────────
print("\n[7] Adding Australia people...")

au_people = [
    {"id": "pau-comyn", "name": "Matt Comyn", "countryCode": "AU", "accountId": "acc-cba", "title": "CEO, Commonwealth Bank of Australia", "seniority": 10, "crmStatus": "champion", "influenceScore": 9.6, "priorEmployers": ["CBA"], "boardSeats": ["CBA", "Reserve Bank of Australia advisory"], "education": ["University of Melbourne"], "publicStance": "Anthropic equity investor and vocal AI safety champion. Quoted in AFR: 'Claude gives us the responsible AI foundation that a systemically important bank requires.'", "lastEngagement": "2026-04-20", "engagementCount": 14},
    {"id": "pau-boteju", "name": "Ranil Boteju", "countryCode": "AU", "accountId": "acc-cba", "title": "Chief AI Officer, Commonwealth Bank of Australia", "seniority": 8, "crmStatus": "champion", "influenceScore": 8.9, "priorEmployers": ["NAB", "Deloitte AI", "CBA"], "boardSeats": [], "education": ["UNSW", "Oxford (MBA)"], "publicStance": "Architected CBA's Claude deployment across fraud and knowledge management. Speaking at Money20/20 Asia on responsible GenAI in banking.", "lastEngagement": "2026-04-22", "engagementCount": 19},
    {"id": "pau-henry", "name": "Mike Henry", "countryCode": "AU", "accountId": "acc-bhp", "title": "CEO, BHP Group", "seniority": 10, "crmStatus": "contacted", "influenceScore": 9.2, "priorEmployers": ["BHP"], "boardSeats": ["BHP", "Business Council of Australia"], "education": ["University of Queensland (Chemical Engineering)"], "publicStance": "Publicly committed to AI for mine safety and operational efficiency. Microsoft relationship entrenched but expressed interest in 'best model for each use case' approach.", "lastEngagement": "2026-03-15", "engagementCount": 2},
    {"id": "pau-cahill", "name": "Laura Cahill", "countryCode": "AU", "accountId": "acc-bhp", "title": "Chief Technology Officer, BHP", "seniority": 8, "crmStatus": "meeting_held", "influenceScore": 8.3, "priorEmployers": ["Rio Tinto", "AWS", "BHP"], "boardSeats": [], "education": ["University of Western Australia", "MIT (MS Computer Science)"], "publicStance": "Running BHP AI platform evaluation. Interested in Claude's long context for geological report analysis. AWS relationship through prior role is a warm connection.", "lastEngagement": "2026-03-15", "engagementCount": 4},
    {"id": "pau-kannangara", "name": "Paul Cannane", "countryCode": "AU", "accountId": "acc-csl", "title": "Chief Digital & Technology Officer, CSL", "seniority": 8, "crmStatus": "contacted", "influenceScore": 7.9, "priorEmployers": ["Roche", "Sanofi", "CSL"], "boardSeats": [], "education": ["University of Melbourne (Biochemistry)", "INSEAD (MBA)"], "publicStance": "CSL exploring AI for clinical documentation and donor management. Interested in Claude's handling of scientific literature. No incumbent AI provider — greenfield opportunity.", "lastEngagement": "2026-02-28", "engagementCount": 1},
    {"id": "pau-brookes", "name": "Mike Cannon-Brookes", "countryCode": "AU", "accountId": "acc-atlassian", "title": "Co-CEO, Atlassian", "seniority": 10, "crmStatus": "champion", "influenceScore": 9.5, "priorEmployers": ["Atlassian"], "boardSeats": ["Atlassian", "Grok Academy", "Sun Cable"], "education": ["University of New South Wales"], "publicStance": "AI-first engineering culture at Atlassian. Rovo (Atlassian AI) powered by multiple models including Claude. Actively promoting Anthropic at Sydney tech events.", "lastEngagement": "2026-04-10", "engagementCount": 8},
]

for p in au_people:
    add_person(p)
    for acc in accounts:
        if acc["id"] == p["accountId"] and p["id"] not in acc["stakeholderIds"]:
            acc["stakeholderIds"].append(p["id"])

# Also link Matt Comyn to acc-commonwealth-bank (the old existing one → redirect or keep acc-cba as primary)
# Actually, let's just update the old acc-commonwealth-bank stakeholder list too
for acc in accounts:
    if acc["id"] == "acc-commonwealth-bank":
        for pid in ["pau-comyn", "pau-boteju"]:
            if pid not in acc["stakeholderIds"]:
                acc["stakeholderIds"].append(pid)

# ── NEW ZEALAND new accounts ──────────────────────────────────────────────────
print("\n[8] Adding New Zealand accounts...")

nz_accounts = [
    {
        "id": "acc-xero",
        "name": "Xero Limited",
        "countryCode": "NZ",
        "vertical": "TechSaaS",
        "size": "Enterprise",
        "status": "active",
        "isLighthouse": True,
        "rank": 1,
        "acvPotential": 3800000,
        "targetClose": "2026-09-30",
        "tamUSD": 1900000000,
        "revenue": "$1.72B",
        "employees": 5400,
        "aiMaturity": 4,
        "incumbent": "OpenAI GPT-4",
        "notes": "Xero launched 'Xero AI' in 2025 powered by OpenAI. CEO Sukhinder Singh Cassidy has made AI the centrepiece of the FY27 product roadmap. Accounting AI use cases: auto-categorization, cashflow forecasting, regulatory compliance summarization.",
        "lighthouseRationale": "Xero has 4.2M small business subscribers across ANZ, UK and North America. Their AI adoption validates the SMB AI market — and their API-first architecture makes Claude easy to embed.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-03-20",
        "meddpicc": {"metrics": 3, "economicBuyer": 2, "decisionCriteria": 3, "decisionProcess": 2, "identifiedPain": 3, "champion": 2, "competition": 3}
    },
    {
        "id": "acc-fph",
        "name": "Fisher & Paykel Healthcare",
        "countryCode": "NZ",
        "vertical": "Healthcare",
        "size": "Enterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 2,
        "acvPotential": 2400000,
        "targetClose": "2026-12-31",
        "tamUSD": 1200000000,
        "revenue": "$2.0B",
        "employees": 7000,
        "aiMaturity": 2,
        "incumbent": None,
        "notes": "FPH is the global leader in respiratory care and sleep apnea devices. AI use cases span device monitoring analytics, clinical trial documentation, and regulatory submission automation. Export-focused company watching AI adoption in key markets.",
        "lighthouseRationale": "FPH is NZ's most globally significant MedTech company. An AI win here opens the APAC MedTech vertical — Cochlear, ResMed, and Nanoform are all watching.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 1, "economicBuyer": 1, "decisionCriteria": 1, "decisionProcess": 1, "identifiedPain": 2, "champion": 1, "competition": 1}
    },
    {
        "id": "acc-spark-nz",
        "name": "Spark New Zealand",
        "countryCode": "NZ",
        "vertical": "Telco",
        "size": "Enterprise",
        "status": "targeted",
        "isLighthouse": True,
        "rank": 3,
        "acvPotential": 2800000,
        "targetClose": "2026-12-31",
        "tamUSD": 1400000000,
        "revenue": "$3.8B",
        "employees": 5000,
        "aiMaturity": 3,
        "incumbent": "Microsoft Azure OpenAI",
        "notes": "Spark NZ's Starhub data centre and cloud infrastructure makes them a potential AI platform distributor. CEO Jolie Hodson is championing AI workforce transformation internally. Telco AI use cases: network management, customer service automation.",
        "lighthouseRationale": "Spark is NZ's dominant telco and cloud provider. An enterprise agreement creates a channel for Anthropic's models to NZ's mid-market via Spark's cloud marketplace.",
        "stakeholderIds": [],
        "lastTouchDate": "2026-02-10",
        "meddpicc": {"metrics": 2, "economicBuyer": 2, "decisionCriteria": 2, "decisionProcess": 2, "identifiedPain": 2, "champion": 1, "competition": 2}
    },
    {
        "id": "acc-infratil",
        "name": "Infratil Limited",
        "countryCode": "NZ",
        "vertical": "PublicSector",
        "size": "Enterprise",
        "status": "targeted",
        "isLighthouse": False,
        "rank": 4,
        "acvPotential": 1800000,
        "targetClose": "2027-03-31",
        "tamUSD": 900000000,
        "revenue": "$3.1B",
        "employees": 2000,
        "aiMaturity": 2,
        "incumbent": None,
        "notes": "Infratil owns CDC Data Centres — the dominant hyperscale data centre operator in ANZ with 200+ MW planned capacity. As Anthropic's infrastructure demand grows in ANZ, Infratil/CDC relationship is strategically valuable.",
        "lighthouseRationale": "CDC Data Centres is Anthropic's most likely ANZ infrastructure partner. Infratil's board includes senior NZ government-connected directors who influence public sector AI procurement.",
        "stakeholderIds": [],
        "lastTouchDate": None,
        "meddpicc": {"metrics": 1, "economicBuyer": 1, "decisionCriteria": 1, "decisionProcess": 1, "identifiedPain": 1, "champion": 1, "competition": 1}
    },
]

for acc in nz_accounts:
    add_account(acc)

# ── NEW ZEALAND people ────────────────────────────────────────────────────────
print("\n[9] Adding New Zealand people...")

nz_people = [
    {"id": "pnz-cassidy", "name": "Sukhinder Singh Cassidy", "countryCode": "NZ", "accountId": "acc-xero", "title": "CEO, Xero Limited", "seniority": 10, "crmStatus": "meeting_held", "influenceScore": 9.1, "priorEmployers": ["Google", "Amazon", "StubHub", "Xero"], "boardSeats": ["Xero", "Reebok", "PayPal"], "education": ["Ivey Business School (MBA)"], "publicStance": "AI-first product roadmap for Xero. Currently on OpenAI but has publicly stated 'best model wins' philosophy — open to Claude evaluation for coding and compliance use cases.", "lastEngagement": "2026-03-20", "engagementCount": 3},
    {"id": "pnz-hodson", "name": "Jolie Hodson", "countryCode": "NZ", "accountId": "acc-spark-nz", "title": "CEO, Spark New Zealand", "seniority": 9, "crmStatus": "contacted", "influenceScore": 8.3, "priorEmployers": ["Spark NZ", "Telecom NZ"], "boardSeats": ["Spark NZ", "NZX"], "education": ["University of Auckland"], "publicStance": "Championing AI workforce transformation at Spark. Azure partnership entrenched but interested in multi-model approach for enterprise clients.", "lastEngagement": "2026-02-10", "engagementCount": 1},
    {"id": "pnz-lewis", "name": "Lewis Gradon", "countryCode": "NZ", "accountId": "acc-fph", "title": "CEO, Fisher & Paykel Healthcare", "seniority": 9, "crmStatus": "cold", "influenceScore": 8.0, "priorEmployers": ["Fisher & Paykel Healthcare"], "boardSeats": ["FPH"], "education": ["University of Auckland (Engineering)"], "publicStance": "Focus on device innovation rather than software AI. Needs strong clinical documentation ROI case to engage at AI level.", "lastEngagement": None, "engagementCount": 0},
    {"id": "pnz-morrison", "name": "Marko Bogoievski", "countryCode": "NZ", "accountId": "acc-infratil", "title": "CEO, Infratil Limited", "seniority": 9, "crmStatus": "cold", "influenceScore": 7.8, "priorEmployers": ["Telecom NZ", "Infratil"], "boardSeats": ["Infratil", "CDC Data Centres"], "education": ["Victoria University Wellington"], "publicStance": "Focused on data centre capacity expansion. Indirect influence on Anthropic via CDC relationship — worth cultivating as infrastructure demand grows.", "lastEngagement": None, "engagementCount": 0},
]

for p in nz_people:
    add_person(p)
    for acc in accounts:
        if acc["id"] == p["accountId"] and p["id"] not in acc["stakeholderIds"]:
            acc["stakeholderIds"].append(p["id"])

# ── Cross-market edges ────────────────────────────────────────────────────────
print("\n[10] Adding cross-market trust edges...")

new_edges = [
    # JP
    ("pjp-morita", "pjp-ichikawa", "co-worker", 3),
    ("pjp-hirano", "pjp-hara", "co-worker", 3),
    ("pjp-shimada", "pjp-nakamura", "co-worker", 2),
    # KR
    ("pkr-ryu", "pkr-ha", "co-worker", 3),
    ("pkr-lee-jy", "pkr-jun", "co-worker", 2),
    # AU
    ("pau-comyn", "pau-boteju", "co-worker", 3),
    ("pau-henry", "pau-cahill", "co-worker", 3),
    ("pau-brookes", "pau-comyn", "board-overlap", 2),
    # NZ
    ("pnz-cassidy", "pnz-hodson", "conference-co-panelist", 2),
    # Cross-market — champions who know each other
    ("pau-comyn", "pkr-ryu", "conference-co-panelist", 1),
    ("pjp-morita", "pau-comyn", "conference-co-panelist", 1),  # Both spoke at Tokyo AI Summit
    ("pau-brookes", "pnz-cassidy", "alumni", 2),  # Tech CEO network
    ("pkr-ha", "pau-boteju", "conference-co-panelist", 2),  # Both spoke at APAC FinTech Forum
    # NEC + SKT champions should know Anthropic team (internal)
    ("pjp-morita", "pjp-shimada", "conference-co-panelist", 1),
    ("pkr-ryu", "pkr-ahn", "conference-co-panelist", 2),  # Korean telco CEOs
]

for source, target, label, strength in new_edges:
    add_edge(source, target, label, strength)

# ── Intel notes ───────────────────────────────────────────────────────────────
print("\n[11] Adding intel notes...")

new_intel = [
    # Japan - NEC (won)
    {"id": "intel-nec-01", "accountId": "acc-nec", "date": "2026-04-10", "author": "Field Team", "text": "NEC-Anthropic strategic partnership announced. Claude deployed in NEC Smart City platform across 12 Japanese municipal governments. Morita personally introduced the partnership at press event.", "isNew": True},
    {"id": "intel-nec-02", "accountId": "acc-nec", "date": "2026-03-28", "author": "Field Team", "text": "NEC CAIO Ichikawa confirmed Claude as primary model for government contracts. Competitor Azure OpenAI position lost — NEC cited constitutional AI advantages for public sector data handling.", "isNew": True},
    # Japan - MUFG
    {"id": "intel-mufg-01", "accountId": "acc-mufg", "date": "2026-03-10", "author": "Field Team", "text": "Met with MUFG CDTO Hara re: GenAI RFP for risk analytics and wealth management. Competing with Azure OpenAI and AWS Bedrock. Hara specifically asked about Claude's audit trail capabilities for APRA-equivalent compliance.", "isNew": True},
    {"id": "intel-mufg-02", "accountId": "acc-mufg", "date": "2026-02-20", "author": "Field Team", "text": "MUFG CEO Hirano's earnings call referenced 200B yen AI efficiency target. Enterprise AI vendor decision expected by Q3 2026. CBA partnership (Claude) is a reference case they're watching closely.", "isNew": False},
    # Japan - NTT
    {"id": "intel-ntt-01", "accountId": "acc-ntt", "date": "2026-03-05", "author": "Field Team", "text": "NTT DATA Head of AI Research Nakamura attended Anthropic Tokyo roadshow. Strong technical interest in Claude's 200K context window for document-heavy telco contracts. Follow up: schedule technical deep-dive with NTT DATA engineering.", "isNew": True},
    # Japan - Fujitsu
    {"id": "intel-fujitsu-01", "accountId": "acc-fujitsu", "date": "2026-02-20", "author": "Field Team", "text": "Fujitsu CEO Suzuki indicated openness to multi-model Uvance platform. Current build uses Azure OpenAI — but Fujitsu's open architecture means Claude could be added as premium tier. Channel partner discussion underway.", "isNew": True},
    # Korea - SKT (won)
    {"id": "intel-skt-01", "accountId": "acc-skt", "date": "2026-04-20", "author": "Field Team", "text": "TelClaude QBR — 2.1M active users on Claude-powered SKT assistant in 90 days post-launch. SKT reporting 34% reduction in call center volume. Ryu confirmed expansion to enterprise B2B segment.", "isNew": True},
    {"id": "intel-skt-02", "accountId": "acc-skt", "date": "2026-04-01", "author": "Field Team", "text": "SKT CEO Ryu quoted in Seoul Economic Daily: 'Our $100M Anthropic investment is the most important strategic bet of my tenure. AI safety is not a constraint — it's a competitive advantage in regulated markets.'", "isNew": False},
    # Korea - Samsung Electronics
    {"id": "intel-samsung-elec-01", "accountId": "acc-samsung-electronics", "date": "2026-03-20", "author": "Field Team", "text": "Samsung Research President Jun met with Anthropic team re: Gauss2 model evaluation. Current Gauss2 is built on proprietary + Google models. Jun interested in Claude as a premium enterprise-grade layer for B2B Galaxy AI.", "isNew": True},
    # Korea - KT Corp
    {"id": "intel-kt-01", "accountId": "acc-kt-corp", "date": "2026-03-01", "author": "Field Team", "text": "KT CEO Ahn contacted post SKT TelClaude announcement. KT evaluating switching Mi:dm AI from GPT-4 to Claude — SKT's success is forcing competitive response. Decision timeline: Q4 2026.", "isNew": True},
    # Australia - CBA (won)
    {"id": "intel-cba-01", "accountId": "acc-cba", "date": "2026-04-20", "author": "Field Team", "text": "CBA QBR with Anthropic team. 850K+ internal Claude queries per month across fraud, compliance, and wealth management. CAIO Boteju requesting expanded API rate limits for Phase 2 customer-facing deployment.", "isNew": True},
    {"id": "intel-cba-02", "accountId": "acc-cba", "date": "2026-04-15", "author": "Field Team", "text": "CEO Comyn spoke at AFR Banking Summit — cited Claude as 'the responsible AI foundation that systemically important banks need.' Three other Australian bank CIOs approached our team after the session.", "isNew": True},
    # Australia - BHP
    {"id": "intel-bhp-01", "accountId": "acc-bhp", "date": "2026-03-15", "author": "Field Team", "text": "BHP CTO Cahill (warm via AWS alumni network) agreed to pilot evaluation: Claude vs Azure OpenAI for geological report summarization across 200-page technical documents. Claude long context is the key differentiator to demo.", "isNew": True},
    # Australia - CSL
    {"id": "intel-csl-01", "accountId": "acc-csl", "date": "2026-02-28", "author": "Field Team", "text": "CSL CDTO Cannane identified via LinkedIn — former Roche colleague intro. CSL exploring AI for regulatory submission documents. No incumbent AI provider — pure greenfield. Follow up: send CSL-specific safety brief + healthcare AI whitepaper.", "isNew": True},
    # NZ - Xero
    {"id": "intel-xero-01", "accountId": "acc-xero", "date": "2026-03-20", "author": "Field Team", "text": "CEO Cassidy took meeting at request of mutual connection (Google network). Impressed by Claude's code capabilities for Xero's developer platform. Currently on OpenAI but 'best model for each use case' approach means competitive evaluation possible.", "isNew": True},
    # NZ - Spark
    {"id": "intel-spark-01", "accountId": "acc-spark-nz", "date": "2026-02-10", "author": "Field Team", "text": "Spark CEO Hodson joined Anthropic ANZ Executive Forum as observer. Interested in multi-model telco AI architecture. Current Azure relationship is preferred vendor but not exclusive. Follow up: Spark cloud marketplace partnership discussion.", "isNew": True},
]

# Add intel avoiding duplicates
existing_intel_ids = {n["id"] for n in intel}
for note in new_intel:
    if note["id"] not in existing_intel_ids:
        intel.append(note)
        existing_intel_ids.add(note["id"])

# ── Save all files ─────────────────────────────────────────────────────────────
print("\n[12] Saving files...")
save("accounts", accounts)
save("people", people)
save("edges", edges)
save("intel", intel)

print("\n✓ Merge complete")
print(f"  accounts: {len(accounts)}")
print(f"  people:   {len(people)}")
print(f"  edges:    {len(edges)}")
print(f"  intel:    {len(intel)}")
