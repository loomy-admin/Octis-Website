const glyphs = {
  Billing: "M5 7h14v12H5zM8 7V5h8v2M8 12h8M8 16h5",
  Stock: "M4 8l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
  Catalogue: "M6 5h12v14H6zM9 9h6M9 13h6",
  Reports: "M6 4h8l4 4v12H6zM14 4v4h4M8 13h8M8 17h5",
  Payments: "M4 8h16v8H4zM4 12h16",
  Purity: "M12 4l7 14H5z",
  HUID: "M8 11V8a4 4 0 018 0v3M7 11h10v8H7z",
  KYC: "M12 12a3 3 0 100-6 3 3 0 000 6zM6 19c1.2-2 3-3 6-3s4.8 1 6 3",
  PMLA: "M12 4l7 3v5c0 4.5-3 7-7 8-4-1-7-3.5-7-8V7z",
  WhatsApp: "M6 18l1.2-3A7 7 0 1112 19a7 7 0 01-3.2-.8L6 18z",
  "AI images": "M5 6h14v12H5zM8 15l2.5-3 2 2 2-2.5L17 15",
  Pawnify: "M8 8h8v3a4 4 0 01-8 0V8zM12 15v4M9 19h6",
  Bullion: "M12 4v16M8 8h8M8 16h8",
  "Octis AI": "M12 4l1.4 4.2L18 10l-4.6 1.6L12 16l-1.4-4.4L6 10l4.6-1.8z"
};

function icon(name) {
  const d = glyphs[name] || "M12 4v16M4 12h16";
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${d}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

const modules = [
  { name: "Billing", text: "Fast jewellery billing with instant charge calculations and flexible payments, even during peak showroom hours.", href: "#billing" },
  { name: "Stock", text: "Track jewellery from procurement to sale with precise weight, purity and stock visibility.", href: "#billing" },
  { name: "Catalogue", text: "Live sync of tagged showroom inventory with weight, purity, and BIS hallmarking directly to customer browsing.", href: "#catalogue" },
  { name: "Reports", text: "100+ unique business reports, built around jewellery operations and customizable on request.", href: "#reports" },
  { name: "Payments", text: "Split payments across cash, card and UPI, with old gold exchange on the same bill.", href: "#billing" },
  { name: "OCTIS", core: true },
  { name: "Purity", text: "Filter stock by 22K, 24K and 18K. Separate stone weight from net gold weight.", href: "#billing" },
  { name: "HUID", text: "Built-in support for mandatory HUID tracking, compliant tags and digital audit records.", href: "#compliance" },
  { name: "KYC", text: "Cashiers are prompted for PAN or Aadhaar when a transaction exceeds ₹2 lakh.", href: "#compliance" },
  { name: "PMLA", text: "Cash transactions exceeding ₹10 lakh are flagged and logged.", href: "#compliance" },
  { name: "WhatsApp", text: "Share the invoice on WhatsApp from the counter.", href: "#billing" },
  { name: "AI images", text: "Studio-grade digital product presentations created from jewellery ERP specifications, without photoshoots. Enterprise exclusive.", href: "#catalogue" },
  { name: "Pawnify", text: "A specialised product on the Octis standard: enterprise security, audit logging, role-based access and GST.", href: "#catalogue" },
  { name: "Bullion", text: "A specialised product on the Octis standard: enterprise security, audit logging, role-based access and GST.", href: "#catalogue" },
  { name: "Octis AI", text: "Identifies patterns, exceptions and opportunities, then recommends what needs attention, what to sell, whom to follow up with and what to buy.", href: "#ai" }
];

const cloud = document.querySelector("#cloud");
const detail = document.querySelector("#detail");

function showDetail(mod) {
  detail.innerHTML = `<p class="demo-pill">OCTIS</p><h3>${mod.name}</h3><p>${mod.text}</p><a class="btn btn-fill" href="${mod.href}">Open this section</a>`;
}

modules.forEach((mod, index) => {
  if (mod.core) {
    const mark = document.createElement("div");
    mark.className = "brand-core";
    mark.textContent = "OCTIS";
    cloud.appendChild(mark);
    return;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mod";
  button.innerHTML = `${icon(mod.name)}<span>${mod.name}</span>`;
  button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
  button.addEventListener("click", () => {
    cloud.querySelectorAll(".mod").forEach((el) => el.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    showDetail(mod);
  });
  cloud.appendChild(button);
});
showDetail(modules[0]);

const desks = {
  sales: {
    title: "Today’s sales",
    body: `<p class="kicker">Showroom counter</p><div class="desk-top"><div><p class="kicker">Today’s sales</p><p class="sales">₹4,85,200</p></div><span class="demo-pill">DEMONSTRATION</span></div><div class="chips"><span class="chip">Taxation ready</span><span class="chip">Business intelligence</span><span class="chip">Dynamic billing</span><span class="chip">AI-powered SaaS ERP</span></div><div class="panel-grid"><div class="panel"><h3>Counter mix</h3><div class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div></div><div class="panel"><h3>On this bill</h3><ul><li>Old gold exchange</li><li>Cash, card and UPI</li><li>WhatsApp invoice</li></ul></div></div>`
  },
  billing: {
    title: "Billing",
    body: `<p class="kicker">Point of sale</p><h3>A point of sale that keeps the line moving</h3><p>Fast jewellery billing with instant charge calculations and flexible payments, even during peak showroom hours.</p><div class="chips"><span class="chip">Old gold exchange</span><span class="chip">Cash</span><span class="chip">Card</span><span class="chip">UPI</span><span class="chip">WhatsApp invoice</span></div>`
  },
  stock: {
    title: "Stock",
    body: `<p class="kicker">Weight and purity</p><h3>Every gram. Accounted for.</h3><p>Track jewellery from procurement to sale with precise weight, purity and stock visibility.</p><div class="chips"><span class="chip">22K</span><span class="chip">24K</span><span class="chip">18K</span><span class="chip">Stone vs net gold</span></div>`
  },
  catalogue: {
    title: "Catalogue",
    body: `<p class="kicker">Storefront</p><h3>From your ERP to your digital storefront</h3><p>Live sync of tagged showroom inventory with weight, purity, and BIS hallmarking. AI catalogue images are an Enterprise exclusive, made from ERP specifications without photoshoots.</p><div class="chips"><span class="chip">Professional+</span><span class="chip">Real-time sync</span><span class="chip">Enterprise exclusive</span></div>`
  },
  reports: {
    title: "Reports",
    body: `<p class="kicker">Jewellery reports</p><h3>100+ unique business reports</h3><p>Customizable to your business, on request. Ready to run: traceability matrix, vendor article compare, purchase price trends, daily reconciliation, profitability.</p>`
  }
};

const deskMain = document.querySelector("#desk-main");
function renderDesk(key) {
  deskMain.innerHTML = desks[key].body;
}
renderDesk("sales");
document.querySelectorAll("[data-desk]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-desk]").forEach((el) => el.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");
    renderDesk(tab.dataset.desk);
  });
});

