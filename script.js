const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const btnAbrir = document.getElementById("btnAbrir");
const btnMusica = document.getElementById("btnMusica");
const musica = document.getElementById("musica");
const texto = document.getElementById("mensagem");

// ================= CANVAS =================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ================= TEXTO DIGITANDO =================
const mensagemFinal = "Para você, com todo carinho 💖";
let i = 0;

function digitarTexto() {
  if (i < mensagemFinal.length) {
    texto.innerHTML += mensagemFinal[i];
    i++;
    setTimeout(digitarTexto, 80);
  }
}

// ================= ESTRELAS =================
const estrelas = Array.from({ length: 200 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.5,
  v: Math.random() * 0.4 + 0.1
}));

// ================= CORAÇÕES =================
const coracoes = Array.from({ length: 40 }, () => ({
  x: Math.random() * canvas.width,
  y: canvas.height + Math.random() * 300,
  s: Math.random() * 0.6 + 0.3,
  v: Math.random() * 0.6 + 0.3
}));

let mostrarCoracoes = false;

// ================= ÁUDIO =================
let audioCtx, analyser, dataArray;
let tocando = false;
let batida = 0;

btnMusica.addEventListener("click", async () => {
  musica.volume = 1;

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(musica);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  if (!tocando) {
    await musica.play();
    tocando = true;
    btnMusica.classList.add("tocando");
  } else {
    musica.pause();
    tocando = false;
    btnMusica.classList.remove("tocando");
  }
});

// ================= FLOR =================
let abertura = 0;
let abrir = false;

btnAbrir.addEventListener("click", () => {
  abrir = true;
  mostrarCoracoes = true;
  digitarTexto();
  btnAbrir.style.display = "none";
});

function desenharFlor() {
  if (abrir && abertura < 90) abertura += 0.6;

  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
    batida = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  }

  const pulso = 1 + batida / 600;
  const fx = canvas.width / 2;
  const fy = canvas.height / 2 + 120;

  ctx.strokeStyle = "#2ecc71";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(fx, canvas.height);
  ctx.stroke();

  ctx.save();
  ctx.translate(fx, fy);
  ctx.scale(pulso, pulso);

  for (let i = 0; i < 18; i++) {
    const a = (Math.PI * 2 / 18) * i;
    ctx.save();
    ctx.rotate(a);

    const g = ctx.createLinearGradient(0, 0, 0, -130);
    g.addColorStop(0, "#ff3f8f");
    g.addColorStop(1, "#ffd1dc");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -abertura, 30, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#f1c40f";
  ctx.shadowColor = "#f9e79f";
  ctx.shadowBlur = 25;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ================= LOOP =================
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  estrelas.forEach(e => {
    e.y += e.v;
    if (e.y > canvas.height) e.y = 0;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();
  });

  if (mostrarCoracoes) {
    coracoes.forEach(c => {
      c.y -= c.v;
      if (c.y < -50) c.y = canvas.height + 50;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.s, c.s);
      ctx.fillStyle = "rgba(255,105,180,0.6)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-10, -10, -25, 5, 0, 25);
      ctx.bezierCurveTo(25, 5, 10, -10, 0, 0);
      ctx.fill();
      ctx.restore();
    });
  }

  desenharFlor();
  requestAnimationFrame(animate);
}

animate();
