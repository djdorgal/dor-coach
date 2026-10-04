"use strict";
/* המאמן של דור — local-first PWA. All data lives in localStorage on the phone. */

const APP_VERSION = "1.1.0";
const STORE_KEY = "dor-coach-v1";
const DAY_START = 5; // the day flips at 05:00

/* ---------- plan data ---------- */
// Base: Racheli Stern's personal menu (clinical dietitian, 2/2023) — ~1,850 kcal, 4 meals.
const TARGET = { kcal: 1850, protein: 120 };
const DRINKS_WEEK = 2; // dietitian's limit

const FOOD_CATS = [
  { id: "fav", n: "מועדפים" },
  { id: "menu", n: "התפריט של רחלי" },
  { id: "home", n: "אוכל בית" },
  { id: "prot", n: "חלבון ונשנוש" },
  { id: "eve", n: "ערב בבית" },
  { id: "event", n: "באירוע" },
  { id: "deliv", n: "משלוח" },
  { id: "sweet", n: "קפה ומתוק" }
];
const FOODS = [
  { c: "menu", n: "צהריים 13:00: חלבון + פחמימה + 3–4 מנות ירקות", k: 700, p: 50 },
  { c: "menu", n: "ביניים 17:00: 2 פרוסות לחם מלא + חלבון + שומן + ירקות", k: 330, p: 18 },
  { c: "menu", n: "ביניים 17:00: 2 פרוסות לחם מלא + כף חמאת בוטנים", k: 300, p: 11 },
  { c: "menu", n: "ערב 21:00: לחמנייה / 2 פרוסות + 3 מנות חלבון + ירקות + כפית שמן זית", k: 550, p: 30 },
  { c: "menu", n: "לילה: במבה (50 ג׳)", k: 250, p: 8 },
  { c: "menu", n: "לילה: 1.5 כוס דגני בוקר + ¾ כוס חלב", k: 250, p: 9 },
  { c: "menu", n: "סקופ חלבון במים (3 פעמים בשבוע)", k: 120, p: 24 },
  { c: "home", n: "צלחת עוף / בשר + אורז + סלט", k: 700, p: 50 },
  { c: "home", n: "צלחת עוף + ירקות, בלי פחמימה", k: 450, p: 45 },
  { c: "home", n: "קציצות ברוטב (3) + כוס אורז", k: 650, p: 35 },
  { c: "home", n: "דג אפוי + תפו״א + סלט", k: 600, p: 40 },
  { c: "home", n: "פסטה בולונז (צלחת)", k: 750, p: 35 },
  { c: "home", n: "מרק עוף עם עוף", k: 350, p: 30 },
  { c: "home", n: "מוקפץ עוף + אורז", k: 650, p: 40 },
  { c: "home", n: "חצי צלחת נוספת", k: 350, p: 20 },
  { c: "prot", n: "יוגורט חלבון", k: 130, p: 20 },
  { c: "prot", n: "גביע קוטג׳ 5%", k: 250, p: 28 },
  { c: "prot", n: "שייק חלבון במים", k: 120, p: 24 },
  { c: "prot", n: "פרי", k: 80, p: 1 },
  { c: "prot", n: "חופן אגוזים (30 ג׳)", k: 180, p: 5 },
  { c: "prot", n: "2 ביצים קשות", k: 150, p: 13 },
  { c: "eve", n: "חביתה / שקשוקה מ-3 ביצים", k: 280, p: 19 },
  { c: "eve", n: "קופסת טונה במים", k: 120, p: 26 },
  { c: "eve", n: "סלט גדול + כף שמן זית", k: 170, p: 3 },
  { c: "eve", n: "פרוסת לחם מלא", k: 80, p: 4 },
  { c: "eve", n: "חצי גביע גבינה לבנה 5%", k: 110, p: 10 },
  { c: "eve", n: "2 כפות טחינה / חומוס", k: 180, p: 5 },
  { c: "event", n: "צלחת אירוע: חלבון צלוי + סלטים", k: 600, p: 45 },
  { c: "event", n: "קבלת פנים (כמה ביסים)", k: 300, p: 10 },
  { c: "event", n: "לחמניה / לחם", k: 200, p: 6 },
  { c: "event", n: "מנת צ׳יפס / תוספת מטוגנת", k: 350, p: 4 },
  { c: "event", n: "קינוח", k: 350, p: 4 },
  { c: "event", n: "סגירה בבית: קוטג׳ / יוגורט חלבון", k: 150, p: 20 },
  { c: "deliv", n: "פוקי עם חלבון כפול", k: 650, p: 45 },
  { c: "deliv", n: "שווארמה בצלחת + סלטים", k: 750, p: 50 },
  { c: "deliv", n: "שיפודים + סלטים", k: 650, p: 50 },
  { c: "deliv", n: "שווארמה בלאפה", k: 1100, p: 50 },
  { c: "deliv", n: "2 משולשי פיצה", k: 560, p: 24 },
  { c: "deliv", n: "המבורגר + צ׳יפס", k: 1200, p: 45 },
  { c: "sweet", n: "קפה עם חלב", k: 60, p: 3 },
  { c: "sweet", n: "קפה עם חלב חלבון", k: 90, p: 12 },
  { c: "sweet", n: "2 קוביות שוקולד מריר", k: 110, p: 2 },
  { c: "sweet", n: "חטיף / עוגייה", k: 200, p: 3 },
  { c: "sweet", n: "גלידה (כדור)", k: 150, p: 3 }
];