document.querySelectorAll(".tabs [role='tab']").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tabs [role='tab']").forEach((el) => el.setAttribute("aria-selected", "false"));
    document.querySelectorAll(".tab-panel").forEach((panel) => { panel.hidden = true; });
    tab.setAttribute("aria-selected", "true");
    document.getElementById(tab.getAttribute("aria-controls")).hidden = false;
  });
});

const scroller = document.querySelector("#report-scroller");
document.querySelector("#rep-next").addEventListener("click", () => {
  scroller.scrollBy({ left: 280, behavior: "smooth" });
});
document.querySelector("#rep-prev").addEventListener("click", () => {
  scroller.scrollBy({ left: -280, behavior: "smooth" });
});

const menu = document.querySelector("#nav-links");
const menuToggle = document.querySelector("#menu-toggle");
menuToggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "Close" : "Menu";
});
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "Menu";
  });
});

const dialog = document.querySelector("#search-dialog");
document.querySelector("#open-search").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-search").addEventListener("click", () => dialog.close());
dialog.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => dialog.close()));

document.querySelector("#ai-jump").addEventListener("click", () => {
  document.querySelector("#intelligence").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#demo-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = String(data.get("name") || "").trim();
  const showroom = String(data.get("showroom") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const email = String(data.get("email") || "").trim();
  const error = document.querySelector("#form-error");
  if (!name || !showroom || !phone || !email) {
    error.textContent = "Add your name, showroom, phone and email so the demonstration request is complete.";
    return;
  }
  error.textContent = "";
  const body = `Name: ${name}\nShowroom: ${showroom}\nPhone: ${phone}\nEmail: ${email}\n\nPlease arrange a free Octis demonstration.`;
  window.location.href = `mailto:hello@octis.in?subject=${encodeURIComponent("Octis demonstration request")}&body=${encodeURIComponent(body)}`;
  document.querySelector("#form-note").textContent = "Your email app should open with this request addressed to hello@octis.in.";
});
