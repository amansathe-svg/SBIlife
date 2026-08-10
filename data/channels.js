// =============================================================
// data/channels.js — SBI Life AI Engagement Platform
// Colleague: edit channel rules, costs, and message templates here.
// =============================================================

const CHANNEL_CONFIG = {
  whatsapp: {
    key: "whatsapp", label: "WhatsApp", icon: "wa",
    costPerContact: 12,       // ₹ per contact
    avgSuccessRate: 34,       // % conversion
    avgDeliveryRate: 97,
    color: "#25D366",
    bgColor: "#DCFCE7",
    desc: "Primary digital touchpoint. Payment links, policy info, Saaspot creatives."
  },
  sms: {
    key: "sms", label: "SMS", icon: "sms",
    costPerContact: 8,
    avgSuccessRate: 18,
    avgDeliveryRate: 99,
    color: "#3B82F6",
    bgColor: "#DBEAFE",
    desc: "Fallback for WhatsApp. Broadcast channel for all customers."
  },
  email: {
    key: "email", label: "Email", icon: "email",
    costPerContact: 3,
    avgSuccessRate: 5,
    avgDeliveryRate: 89,
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    desc: "Selective use. SI failure notices, statements, monthly mode reminders."
  },
  voicebot: {
    key: "voicebot", label: "Voice Bot", icon: "voice",
    costPerContact: 45,
    avgSuccessRate: 12,
    avgDeliveryRate: 78,
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    desc: "Ubona platform. Automated voice outreach at select T-day touchpoints."
  },
  chatbot: {
    key: "chatbot", label: "AI Chatbot", icon: "cb",
    costPerContact: 18,
    avgSuccessRate: 9,
    avgDeliveryRate: 95,
    color: "#06B6D4",
    bgColor: "#CFFAFE",
    desc: "Sarvam chatbot via WhatsApp. Payment queries, Smart Care portal link."
  },
  saaspot: {
    key: "saaspot", label: "Saaspot Creative", icon: "ss",
    costPerContact: 22,
    avgSuccessRate: 7,
    avgDeliveryRate: 96,
    color: "#EC4899",
    bgColor: "#FCE7F3",
    desc: "Rich WhatsApp/digital creatives. Brand engagement, warm-up phase."
  },
  callcenter: {
    key: "callcenter", label: "Call Center", icon: "cc",
    costPerContact: 380,
    avgSuccessRate: 28,
    avgDeliveryRate: 72,
    color: "#EF4444",
    bgColor: "#FEE2E2",
    desc: "Human agents. Most expensive. Product-specialist conversations for at-risk customers."
  },
  fieldagent: {
    key: "fieldagent", label: "Field Agent", icon: "fa",
    costPerContact: 250,
    avgSuccessRate: 41,
    avgDeliveryRate: 85,
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    desc: "Smart Advisor App. Commission-incentivised intermediaries. Highest conversion for rural/elderly."
  }
};

