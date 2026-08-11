// =============================================================
// js/app.js — Main Application Controller
// SBI Life × Greylabs AI Engagement Platform
// =============================================================

// ---- Nav routing ----
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    document.getElementById('pageTitle').textContent = btn.querySelector('span')?.textContent || view;
  });
});

// ---- Dashboard ----
function initDashboard() {
  // Donut — Propensity distribution
  renderDonutChart('donut-propensity', [
    { label: 'Green High',  value: 89750,  color: '#059669' },
    { label: 'Green Mid',   value: 55900,  color: '#10B981' },
    { label: 'Green Low',   value: 13600,  color: '#34D399' },
    { label: 'Amber',       value: 53900,  color: '#D97706' },
    { label: 'Red',         value: 31850,  color: '#DC2626' }
  ], { size: 160, strokeWidth: 28, centerLabel: '2.45L', centerSub: 'Policies' });

  // Bar — Channel effectiveness
  renderBarChart('bar-channel-eff', [
    { label: 'WhatsApp',  shortLabel: 'WA',   value: 34, color: '#25D366' },
    { label: 'Call Ctr',  shortLabel: 'CC',   value: 28, color: '#EF4444' },
    { label: 'SMS',       shortLabel: 'SMS',  value: 18, color: '#3B82F6' },
    { label: 'Voice Bot', shortLabel: 'VB',   value: 12, color: '#F59E0B' },
    { label: 'Chatbot',   shortLabel: 'CB',   value:  9, color: '#06B6D4' },
    { label: 'Saaspot',   shortLabel: 'SS',   value:  7, color: '#EC4899' },
    { label: 'Email',     shortLabel: 'EM',   value:  5, color: '#8B5CF6' }
  ], { height: 150, barWidth: 26, gap: 14, suffix: '%' });

  // Sparklines for KPI trends
  renderSparkline('spark-renewal',  [83,84,85,84,86,87,87.3], '#059669');
  renderSparkline('spark-risk',     [20200,19800,19100,18700,18420], '#DC2626');
  renderSparkline('spark-cost',     [155,148,142,135,130,127], '#6366F1');
  renderSparkline('spark-coverage', [91,92,93,92,94,95], '#D97706');

  startSignalFeed();
}

// ---- Live signal feed ----
const SIGNALS = [
  { name: "Meera Iyer",    desc: "Replied to WhatsApp chatbot — payment intent confirmed",     icon: "wa",  color: "#25D366", bg: "#DCFCE7",  time: "Just now"   },
  { name: "Vijay Reddy",   desc: "Read T-5 SI balance maintenance reminder",                   icon: "wa",  color: "#25D366", bg: "#DCFCE7",  time: "2 min ago"  },
  { name: "Fatima Sheikh", desc: "Clicked payment link via WhatsApp chatbot",                  icon: "cb",  color: "#06B6D4", bg: "#CFFAFE",  time: "5 min ago"  },
  { name: "Ravi Desai",    desc: "Chatbot query: 'Can I pay via UPI?'",                        icon: "cb",  color: "#06B6D4", bg: "#CFFAFE",  time: "8 min ago"  },
  { name: "Deepa Nair",    desc: "Call Center — payment confirmed for next week",              icon: "cc",  color: "#EF4444", bg: "#FEE2E2",  time: "11 min ago" },
  { name: "Rekha Tiwari",  desc: "Call Center — verbal commitment received",                   icon: "cc",  color: "#EF4444", bg: "#FEE2E2",  time: "14 min ago" },
  { name: "Pooja Agarwal", desc: "Email opened — policy warm-up message",                     icon: "email",color: "#8B5CF6", bg: "#EDE9FE",  time: "18 min ago" },
  { name: "Harish Joshi",  desc: "Voice Bot — no answer after 3 attempts",                    icon: "voice",color: "#F59E0B", bg: "#FEF3C7",  time: "22 min ago" },
  { name: "Manoj Gupta",   desc: "WhatsApp T-15 SI reminder delivered — unread",              icon: "wa",  color: "#25D366", bg: "#DCFCE7",  time: "26 min ago" },
  { name: "Priya Sharma",  desc: "WhatsApp payment link delivered and read",                   icon: "wa",  color: "#25D366", bg: "#DCFCE7",  time: "31 min ago" }
];

let signalIndex = 0;
function renderSignalFeed() {
  const feed = document.getElementById('signal-feed');
  if (!feed) return;
  feed.innerHTML = SIGNALS.slice(0, 8).map(s => `
    <div class="signal-item">
      <div class="signal-icon" style="background:${s.bg};color:${s.color};">
        ${CHANNEL_ICONS[s.icon] || ''}
      </div>
      <div class="signal-text">
        <div class="signal-name">${s.name}</div>
        <div class="signal-desc">${s.desc}</div>
      </div>
      <div class="signal-time">${s.time}</div>
    </div>`).join('');
}

