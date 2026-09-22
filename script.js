const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");
const searchBtn = document.getElementById("searchBtn");
const toast = document.getElementById("toast");
const cartCount = document.getElementById("cartCount");

menuBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
  menuBtn.textContent = mobileNav.classList.contains("open") ? "✕" : "☰";
});

document.querySelectorAll(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuBtn.textContent = "☰";
  });
});

searchBtn.addEventListener("click", () => {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Placeholder cart interaction for future product pages.
document.querySelectorAll(".category-card, .primary-btn").forEach(card => {
  card.addEventListener("click", () => {
    // Product/cart logic can be connected later.
  });
});
