/* =========================
   ESTADO GLOBAL
========================= */

let items = [];
let deferredPrompt = null;

const categories = [
  "Alimentos",
  "Bebidas",
  "Limpeza",
  "Higiene",
  "Hortifruti",
  "Outros"
];

/* =========================
   ELEMENTOS DOM
========================= */

const form = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const grandTotalEl = document.getElementById("grandTotal");
const itemCountEl = document.getElementById("itemCount");
const categorySelect = document.getElementById("category");
const filterCategory = document.getElementById("filterCategory");
const installBtn = document.getElementById("installBtn");
const toast = document.getElementById("toast");
const copyBtn = document.getElementById("copyBtn");
const offlineBadge = document.getElementById("offlineBadge");

/* =========================
   UTILITÁRIOS
========================= */

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

/* =========================
   CATEGORIAS
========================= */

function initCategories() {
  categorySelect.innerHTML = "";
  filterCategory.innerHTML = '<option value="all">Filtrar por Categoria</option>';

  categories.forEach(cat => {
    categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

/* =========================
   STORAGE
========================= */

function saveToLocalStorage() {
  localStorage.setItem("items", JSON.stringify(items));
}

function loadFromLocalStorage() {
  items = JSON.parse(localStorage.getItem("items")) || [];
}

/* =========================
   CÁLCULO TOTAL
========================= */

function calculateGrandTotal() {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  grandTotalEl.textContent = formatCurrency(total);
  itemCountEl.textContent = items.length;
}

/* =========================
   RENDERIZAÇÃO
========================= */

function renderItems() {
  itemList.innerHTML = "";
  const filter = filterCategory.value;

  const filteredItems = items.filter(
    item => filter === "all" || item.category === filter
  );

  filteredItems.forEach((item, index) => {
    itemList.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price)}</td>
        <td><strong>${formatCurrency(item.total)}</strong></td>
        <td>${item.market || "-"}</td>
        <td>
          <button class="actionBtn" onclick="editItem(${index})">Editar</button>
          <button class="actionBtn" onclick="deleteItem(${index})">Excluir</button>
        </td>
      </tr>
    `;
  });

  calculateGrandTotal();
  saveToLocalStorage();
}

/* =========================
   CRUD
========================= */

function addItem(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const price = parseFloat(
    document.getElementById("price").value.replace(",", ".")
  );
  const market = document.getElementById("market").value.trim();
  const category = categorySelect.value;

  if (!name || !quantity || !price) {
    showToast("Preencha todos os campos obrigatórios.");
    return;
  }

  const total = quantity * price;

  items.push({ name, quantity, price, total, market, category });

  form.reset();
  renderItems();
}

function editItem(index) {
  const item = items[index];

  document.getElementById("name").value = item.name;
  document.getElementById("quantity").value = item.quantity;
  document.getElementById("price").value = item.price;
  document.getElementById("market").value = item.market;
  categorySelect.value = item.category;

  items.splice(index, 1);
  renderItems();
}

function deleteItem(index) {
  if (confirm("Deseja excluir este item?")) {
    items.splice(index, 1);
    renderItems();
  }
}

/* =========================
   COPIAR LISTA
========================= */

function copyList() {
  if (items.length === 0) {
    showToast("Lista vazia.");
    return;
  }

  let text = "🛒 Lista de Compras\n\n";

  items.forEach(item => {
    text += `${item.name} - ${item.quantity}x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}\n`;
  });

  text += `\nTotal: ${grandTotalEl.textContent}`;

  navigator.clipboard.writeText(text);
  showToast("Lista copiada com sucesso!");
}

/* =========================
   PWA
========================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn?.addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    installBtn.classList.add("hidden");
  }
});

/* =========================
   STATUS ONLINE/OFFLINE
========================= */

window.addEventListener("online", () =>
  offlineBadge.classList.add("hidden")
);

window.addEventListener("offline", () =>
  offlineBadge.classList.remove("hidden")
);

/* =========================
   EVENT LISTENERS
========================= */

filterCategory.addEventListener("change", renderItems);
form.addEventListener("submit", addItem);
copyBtn?.addEventListener("click", copyList);

/* =========================
   INICIALIZAÇÃO
========================= */

loadFromLocalStorage();
initCategories();
renderItems();