// SOP Channel Matrix — maps journey day ranges to active channels
// Edit touchpoints per day here
const SOP_MATRIX = [
  { day: -60, label: "T-60", channels: ["sms","whatsapp"],        target: "Non-SI only", phase: "pre-due",    note: "E-Mandate registration push" },
  { day: -45, label: "T-45", channels: ["sms","whatsapp","saaspot"], target: "All",       phase: "pre-due",    note: "Policy warm-up + Smart Care link" },
  { day: -30, label: "T-30", channels: ["sms","whatsapp","email","chatbot","saaspot"], target: "All", phase: "pre-due", note: "Payment link goes live. Chatbot activated." },
  { day: -15, label: "T-15", channels: ["sms","whatsapp","voicebot","chatbot","callcenter"], target: "All", phase: "pre-due", note: "Call Center + Voice Bot activated. SI: balance reminder." },
  { day: -10, label: "T-10", channels: ["sms","whatsapp","callcenter"], target: "Non-SI only", phase: "pre-due", note: "SI excluded (auto-debit handles)" },
  { day: -7,  label: "T-7",  channels: ["sms","whatsapp","email","callcenter"], target: "Non-SI only", phase: "pre-due", note: "" },
  { day: -5,  label: "T-5",  channels: ["sms","whatsapp","voicebot","chatbot","callcenter"], target: "All", phase: "pre-due", note: "SI: legally required T-5 balance reminder" },
  { day: -3,  label: "T-3",  channels: ["sms","whatsapp","callcenter"], target: "Non-SI only", phase: "pre-due", note: "" },
  { day: -2,  label: "T-2",  channels: ["voicebot","callcenter"],  target: "Non-SI only", phase: "pre-due",    note: "Voice bot only for Non-SI" },
  { day: -1,  label: "T-1",  channels: ["sms","whatsapp","chatbot","callcenter"], target: "Non-SI only", phase: "pre-due", note: "" },
  { day:  0,  label: "T",    channels: ["sms","whatsapp","voicebot","chatbot","saaspot","callcenter"], target: "Non-SI / Non-Green", phase: "due",     note: "No calls to Green customers who pay on time" },
  { day:  1,  label: "T+1",  channels: ["email"],                  target: "SI Failed only", phase: "post-due", note: "SI failure reason email only. Grace window." },
  { day:  2,  label: "T+2",  channels: ["sms","whatsapp","email","voicebot","chatbot","callcenter"], target: "All", phase: "post-due", note: "Full escalation. Lapse warning." },
  { day:  3,  label: "T+3",  channels: ["sms","whatsapp","voicebot","callcenter"], target: "All",      phase: "post-due", note: "Grace period urgency" },
  { day:  5,  label: "T+5",  channels: ["sms","whatsapp","voicebot","callcenter"], target: "All",      phase: "post-due", note: "" },
  { day: 10,  label: "T+10", channels: ["sms","whatsapp","chatbot","callcenter"], target: "All",       phase: "post-due", note: "" },
  { day: 15,  label: "T+15", channels: ["sms","whatsapp","email","chatbot","callcenter"], target: "All", phase: "post-due", note: "Email for monthly mode only" },
  { day: 20,  label: "T+20", channels: ["sms","whatsapp","callcenter"], target: "All",                 phase: "post-due", note: "" },
  { day: 25,  label: "T+25", channels: ["sms","whatsapp","email","chatbot","callcenter"], target: "All", phase: "post-due", note: "" },
  { day: 27,  label: "T+27", channels: ["sms","whatsapp","callcenter"], target: "All",                 phase: "post-due", note: "" },
  { day: 29,  label: "T+29", channels: ["sms","whatsapp","callcenter"], target: "All",                 phase: "post-due", note: "" },
  { day: 30,  label: "T+30", channels: ["sms","whatsapp","email","saaspot","callcenter"], target: "All", phase: "post-due", note: "Saaspot reactivated. End of standard grace window." },
  { day: 31,  label: "T+31", channels: ["sms","whatsapp"],           target: "All",                    phase: "lapsed",  note: "Digital only. CC & Voice Bot withdrawn." },
  { day: 45,  label: "T+45", channels: ["sms","whatsapp"],           target: "All",                    phase: "lapsed",  note: "Digital only." },
  { day: 60,  label: "T+60", channels: ["sms","whatsapp","saaspot"], target: "All",                    phase: "lapsed",  note: "Lapsed — Saaspot revival creative." },
  { day: 90,  label: "T+90", channels: ["sms","whatsapp","email","saaspot"], target: "All",            phase: "lapsed",  note: "Revival push." },
  { day: 360, label: "T+360",channels: ["sms","whatsapp"],           target: "All",                    phase: "lapsed",  note: "Long-tail digital revival cadence." }
];