const EX = {
  A: [
    { k: "legpress", n: "לחיצת רגליים במכונה", rep: "10–12", core: true },
    { k: "chestpress", n: "לחיצת חזה (מכונה / משקולות יד)", rep: "8–12", core: true },
    { k: "pulldown", n: "משיכת פולי עליון", rep: "10–12", core: true },
    { k: "rdl", n: "דדליפט רומני עם משקולות יד", rep: "10" },
    { k: "lateral", n: "הרחקת כתפיים לצדדים", rep: "12–15", fixedSets: 2 },
    { k: "plank", n: "פלאנק", rep: "30–45 שנ׳", time: true },
    { k: "walk", n: "סיום: הליכה בשיפוע", rep: "10 דק׳", cardio: true }
  ],
  B: [
    { k: "goblet", n: "גובלט סקוואט", rep: "8–12", core: true },
    { k: "row", n: "חתירה בישיבה בכבל", rep: "10–12", core: true },
    { k: "shoulder", n: "לחיצת כתפיים בישיבה", rep: "8–12", core: true },
    { k: "legcurl", n: "כפיפת ברכיים במכונה", rep: "10–12" },
    { k: "hipthrust", n: "גשר ישבן / היפ ת׳ראסט", rep: "10–12" },
    { k: "deadbug", n: "דד באג", rep: "10 לכל צד", time: true },
    { k: "bike", n: "סיום: אופניים בקצב מתון", rep: "10 דק׳", cardio: true }
  ]
};

const SCHED = {
  event: [
    { id: "coffee", when: "בוקר", w: "רק קפה.", from: 5, to: 13 },
    { id: "meal1", when: "13:00", w: "צהריים (700): 200 ג׳ עוף / 4 קציצות / 250 ג׳ דג / 180 ג׳ בקר + 8 כפות בורגול / קינואה או 180 ג׳ אורז / פסטה + 3–4 מנות ירקות.", from: 13, to: 15 },
    { id: "snack", when: "17:00", w: "ביניים (300–350) לפני יציאה: 2 פרוסות לחם מלא + חלבון + שומן + ירקות, או + כף חמאת בוטנים.", from: 15, to: 18 },
    { id: "plate", when: "באירוע", w: "זו ארוחת הערב (550): צלחת אחת — חלבון צלוי + סלטים, בלי לחם נוסף ובלי קינוחים.", from: 18, to: 22.5 },
    { id: "night", when: "בבית", w: "ארוחת הלילה (250): במבה 50 ג׳ או דגני בוקר + חלב — וזהו, המטבח נסגר.", from: 22.5, to: 29 }
  ],
  regular: [
    { id: "coffee", when: "בוקר", w: "רק קפה.", from: 5, to: 13 },
    { id: "meal1", when: "13:00", w: "צהריים (700): 200 ג׳ עוף / 4 קציצות / 250 ג׳ דג / 180 ג׳ בקר + 8 כפות בורגול / קינואה או 180 ג׳ אורז / פסטה + 3–4 מנות ירקות.", from: 13, to: 15 },
    { id: "snack", when: "17:00", w: "ביניים (300–350): 2 פרוסות לחם מלא + חלבון + שומן + ירקות, או + כף חמאת בוטנים.", from: 15, to: 19.5 },
    { id: "dinner", when: "21:00", w: "ערב (550): לחמנייה או 2 פרוסות לחם מלא + 3 מנות חלבון (ביצה / חצי טונה / גבינה 5% / פסטרמה) + ירקות + כפית שמן זית.", from: 19.5, to: 22.5 },
    { id: "night", when: "לילה", w: "ארוחת הלילה (250): במבה 50 ג׳ או דגני בוקר + חלב — וזהו, המטבח נסגר.", from: 22.5, to: 29 }
  ]
};

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayKey = (d = new Date()) => keyOf(new Date(d.getTime() - DAY_START * 3600e3));
const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const weekStart = k => { const d = parseKey(k); d.setDate(d.getDate() - d.getDay()); return keyOf(d); }; // Sunday
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const fmtDM = k => { const d = parseKey(k); return `${d.getDate()}.${d.getMonth() + 1}`; };
const HEB_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEB_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const fmtLong = k => { const d = parseKey(k); return `יום ${HEB_DAYS[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}`; };
const fmt1 = n => (Math.round(n * 10) / 10).toFixed(1);
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const today = () => dayKey();
function nowHour() { const n = new Date(); let h = n.getHours() + n.getMinutes() / 60; if (h < DAY_START) h += 24; return h; }

let toastT;
function toast(msg, actLabel, act) {
  $("#toastTxt").textContent = msg;
  const b = $("#toastAct");
  if (actLabel) { b.hidden = false; b.textContent = actLabel; b.onclick = () => { $("#toast").hidden = true; act(); }; } else b.hidden = true;
  $("#toast").hidden = false; clearTimeout(toastT);
  toastT = setTimeout(() => $("#toast").hidden = true, actLabel ? 6000 : 2600);
}

