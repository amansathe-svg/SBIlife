// =============================================================
// js/charts.js — Chart rendering (pure SVG/CSS, no dependencies)
// =============================================================

function renderDonutChart(containerId, segments, opts = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const size = opts.size || 180;
  const strokeW = opts.strokeWidth || 32;
  const r = (size - strokeW) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = -circ * 0.25; // start at top

  let paths = "";
  segments.forEach(seg => {
    const frac = seg.value / total;
    const dash = frac * circ;
    paths += `
      <circle
        cx="${cx}" cy="${cy}" r="${r}"
        fill="none"
        stroke="${seg.color}"
        stroke-width="${strokeW}"
        stroke-dasharray="${dash.toFixed(2)} ${(circ - dash).toFixed(2)}"
        stroke-dashoffset="${offset.toFixed(2)}"
        stroke-linecap="butt"
      >
        <title>${seg.label}: ${seg.value.toLocaleString()} (${Math.round(frac * 100)}%)</title>
      </circle>`;
    offset -= dash;
  });

  const centerLabel = opts.centerLabel || "";
  const centerSub = opts.centerSub || "";

  el.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Donut chart">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#F1F5F9" stroke-width="${strokeW}"/>
      ${paths}
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="20" font-weight="700" fill="#1E293B">${centerLabel}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" fill="#64748B">${centerSub}</text>
    </svg>`;
}

function renderBarChart(containerId, bars, opts = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const maxVal = Math.max(...bars.map(b => b.value));
  const height = opts.height || 160;
  const barW = opts.barWidth || 28;
  const gap = opts.gap || 18;
  const totalW = bars.length * (barW + gap) + gap;
  const labelH = 20;
  const yPad = 10;

  let rects = "", labels = "", values = "";
  bars.forEach((bar, i) => {
    const x = gap + i * (barW + gap);
    const barH = ((bar.value / maxVal) * (height - labelH - yPad - 10));
    const y = height - labelH - barH - yPad;
    rects += `
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}"
            rx="4" fill="${bar.color}" opacity="0.9">
        <title>${bar.label}: ${bar.value}${opts.suffix || ''}</title>
      </rect>`;
    labels += `
      <text x="${x + barW / 2}" y="${height - yPad + 4}" text-anchor="middle"
            font-size="9" fill="#64748B">${bar.shortLabel || bar.label}</text>`;
    values += `
      <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle"
            font-size="9" font-weight="600" fill="${bar.color}">${bar.value}${opts.suffix || ''}</text>`;
  });

  el.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${totalW} ${height}" role="img" aria-label="Bar chart" preserveAspectRatio="xMidYMid meet">
      ${rects}${labels}${values}
    </svg>`;
}

function renderSparkline(containerId, data, color = "#6366F1") {
  const el = document.getElementById(containerId);
  if (!el) return;
  const w = 80, h = 30;
  const minV = Math.min(...data), maxV = Math.max(...data);
  const range = maxV - minV || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - minV) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");

  el.innerHTML = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
}

function renderGauge(containerId, value, max = 100, color = "#6366F1") {
  const el = document.getElementById(containerId);
  if (!el) return;
  const pct = Math.min(value / max, 1);
  const size = 90, strokeW = 10;
  const r = (size - strokeW) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = Math.PI * r; // half circle

  const arcPts = (angle) => {
    const rad = (angle * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };

  const bg = `M ${arcPts(180)} A ${r} ${r} 0 0 1 ${arcPts(0)} `;
  const fill = pct > 0 ? `M ${arcPts(180)} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${arcPts(180 - pct * 180)} ` : "";

  el.innerHTML = `
    <svg width="${size}" height="${size / 2 + 14}" viewBox="0 0 ${size} ${size / 2 + 14}">
      <path d="${bg}" fill="none" stroke="#E2E8F0" stroke-width="${strokeW}" stroke-linecap="round"/>
      ${fill ? `<path d="${fill}" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>` : ""}
      <text x="${cx}" y="${size / 2 + 12}" text-anchor="middle" font-size="14" font-weight="700" fill="#1E293B">${value}</text>
    </svg>`;
}

// Confidence bar (horizontal progress bar)
function renderConfidenceBar(containerId, pct, color = "#6366F1", label = "") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="conf-bar-wrap">
      <div class="conf-bar-track">
        <div class="conf-bar-fill" style="width:${pct}%;background:${color};"></div>
      </div>
      ${label ? `<span class="conf-bar-label">${label}</span>` : ""}
    </div>`;
}

// Channel icon SVGs (inline, no external deps)
const CHANNEL_ICONS = {
  wa:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 3.6C18.2 1.4 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.4-6.2-3.6-8.3zm-8.4 18.4c-1.8 0-3.5-.5-5-1.3l-.4-.2-3.7 1 1-3.6-.2-.4C3 15.8 2.5 14 2.5 12 2.5 6.7 6.7 2.5 12 2.5S21.5 6.7 21.5 12 17.3 22 12 22zm5.8-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.7 0c-1.9-.9-3.1-1.7-4.3-3.8-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3 2.1 3.2 5 4.5c1.9.8 2.6.9 3.5.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"/></svg>`,
  sms:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  voice: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9zm1 14h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 10.9 13 11.5 13 13h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`,
  cb:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-9 11H7v-2h4v2zm6 0h-4v-2h4v2zm0-4H7V7h10v2z"/></svg>`,
  ss:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 14H4V6h16v11zm-5-4H8v-2h7v2zm3-4H8V7h10v2z"/></svg>`,
  cc:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
  fa:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
};