// Message templates per scenario
// Edit: messageType → object with subject, body, tone, callToAction
const MESSAGE_TEMPLATES = {
  "si-balance-maintenance": {
    tone: "informational",
    subject: "Maintain balance for auto-debit — Policy {policyNumber}",
    body: "Dear {name}, your SBI Life premium of ₹{amount} for policy {policyNumber} will be auto-debited on {dueDate}. Please ensure sufficient balance in your registered bank account. – SBI Life Insurance",
    callToAction: "Check Balance",
    urgency: "low"
  },
  "si-balance-maintenance-urgent": {
    tone: "urgent-informational",
    subject: "5 days left — Ensure balance for auto-debit",
    body: "Dear {name}, IMPORTANT: Your premium of ₹{amount} is due in 5 days. Auto-debit will be initiated on {dueDate}. Insufficient balance may cause debit failure and policy lapse. Please maintain funds now. – SBI Life",
    callToAction: "Verify Balance",
    urgency: "medium"
  },
  "si-failure-notification": {
    tone: "factual",
    subject: "Auto-debit failed — Action required for Policy {policyNumber}",
    body: "Dear {name}, we regret to inform you that the auto-debit of ₹{amount} for your policy {policyNumber} could not be processed. Reason: {failureReason}. Please make a manual payment within the grace period to avoid policy lapse. – SBI Life Insurance",
    callToAction: "Pay Now",
    urgency: "high"
  },
  "payment-reminder-gentle": {
    tone: "friendly",
    subject: "Your SBI Life premium is due soon",
    body: "Hi {name}! Your policy {policyNumber} premium of ₹{amount} is due on {dueDate}. Click below to pay securely in just 2 minutes. 🔒 – SBI Life Insurance",
    callToAction: "Pay Now ₹{amount}",
    urgency: "low"
  },
  "payment-reminder-urgent": {
    tone: "urgent",
    subject: "URGENT: Premium due in {daysLeft} days",
    body: "Dear {name}, your SBI Life premium of ₹{amount} for policy {policyNumber} is due in {daysLeft} days. Delayed payment may cause policy lapse and loss of all accumulated benefits. Please pay immediately. – SBI Life",
    callToAction: "Pay Immediately",
    urgency: "high"
  },
  "grace-period-warning": {
    tone: "critical",
    subject: "Policy at risk of lapse — Immediate action required",
    body: "Dear {name}, your policy {policyNumber} is in the grace period. Outstanding premium: ₹{amount}. Benefits including sum assured of ₹{sumAssured} are at risk. Your policy will lapse if payment is not received before {lapseDate}. – SBI Life Insurance",
    callToAction: "Save My Policy",
    urgency: "critical"
  },
  "revival-campaign": {
    tone: "empathetic",
    subject: "Revive your SBI Life policy — Special offer available",
    body: "Dear {name}, we noticed your policy {policyNumber} has lapsed. The coverage you chose — ₹{sumAssured} — can still protect your family. Revival option is available with no additional medical tests if you act within {revivalDays} days. – SBI Life Insurance",
    callToAction: "Revive My Policy",
    urgency: "medium"
  },
  "warmup-brand": {
    tone: "warm",
    subject: "A year ago, you made a great decision 🌟",
    body: "Hi {name}! A year ago, you secured your family's future with an SBI Life policy. Here's a reminder of what your ₹{sumAssured} cover means: financial security, peace of mind, and a promise kept. We're here whenever you need us. – SBI Life",
    callToAction: "View My Policy",
    urgency: "none"
  }
};

// AI Suppression Rules — when to suppress a channel
// Edit: these rules override the SOP matrix
const SUPPRESSION_RULES = [
  {
    id: "green-no-cc-pre-due",
    name: "Green Bucket — No CC/Voice Pre-Due",
    condition: "propensityBucket.startsWith('green') && journeyDay < 0",
    suppress: ["callcenter", "voicebot"],
    reason: "Green customers have high propensity — costly channels would cause brand friction."
  },
  {
    id: "si-no-cc-pre-due",
    name: "SI Registered — No CC Pre-Due",
    condition: "siStatus === 'registered' && siHealth === 'healthy' && journeyDay < 0",
    suppress: ["callcenter", "voicebot"],
    reason: "SI customers will be auto-debited — no manual payment push needed."
  },
  {
    id: "promise-window",
    name: "Customer Committed — 48h Suppression",
    condition: "callOutcome === 'promised' && daysSinceLastCall < 3",
    suppress: ["callcenter", "voicebot"],
    reason: "Respect commitment window. Over-contacting after a promise damages trust."
  },
  {
    id: "chatbot-active",
    name: "Chatbot Interaction — Hold CC",
    condition: "chatbotInteracted === true && journeyDay < 0",
    suppress: ["callcenter"],
    reason: "Active chatbot session indicates self-service intent. CC would disrupt the flow."
  },
  {
    id: "si-t1-email-only",
    name: "SI Failed T+1 — Email Only",
    condition: "siHealth === 'failed' && journeyDay === 1",
    suppress: ["callcenter", "voicebot", "sms", "chatbot"],
    reason: "T+1 grace window. End-of-month processing delays may auto-resolve by tomorrow."
  },
  {
    id: "lapsed-no-cc",
    name: "Lapsed (T+31+) — CC Withdrawn",
    condition: "journeyDay > 30",
    suppress: ["callcenter", "voicebot"],
    reason: "Post-grace period: digital revival cadence only. CC not cost-effective."
  }
];