/* ---------- state + storage ---------- */
const S = { profile: null, weights: {}, days: {}, favs: [], lastBackup: null, ui: { tab: "today", cat: "menu", pick: null, installHidden: false } };
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const d = JSON.parse(raw); Object.assign(S, d, { ui: { ...S.ui, ...(d.ui || {}) } }); }
  } catch (_) { toast("לא הצלחתי לקרוא את הנתונים השמורים."); }
}
let saveT;
function save(now) {
  clearTimeout(saveT);
  const write = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (_) { toast("השמירה נכשלה — אין מקום פנוי במכשיר?"); } };
  if (now) write(); else saveT = setTimeout(write, 300);
}
window.addEventListener("pagehide", () => save(true));
document.addEventListener("visibilitychange", () => { if (document.hidden) save(true); else render(); });

function blankDay(k) { return { date: k, type: "regular", meals: [], drinks: [], checks: {}, workout: null }; }
function day(k = today()) { return S.days[k] || (S.days[k] = blankDay(k)); }
const P = () => S.profile || { startWeight: null, startDate: today() };

/* ---------- derived ---------- */
function sortedDays() { return Object.values(S.days).sort((a, b) => a.date < b.date ? 1 : -1); }
function weekDays(k = today()) { const ws = weekStart(k), we = addDays(ws, 6); return Object.values(S.days).filter(d => d.date >= ws && d.date <= we); }
function totals(d) { let kcal = 0, prot = 0; (d.meals || []).forEach(m => { kcal += +m.kcal || 0; prot += +m.protein || 0; }); return { kcal: Math.round(kcal), prot: Math.round(prot) }; }
function weekDrinks(k = today()) { const ds = weekDays(k); return { total: ds.reduce((s, d) => s + (d.drinks || []).length, 0), nights: ds.filter(d => (d.drinks || []).length > 0).length }; }
function seasonTarget(k = today()) { const m = parseKey(k).getMonth(); return (m === 11 || m === 0 || m === 1) ? 4 : 3; }
function workoutsThisWeek() { return weekDays().filter(d => d.workout && d.workout.done).length; }
function lastDoneWorkout(excl) { return sortedDays().find(d => d.date !== excl && d.workout && d.workout.done); }
function nextWorkoutType() { const l = lastDoneWorkout(today()); return l ? (l.workout.type === "A" ? "B" : "A") : "A"; }
function weightEntries() { return Object.entries(S.weights).map(([k, v]) => ({ k, v: +v })).filter(e => e.v > 0).sort((a, b) => a.k < b.k ? -1 : 1); }
function avg7(es, upto) { const from = addDays(upto, -6); const xs = es.filter(e => e.k >= from && e.k <= upto); return xs.length ? xs.reduce((s, e) => s + e.v, 0) / xs.length : null; }
function programWeek() { return Math.max(1, Math.floor(daysBetween(P().startDate, today()) / 7) + 1); }
function goalRange() { const s = P().startWeight; return s ? [Math.round(s * 0.90 * 10) / 10, Math.round(s * 0.93 * 10) / 10] : null; }

/* ---------- "what now" engine ---------- */
function nowAdvice() {
  const d = day(), t = totals(d), h = nowHour(), ev = d.type === "event";
  const kcalLeft = TARGET.kcal - t.kcal;
  const wd = weekDrinks(), tonight = (d.drinks || []).length;
  const tw = workoutsThisWeek(), target = seasonTarget();
  const dow = parseKey(today()).getDay(), daysLeft = 6 - dow + 1;
  const drinksLeft = Math.max(0, DRINKS_WEEK - wd.total);
  let label = "עכשיו", tip = "", sub = "";
  if (h < 13) {
    label = "בוקר";
    tip = "רק קפה. ארוחת הצהריים ב-13:00.";
    if (!(d.workout && d.workout.done) && tw < target && target - tw >= daysLeft - 1) sub = `חסרים ${target - tw} אימונים השבוע ונשארו ${daysLeft} ימים — היום יום טוב לאימון, לפני הצהריים או שעתיים אחרי.`;
    else if (ev) sub = "ערב אירוע היום. הצהריים והביניים כרגיל — הם מה ששומר עליך שם.";
  } else if (h < 15) {
    label = "צהריים";
    tip = t.kcal < 300 ? "ארוחת צהריים לפי התפריט: מנת חלבון + פחמימה + 3–4 מנות ירקות." : "הצהריים נרשמו. הבא: ביניים ב-17:00.";
  } else if (h < (ev ? 18 : 19.5)) {
    label = "אחר הצהריים";
    tip = "ביניים ב-17:00: 2 פרוסות לחם מלא + חלבון + ירקות, או + כף חמאת בוטנים.";
    if (ev) sub = "לא יוצאים לאירוע רעבים.";
  } else if (ev && h < 22.5) {
    label = "באירוע";
    tip = "זו ארוחת הערב: צלחת אחת — חלבון צלוי + סלטים. קבלת פנים — כוס ביד, לא ביסים.";
    sub = tonight >= 2 || wd.total >= DRINKS_WEEK ? "הגעת לגבול השתייה של השבוע. מכאן מים, סודה, קולה זירו." : `נשארו ${drinksLeft} משקאות השבוע. אם שותים — אחרי שאכלת, ומים בין משקה למשקה.`;
  } else if (!ev && h < 22.5) {
    label = "ערב";
    tip = "ארוחת ערב ב-21:00: לחמנייה או 2 פרוסות + 3 מנות חלבון + ירקות + כפית שמן זית.";
    sub = kcalLeft > 0 ? `נשארו כ-${kcalLeft} קק״ל להיום, כולל ארוחת הלילה.` : "התקציב היומי מלא — ארוחת הלילה קטנה או בכלל לא.";
  } else {
    label = ev ? "אחרי האירוע" : "לילה";
    const hadNight = (d.checks || {}).night;
    tip = hadNight ? "המטבח סגור. מצחצחים שיניים." : "ארוחת לילה (250): במבה 50 ג׳ או דגני בוקר + חלב. אחריה המטבח נסגר.";
    sub = t.kcal ? `היום: ${t.kcal.toLocaleString("en-US")} קק״ל, ${t.prot} ג׳ חלבון.` : "";
  }
  return { label, tip, sub };
}

