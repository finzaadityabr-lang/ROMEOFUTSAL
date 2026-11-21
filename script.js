"use strict";

/* ================= DATA ================= */
const matches = [
  { date: "2026-11-07T19:00", home: "Rio Fúria",      away: "São Paulo Raio",  venue: "Ginásio Maracanãzinho", score: [4, 2] },
  { date: "2026-11-12T20:00", home: "Bahia Sol",      away: "Rio Fúria",       venue: "Arena Salvador",        score: [1, 1] },
  { date: "2026-11-15T18:30", home: "São Paulo Raio", away: "Curitiba Pinhão", venue: "Ginásio Ibirapuera",    score: [3, 5] },
  { date: "2026-11-19T19:30", home: "Rio Fúria",      away: "Curitiba Pinhão", venue: "Ginásio Maracanãzinho", score: [2, 0] },
  { date: "2026-11-28T19:00", home: "Rio Fúria",      away: "Bahia Sol",       venue: "Ginásio Maracanãzinho", score: null },
  { date: "2026-12-03T20:00", home: "Curitiba Pinhão",away: "Rio Fúria",       venue: "Arena Araucária",       score: null },
  { date: "2026-12-10T18:00", home: "Rio Fúria",      away: "São Paulo Raio",  venue: "Ginásio Maracanãzinho", score: null },
  { date: "2026-12-17T19:30", home: "Bahia Sol",      away: "São Paulo Raio",  venue: "Arena Salvador",        score: null }
];
const OUR_TEAM = "Rio Fúria";

const players = [
  { name: "Thiago Almeida",   pos: "Goleiro", num: 1,  g: 0,  a: 2,  m: 14 },
  { name: "Bruno Carvalho",   pos: "Goleiro", num: 12, g: 0,  a: 0,  m: 6 },
  { name: "Rafael Souza",     pos: "Fixo",    num: 4,  g: 3,  a: 7,  m: 14 },
  { name: "Lucas Ferreira",   pos: "Fixo",    num: 5,  g: 1,  a: 4,  m: 12 },
  { name: "Gabriel Rocha",    pos: "Ala",     num: 7,  g: 11, a: 9,  m: 14 },
  { name: "Matheus Lima",     pos: "Ala",     num: 10, g: 9,  a: 13, m: 14 },
  { name: "Pedro Nascimento", pos: "Ala",     num: 8,  g: 5,  a: 6,  m: 13 },
  { name: "Diego Barbosa",    pos: "Pivô",    num: 9,  g: 15, a: 4,  m: 14 },
  { name: "Felipe Costa",     pos: "Pivô",    num: 11, g: 8,  a: 3,  m: 11 },
  { name: "Caio Mendes",      pos: "Ala",     num: 14, g: 4,  a: 5,  m: 9 }
];

/* ================= UTIL ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = n => String(n).padStart(2, "0");
const bulan = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
const hari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const initials = name => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

/* ================= PROGRESS BAR ================= */
const progress = $("#progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
}
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ================= NAVBAR ================= */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
$$("a", navLinks).forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", false);
}));

const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      $$("a", navLinks).forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => navObs.observe(s));

/* ================= REVEAL ================= */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); revObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => revObs.observe(el));

/* ================= HERO: efek miring lapangan ================= */
const heroArt = $("#heroArt");
const court = $(".court");
if (heroArt && court && matchMedia("(pointer: fine)").matches) {
  heroArt.addEventListener("mousemove", e => {
    const r = heroArt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    court.style.transform = `rotateX(${18 - y * 12}deg) rotateZ(${-4 + x * 8}deg)`;
  });
  heroArt.addEventListener("mouseleave", () => { court.style.transform = ""; });
}

/* ================= COUNTDOWN ================= */
function nextMatch() {
  const now = Date.now();
  return matches
    .filter(m => new Date(m.date).getTime() > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
}
function tickCountdown() {
  const m = nextMatch();
  if (!m) {
    $("#nextMatchName").textContent = "Belum ada jadwal";
    ["D", "H", "M", "S"].forEach(k => $("#cd" + k).textContent = "00");
    return;
  }
  $("#nextMatchName").textContent = `${m.home} vs ${m.away}`;
  let diff = Math.max(0, new Date(m.date).getTime() - Date.now());
  const d = Math.floor(diff / 864e5); diff %= 864e5;
  const h = Math.floor(diff / 36e5);  diff %= 36e5;
  const mi = Math.floor(diff / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);
  $("#cdD").textContent = pad(d);
  $("#cdH").textContent = pad(h);
  $("#cdM").textContent = pad(mi);
  $("#cdS").textContent = pad(s);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ================= BOLA ================= */
let spinDeg = 0;
$("#spinBtn").addEventListener("click", () => {
  spinDeg += 720 + Math.floor(Math.random() * 360);
  $("#spinBall").style.transform = `rotate(${spinDeg}deg)`;
});

/* ================= JADWAL ================= */
const isDone = m => m.score !== null;

function team(name, cls) {
  return `<div class="team ${cls}"><span class="crest ${name === OUR_TEAM ? "us" : ""}">${initials(name)}</span><span>${name}</span></div>`;
}
function renderMatches(filter = "all") {
  const list = $("#matchList");
  const items = matches
    .filter(m => filter === "all" || (filter === "done" ? isDone(m) : !isDone(m)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!items.length) { list.innerHTML = '<p class="empty">Tidak ada pertandingan.</p>'; return; }

  list.innerHTML = items.map((m, i) => {
    const d = new Date(m.date);
    const jam = `${pad(d.getHours())}.${pad(d.getMinutes())}`;
    const done = isDone(m);
    let mid = '<span class="vs">VS</span>', hc = "", ac = "";
    if (done) {
      mid = `<span class="score">${m.score[0]} - ${m.score[1]}</span>`;
      if (m.score[0] > m.score[1]) hc = "win";
      if (m.score[1] > m.score[0]) ac = "win";
    }
    return `
      <article class="match" style="animation-delay:${i * 60}ms">
        <div class="m-date"><b>${pad(d.getDate())}</b><small>${bulan[d.getMonth()]}</small></div>
        <div>
          <div class="m-teams">${team(m.home, hc)}${mid}${team(m.away, ac)}</div>
          <span class="m-meta">${hari[d.getDay()]}, ${jam} WIB · ${m.venue}</span>
        </div>
        <span class="m-badge ${done ? "done" : "upcoming"}">${done ? "Selesai" : "Mendatang"}</span>
      </article>`;
  }).join("");
}
$$(".tab[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".tab[data-filter]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderMatches(btn.dataset.filter);
  });
});
renderMatches();

