// =============================================================
// js/recommendations.js — AI Channel Recommendation Engine
// Core logic for deciding the optimal engagement channel
// per customer based on propensity, SI status, journey phase,
// and recent interaction signals.
// =============================================================

function getChannelRecommendation(customer) {
  const {
    propensityBucket, siStatus, siHealth, journeyDay,
    digitalEngagement, previousLapses, signals
  } = customer;

  const result = {
    primary: null,
    channels: [],        // [{key, label, priority, reason}]
    suppressed: [],      // [{key, label, reason}]
    messageType: null,
    urgencyLevel: "low", // "low" | "medium" | "high" | "critical"
    reasoning: [],       // Human-readable explanation bullets
    confidenceScore: 0,  // 0–100
    estimatedSuccessRate: 0,
    nextContactTime: "Now",
    phase: journeyDay < 0 ? "pre-due" : journeyDay === 0 ? "due-date" : journeyDay <= 30 ? "grace-period" : "lapsed"
  };

  const isGreen = propensityBucket.startsWith("green");
  const isAmber = propensityBucket === "amber";
  const isRed = propensityBucket === "red";
  const isSI = siStatus === "registered";
  const isSIFailed = isSI && siHealth === "failed";
  const preDue = journeyDay < 0;
  const daysAbs = Math.abs(journeyDay);

  // -------------------------------------------------------
  // MANDATORY: SI legal compliance (T-15 and T-5)
  // -------------------------------------------------------
  if (isSI && !isSIFailed && journeyDay === -15) {
    result.messageType = "si-balance-maintenance";
    result.urgencyLevel = "medium";
    result.reasoning.push("⚖️ Legal compliance: Mandatory SI balance maintenance reminder at T-15");
    result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Primary digital channel for SI reminder" });
    result.channels.push({ key: "sms",      label: "SMS",      priority: 2, reason: "Auto-fallback if WhatsApp undelivered" });
    result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "SI: auto-debit will process — no manual payment push" });
    result.suppressed.push({ key: "voicebot",   label: "Voice Bot",  reason: "SI: auto-debit will process — no manual payment push" });
    result.primary = "WhatsApp";
    result.confidenceScore = 97;
    result.estimatedSuccessRate = 94;
    result.reasoning.push("📱 WhatsApp primary + SMS fallback — no Call Center intervention");
    return result;
  }

  if (isSI && !isSIFailed && journeyDay === -5) {
    result.messageType = "si-balance-maintenance-urgent";
    result.urgencyLevel = "medium";
    result.reasoning.push("⚖️ Legal compliance: Mandatory SI balance maintenance reminder at T-5 (5 days to auto-debit)");
    result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Primary for urgent balance reminder" });
    result.channels.push({ key: "voicebot", label: "Voice Bot", priority: 2, reason: "SOP allows Voice Bot at T-5 for SI" });
    result.channels.push({ key: "sms",      label: "SMS",      priority: 3, reason: "SMS fallback" });
    result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "SI pre-due — no payment push needed" });
    result.primary = "WhatsApp";
    result.confidenceScore = 95;
    result.estimatedSuccessRate = 91;
    return result;
  }

  // -------------------------------------------------------
  // SI FAILURE HANDLING
  // -------------------------------------------------------
  if (isSIFailed && journeyDay === 1) {
    result.messageType = "si-failure-notification";
    result.urgencyLevel = "high";
    result.phase = "si-failed-t1";
    result.reasoning.push("📧 T+1 SI Failure: SOP mandates Email ONLY. Grace window for processing delays — premature escalation risks false alarms (month-end batch processing).");
    result.channels.push({ key: "email", label: "Email", priority: 1, reason: "T+1 SI failure protocol — email with failure reason" });
    result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "T+1 grace window — allow one business day" });
    result.suppressed.push({ key: "voicebot",   label: "Voice Bot",  reason: "T+1 grace window" });
    result.suppressed.push({ key: "sms",        label: "SMS",        reason: "T+1: email-only per SOP" });
    result.primary = "Email";
    result.confidenceScore = 99;
    result.estimatedSuccessRate = 68;
    result.reasoning.push("⏳ Full escalation (all channels) activates tomorrow at T+2 if payment not received");
    result.nextContactTime = "Tomorrow (T+2)";
    return result;
  }

  if (isSIFailed && journeyDay >= 2) {
    result.messageType = "si-failed-full-escalation";
    result.urgencyLevel = "critical";
    result.reasoning.push("🚨 SI debit failed + T+2 reached: Full multi-channel escalation — treating as Non-SI Non-Green from here.");
  }

  // -------------------------------------------------------
  // WARM-UP PHASE (T-60 to T-45) — gentle, brand-building
  // -------------------------------------------------------
  if (preDue && daysAbs >= 45 && daysAbs <= 60) {
    result.messageType = "warmup-brand";
    result.urgencyLevel = "low";
    result.reasoning.push("🌱 T-60 to T-45 warm-up phase: Goal is brand reconnection, not payment push.");
    if (isSI && !isSIFailed && daysAbs === 60) {
      result.reasoning.push("ℹ️ E-Mandate push at T-60 skipped — customer is already SI registered.");
    }
    result.channels.push({ key: "whatsapp", label: "WhatsApp",         priority: 1, reason: "Policy warm-up — Saaspot creative" });
    result.channels.push({ key: "saaspot",  label: "Saaspot Creative", priority: 2, reason: "Rich visual creative for brand recall" });
    result.channels.push({ key: "sms",      label: "SMS",              priority: 3, reason: "Fallback" });
    result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Warm-up phase — no payment urgency yet" });
    result.suppressed.push({ key: "voicebot",   label: "Voice Bot",  reason: "Warm-up phase — only digital" });
    result.primary = "WhatsApp";
    result.confidenceScore = 88;
    result.estimatedSuccessRate = isGreen ? 91 : isAmber ? 75 : 55;
    if (isGreen) result.reasoning.push("🟢 Green bucket: Minimum intervention. Single warm-up touch only.");
    return result;
  }

  // -------------------------------------------------------
  // T-30: Payment link activation
  // -------------------------------------------------------
  if (preDue && daysAbs >= 25 && daysAbs < 45) {
    result.messageType = isSI ? "si-balance-maintenance" : "payment-reminder-gentle";
    result.urgencyLevel = isGreen ? "low" : isAmber ? "medium" : "high";
    result.reasoning.push("💳 T-30 phase: Payment link now live. " + (isSI ? "SI customers get balance maintenance tone." : "Non-SI customers get direct payment link."));
    if (isGreen) {
      result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Green bucket — no CC pre-due" });
      result.suppressed.push({ key: "voicebot",   label: "Voice Bot",  reason: "Green bucket — no Voice Bot pre-due" });
      result.reasoning.push("🟢 Green bucket: Digital channels only. No human intervention.");
    }
    if (digitalEngagement === "high" || digitalEngagement === "medium") {
      result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Payment link via WhatsApp — high open rate" });
      result.channels.push({ key: "chatbot",  label: "AI Chatbot", priority: 2, reason: "Sarvam chatbot activated for payment queries" });
      result.channels.push({ key: "saaspot",  label: "Saaspot",  priority: 3, reason: "Rich creative engagement" });
      result.channels.push({ key: "email",    label: "Email",    priority: 4, reason: "Email with payment link" });
    } else {
      result.channels.push({ key: "sms",      label: "SMS",      priority: 1, reason: "Low digital — SMS primary" });
      result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 2, reason: "WhatsApp secondary" });
    }
    if (!isGreen) {
      result.channels.push({ key: "callcenter", label: "Call Center", priority: 5, reason: "Non-green: CC available from T-15" });
    }
    result.primary = digitalEngagement === "very-low" ? "SMS" : "WhatsApp";
    result.confidenceScore = 82;
    result.estimatedSuccessRate = isGreen ? 88 : isAmber ? 65 : 40;
    return result;
  }

  // -------------------------------------------------------
  // T-15 to T-7: Main activation window
  // -------------------------------------------------------
  if (preDue && daysAbs >= 7 && daysAbs < 25) {
    result.messageType = isSI ? "si-balance-maintenance" : "payment-reminder-urgent";
    if (isGreen) {
      // Green: digital only, no CC
      result.urgencyLevel = "low";
      result.reasoning.push("🟢 Green bucket at T-15: No Call Center. WhatsApp/SMS only. High propensity — will pay.");
      result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Green bucket rule: pre-due CC suppressed" });
      result.suppressed.push({ key: "voicebot",   label: "Voice Bot",  reason: "Green bucket rule: pre-due Voice Bot suppressed" });
      result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Payment link reminder" });
      result.channels.push({ key: "sms",      label: "SMS",      priority: 2, reason: "SMS fallback" });
      result.primary = "WhatsApp";
      result.confidenceScore = 91;
      result.estimatedSuccessRate = 90;
    } else {
      // Amber/Red: Full activation
      result.urgencyLevel = isRed ? "high" : "medium";
      result.reasoning.push(`${isRed ? "🔴 Red" : "🟡 Amber"} bucket T-15 window: Call Center + Voice Bot activated.`);
      // Apply chatbot suppression if active chatbot session
      if (signals.chatbotInteracted) {
        result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Active chatbot session — customer showing self-service intent. Hold CC to avoid disruption." });
        result.reasoning.push("💬 Chatbot interaction detected: Suppressing Call Center temporarily.");
        result.channels.push({ key: "chatbot",  label: "AI Chatbot", priority: 1, reason: "Active chatbot session — let customer complete" });
        result.channels.push({ key: "whatsapp", label: "WhatsApp",   priority: 2, reason: "Follow-up with payment link" });
        result.primary = "AI Chatbot";
        result.nextContactTime = "After chatbot session (2h)";
      } else if (signals.callOutcome === "promised") {
        result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Customer gave verbal commitment. Honour 48h window." });
        result.suppressed.push({ key: "voicebot",   label: "Voice Bot",  reason: "Respect commitment window — avoid over-contact" });
        result.reasoning.push("🤝 Promise received: Suppress CC/Voice 48h. Digital-only follow-up.");
        result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Gentle reminder of commitment" });
        result.primary = "WhatsApp";
        result.nextContactTime = "After 48 hours";
      } else {
        result.channels.push({ key: "callcenter", label: "Call Center", priority: 1, reason: isRed ? "Red bucket — priority CC call" : "Amber: CC activation at T-15" });
        result.channels.push({ key: "voicebot",   label: "Voice Bot",  priority: 2, reason: "Voice bot reminder" });
        result.channels.push({ key: "whatsapp",   label: "WhatsApp",   priority: 3, reason: "Digital payment link" });
        result.channels.push({ key: "sms",        label: "SMS",        priority: 4, reason: "SMS fallback" });
        result.primary = "Call Center";
      }
      result.confidenceScore = isRed ? 65 : 78;
      result.estimatedSuccessRate = isRed ? 42 : 63;
    }
    return result;
  }

  // -------------------------------------------------------
  // T-6 to T-1: Closing window — high urgency
  // -------------------------------------------------------
  if (preDue && daysAbs <= 6) {
    result.messageType = "payment-reminder-urgent";
    if (isGreen) {
      result.urgencyLevel = "low";
      result.reasoning.push("🟢 Green T-1: Digital only. Even at T-1, Green customers need no CC call — they will pay.");
      result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Green bucket: no CC even at T-1" });
      result.channels.push({ key: "voicebot", label: "Voice Bot", priority: 1, reason: "Allowed at T-1 for non-CC reminder" });
      result.channels.push({ key: "whatsapp", label: "WhatsApp",  priority: 2, reason: "Final digital reminder" });
      result.channels.push({ key: "sms",      label: "SMS",       priority: 3, reason: "SMS fallback" });
      result.primary = "Voice Bot";
      result.confidenceScore = 86;
      result.estimatedSuccessRate = 85;
    } else {
      result.urgencyLevel = isRed ? "critical" : "high";
      result.reasoning.push(`${isRed ? "🔴" : "🟡"} T-${daysAbs}: Closing pre-due window. Escalating all channels.`);
      if (signals.callOutcome === "promised") {
        result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Promise given recently — check if window has elapsed" });
        result.reasoning.push("🤝 Recent promise — verify if payment due before re-escalating CC");
      }
      if (!isSI) {
        result.channels.push({ key: "callcenter", label: "Call Center", priority: 1, reason: "Highest priority — last chance pre-due" });
      }
      result.channels.push({ key: "voicebot", label: "Voice Bot", priority: 2, reason: "Voice Bot for reminder" });
      result.channels.push({ key: "whatsapp", label: "WhatsApp",  priority: 3, reason: "WhatsApp payment link" });
      result.channels.push({ key: "chatbot",  label: "Chatbot",   priority: 4, reason: "Chatbot for assisted payment" });
      result.primary = isSI ? "WhatsApp" : "Call Center";
      result.confidenceScore = isRed ? 58 : 71;
      result.estimatedSuccessRate = isRed ? 38 : 56;
    }
    return result;
  }

  // -------------------------------------------------------
  // DUE DATE (T=0)
  // -------------------------------------------------------
  if (journeyDay === 0) {
    result.urgencyLevel = "critical";
    result.messageType = "payment-reminder-urgent";
    result.reasoning.push("🔔 Due date: All channels active for Non-SI, Non-Green customers.");
    if (isGreen) {
      result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Green: Green customers historically pay on due date — no call" });
      result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Green bucket: digital-only on due date — high propensity to self-pay" });
      result.channels.push({ key: "sms",      label: "SMS",      priority: 2, reason: "SMS fallback if WhatsApp undelivered" });
      result.primary = "WhatsApp";
      result.confidenceScore = 89;
    } else {
      result.channels.push({ key: "callcenter", label: "Call Center",      priority: 1, reason: isRed ? "Red bucket on due date: human agent has highest conversion rate" : "Non-green on due date: CC maximises same-day payment probability" });
      result.channels.push({ key: "voicebot",   label: "Voice Bot",        priority: 2, reason: "Automated voice reminder — scales across high contact volume" });
      result.channels.push({ key: "whatsapp",   label: "WhatsApp",         priority: 3, reason: "Payment link delivery — highest open rate of digital channels" });
      result.channels.push({ key: "chatbot",    label: "AI Chatbot",       priority: 4, reason: "Sarvam chatbot for assisted self-service payment" });
      result.channels.push({ key: "saaspot",    label: "Saaspot Creative", priority: 5, reason: "Urgency creative to reinforce premium due message" });
      result.channels.push({ key: "sms",        label: "SMS",              priority: 6, reason: "SMS broadcast fallback — highest delivery rate" });
      result.primary = "Call Center";
      result.confidenceScore = 72;
    }
    result.estimatedSuccessRate = isGreen ? 88 : isAmber ? 51 : 32;
    return result;
  }

  // -------------------------------------------------------
  // POST-DUE GRACE PERIOD (T+1 to T+30)
  // -------------------------------------------------------
  if (journeyDay >= 2 && journeyDay <= 30) {
    if (!result.messageType) result.messageType = "grace-period-warning";
    result.urgencyLevel = "critical";
    result.reasoning.push(`⏰ T+${journeyDay}: Grace period. ${85}% of renewals collected before T+30. Full escalation active.`);
    if (signals.callOutcome === "refused") {
      result.reasoning.push("❌ Customer refused payment. Escalate to specialist agent — standard CC may not work.");
      result.channels.push({ key: "callcenter", label: "Call Center (Specialist)", priority: 1, reason: "Route to product-specialist agent trained for lapse-risk conversations" });
      result.channels.push({ key: "fieldagent", label: "Field Agent",              priority: 2, reason: "High-value refusal: consider field agent visit" });
    } else if (signals.callOutcome === "promised") {
      result.reasoning.push("🤝 Promise in window: Monitor, don't over-contact. Re-check after promised date.");
      result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Soft payment confirmation reminder" });
      result.nextContactTime = "After promise window";
    } else {
      result.channels.push({ key: "callcenter", label: "Call Center", priority: 1, reason: "Grace period escalation" });
      result.channels.push({ key: "whatsapp",   label: "WhatsApp",   priority: 2, reason: "Lapse warning message + payment link" });
      result.channels.push({ key: "voicebot",   label: "Voice Bot",  priority: 3, reason: (journeyDay <= 5) ? "Active at T+3 and T+5" : "Reduced post-T+5" });
      result.channels.push({ key: "sms",        label: "SMS",        priority: 4, reason: "SMS reminder" });
      if (journeyDay >= 15) {
        result.channels.push({ key: "email", label: "Email", priority: 5, reason: "Email at T+15 for monthly mode policies" });
      }
    }
    result.primary = signals.callOutcome === "refused" ? "Call Center (Specialist)" :
                     signals.callOutcome === "promised" ? "WhatsApp" : "Call Center";
    result.confidenceScore = 68;
    result.estimatedSuccessRate = journeyDay <= 5 ? 38 : journeyDay <= 15 ? 28 : 18;
    return result;
  }

  // -------------------------------------------------------
  // LAPSED — T+31 onwards
  // -------------------------------------------------------
  if (journeyDay > 30) {
    result.messageType = "revival-campaign";
    result.urgencyLevel = "medium";
    result.phase = "lapsed";
    result.reasoning.push(`📴 T+${journeyDay}: Policy in lapsed state. CC/Voice withdrawn. Digital revival cadence only.`);
    result.reasoning.push("💡 Objective shifts from renewal to revival — highlighting lost coverage and revival benefits.");
    result.suppressed.push({ key: "callcenter", label: "Call Center", reason: "Post T+30: CC cost not justified for lapsed customers" });
    result.suppressed.push({ key: "voicebot",   label: "Voice Bot",  reason: "Post T+30: Voice Bot withdrawn" });
    result.channels.push({ key: "whatsapp", label: "WhatsApp", priority: 1, reason: "Revival campaign — WhatsApp primary" });
    result.channels.push({ key: "sms",      label: "SMS",      priority: 2, reason: "SMS for low-digital customers" });
    if (journeyDay >= 60) {
      result.channels.push({ key: "saaspot", label: "Saaspot Creative", priority: 3, reason: "Rich revival creative at T+60 and T+90" });
    }
    if (journeyDay >= 90) {
      result.channels.push({ key: "email", label: "Email", priority: 4, reason: "Email revival push at T+90" });
    }
    if (digitalEngagement === "very-low") {
      result.reasoning.push("📲 Very low digital engagement: Consider field agent visit for revival.");
      result.channels.push({ key: "fieldagent", label: "Field Agent", priority: 5, reason: "Very-low digital: field visit for revival" });
    }
    result.primary = digitalEngagement === "very-low" ? "Field Agent" : "WhatsApp";
    result.confidenceScore = 45;
    result.estimatedSuccessRate = journeyDay <= 60 ? 14 : journeyDay <= 90 ? 9 : 5;
    return result;
  }

  return result;
}

