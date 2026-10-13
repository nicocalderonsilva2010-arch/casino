/* ===== Barra inferior móvil: mueve el notch y la burbuja al tab activo ===== */
const tabbar = document.getElementById("tabbar");
const bubble = document.getElementById("bubble");
const tabs = [...tabbar.querySelectorAll(".tab")];
const pillLinks = [...document.querySelectorAll(".pill-link")];

function setActive(section) {
  const tab = tabs.find(t => t.dataset.section === section);
  if (!tab) return;

  tabs.forEach(t => t.classList.toggle("is-active", t === tab));
  pillLinks.forEach(l => l.classList.toggle("is-active", l.dataset.section === section));

  // posición del notch = centro del tab activo
  const barRect = tabbar.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  const x = tabRect.left - barRect.left + tabRect.width / 2;
  tabbar.style.setProperty("--x", x + "px");

  // la burbuja muestra el icono del tab activo
  bubble.innerHTML = tab.innerHTML;
  const svg = bubble.querySelector("svg");
  if (svg) {
    svg.style.cssText = "opacity:1;transform:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round";
  }
}

tabs.forEach(t => t.addEventListener("click", () => setActive(t.dataset.section)));
pillLinks.forEach(l => l.addEventListener("click", () => setActive(l.dataset.section)));

/* ===== Scroll spy: el tab sigue a la sección visible ===== */
const sections = ["lobby", "juegos", "ranking", "fichas"]
  .map(id => document.getElementById(id))
  .filter(Boolean);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) setActive(e.target.id);
    });
  },
  { rootMargin: "-40% 0px -50% 0px" }
);
sections.forEach(s => observer.observe(s));

window.addEventListener("resize", () => {
  const active = tabs.find(t => t.classList.contains("is-active"));
  if (active) setActive(active.dataset.section);
});
window.addEventListener("load", () => setActive("lobby"));

/* ===== Botones de juego (aquí conectas tus juegos reales) ===== */
document.querySelectorAll("[data-game]").forEach(btn => {
  btn.addEventListener("click", () => {
    const game = btn.dataset.game;
    console.log("Abrir juego:", game);
    // Ejemplo: window.location.href = `/${game}`;
  });
});