/* ================= PEMAIN ================= */
const posLabel = { Goleiro: "Kiper", Fixo: "Fixo", Ala: "Ala", "Pivô": "Pivô" };

function renderPlayers(pos = "all") {
  const items = players.filter(p => pos === "all" || p.pos === pos);
  $("#playerGrid").innerHTML = items.map((p, i) => `
    <article class="player" style="animation-delay:${i * 50}ms">
      <span class="p-num">${p.num}</span>
      <div class="p-avatar">${initials(p.name)}</div>
      <h3>${p.name}</h3>
      <span class="p-pos">${posLabel[p.pos]}</span>
      <div class="p-stats">
        <div><b>${p.g}</b><small>Gol</small></div>
        <div><b>${p.a}</b><small>Assist</small></div>
        <div><b>${p.m}</b><small>Main</small></div>
      </div>
    </article>`).join("");
}
$$("#posTabs .tab").forEach(btn => {
  btn.addEventListener("click", () => {
    $$("#posTabs .tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPlayers(btn.dataset.pos);
  });
});
renderPlayers();

/* ================= GAWANG (MINI GAME) ================= */
(function () {
  const MAX_SHOTS = 5;
  const goal = $("#goal");
  const ball = $("#shotBall");
  const keeper = $("#keeper");
  const verdict = $("#verdict");
  const msg = $("#gameMsg");
  let shots = 0, goals = 0, saves = 0, busy = false;

  function updateBoard() {
    $("#shotCount").textContent = `${shots}/${MAX_SHOTS}`;
    $("#goalCount").textContent = goals;
    $("#saveCount").textContent = saves;
  }
  function resetBall() {
    ball.style.transition = "none";
    ball.classList.remove("fly");
    ball.style.left = "50%";
    ball.style.top = "112%";
    void ball.offsetWidth;
    ball.style.transition = "";
  }
  function resetKeeper() {
    keeper.classList.remove("dive");
    keeper.style.left = "50%";
    keeper.style.transform = "translateX(-50%)";
  }
  function showVerdict(text) {
    verdict.textContent = text;
    verdict.classList.remove("show");
    void verdict.offsetWidth;
    verdict.classList.add("show");
  }
  function shoot(xPct, yPct) {
    if (busy || shots >= MAX_SHOTS) return;
    busy = true;
    shots++;

    const kx = 15 + Math.random() * 70;
    keeper.style.left = kx + "%";
    keeper.style.transform = `translateX(-50%) rotate(${kx < xPct ? -18 : 18}deg)`;
    keeper.classList.add("dive");

    ball.classList.add("fly");
    ball.style.left = xPct + "%";
    ball.style.top = yPct + "%";

    setTimeout(() => {
      const reach = yPct < 30 ? 7 : 13; // sudut atas lebih sulit ditahan
      const saved = Math.abs(kx - xPct) < reach && yPct > 18;
      if (saved) { saves++; showVerdict("Ditahan!"); msg.textContent = "Kiper berhasil menepis bola. Coba sudut lain!"; }
      else       { goals++; showVerdict("Golaço!");  msg.textContent = "Bola masuk ke jaring. Mantap!"; }
      updateBoard();
    }, 520);

    setTimeout(() => {
      resetKeeper();
      resetBall();
      busy = false;
      if (shots >= MAX_SHOTS) finish();
    }, 1500);
  }
  function finish() {
    let text;
    if (goals >= 4) text = `Skor ${goals}/5. Luar biasa, kamu layak jadi pivô Seleção!`;
    else if (goals >= 2) text = `Skor ${goals}/5. Lumayan, latihan lagi ya!`;
    else text = `Skor ${goals}/5. Kiper hari ini sedang on fire!`;
    msg.textContent = text + " Tekan Main Lagi.";
  }
  function reset() {
    shots = goals = saves = 0; busy = false;
    resetKeeper(); resetBall(); updateBoard();
    msg.textContent = "Klik di mana saja pada gawang untuk menendang.";
  }

  goal.addEventListener("click", e => {
    const r = goal.getBoundingClientRect();
    const x = Math.min(95, Math.max(5, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(92, Math.max(8, ((e.clientY - r.top) / r.height) * 100));
    shoot(x, y);
  });
  goal.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      shoot(10 + Math.random() * 80, 15 + Math.random() * 70);
    }
  });
  $("#resetGame").addEventListener("click", reset);
  updateBoard();
})();
