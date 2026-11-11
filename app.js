(() => {
'use strict';
const $ = s => document.querySelector(s);
const SCHEDULE = [
  {id:'s1', a:8,    b:9,    t:'Biology',            k:'main'},
  {id:'s2', a:9,    b:10,   t:'Break',              k:'break'},
  {id:'s3', a:10,   b:11,   t:'Physics',            k:'main'},
  {id:'s4', a:11,   b:12,   t:'Other subjects',     k:'other'},
  {id:'s5', a:12,   b:13,   t:'Lunch / Break',      k:'break'},
  {id:'s6', a:13,   b:14,   t:'Chemistry',          k:'main'},
  {id:'s7', a:14,   b:16,   t:'Mathematics',        k:'main'},
  {id:'s8', a:16,   b:17,   t:'Break',              k:'break'},
  {id:'s9', a:17,   b:18.5, t:'English 2nd Paper',  k:'main'},
  {id:'s10',a:18.5, b:19,   t:'Break',              k:'break'},
  {id:'s11',a:19,   b:20.5, t:'Rotation',           k:'main', rot:true},
  {id:'s12',a:20.5, b:21,   t:'Dinner',             k:'break'},
  {id:'s13',a:21,   b:22.5, t:'Other subjects',     k:'other'},
  {id:'s14',a:22.5, b:24,   t:'Other subjects',     k:'other'}
];
const ROT = ['Biology','Physics','Chemistry'];
const PRESETS = [15,25,45,50];
const TARGET = {all:12, main:8, other:4};
const CIRC = 565.49;

// ---------- storage ----------
const KEY = 'studyos:v1', TKEY = 'studyos:timer';
let store = {days:{}};
try { store = JSON.parse(localStorage.getItem(KEY)) || {days:{}}; } catch(e){}
if (!store.days) store.days = {};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} };

// ---------- dates ----------
const dkey = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const todayKey = () => dkey(new Date());
const fromKey = k => { const [y,m,d] = k.split('-').map(Number); return new Date(y,m-1,d); };
const shift = (k,n) => { const d = fromKey(k); d.setDate(d.getDate()+n); return dkey(d); };
let lastToday = todayKey(), view = lastToday;

const getDay = k => store.days[k] || {done:{}, rot:'Biology'};
const ensureDay = k => store.days[k] || (store.days[k] = {done:{}, rot:'Biology'});
const num = n => +n.toFixed(2);
const fmtT = h => { const H = Math.floor(h)%24, M = Math.round((h%1)*60); return (H%12||12)+':'+String(M).padStart(2,'0')+' '+(H>=12?'PM':'AM'); };
const fmtD = d => d < 1 ? Math.round(d*60)+' min' : num(d)+(d===1?' hour':' hours');

function totals(k){
  const day = getDay(k), t = {main:0, other:0};
  SCHEDULE.forEach(s => { if (s.k!=='break' && day.done[s.id]) t[s.k] += s.b - s.a; });
  t.all = t.main + t.other;
  return t;
}