/* ---------- render ---------- */
function setBar(id, val, max, mode) { const b = $(id); b.querySelector("i").style.width = Math.min(100, Math.round(val / max * 100)) + "%"; b.className = "bar " + (mode || ""); }

function renderHeader() {
  const d = day();
  $("#dateLbl").textContent = fmtLong(today());
  $("#typeRegular").setAttribute("aria-pressed", d.type !== "event");
  $("#typeEvent").setAttribute("aria-pressed", d.type === "event");
  $("#dayNote").textContent = d.type === "event" ? "ערב אירוע" : "";
  $("#onboard").hidden = !!(S.profile && S.profile.startWeight);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  $("#installTip").hidden = standalone || S.ui.installHidden;
}

function foodsFor(cat) {
  if (cat === "fav") return S.favs.map(f => ({ ...f, fav: true }));
  return FOODS.filter(f => f.c === cat);
}
function renderToday() {
  const k = today(), d = day(k), t = totals(d);
  const a = nowAdvice();
  $("#nowLabel").textContent = a.label; $("#nowTip").textContent = a.tip; $("#nowSub").textContent = a.sub; $("#nowSub").hidden = !a.sub;

  $("#protNow").textContent = t.prot; $("#protGoal").textContent = TARGET.protein;
  $("#kcalNow").textContent = t.kcal.toLocaleString("en-US"); $("#kcalGoal").textContent = TARGET.kcal.toLocaleString("en-US");
  setBar("#protBar", t.prot, TARGET.protein, t.prot >= TARGET.protein ? "good" : "");
  setBar("#kcalBar", t.kcal, TARGET.kcal, t.kcal > TARGET.kcal * 1.1 ? "bad" : t.kcal > TARGET.kcal ? "warn" : "good");

  $("#mealList").innerHTML = (d.meals || []).map((m, i) => `
    <li><span class="t num">${esc(m.time)}</span>
      <div class="txt">${esc(m.n)}<div class="nums"><span class="num">${Math.round(m.kcal)}</span> קק״ל · <span class="num">${Math.round(m.protein)}</span> ג׳ חלבון</div></div>
      <button class="iconbtn" type="button" data-del-meal="${i}" aria-label="מחק">×</button></li>`).join("");
  $("#mealEmpty").hidden = (d.meals || []).length > 0;

  if (S.ui.cat === "fav" && !S.favs.length) S.ui.cat = "menu";
  $("#cats").innerHTML = FOOD_CATS.filter(c => c.id !== "fav" || S.favs.length).map(c => `<button type="button" data-cat="${c.id}" aria-pressed="${S.ui.cat === c.id}">${c.n}</button>`).join("");
  $("#foods").innerHTML = foodsFor(S.ui.cat).map((f, i) => `
    <button type="button" class="food ${f.fav ? "fav" : ""}" data-food="${i}">
      <span class="fn">${esc(f.n)}</span><span class="fm"><span class="num">${f.k}</span> קק״ל · <span class="num">${f.p}</span> ג׳</span></button>`).join("");
  const fm = $("#favManage"); fm.hidden = S.ui.cat !== "fav";
  fm.innerHTML = S.ui.cat === "fav" ? S.favs.map((f, i) => `<li><span class="txt small">להסיר: ${esc(f.n)}</span><button class="iconbtn" type="button" data-del-fav="${i}" aria-label="הסר מהמועדפים">×</button></li>`).join("") : "";

  const items = SCHED[d.type === "event" ? "event" : "regular"], h = nowHour();
  $("#sched").innerHTML = items.map(it => {
    const done = !!(d.checks || {})[it.id], cur = h >= it.from && h < it.to;
    return `<li class="${cur ? "now" : ""} ${done ? "done" : ""}">
      <input type="checkbox" id="chk-${it.id}" data-check="${it.id}" ${done ? "checked" : ""}>
      <label for="chk-${it.id}"><span class="when">${esc(it.when)}</span>${cur ? '<span class="nowtag">עכשיו</span>' : ""}<div class="what">${esc(it.w)}</div></label></li>`;
  }).join("");
  $("#schedCount").textContent = `${items.filter(it => (d.checks || {})[it.id]).length} מתוך ${items.length}`;

  const wd = weekDrinks(k), tonight = (d.drinks || []).length;
  $("#drinkTonight").textContent = tonight;
  $("#pips").innerHTML = Array.from({ length: Math.max(DRINKS_WEEK, wd.total) }, (_, i) => `<span class="pip ${i < wd.total ? (i >= DRINKS_WEEK ? "over" : "on") : ""}"></span>`).join("");
  let chip = ["good", "בתוך המגבלה"], msg;
  if (wd.total > DRINKS_WEEK) { chip = ["bad", "מעבר למגבלה"]; msg = "עברת את 2 המשקאות של השבוע. עד ראשון — בלי אלכוהול."; }
  else if (wd.total === DRINKS_WEEK) { chip = ["warn", "הגעת לגבול"]; msg = "2 משקאות השבוע — זה הגבול עד ראשון. מכאן מים, סודה, קולה זירו."; }
  else msg = `נשארו ${DRINKS_WEEK - wd.total} משקאות השבוע. אם שותים — רק אחרי שאכלת, ומים בין משקה למשקה.`;
  $("#drinkChip").className = "chip " + chip[0]; $("#drinkChip").textContent = chip[1];
  $("#drinkMsg").textContent = msg; $("#drinkUndo").disabled = tonight === 0;

  const es = weightEntries(), last = es[es.length - 1];
  $("#wLast").innerHTML = last ? `אחרון: <span class="num">${fmt1(last.v)}</span> (${fmtDM(last.k)})` : "";
  $("#wQuickVal").placeholder = last ? fmt1(last.v) : "ק״ג";
}

