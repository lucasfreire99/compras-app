let lists = {};
let currentList = null;

const categories = [
  "Alimentos",
  "Bebidas",
  "Limpeza",
  "Higiene",
  "Hortifruti",
  "Outros"
];

const form = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const grandTotalEl = document.getElementById("grandTotal");
const itemCountEl = document.getElementById("itemCount");
const categorySelect = document.getElementById("category");
const filterCategory = document.getElementById("filterCategory");
const listsContainer = document.getElementById("listsContainer");
const newListNameInput = document.getElementById("newListName");
const createListBtn = document.getElementById("createListBtn");
const toast = document.getElementById("toast");
const currentListTitle = document.getElementById("currentListTitle");

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

function save() {
  localStorage.setItem("lists", JSON.stringify(lists));
  localStorage.setItem("currentList", currentList);
}

function load() {
  lists = JSON.parse(localStorage.getItem("lists")) || {
    "Lista Principal": []
  };
  currentList =
    localStorage.getItem("currentList") ||
    Object.keys(lists)[0];
}

function initCategories() {
  categorySelect.innerHTML = "";
  filterCategory.innerHTML = '<option value="all">Filtrar</option>';

  categories.forEach(cat => {
    categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

function renderLists() {
  listsContainer.innerHTML = "";

  Object.keys(lists).forEach(name => {
    const li = document.createElement("li");
    li.className = "listItem";

    if (name === currentList) {
      li.classList.add("activeList");
    }

    li.innerHTML = `
      <span class="listName">${name}</span>
      <span class="listCount">${lists[name].length}</span>
      <div class="listActions">
        <button onclick="renameList('${name}')">✏️</button>
        <button onclick="deleteList('${name}')">🗑️</button>
      </div>
    `;

    li.querySelector(".listName").onclick = () => {
      currentList = name;
      render();
      save();
    };

    listsContainer.appendChild(li);
  });
}

function createList() {
  const name = newListNameInput.value.trim();

  if (!name) return;

  if (lists[name]) {
    showToast("Lista já existe.");
    return;
  }

  lists[name] = [];
  currentList = name;
  newListNameInput.value = "";

  render();
  save();
}

function renameList(oldName) {
  const newName = prompt("Novo nome:", oldName);
  if (!newName || lists[newName]) return;

  lists[newName] = lists[oldName];
  delete lists[oldName];

  if (currentList === oldName) {
    currentList = newName;
  }

  render();
  save();
}

function deleteList(name) {
  if (Object.keys(lists).length === 1) {
    showToast("Precisa ter ao menos uma lista.");
    return;
  }

  if (!confirm("Excluir lista?")) return;

  delete lists[name];

  if (currentList === name) {
    currentList = Object.keys(lists)[0];
  }

  render();
  save();
}

function renderItems() {
  itemList.innerHTML = "";
  const filter = filterCategory.value;
  const items = lists[currentList];

  const filtered = items.filter(
    item => filter === "all" || item.category === filter
  );

  filtered.forEach((item, index) => {
    itemList.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${formatCurrency(item.total)}</td>
        <td>${item.market || "-"}</td>
        <td>
          <button onclick="editItem(${index})">Editar</button>
          <button onclick="deleteItemFromList(${index})">Excluir</button>
        </td>
      </tr>
    `;
  });

  calculateTotal();
}

function calculateTotal() {
  const items = lists[currentList];
  const total = items.reduce((sum, item) => sum + item.total, 0);

  grandTotalEl.textContent = formatCurrency(total);
  itemCountEl.textContent = items.length;
}

function addItem(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);
  const market = document.getElementById("market").value.trim();
  const category = categorySelect.value;

  const total = quantity * price;

  lists[currentList].push({
    name, quantity, price, total, market, category
  });

  form.reset();
  render();
  save();
}

function editItem(index) {
  const item = lists[currentList][index];

  document.getElementById("name").value = item.name;
  document.getElementById("quantity").value = item.quantity;
  document.getElementById("price").value = item.price;
  document.getElementById("market").value = item.market;
  categorySelect.value = item.category;

  lists[currentList].splice(index, 1);
  render();
  save();
}

function deleteItemFromList(index) {
  lists[currentList].splice(index, 1);
  render();
  save();
}

function render() {
  currentListTitle.textContent = currentList;
  renderLists();
  renderItems();
}

form.addEventListener("submit", addItem);
createListBtn.addEventListener("click", createList);
filterCategory.addEventListener("change", renderItems);

load();
initCategories();
render();