// ---------- render plan ----------
function render(){
  const day = getDay(view), t = totals(view), isToday = view === todayKey();
  const d = fromKey(view);
  $('#dateTitle').textContent = isToday ? 'Today' : view === shift(todayKey(),-1) ? 'Yesterday' : d.toLocaleDateString('en-GB',{weekday:'long'});
  $('#dateSub').textContent = d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  $('#datePick').value = view; $('#datePick').max = todayKey();
  $('#nextDay').disabled = isToday;

  $('#doneH').textContent = num(t.all);
  $('#remH').textContent = num(TARGET.all - t.all);
  const pct = Math.round(t.all/TARGET.all*100);
  $('#pct').textContent = pct;
  $('#barAll').style.width = pct+'%';
  $('#mainTxt').textContent = num(t.main)+' / 8 h';
  $('#otherTxt').textContent = num(t.other)+' / 4 h';
  $('#barMain').style.width = (t.main/TARGET.main*100)+'%';
  $('#barOther').style.width = (t.other/TARGET.other*100)+'%';

  // week strip
  const tk = todayKey();
  $('#week').innerHTML = [6,5,4,3,2,1,0].map(i => {
    const k = shift(tk,-i), p = totals(k).all/TARGET.all*100, dd = fromKey(k);
    return `<button class="wd${k===view?' sel':''}" data-k="${k}" aria-label="${k}">${dd.toLocaleDateString('en-GB',{weekday:'short'}).slice(0,2)}<div class="col"><i style="height:${p}%"></i></div>${dd.getDate()}</button>`;
  }).join('');

  // list
  const nowH = new Date().getHours() + new Date().getMinutes()/60;
  $('#list').innerHTML = SCHEDULE.map(s => {
    const time = fmtT(s.a)+' – '+fmtT(s.b), dur = fmtD(s.b-s.a);
    if (s.k === 'break') return `<div class="row brk"><span>${s.t} · ${time}</span><span>${dur}</span></div>`;
    const done = !!day.done[s.id], now = isToday && nowH >= s.a && nowH < s.b;
    const title = s.rot ? 'Rotation · '+day.rot : s.t;
    return `<div class="row ${s.k}${done?' done':''}${now?' now':''}">
      <label class="rl"><input type="checkbox" data-id="${s.id}" ${done?'checked':''}><span class="box"></span>
      <span class="meta"><small>${time}</small><b>${title}${now?'<span class="tag">NOW</span>':''}</b></span><span class="dur">${dur}</span></label>
      ${s.rot ? `<div class="rot chips">${ROT.map(r=>`<button class="chip${r===day.rot?' on':''}" data-rot="${r}">${r}</button>`).join('')}</div>` : ''}
    </div>`;
  }).join('');
}

$('#list').addEventListener('change', e => {
  const id = e.target.dataset.id; if (!id) return;
  ensureDay(view).done[id] = e.target.checked;
  if (!e.target.checked) delete store.days[view].done[id];
  save(); render();
});
$('#list').addEventListener('click', e => {
  const r = e.target.closest('[data-rot]'); if (!r) return;
  ensureDay(view).rot = r.dataset.rot; save(); render();
});
$('#week').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b){ view = b.dataset.k; render(); } });
$('#prevDay').onclick = () => { view = shift(view,-1); render(); };
$('#nextDay').onclick = () => { if (view < todayKey()){ view = shift(view,1); render(); } };
$('#datePick').onchange = e => { const v = e.target.value; if (v && v <= todayKey()){ view = v; render(); } };

// reset day
$('#resetBtn').onclick = () => { $('#dlgDate').textContent = fromKey(view).toLocaleDateString('en-GB',{day:'numeric',month:'short'}); $('#dlg').showModal(); };
$('#dlg').addEventListener('close', () => {
  if ($('#dlg').returnValue === 'ok'){ delete store.days[view]; save(); render(); }
  $('#dlg').returnValue = '';
});

// tabs
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-'+b.dataset.view));
});

// ---------- timer ----------
let T = {min:25, left:25*60000, endAt:0, running:false, notify:false};
try { T = Object.assign(T, JSON.parse(localStorage.getItem(TKEY))); } catch(e){}
const saveT = () => { try { localStorage.setItem(TKEY, JSON.stringify(T)); } catch(e){} };
const mmss = ms => { const s = Math.ceil(ms/1000); return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); };

