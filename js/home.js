const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    setTimeout(() => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }, 0);
  });
}

function setMenu(menu, open) {
  menu.classList.toggle("is-open", open);
  const button = menu.querySelector(":scope > button");
  if (button) button.setAttribute("aria-expanded", String(open));
}

function closeOtherMenus(menu) {
  document.querySelectorAll(".menu.is-open").forEach((other) => {
    if (other !== menu) setMenu(other, false);
  });
}

document.querySelectorAll(".menu > button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const menu = button.parentElement;
    const open = !menu.classList.contains("is-open");
    closeOtherMenus(menu);
    setMenu(menu, open);
  });
});

document.querySelectorAll(".menu > a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const menu = link.parentElement;
    if (menu.classList.contains("is-open")) return;
    event.preventDefault();
    event.stopPropagation();
    closeOtherMenus(menu);
    setMenu(menu, true);
  });
});

function closeMenus() {
  document.querySelectorAll(".menu.is-open").forEach((menu) => {
    menu.classList.remove("is-open");
    const button = menu.querySelector("button");
    if (button) button.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".menu")) {
    if (event.target.closest("a")) setTimeout(closeMenus, 0);
    return;
  }
  if (toggle && nav && !nav.contains(event.target) && !toggle.contains(event.target)) {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  closeMenus();
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement;
    const open = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
    item.querySelector(".faq-panel").hidden = !open;
  });
});

const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const slider = document.querySelector("[data-review-slider]");
if (slider) {
  const viewport = slider.querySelector(".review-viewport");
  const track = slider.querySelector(".review-track");
  const slides = [...track.children];
  const status = slider.querySelector(".review-status");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let startX = 0;
  let delta = 0;
  let dragging = false;

  const show = (animate) => {
    track.style.transition = animate && !reduced ? "" : "none";
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((slide, i) => slide.setAttribute("aria-hidden", String(i !== index)));
    status.textContent = `Review ${index + 1} of ${slides.length}`;
  };

  const go = (dir) => {
    index = (index + dir + slides.length) % slides.length;
    show(true);
  };

  slider.querySelector("[data-review-prev]").addEventListener("click", () => go(-1));
  slider.querySelector("[data-review-next]").addEventListener("click", () => go(1));

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    delta = 0;
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    delta = event.clientX - startX;
    if (Math.abs(delta) < 6) return;
    track.style.transition = "none";
    track.style.transform = `translateX(calc(-${index * 100}% + ${delta}px))`;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(delta) > 48) go(delta < 0 ? 1 : -1);
    else show(true);
    delta = 0;
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  show(false);
}

document.querySelectorAll(".compare-view").forEach((view) => {
  const range = view.querySelector("input");
  if (!range) return;
  const paint = () => view.style.setProperty("--pos", `${range.value}%`);
  range.addEventListener("input", paint);
  paint();
});
