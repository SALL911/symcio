/* ============================================================
   Symcio AIV Index — app logic (vanilla JS, no build step)
   ============================================================ */

// ── CONFIG ────────────────────────────────
// 留空 = 使用內建示意資料 (assets/data.js)。
// 填入你的 Vercel API base（如 "https://your-api.vercel.app"）即切換為即時數據；
// 預期端點：GET {API_BASE}/api/rankings → 回傳與 data.js 相同結構的 JSON。
const API_BASE = "";

const WEIGHT_LABELS = {
  PR:  ["出現率", "Presence Rate", 0.35],
  CR:  ["引述排序", "Citation Rank", 0.25],
  SoV: ["聲量占比", "Share of Voice", 0.20],
  CQ:  ["語境品質", "Context Quality", 0.10],
  CMC: ["跨模型一致性", "Cross-Model Consistency", 0.10],
};

let STATE = { data: null, filter: "全部", query: "" };

// ── boot ──────────────────────────────
try {
      const r = await fetch(`${API_BASE}/api/rankings`, { cache: "no-store" });
      if (r.ok) data = await r.json();
    } catch (e) { console.warn("Live API unavailable, using bundled demo data.", e); }
  }
  STATE.data = data;
  renderHeaderStats();
  renderTicker();
  renderFilters();
  renderMethodology();
  renderRows();
  if (data.demo) document.getElementById("demo-banner").style.display = "flex";
})();

// ── header stats ────────────────────────
function renderHeaderStats() {
  const b = STATE.data.brands;
  const avg = (b.reduce((s, x) => s + x.score, 0) / b.length).toFixed(1);
  const top = b[0];
  document.getElementById("stats").innerHTML = `
    <div class="stat"><div class="v">${b.length}</div><div class="k">追蹤品牌 BRANDS</div></div>
    <div class="stat"><div class="v">3<span class="u">AI 系統</span></div><div class="k">ChatGPT · Claude · Gemini</div></div>
    <div class="stat"><div class="v">${avg}</div><div class="k">平均 AIV AVG SCORE</div></div>
    <div class="stat"><div class="v">${top.zh}</div><div class="k">本月榜首 #1</div></div>`;
}

// ── ticker ────────────────────────────
function renderTicker() {
  const items = STATE.data.brands.map(b => {
    const cls = b.chg > 0 ? "up" : b.chg < 0 ? "dn" : "";
    const arrow = b.chg > 0 ? "▲" : b.chg < 0 ? "▼" : "—";
    return `<span class="tk"><span class="nm">${b.zh}</span>
      <span class="sc">${b.score.toFixed(1)}</span>
      <span class="${cls}">${arrow}${Math.abs(b.chg).toFixed(1)}%</span></span>`;
  }).join("");
  document.getElementById("ticker-track").innerHTML = items + items; // duplicate for seamless loop
}

// ── filters ───────────────────────────
function renderFilters() {
  const inds = ["全部", ...STATE.data.industries];
  document.getElementById("filters").innerHTML = inds.map(i =>
    `<button class="chip ${i === STATE.filter ? "active" : ""}" data-ind="${i}">${i}</button>`
  ).join("");
  document.querySelectorAll(".chip").forEach(c =>
    c.addEventListener("click", () => { STATE.filter = c.dataset.ind; renderFilters(); renderRows(); }));
}

// ── rows ──────────────────────────────
function renderRows() {
  let rows = STATE.data.brands.slice();
  if (STATE.filter !== "全部") rows = rows.filter(b => b.industry === STATE.filter);
  if (STATE.query) {
    const q = STATE.query.toLowerCase();
    rows = rows.filter(b => b.zh.includes(STATE.query) || b.en.toLowerCase().includes(q));
  }
  const max = Math.max(...STATE.data.brands.map(b => b.score));
  const html = rows.map(b => {
    const d = b.prevRank - b.rank;
    const dCls = d > 0 ? "up" : d < 0 ? "dn" : "fl";
    const dTxt = d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : "—";
    return `<div class="row" data-id="${b.rank}">
      <div class="rk">${b.rank}<span class="delta ${dCls}">${dTxt}</span></div>
      <div class="brand"><div class="nm">${b.zh}</div><div class="en">${b.en}</div></div>
      <div class="ind">${b.industry}</div>
      <div class="bar-wrap"><div class="bar"><i style="width:${(b.score / max * 100).toFixed(1)}%"></i></div></div>
      <div class="score">${b.score.toFixed(1)}</div>
    </div>`;
  }).join("");
  document.getElementById("rows").innerHTML = html ||
    `<div style="padding:30px;text-align:center;color:var(--ink-dim)">無符合條件的品牌</div>`;
  document.querySelectorAll(".row").forEach(r =>
    r.addEventListener("click", () => openModal(+r.dataset.id)));
  // animate bars
  requestAnimationFrame(() => document.querySelectorAll(".bar > i").forEach(i => i.style.width = i.style.width));
}

document.getElementById("search-input").addEventListener("input", e => {
  STATE.query = e.target.value.trim(); renderRows();
});

// ── modal ─────────────────────────────
function openModal(rank) {
  const b = STATE.data.brands.find(x => x.rank === rank);
  if (!b) return;
  const subs = Object.entries(WEIGHT_LABELS).map(([k, [zh, en, w]]) => {
    const val = b[k];
    return `<div class="subrow">
      <div class="l"><span class="lab"><b>${k}</b>${zh} · ${en}<span class="w">w=${w}</span></span>
        <span class="num">${val.toFixed(1)}</span></div>
      <div class="track"><i style="width:${val}%"></i></div>
    </div>`;
  }).join("");
  document.getElementById("modal").innerHTML = `
    <div class="m-head">
      <span class="close" onclick="closeModal()">×</span>
      <div class="m-rank">RANK #${b.rank} · ${b.industry}</div>
      <div class="m-name">${b.zh}</div>
      <div class="m-en">${b.en}</div>
      <div class="m-score"><div class="v">${b.score.toFixed(1)}</div><div class="k">AIV SCORE</div></div>
    </div>
    <div class="m-body">
      ${subs}
      <div class="m-note">AIV = 0.35·PR + 0.25·CR + 0.20·SoV + 0.10·CQ + 0.10·CMC。
      子指標皆於類別內 0–100 標準化。本指數衡量品牌於 AI 系統中之能見度，非投資建議、非信用評等。</div>
    </div>`;
  document.getElementById("overlay").classList.add("open");
}
function closeModal() { document.getElementById("overlay").classList.remove("open"); }
document.getElementById("overlay").addEventListener("click", e => {
  if (e.target.id === "overlay") closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ── methodology mini-cards ─────────────────
function renderMethodology() {
  document.getElementById("mcards").innerHTML = Object.entries(WEIGHT_LABELS).map(([k, [zh, en, w]]) =>
    `<div class="mcard"><span class="w">${(w * 100)}%</span><div class="c">${k}</div>
      <div class="n">${zh}<br><span style="font-family:var(--mono);font-size:10px;color:var(--ink-dim)">${en}</span></div></div>`
  ).join("");
}