function drawTimer(){
  const left = T.running ? Math.max(0, T.endAt - Date.now()) : T.left;
  $('#clock').textContent = mmss(left);
  const frac = T.min ? 1 - left/(T.min*60000) : 0;
  $('#ringProg').style.strokeDashoffset = CIRC * Math.min(1, Math.max(0, frac));
  $('#startBtn').textContent = T.running ? 'Pause' : (left < T.min*60000 && left > 0 ? 'Resume' : 'Start');
  $('#tstate').textContent = T.running ? 'Focusing…' : left === 0 ? 'Finished' : left < T.min*60000 ? 'Paused' : 'Ready to focus';
  $('#runDot').hidden = !T.running;
  document.title = T.running ? mmss(left)+' · StudyOS' : 'StudyOS';
  document.querySelectorAll('#presets .chip').forEach(c => c.classList.toggle('on', +c.dataset.m === T.min));
}
function startPause(){
  if (T.running){ T.left = Math.max(0, T.endAt - Date.now()); T.running = false; }
  else { if (T.left <= 0) T.left = T.min*60000; T.endAt = Date.now() + T.left; T.running = true; unlockAudio(); }
  saveT(); drawTimer();
}
function resetTimer(){ T.running = false; T.left = T.min*60000; saveT(); drawTimer(); }
function setMin(m){
  m = Math.round(+m); if (!(m >= 1 && m <= 180)) return false;
  T.min = m; if (!T.running) T.left = m*60000; saveT(); drawTimer(); return true;
}
let actx;
function unlockAudio(){ try { actx = actx || new (window.AudioContext||window.webkitAudioContext)(); if (actx.state==='suspended') actx.resume(); } catch(e){} }
function beep(){
  try {
    unlockAudio(); if (!actx) return;
    [0,.35,.7].forEach(o => {
      const os = actx.createOscillator(), g = actx.createGain();
      os.frequency.value = 880; os.connect(g); g.connect(actx.destination);
      const t0 = actx.currentTime + o;
      g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(.4,t0+.02); g.gain.exponentialRampToValueAtTime(.0001,t0+.28);
      os.start(t0); os.stop(t0+.3);
    });
  } catch(e){}
}
function finish(){
  T.running = false; T.left = 0; saveT(); drawTimer();
  beep();
  if (navigator.vibrate) navigator.vibrate([300,150,300,150,300]);
  $('#banner').hidden = false;
  if (T.notify && 'Notification' in window && Notification.permission === 'granted'){
    const opts = {body:'Focus session complete. Take a short break.', icon:'icons/icon-192.png', tag:'studyos-timer', vibrate:[300,150,300]};
    navigator.serviceWorker?.getRegistration().then(r => r ? r.showNotification('StudyOS', opts) : new Notification('StudyOS', opts)).catch(()=>{});
  }
}
setInterval(() => {
  if (T.running){ if (Date.now() >= T.endAt) finish(); else drawTimer(); }
  const tk = todayKey(); if (tk !== lastToday){ if (view === lastToday) view = tk; lastToday = tk; render(); }
}, 500);
document.addEventListener('visibilitychange', () => { if (!document.hidden){ drawTimer(); render(); } });

$('#startBtn').onclick = startPause;
$('#resetTimer').onclick = resetTimer;
$('#bannerOk').onclick = () => { $('#banner').hidden = true; };
$('#presets').innerHTML = PRESETS.map(m => `<button class="chip" data-m="${m}">${m}</button>`).join('');
$('#presets').onclick = e => { const b = e.target.closest('[data-m]'); if (b) setMin(b.dataset.m); };
$('#setCustom').onclick = () => { if (setMin($('#customMin').value)) $('#customMin').value = ''; else $('#customMin').focus(); };
$('#customMin').addEventListener('keydown', e => { if (e.key === 'Enter') $('#setCustom').click(); });
$('#notifyChk').checked = T.notify && 'Notification' in window && Notification.permission === 'granted';
$('#notifyChk').onchange = async e => {
  if (!e.target.checked){ T.notify = false; saveT(); return; }
  if (!('Notification' in window)){ e.target.checked = false; return; }
  const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  T.notify = p === 'granted'; e.target.checked = T.notify; saveT();
};

// ---------- PWA ----------
let deferred;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
$('#installBtn').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#installBtn').hidden = true; };
window.addEventListener('appinstalled', () => { $('#installBtn').hidden = true; });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));

// ---------- init ----------
if (T.running && Date.now() >= T.endAt) finish();
render(); drawTimer();
})();