// Helper: get journey phase label
function getPhaseLabel(journeyDay) {
  if (journeyDay < -30) return "Early Pre-Due";
  if (journeyDay < -14) return "Warm-Up";
  if (journeyDay < 0)   return "Activation Window";
  if (journeyDay === 0) return "Due Date";
  if (journeyDay <= 30) return "Grace Period";
  if (journeyDay <= 90) return "Lapsed — Revival";
  return "Long-Tail Revival";
}

// Helper: format journey day as "T-45" or "T+3" or "T"
function formatJourneyDay(day) {
  if (day === 0) return "T";
  return day < 0 ? `T${day}` : `T+${day}`;
}

// Helper: propensity bucket display info
function getBucketInfo(bucket) {
  const map = {
    "green-high": { label: "Green High", color: "#059669", bg: "#D1FAE5", tag: "GH" },
    "green-mid":  { label: "Green Mid",  color: "#10B981", bg: "#D1FAE5", tag: "GM" },
    "green-low":  { label: "Green Low",  color: "#34D399", bg: "#D1FAE5", tag: "GL" },
    "amber":      { label: "Amber",      color: "#D97706", bg: "#FEF3C7", tag: "AM" },
    "red":        { label: "Red",        color: "#DC2626", bg: "#FEE2E2", tag: "RE" }
  };
  return map[bucket] || { label: bucket, color: "#6B7280", bg: "#F3F4F6", tag: "?" };
}

// Helper: urgency color
function getUrgencyColor(level) {
  const map = { low: "#10B981", medium: "#F59E0B", high: "#EF4444", critical: "#7C3AED" };
  return map[level] || "#6B7280";
}