function renderWeight() {
  const es = weightEntries(), start = P().startWeight, gr = goalRange();
  const last = es[es.length - 1], a = last ? avg7(es, last.k) : null;
  $("#sLast").textContent = last ? fmt1(last.v) : "—";
  $("#sAvg").textContent = a ? fmt1(a) : "—";
  const delta = a != null && start ? a - start : null;
  $("#sDelta").textContent = delta == null ? "—" : (delta > 0 ? "+" : "") + fmt1(delta);
  let pace = "ממוצע";
  if (last && es.length > 3) { const prev = avg7(es, addDays(last.k, -14)); if (prev) { const pw = (a - prev) / 2; pace = pw <= -0.3 ? `${fmt1(-pw)}- ק״ג לשבוע` : pw < 0.1 ? "יציב" : "עולה"; } }
  $("#wPace").textContent = pace;
  $("#chart").innerHTML = chartSVG(es, gr);
  const cur = a ?? (last ? last.v : start);
  $("#milestones").innerHTML = !start ? `<li class="muted">יופיע אחרי שתזין משקל התחלתי.</li>` : [[5, "פחות שומן בכבד"], [7, "פחות דלקת בכבד"], [10, "שיפור גם בצלקות"]].map(([p, why]) => {
    const tgt = start * (1 - p / 100), ok = cur <= tgt;
    return `<li><span><strong>${p}%</strong> · <span class="num">${fmt1(tgt)}</span> ק״ג <span class="muted small">— ${why}</span></span>
      <span class="chip ${ok ? "good" : "plain"}">${ok ? "הושג" : `עוד <span class="num">${fmt1(cur - tgt)}</span>`}</span></li>`;
  }).join("");
  $("#wHist").innerHTML = es.slice(-14).reverse().map(e => `<li><span>${fmtLong(e.k)}</span><span class="row"><span class="num">${fmt1(e.v)}</span><button class="iconbtn" type="button" data-del-w="${e.k}" aria-label="מחק">×</button></span></li>`).join("") || `<li class="muted">אין שקילות עדיין.</li>`;
  if (!$("#wDate").value) $("#wDate").value = today();
}
function chartSVG(es, gr) {
  if (!es.length) return `<p class="muted small">הגרף יופיע אחרי השקילה הראשונה.</p>`;
  const W = 340, H = 190, L = 34, R = 10, T = 12, B = 26;
  const first = es[0].k, span = Math.max(14, daysBetween(first, es[es.length - 1].k));
  const vals = es.map(e => e.v).concat(gr ? [gr[0]] : []);
  const lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
  const x = k => L + (W - L - R) * (daysBetween(first, k) / span);
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const step = (hi - lo) > 8 ? 2 : 1, mono = 'font-family="IBM Plex Mono, monospace"';
  let g = "";
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="var(--muted)" ${mono}>${v}</text>`;
  const band = gr ? `<rect x="${L}" width="${W - L - R}" y="${y(gr[1])}" height="${y(gr[0]) - y(gr[1])}" fill="var(--good)" opacity="0.13"/><text x="${W - R - 4}" y="${y(gr[0]) - 4}" text-anchor="end" font-size="10" fill="var(--good)">יעד</text>` : "";
  const dots = es.map(e => `<circle cx="${x(e.k)}" cy="${y(e.v)}" r="3" fill="var(--muted)" opacity="0.55"/>`).join("");
  const pts = es.map(e => [x(e.k), y(avg7(es, e.k))]);
  const line = pts.length > 1 ? `<path d="M${pts.map(p => p.join(",")).join(" L")}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` : "";
  const e = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="גרף משקל" direction="ltr">${g}${band}${dots}${line}<circle cx="${e[0]}" cy="${e[1]}" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/><text x="${L}" y="${H - 6}" font-size="10" fill="var(--muted)" ${mono}>${fmtDM(first)}</text><text x="${W - R}" y="${H - 6}" text-anchor="end" font-size="10" fill="var(--muted)" ${mono}>${fmtDM(addDays(first, span))}</text></svg>`;
}

function setsFor(ex) { if (ex.cardio) return 0; if (ex.fixedSets) return ex.fixedSets; return programWeek() <= 2 ? 2 : 3; }
function lastSetsFor(key) { for (const d of sortedDays()) { if (d.date === today()) continue; const s = d.workout && d.workout.sets && d.workout.sets[key]; if (s && s.some(x => x && (x.kg || x.reps))) return { date: d.date, s }; } return null; }
function renderTrain() {
  const d = day(), wk = programWeek();
  const type = (d.workout && d.workout.type) || S.ui.pick || nextWorkoutType();
  S.ui.pick = type;
  $("#pickA").setAttribute("aria-pressed", type === "A"); $("#pickB").setAttribute("aria-pressed", type === "B");
  $("#trTitle").textContent = "אימון " + type;
  const tw = workoutsThisWeek(), target = seasonTarget();
  $("#trWeek").className = "chip " + (tw >= target ? "good" : "plain"); $("#trWeek").innerHTML = `השבוע <span class="num">${tw}/${target}</span>`;
  $("#trPhase").textContent = wk <= 2 ? `שבוע ${wk} בתוכנית: הסתגלות — 2 סטים, משקל שנשארות איתו עוד 3–4 חזרות.` : `שבוע ${wk}: 3 סטים, משקל שמשאיר 1–2 חזרות במאגר. הגעת לחזרות העליונות בכל הסטים? בפעם הבאה מעלים משקל.`;
  const sets = (d.workout && d.workout.type === type && d.workout.sets) || {};
  $("#exList").innerHTML = EX[type].map(ex => {
    const n = setsFor(ex), prev = lastSetsFor(ex.k);
    const prevTxt = prev ? prev.s.filter(x => x && (x.kg || x.reps)).map(x => `${x.kg || "–"}×${x.reps || "–"}`).join(", ") : "";
    let rows = "";
    if (n) rows = `<div class="sets"><span></span><span class="hd">${ex.time ? "תוספת משקל" : "ק״ג"}</span><span class="hd">${ex.time ? "שניות / חזרות" : "חזרות"}</span>` +
      Array.from({ length: n }, (_, i) => { const s = (sets[ex.k] || [])[i] || {}; return `<span class="lbl">סט ${i + 1}</span>
        <input id="s-${ex.k}-${i}-kg" inputmode="decimal" data-set="${ex.k}" data-i="${i}" data-f="kg" value="${esc(s.kg ?? "")}" aria-label="${esc(ex.n)} סט ${i + 1} משקל">
        <input id="s-${ex.k}-${i}-r" inputmode="numeric" data-set="${ex.k}" data-i="${i}" data-f="reps" value="${esc(s.reps ?? "")}" aria-label="${esc(ex.n)} סט ${i + 1} חזרות">`; }).join("") + `</div>`;
    return `<div class="ex ${ex.core ? "core" : ""}"><div class="ex-h"><span class="ex-name">${esc(ex.n)}</span><span class="muted small">${n ? `<span class="num">${n}</span> × ` : ""}${esc(ex.rep)}</span></div>
      ${prevTxt ? `<span class="muted small">פעם קודמת (${fmtDM(prev.date)}): <span class="num">${esc(prevTxt)}</span></span>` : ""}${rows}</div>`;
  }).join("");
  const done = !!(d.workout && d.workout.done);
  $("#trDone").hidden = !done; $("#trFinish").hidden = done; $("#trUndo").hidden = !done;
  $("#trHist").innerHTML = sortedDays().filter(x => x.workout && x.workout.done).slice(0, 8).map(x => `<li><span>${fmtLong(x.date)}</span><span class="chip plain">אימון ${esc(x.workout.type)}</span></li>`).join("") || `<li class="muted">עוד לא נרשמו אימונים.</li>`;
}

function renderWeek() {
  const ws = weekStart(today()), tk = today();
  $("#weekRange").textContent = `${fmtDM(ws)}–${fmtDM(addDays(ws, 6))}`;
  let protDays = 0, logged = 0, kcalSum = 0;
  $("#weekGrid").innerHTML = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(ws, i), d = S.days[k], t = d ? totals(d) : { kcal: 0, prot: 0 };
    if (t.kcal > 0 && k <= tk) { logged++; kcalSum += t.kcal; }
    const pOk = t.prot >= TARGET.protein; if (pOk) protDays++;
    return `<div class="wd ${k === tk ? "today" : ""}"><strong>${HEB_SHORT[i]}</strong><span class="dot ${pOk ? "g" : ""}"></span><span class="dot ${d && d.workout && d.workout.done ? "b" : ""}"></span><span class="dot ${d && (d.drinks || []).length ? "a" : ""}"></span></div>`;
  }).join("");
  const wd = weekDrinks(), tw = workoutsThisWeek(), target = seasonTarget();
  const rows = [
    ["אימונים", `${tw}/${target}`, tw >= target ? "good" : tw >= target - 1 ? "warn" : "plain"],
    ["ימים עם חלבון ביעד", `${protDays}`, protDays >= 4 ? "good" : "plain"],
    ["ממוצע קלוריות בימים שנרשמו", logged ? Math.round(kcalSum / logged).toLocaleString("en-US") : "—", logged && kcalSum / logged <= TARGET.kcal * 1.05 ? "good" : "plain"],
    ["משקאות (עד 2)", `${wd.total}`, wd.total > DRINKS_WEEK ? "bad" : wd.total === DRINKS_WEEK ? "warn" : "good"]
  ];
  $("#weekStats").innerHTML = rows.map(([n, v, c]) => `<li><span>${n}</span><span class="chip ${c}"><span class="num">${v}</span></span></li>`).join("");
  $("#lastBackup").textContent = S.lastBackup ? `גיבוי אחרון: ${fmtLong(S.lastBackup)}` : "עוד לא נשמר גיבוי.";
}

function render() {
  renderHeader();
  const t = S.ui.tab;
  ["today", "weight", "train", "week"].forEach(x => $("#tab-" + x).hidden = x !== t);
  document.querySelectorAll(".tabs button").forEach(b => b.dataset.tab === t ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  if (t === "today") renderToday();
  if (t === "weight") renderWeight();
  if (t === "train") renderTrain();
  if (t === "week") renderWeek();
}
function showTab(t) { S.ui.tab = t; save(); window.scrollTo(0, 0); render(); }

/* ---------- actions ---------- */
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
document.querySelectorAll(".top .seg button").forEach(b => b.addEventListener("click", () => { day().type = b.dataset.type; save(); render(); }));
$("#installHide").addEventListener("click", () => { S.ui.installHidden = true; save(); render(); });

$("#obForm").addEventListener("submit", e => {
  e.preventDefault(); const v = parseFloat($("#obWeight").value);
  if (!(v > 30 && v < 250)) { toast("המשקל נראה לא תקין."); return; }
  S.profile = { startWeight: Math.round(v * 10) / 10, startDate: today() };
  S.weights[today()] = S.profile.startWeight; save(true); render(); toast("יצאנו לדרך.");
});

$("#cats").addEventListener("click", e => { const c = e.target.closest("[data-cat]"); if (!c) return; S.ui.cat = c.dataset.cat; save(); renderToday(); });
$("#foods").addEventListener("click", e => {
  const b = e.target.closest("[data-food]"); if (!b) return;
  const f = foodsFor(S.ui.cat)[+b.dataset.food]; if (!f) return;
  const d = day(); d.meals.push({ time: nowHM(), n: f.n, kcal: f.k, protein: f.p }); save();
  renderToday();
  toast(`נרשם: ${f.n}`, "בטל", () => { d.meals.pop(); save(); renderToday(); });
});
$("#mealList").addEventListener("click", e => { const i = e.target.dataset.delMeal; if (i == null) return; day().meals.splice(+i, 1); save(); renderToday(); });
$("#customForm").addEventListener("submit", e => {
  e.preventDefault();
  const n = $("#cName").value.trim(); if (!n) return;
  const k = Math.max(0, parseInt($("#cKcal").value) || 0), p = Math.max(0, parseInt($("#cProt").value) || 0);
  day().meals.push({ time: nowHM(), n, kcal: k, protein: p });
  if ($("#cFav").checked && !S.favs.some(f => f.n === n)) S.favs.unshift({ n, k, p });
  save(); $("#customForm").reset(); $("#customBox").open = false; renderToday(); toast("נרשם.");
});
$("#favManage").addEventListener("click", e => {
  const i = e.target.dataset.delFav; if (i == null) return;
  const f = S.favs[+i]; S.favs.splice(+i, 1); save(); renderToday();
  toast(`הוסר מהמועדפים: ${f.n}`, "בטל", () => { S.favs.splice(+i, 0, f); save(); renderToday(); });
});
$("#sched").addEventListener("change", e => { const id = e.target.dataset.check; if (!id) return; const d = day(); d.checks = { ...(d.checks || {}), [id]: e.target.checked }; save(); renderToday(); });

$("#drinkAdd").addEventListener("click", () => { const d = day(); d.drinks = [...(d.drinks || []), nowHM()]; save(); renderToday(); const h = new Date().getHours(); if (h < DAY_START) toast("אחרי חצות — זה הזמן לעבור למים."); });
$("#drinkUndo").addEventListener("click", () => { const d = day(); d.drinks = (d.drinks || []).slice(0, -1); save(); renderToday(); });

function saveWeight(k, v) {
  if (!(v > 30 && v < 250)) { toast("המשקל נראה לא תקין. בדוק שוב."); return false; }
  S.weights[k] = Math.round(v * 10) / 10;
  if (!S.profile) S.profile = { startWeight: S.weights[k], startDate: k };
  save(true); return true;
}
$("#wQuick").addEventListener("submit", e => { e.preventDefault(); if (saveWeight(today(), parseFloat($("#wQuickVal").value))) { $("#wQuickVal").value = ""; toast("נשמר."); render(); } });
$("#wForm").addEventListener("submit", e => { e.preventDefault(); if (saveWeight($("#wDate").value || today(), parseFloat($("#wVal").value))) { $("#wVal").value = ""; toast("נשמר."); render(); } });
$("#wHist").addEventListener("click", e => { const k = e.target.dataset.delW; if (!k) return; const v = S.weights[k]; delete S.weights[k]; save(); render(); toast("נמחק.", "בטל", () => { S.weights[k] = v; save(); render(); }); });

function ensureWorkout(type) { const d = day(); if (!d.workout || d.workout.type !== type) d.workout = { type, sets: {}, done: false }; return d.workout; }
function pickWorkout(t) { const d = day(); if (d.workout && d.workout.done) return; S.ui.pick = t; if (d.workout && d.workout.type !== t) d.workout = null; save(); renderTrain(); }
$("#pickA").addEventListener("click", () => pickWorkout("A"));
$("#pickB").addEventListener("click", () => pickWorkout("B"));
$("#exList").addEventListener("input", e => {
  const t = e.target; if (!t.dataset.set) return;
  const w = ensureWorkout(S.ui.pick), arr = (w.sets[t.dataset.set] = w.sets[t.dataset.set] || []);
  arr[+t.dataset.i] = { ...(arr[+t.dataset.i] || {}), [t.dataset.f]: t.value.trim() };
  for (let i = 0; i < arr.length; i++) if (!arr[i]) arr[i] = {};
  save();
});
$("#trFinish").addEventListener("click", () => { const w = ensureWorkout(S.ui.pick); w.done = true; save(true); render(); toast("אימון נרשם."); });
$("#trUndo").addEventListener("click", () => { const d = day(); if (d.workout) { d.workout.done = false; save(); render(); } });

/* summary for Claude */
function summaryText() {
  const es = weightEntries(), last = es[es.length - 1];
  const lines = [`סיכום מהאפליקציה "המאמן של דור" (${fmtLong(today())}):`,
    `משקל התחלתי ${P().startWeight ?? "—"} (${P().startDate}), אחרון ${last ? fmt1(last.v) + " (" + last.k + ")" : "—"}, ממוצע 7 ימים ${last ? fmt1(avg7(es, last.k)) : "—"}.`,
    `השבוע: ${workoutsThisWeek()}/${seasonTarget()} אימונים, ${weekDrinks().total} משקאות ב-${weekDrinks().nights} ערבים.`, "", "14 ימים אחרונים:"];
  for (let i = 13; i >= 0; i--) {
    const k = addDays(today(), -i), d = S.days[k]; if (!d) continue;
    const t = totals(d);
    lines.push(`${k} (${d.type === "event" ? "אירוע" : "רגיל"}): ${t.kcal} קק״ל, ${t.prot} ג׳ חלבון${(d.drinks || []).length ? `, ${d.drinks.length} משקאות` : ""}${d.workout && d.workout.done ? `, אימון ${d.workout.type}` : ""}${S.weights[k] ? `, משקל ${S.weights[k]}` : ""}`);
    if ((d.meals || []).length) lines.push("  אוכל: " + d.meals.map(m => `${m.time} ${m.n}`).join(" | "));
  }
  return lines.join("\n");
}
$("#copySummary").addEventListener("click", async () => {
  const txt = summaryText(), box = $("#summaryBox");
  try { await navigator.clipboard.writeText(txt); toast("הסיכום הועתק. הדבק אותו בשיחה עם Claude."); box.hidden = true; }
  catch (_) { box.hidden = false; box.value = txt; box.focus(); box.select(); toast("סמן את הטקסט והעתק."); }
});

/* backup */
$("#exportBtn").addEventListener("click", async () => {
  const data = JSON.stringify({ app: "dor-coach", version: APP_VERSION, exported: new Date().toISOString(), data: { profile: S.profile, weights: S.weights, days: S.days, favs: S.favs } }, null, 1);
  const name = `dor-coach-${today()}.json`;
  const file = new File([data], name, { type: "application/json" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: name });
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
    S.lastBackup = today(); save(true); renderWeek();
  } catch (e) { if (e && e.name !== "AbortError") toast("שמירת הגיבוי נכשלה."); }
});
$("#importFile").addEventListener("change", async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    if (j.app !== "dor-coach" || !j.data) throw 0;
    toast("לשחזר? זה מחליף את הנתונים שבטלפון.", "שחזר", () => { Object.assign(S, { profile: j.data.profile, weights: j.data.weights || {}, days: j.data.days || {}, favs: j.data.favs || [] }); save(true); render(); toast("שוחזר."); });
  } catch (_) { toast("הקובץ לא נראה כמו גיבוי של האפליקציה."); }
  e.target.value = "";
});

/* ---------- boot ---------- */
load();
render();
setInterval(() => { if (!document.hidden && S.ui.tab === "today") renderToday(); }, 60000);
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(reg => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing; if (!nw) return;
      nw.addEventListener("statechange", () => { if (nw.state === "installed" && navigator.serviceWorker.controller) toast("יש גרסה חדשה.", "רענן", () => location.reload()); });
    });
  }).catch(() => {});
}