function startSignalFeed() {
  renderSignalFeed();
  setInterval(() => {
    // Rotate signals to simulate live feed
    SIGNALS.unshift({
      name: PERSONAS[Math.floor(Math.random() * PERSONAS.length)].name,
      desc: ["Opened WhatsApp reminder", "Payment link clicked", "Call answered — processing payment", "Chatbot interaction"][Math.floor(Math.random()*4)],
      icon: ["wa","cb","cc","voice"][Math.floor(Math.random()*4)],
      color: ["#25D366","#06B6D4","#EF4444","#F59E0B"][Math.floor(Math.random()*4)],
      bg:    ["#DCFCE7","#CFFAFE","#FEE2E2","#FEF3C7"][Math.floor(Math.random()*4)],
      time: "Just now"
    });
    // Update times
    SIGNALS.forEach((s, i) => {
      if (i > 0) {
        const prev = SIGNALS[i-1];
        s.time = prev.time === "Just now" ? "2 min ago" : s.time;
      }
    });
    SIGNALS.splice(12);
    renderSignalFeed();
  }, 8000);
}

// ---- Personas View ----
let activeFilter = 'all';
let searchQuery = '';

function getBucketClass(b) {
  return 'bucket-' + b;
}

function getSIClass(p) {
  if (p.siStatus === 'not-registered') return 'si-not-registered';
  if (p.siHealth === 'failed') return 'si-failed';
  return 'si-registered';
}

function getSILabel(p) {
  if (p.siStatus === 'not-registered') return 'Non-SI';
  if (p.siHealth === 'failed') return 'SI Failed';
  return 'SI Registered';
}

function getJourneyStyle(day) {
  if (day < 0)  return { bg: '#EDE9FE', color: '#4C1D95' };
  if (day === 0)return { bg: '#FEE2E2', color: '#991B1B' };
  if (day <= 30)return { bg: '#FFF7ED', color: '#9A3412' };
  return { bg: '#F1F5F9', color: '#475569' };
}

function getEngagementColor(score) {
  if (score >= 80) return '#059669';
  if (score >= 50) return '#D97706';
  return '#DC2626';
}

function renderPersonaCard(p) {
  const rec = getChannelRecommendation(p);
  const bucket = getBucketInfo(p.propensityBucket);
  const jStyle = getJourneyStyle(p.journeyDay);
  const engColor = getEngagementColor(p.engagementScore);
  const chanConf = CHANNEL_CONFIG[rec.primary?.toLowerCase().replace(/\s+/g,'').replace('(specialist)','')];
  const primaryColor = chanConf?.color || '#6366F1';
  const primaryBg = chanConf?.bgColor || '#EDE9FE';
  const channelIconKey = chanConf?.icon || 'wa';

  return `
    <div class="persona-card" data-id="${p.id}" onclick="openPersonaModal(${p.id})">
      <div class="persona-card-header">
        <div class="persona-avatar" style="background:${p.avatarColor}">${p.initials}</div>
        <div class="persona-info">
          <div class="persona-name">${p.name}</div>
          <div class="persona-sub">${p.occupation} · ${p.city}</div>
          <div class="persona-sub" style="margin-top:2px">Policy: ${p.policyNumber.slice(-6)}</div>
        </div>
      </div>

      <div class="persona-badges">
        <span class="badge ${getBucketClass(p.propensityBucket)}" title="Propensity Bucket">
          ${bucket.label}
        </span>
        <span class="badge ${getSIClass(p)}" title="SI Status">
          ${getSILabel(p)}
        </span>
        <span class="badge" style="background:#F1F5F9;color:#475569;">
          ₹${(p.premiumAmount/1000).toFixed(0)}K/yr
        </span>
      </div>

      <div class="persona-metrics">
        <div class="journey-day-badge" style="background:${jStyle.bg};color:${jStyle.color};">
          <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
          Journey: ${formatJourneyDay(p.journeyDay)}
          &nbsp;·&nbsp;${getPhaseLabel(p.journeyDay)}
        </div>

        <div class="engagement-row">
          <span class="eng-label">Engagement</span>
          <div class="eng-bar-track">
            <div class="eng-bar-fill" style="width:${p.engagementScore}%;background:${engColor};"></div>
          </div>
          <span class="eng-score" style="color:${engColor}">${p.engagementScore}</span>
        </div>

        <div class="rec-channel-row">
          <div class="rec-icon" style="background:${primaryBg};color:${primaryColor};">
            ${CHANNEL_ICONS[channelIconKey] || ''}
          </div>
          <span class="rec-label">
            <span style="font-size:9px;color:var(--text-3);display:block;margin-bottom:1px;">AI Recommends</span>
            ${rec.primary || 'Analysing…'}
          </span>
          <span class="rec-urgency urgency-${rec.urgencyLevel}">${rec.urgencyLevel}</span>
        </div>
      </div>
    </div>`;
}

function initPersonas() {
  const grid = document.getElementById('persona-grid');
  const searchEl = document.getElementById('persona-search');
  const filters = document.querySelectorAll('.persona-filter-btn');

  function render() {
    let list = PERSONAS;
    if (activeFilter !== 'all') {
      list = list.filter(p => {
        if (activeFilter === 'green')   return p.propensityBucket.startsWith('green');
        if (activeFilter === 'amber')   return p.propensityBucket === 'amber';
        if (activeFilter === 'red')     return p.propensityBucket === 'red';
        if (activeFilter === 'si')      return p.siStatus === 'registered';
        if (activeFilter === 'non-si')  return p.siStatus === 'not-registered';
        if (activeFilter === 'predue')  return p.journeyDay < 0;
        if (activeFilter === 'postdue') return p.journeyDay >= 0;
        return true;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.occupation.toLowerCase().includes(q) ||
        p.policyNumber.toLowerCase().includes(q)
      );
    }
    grid.innerHTML = list.length
      ? list.map(renderPersonaCard).join('')
      : '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-3);">No personas match your filters.</div>';
    document.getElementById('persona-count').textContent = list.length + ' personas';
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  searchEl?.addEventListener('input', e => { searchQuery = e.target.value; render(); });
  render();
}

// ---- Modal ----
function openPersonaModal(id) {
  const p = PERSONAS.find(x => x.id === id);
  if (!p) return;
  const rec = getChannelRecommendation(p);
  const bucket = getBucketInfo(p.propensityBucket);

  // Update header
  const avatarEl = document.getElementById('modalAvatar');
  if (avatarEl) { avatarEl.style.background = p.avatarColor; avatarEl.textContent = p.initials; }
  const nameEl = document.getElementById('modalName');
  if (nameEl) nameEl.textContent = p.name;
  const subEl = document.getElementById('modalSub');
  if (subEl) subEl.textContent = `${p.occupation} · ${p.city}, ${p.state} · Policy ${p.policyNumber}`;
  const tagsEl = document.getElementById('modalTags');
  if (tagsEl) tagsEl.innerHTML = `
    <span class="badge" style="background:${bucket.bg};color:${bucket.color}">${bucket.label}</span>
    <span class="badge ${getSIClass(p)}">${getSILabel(p)}</span>
    <span class="badge" style="background:rgba(255,255,255,.15);color:rgba(255,255,255,.8)">
      ${formatJourneyDay(p.journeyDay)} · ${getPhaseLabel(p.journeyDay)}
    </span>
    <span class="badge" style="background:rgba(255,255,255,.1);color:rgba(255,255,255,.6)">
      Eng. Score: ${p.engagementScore}/100
    </span>`;

  document.getElementById('modalBody').innerHTML = buildModalContent(p, rec, bucket);
  document.getElementById('personaModal').classList.add('open');
}

function buildModalContent(p, rec, bucket) {
  const chanConf = CHANNEL_CONFIG[rec.primary?.toLowerCase().replace(/\s+/g,'').replace('(specialist)','')];
  const primaryColor = chanConf?.color || '#6366F1';
  const channelIconKey = chanConf?.icon || 'wa';

  // Message preview
  const tpl = MESSAGE_TEMPLATES[rec.messageType] || MESSAGE_TEMPLATES['payment-reminder-gentle'];
  const msgBody = (tpl.body || '').replace('{name}', p.name.split(' ')[0])
    .replace(/{policyNumber}/g, p.policyNumber)
    .replace(/{amount}/g, `₹${p.premiumAmount.toLocaleString()}`)
    .replace(/{dueDate}/g, 'Aug 20, 2026')
    .replace(/{daysLeft}/g, Math.abs(p.journeyDay))
    .replace('{failureReason}', 'Insufficient balance')
    .replace('{sumAssured}', '₹25 Lakhs')
    .replace('{lapseDate}', 'Sep 19, 2026')
    .replace('{revivalDays}', '90');

  const jStyle = getJourneyStyle(p.journeyDay);
  const allChannelHTML = (rec.channels || []).map((ch, i) => {
    const cfg = CHANNEL_CONFIG[ch.key];
    return `<div class="ai-ch-chip ${i === 0 ? 'priority-1' : ''}">
      <span style="width:13px;height:13px;color:${cfg?.color||'#fff'}">${CHANNEL_ICONS[cfg?.icon||'wa']||''}</span>
      <span>${ch.label}</span>
      <span class="priority-num">#${i+1}</span>
    </div>`;
  }).join('');

  const suppressedHTML = (rec.suppressed || []).map(s =>
    `<div class="suppressed-chip">
      <svg viewBox="0 0 20 20" fill="currentColor" width="10" height="10"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
      ${s.label} suppressed
    </div>`).join('');

  const reasonHTML = (rec.reasoning || []).map(r => `<div class="ai-reason-item">${r}</div>`).join('');

  const histHTML = (p.communicationHistory || []).map(h => {
    const engaged = h.engaged;
    const cfg = CHANNEL_CONFIG[h.icon] || {};
    return `<div class="timeline-item">
      <div class="timeline-dot ${engaged ? 'engaged' : 'not-engaged'}">
        <span style="width:12px;height:12px;color:${cfg.color||'#888'}">${CHANNEL_ICONS[h.icon]||''}</span>
      </div>
      <div class="timeline-content">
        <div class="timeline-title">${h.event}</div>
        <div class="timeline-meta">${h.daysAgo === 0 ? 'Today' : h.daysAgo + ' days ago'} · ${h.channel}</div>
        <span class="timeline-tag" style="background:${engaged?'#DCFCE7':'#FEE2E2'};color:${engaged?'#166534':'#991B1B'}">
          ${engaged ? '✓ Engaged' : '✗ No response'}
        </span>
      </div>
    </div>`;
  }).join('');

  // Signals summary
  const s = p.signals;
  const sigHTML = `
    <div class="profile-grid">
      <div>
        <div class="profile-field-label">WhatsApp</div>
        <div class="profile-field-value">${s.whatsappDelivered ? (s.whatsappRead ? (s.whatsappReplied ? '✅ Replied' : '👁 Read') : '✔ Delivered') : '✗ Not delivered'}</div>
      </div>
      <div>
        <div class="profile-field-label">Last Call</div>
        <div class="profile-field-value">${s.callOutcome ? s.callOutcome.replace('_',' ') : 'N/A'}</div>
      </div>
      <div>
        <div class="profile-field-label">Email</div>
        <div class="profile-field-value">${s.emailOpened ? '📧 Opened' : s.emailOpened === false ? 'Not opened' : 'N/A'}</div>
      </div>
      <div>
        <div class="profile-field-label">Chatbot</div>
        <div class="profile-field-value">${s.chatbotInteracted ? '💬 Interacted' : 'No interaction'}</div>
      </div>
    </div>`;

  // Interaction summary stats
  const totalContacts = p.communicationHistory.length;
  const engagedContacts = p.communicationHistory.filter(h => h.engaged).length;
  const responseRate = totalContacts > 0 ? Math.round(engagedContacts / totalContacts * 100) : 0;
  const lastContact = totalContacts > 0
    ? (p.communicationHistory[0].daysAgo === 0 ? 'Today' : `${p.communicationHistory[0].daysAgo}d ago`)
    : 'None';

  // Renewal intent derived from signals
  const si = p.signals;
  let intentLabel, intentColor;
  if (si.callOutcome === 'promised')     { intentLabel = 'Verbal payment commitment given'; intentColor = '#059669'; }
  else if (si.callOutcome === 'refused') { intentLabel = 'Payment explicitly refused'; intentColor = '#DC2626'; }
  else if (si.whatsappReplied)           { intentLabel = 'Actively responding via WhatsApp'; intentColor = '#059669'; }
  else if (si.chatbotInteracted)         { intentLabel = 'Self-service payment query initiated'; intentColor = '#059669'; }
  else if (si.whatsappRead)              { intentLabel = 'Reading messages — no payment action yet'; intentColor = '#D97706'; }
  else if (si.emailOpened)              { intentLabel = 'Email opened — monitoring closely'; intentColor = '#D97706'; }
  else if (p.engagementScore >= 80)     { intentLabel = 'High propensity — likely to self-pay on time'; intentColor = '#059669'; }
  else if (p.engagementScore >= 50)     { intentLabel = 'Moderate signal — gentle nudge required'; intentColor = '#D97706'; }
  else                                  { intentLabel = 'Low engagement — active escalation needed'; intentColor = '#DC2626'; }

  const recentInteractionsHTML = p.communicationHistory.slice(0, 2).map(h => {
    const cfg = CHANNEL_CONFIG[h.icon] || {};
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-light)">
      <div style="width:22px;height:22px;border-radius:6px;background:${cfg.bgColor||'#F1F5F9'};color:${cfg.color||'#64748B'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span style="width:12px;height:12px">${CHANNEL_ICONS[h.icon]||''}</span>
      </div>
      <div style="flex:1;font-size:11px;color:var(--text-2);line-height:1.3">${h.event}</div>
      <span style="font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;background:${h.engaged?'#DCFCE7':'#FEE2E2'};color:${h.engaged?'#166534':'#991B1B'};flex-shrink:0">${h.engaged?'Engaged':'No response'}</span>
    </div>`;
  }).join('');

  return `
    <!-- AI Recommendation Panel (full width) -->
    <div class="ai-rec-panel" style="grid-column:1/-1">
      <div class="ai-rec-title">🤖 AI Channel Recommendation Engine</div>
      <div class="ai-rec-primary-row">
        <div class="ai-primary-channel">
          <div class="ai-channel-icon" style="background:rgba(255,255,255,.15);color:${primaryColor}">
            <span style="width:18px;height:18px">${CHANNEL_ICONS[channelIconKey]||''}</span>
          </div>
          <div>
            <div class="ai-channel-label">${rec.primary || 'Analysing…'}</div>
            <div class="ai-channel-sub">Primary Recommended Channel</div>
            <div style="font-size:11px;color:rgba(255,255,255,.65);margin-top:4px;font-style:italic">${rec.channels[0]?.reason || ''}</div>
          </div>
        </div>
        <div class="ai-score-col" style="min-width:80px">
          <div class="ai-score-val">${rec.confidenceScore}%</div>
          <div class="ai-score-lbl">Confidence</div>
        </div>
        <div class="ai-score-col" style="min-width:80px">
          <div class="ai-score-val" style="color:#86EFAC">${rec.estimatedSuccessRate}%</div>
          <div class="ai-score-lbl">Est. Success</div>
        </div>
        <div class="ai-score-col" style="min-width:90px">
          <div class="ai-score-val" style="color:#FCD34D;font-size:18px;text-transform:capitalize">${rec.urgencyLevel}</div>
          <div class="ai-score-lbl">Urgency</div>
        </div>
      </div>

      <div class="ai-reasoning">${reasonHTML}</div>

      <div style="margin-top:10px;font-size:10px;color:rgba(255,255,255,.4);font-weight:600;letter-spacing:.5px;text-transform:uppercase">Recommended Channels (priority order)</div>
      <div class="ai-channels-row">${allChannelHTML}</div>

      ${rec.suppressed?.length ? `
        <div style="margin-top:8px;font-size:10px;color:rgba(255,255,255,.4);font-weight:600;letter-spacing:.5px;text-transform:uppercase">Suppressed Channels</div>
        <div class="suppressed-row">${suppressedHTML}</div>` : ''}
    </div>

    <!-- Previous Interaction Summary + Renewal Intent (full width) -->
    <div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:12px">

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Previous Interaction Summary</div>
            <div class="card-sub">${totalContacts} recorded contacts</div>
          </div>
        </div>
        <div class="card-body" style="padding:12px 16px">
          <div style="display:flex;gap:0;margin-bottom:12px;text-align:center">
            <div style="flex:1;border-right:1px solid var(--border-light)">
              <div style="font-size:20px;font-weight:800;color:${engagedContacts === 0 && totalContacts > 0 ? '#DC2626' : '#059669'}">${engagedContacts}/${totalContacts}</div>
              <div style="font-size:10px;color:var(--text-3)">Engaged / Total</div>
            </div>
            <div style="flex:1;border-right:1px solid var(--border-light)">
              <div style="font-size:20px;font-weight:800;color:${responseRate >= 60 ? '#059669' : responseRate >= 30 ? '#D97706' : '#DC2626'}">${responseRate}%</div>
              <div style="font-size:10px;color:var(--text-3)">Response Rate</div>
            </div>
            <div style="flex:1">
              <div style="font-size:16px;font-weight:800;color:var(--text-1)">${lastContact}</div>
              <div style="font-size:10px;color:var(--text-3)">Last Contact</div>
            </div>
          </div>
          <div style="font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Most Recent Interactions</div>
          ${recentInteractionsHTML || '<div style="font-size:12px;color:var(--text-3)">No history recorded.</div>'}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Renewal Intent Signal</div>
        </div>
        <div class="card-body" style="padding:12px 16px">
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:${intentColor}18;border:1px solid ${intentColor}44;margin-bottom:12px">
            <div style="width:10px;height:10px;border-radius:50%;background:${intentColor};flex-shrink:0"></div>
            <div style="font-size:13px;font-weight:700;color:${intentColor}">${intentLabel}</div>
          </div>
          <div style="font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Signal Breakdown</div>
          <div class="quick-stat" style="padding:5px 0;border-bottom:1px solid var(--border-light)"><span class="qs-label">WhatsApp</span><span class="qs-val" style="font-size:12px">${si.whatsappReplied ? '✅ Replied' : si.whatsappRead ? '👁 Read' : si.whatsappDelivered ? '✔ Delivered' : '✗ Not delivered'}</span></div>
          <div class="quick-stat" style="padding:5px 0;border-bottom:1px solid var(--border-light)"><span class="qs-label">Last Call</span><span class="qs-val" style="font-size:12px">${si.callOutcome ? si.callOutcome.replace('_',' ') : 'No call made'}</span></div>
          <div class="quick-stat" style="padding:5px 0;border-bottom:1px solid var(--border-light)"><span class="qs-label">Email</span><span class="qs-val" style="font-size:12px">${si.emailOpened ? '📧 Opened' : si.emailOpened === false ? 'Not opened' : 'N/A'}</span></div>
          <div class="quick-stat" style="padding:5px 0;border:none"><span class="qs-label">Chatbot</span><span class="qs-val" style="font-size:12px">${si.chatbotInteracted ? '💬 Interacted' : 'No interaction'}</span></div>
          <div style="margin-top:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:10px;color:var(--text-3)">Engagement Score</span>
              <span style="font-size:10px;font-weight:700;color:${getEngagementColor(p.engagementScore)}">${p.engagementScore}/100</span>
            </div>
            <div style="height:6px;background:var(--border-light);border-radius:999px;overflow:hidden">
              <div style="width:${p.engagementScore}%;height:100%;background:${getEngagementColor(p.engagementScore)};border-radius:999px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Left column: Profile + Signals -->
    <div class="flex-col gap-12">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Policy Profile</div>
            <div class="card-sub">Customer & policy details</div>
          </div>
          <span class="badge" style="background:${jStyle.bg};color:${jStyle.color};font-size:12px;padding:4px 10px">
            ${formatJourneyDay(p.journeyDay)} · ${getPhaseLabel(p.journeyDay)}
          </span>
        </div>
        <div class="card-body">
          <div class="profile-grid">
            <div>
              <div class="profile-field-label">Policy Type</div>
              <div class="profile-field-value">${p.policyType}</div>
            </div>
            <div>
              <div class="profile-field-label">Annual Premium</div>
              <div class="profile-field-value">₹${p.premiumAmount.toLocaleString()}</div>
            </div>
            <div>
              <div class="profile-field-label">Propensity</div>
              <div class="profile-field-value">
                <span class="badge ${getBucketClass(p.propensityBucket)}">${getBucketInfo(p.propensityBucket).label}</span>
              </div>
            </div>
            <div>
              <div class="profile-field-label">SI Status</div>
              <div class="profile-field-value">
                <span class="badge ${getSIClass(p)}">${getSILabel(p)}</span>
              </div>
            </div>
            <div>
              <div class="profile-field-label">Prior Lapses</div>
              <div class="profile-field-value">${p.previousLapses} ${p.previousLapses === 0 ? '✅' : p.previousLapses >= 3 ? '⚠️' : '⚡'}</div>
            </div>
            <div>
              <div class="profile-field-label">Digital Engagement</div>
              <div class="profile-field-value" style="text-transform:capitalize">${p.digitalEngagement}</div>
            </div>
            <div>
              <div class="profile-field-label">Language</div>
              <div class="profile-field-value">${p.preferredLanguage}</div>
            </div>
            <div>
              <div class="profile-field-label">Field Agent</div>
              <div class="profile-field-value" style="font-size:11px">${p.fieldAgent}</div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="profile-field-label" style="margin-bottom:8px">7-Day Interaction Signals</div>
          ${sigHTML}
          ${p.notes ? `<div class="divider"></div><div class="profile-field-label">Analyst Notes</div><div style="font-size:12px;color:var(--text-2);margin-top:4px;line-height:1.5">${p.notes}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Right column: History + Message -->
    <div class="flex-col gap-12">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Communication History</div>
        </div>
        <div class="card-body">
          <div class="timeline">${histHTML || '<div style="color:var(--text-3);font-size:12px">No interactions recorded yet.</div>'}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Recommended Message Preview</div>
        </div>
        <div class="card-body">
          <div class="msg-preview-header">
            <span class="msg-preview-type">${rec.messageType || 'generic-reminder'}</span>
            <span class="msg-preview-tone urgency-${rec.urgencyLevel}" style="padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600">${(tpl.tone || 'informational').toUpperCase()}</span>
          </div>
          <div class="msg-preview">${msgBody}</div>
          <div style="margin-top:10px;display:flex;gap:8px">
            <button style="flex:1;padding:8px;background:var(--gl-purple);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">${tpl.callToAction?.replace('{amount}', '₹'+p.premiumAmount.toLocaleString()) || 'Send Message'}</button>
            <button style="padding:8px 14px;background:var(--bg);color:var(--text-2);border:1px solid var(--border);border-radius:8px;font-size:12px;cursor:pointer">Edit</button>
          </div>
        </div>
      </div>
    </div>`;
}

// Close modal
document.getElementById('modalClose')?.addEventListener('click', () => {
  document.getElementById('personaModal').classList.remove('open');
});
document.getElementById('personaModal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('personaModal')) {
    document.getElementById('personaModal').classList.remove('open');
  }
});

// ---- AI Engine Page ----
function initEngine() {
  const list = document.getElementById('engine-persona-list');
  list.innerHTML = PERSONAS.map(p => {
    const jStyle = getJourneyStyle(p.journeyDay);
    return `<div class="engine-persona-item" data-id="${p.id}" onclick="selectEnginePersona(${p.id})">
      <div class="ep-avatar" style="background:${p.avatarColor}">${p.initials}</div>
      <div class="ep-info">
        <div class="ep-name">${p.name}</div>
        <div class="ep-sub">${p.city} · ${getBucketInfo(p.propensityBucket).label}</div>
      </div>
      <div class="ep-day" style="color:${jStyle.color}">${formatJourneyDay(p.journeyDay)}</div>
    </div>`;
  }).join('');
}

function selectEnginePersona(id) {
  document.querySelectorAll('.engine-persona-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`.engine-persona-item[data-id="${id}"]`)?.classList.add('active');

  const result = document.getElementById('engine-result-content');
  result.innerHTML = `
    <div class="ai-processing">
      <div class="ai-spinner"></div>
      <div class="ai-processing-text">Analysing customer signals & applying rule engine…</div>
    </div>`;

  setTimeout(() => {
    const p = PERSONAS.find(x => x.id === id);
    if (!p) return;
    const rec = getChannelRecommendation(p);
    const bucket = getBucketInfo(p.propensityBucket);
    result.innerHTML = `<div style="padding:20px">${buildModalContent(p, rec, bucket)}</div>`;
  }, 900);
}

// ---- SOP Timeline Page ----
function initTimeline() {
  const container = document.getElementById('sop-timeline-container');
  if (!container) return;

  const phases = {
    "pre-due": { label: "Pre-Due Phase", color: "#4C1D95", bg: "#EDE9FE" },
    "due":     { label: "Due Date",      color: "#991B1B", bg: "#FEE2E2" },
    "post-due":{ label: "Grace Period",  color: "#9A3412", bg: "#FFF7ED" },
    "lapsed":  { label: "Lapsed Revival",color: "#374151", bg: "#F1F5F9" }
  };

  let lastPhase = null;
  const rows = SOP_MATRIX.map(entry => {
    let phaseHeader = '';
    if (entry.phase !== lastPhase) {
      const ph = phases[entry.phase];
      phaseHeader = ph ? `
        <div class="sop-phase-header" style="background:${ph.bg};margin-top:${lastPhase ? '8' : '0'}px">
          <div class="sop-phase-label" style="color:${ph.color}">${ph.label}</div>
        </div>` : '';
      lastPhase = entry.phase;
    }

    const jStyle = getJourneyStyle(entry.day);
    const channelTags = entry.channels.map(ck => {
      const cfg = CHANNEL_CONFIG[ck];
      return `<span class="sop-channel-tag" style="background:${cfg.bgColor};color:${cfg.color}">
        <span style="width:11px;height:11px">${CHANNEL_ICONS[cfg.icon]||''}</span>${cfg.label}
      </span>`;
    }).join('');

    return `${phaseHeader}
      <div class="sop-row">
        <div class="sop-day" style="color:${jStyle.color}">${entry.label}</div>
        <div class="sop-channels">${channelTags}</div>
        <div class="sop-note">${entry.target} ${entry.note ? '· '+entry.note : ''}</div>
      </div>`;
  }).join('');

  container.innerHTML = rows;
}

// ---- Analytics Page ----
function initAnalytics() {
  // Channel performance bars
  const container = document.getElementById('channel-perf-list');
  if (container) {
    const perf = [
      { key: 'whatsapp', rate: 34, cost: 12 },
      { key: 'callcenter', rate: 28, cost: 380 },
      { key: 'sms', rate: 18, cost: 8 },
      { key: 'voicebot', rate: 12, cost: 45 },
      { key: 'chatbot', rate: 9, cost: 18 },
      { key: 'saaspot', rate: 7, cost: 22 },
      { key: 'email', rate: 5, cost: 3 }
    ];
    container.innerHTML = perf.map(p => {
      const cfg = CHANNEL_CONFIG[p.key];
      return `<div class="channel-perf-row">
        <div class="ch-perf-icon" style="background:${cfg.bgColor};color:${cfg.color}">
          <span style="width:14px;height:14px">${CHANNEL_ICONS[cfg.icon]||''}</span>
        </div>
        <div class="ch-perf-info">
          <div class="ch-perf-name">${cfg.label}</div>
          <div class="ch-perf-track">
            <div class="ch-perf-fill" style="width:${p.rate/35*100}%;background:${cfg.color}"></div>
          </div>
        </div>
        <div class="ch-perf-vals">
          <div class="ch-perf-rate" style="color:${cfg.color}">${p.rate}%</div>
          <div class="ch-perf-cost">₹${p.cost}/contact</div>
        </div>
      </div>`;
    }).join('');
  }

  // Monthly renewal trend
  renderBarChart('bar-monthly-trend', [
    { label: 'Mar', shortLabel: 'Mar', value: 83, color: '#6366F1' },
    { label: 'Apr', shortLabel: 'Apr', value: 84, color: '#6366F1' },
    { label: 'May', shortLabel: 'May', value: 85, color: '#6366F1' },
    { label: 'Jun', shortLabel: 'Jun', value: 84, color: '#6366F1' },
    { label: 'Jul', shortLabel: 'Jul', value: 86, color: '#6366F1' },
    { label: 'Aug', shortLabel: 'Aug', value: 87, color: '#4F46E5' }
  ], { height: 120, barWidth: 30, gap: 16, suffix: '%' });

  // Bucket renewal rates
  renderBarChart('bar-bucket-renewal', [
    { label: 'Green Hi',  shortLabel: 'G-Hi',  value: 97, color: '#059669' },
    { label: 'Green Mid', shortLabel: 'G-Md',  value: 91, color: '#10B981' },
    { label: 'Green Low', shortLabel: 'G-Lo',  value: 84, color: '#34D399' },
    { label: 'Amber',     shortLabel: 'AMB',   value: 72, color: '#D97706' },
    { label: 'Red',       shortLabel: 'RED',   value: 48, color: '#DC2626' }
  ], { height: 120, barWidth: 30, gap: 14, suffix: '%' });

  // Cost savings donut
  renderDonutChart('donut-savings', [
    { label: 'Optimised Spend',  value: 73, color: '#059669' },
    { label: 'Baseline Spend',   value: 27, color: '#E2E8F0' }
  ], { size: 120, strokeWidth: 22, centerLabel: '73%', centerSub: 'Saved' });
}

// ---- Configuration Page ----
function initConfiguration() {
  const rulesList = document.getElementById('suppression-rules-list');
  if (rulesList) {
    const ruleSavings = [62, 74, 48, 38, 99, 55];
    rulesList.innerHTML = SUPPRESSION_RULES.map((rule, i) => `
      <div style="padding:12px 0;border-bottom:1px solid var(--border-light)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="width:8px;height:8px;border-radius:50%;background:#059669;flex-shrink:0"></div>
          <div style="font-size:12px;font-weight:700;color:var(--text-1);flex:1">${rule.name}</div>
          <span class="badge" style="background:#DCFCE7;color:#166534;font-size:10px">${ruleSavings[i]}% effective</span>
        </div>
        <div style="font-size:11px;color:var(--text-3);margin-bottom:6px;padding-left:16px">${rule.reason}</div>
        <div style="padding-left:16px"><div id="rule-bar-${i}"></div></div>
      </div>`).join('');
    SUPPRESSION_RULES.forEach((_, i) => {
      renderConfidenceBar(`rule-bar-${i}`, ruleSavings[i], '#059669', `${ruleSavings[i]}%`);
    });
  }

  const grid = document.getElementById('channel-config-grid');
  if (grid) {
    grid.innerHTML = Object.values(CHANNEL_CONFIG).map((ch, i) => `
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:14px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="width:30px;height:30px;border-radius:8px;background:${ch.bgColor};color:${ch.color};display:flex;align-items:center;justify-content:center">
            <span style="width:16px;height:16px">${CHANNEL_ICONS[ch.icon] || ''}</span>
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--text-1)">${ch.label}</div>
        </div>
        <div style="text-align:center;margin:6px 0">
          <div id="gauge-ch-${i}"></div>
          <div style="font-size:10px;color:var(--text-3);margin-top:2px">Success rate</div>
        </div>
        <div class="quick-stat" style="padding:6px 0;border-bottom:none"><span class="qs-label">Cost/contact</span><span class="qs-val">₹${ch.costPerContact}</span></div>
        <div class="quick-stat" style="padding:6px 0;border:none"><span class="qs-label">Delivery rate</span><span class="qs-val">${ch.avgDeliveryRate}%</span></div>
        <div style="font-size:10px;color:var(--text-3);margin-top:6px;line-height:1.4">${ch.desc}</div>
      </div>`).join('');
    Object.values(CHANNEL_CONFIG).forEach((ch, i) => {
      renderGauge(`gauge-ch-${i}`, ch.avgSuccessRate, 50, ch.color);
    });
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initPersonas();
  initEngine();
  initTimeline();
  initAnalytics();
  initConfiguration();
});
