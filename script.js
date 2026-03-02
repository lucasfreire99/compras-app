let lists = JSON.parse(localStorage.getItem("lists")) || { "Lista Padrão": [] };
let currentList = Object.keys(lists)[0];

function save() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  Object.keys(lists).forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = `${name} (${lists[name].length})`;
    btn.onclick = () => {
      currentList = name;
      render();
    };
    container.appendChild(btn);
  });

  document.getElementById("currentListTitle").textContent = currentList;
}

function createNewList() {
  const name = prompt("Nome da nova lista:");
  if (!name) return;
  lists[name] = [];
  currentList = name;
  save();
  render();
}

function addItem() {
  const name = itemName.value;
  const qty = Number(itemQty.value);
  const price = Number(itemPrice.value);

  if (!name || !qty || !price) return;

  lists[currentList].push({
    name,
    quantity: qty,
    price,
    total: qty * price,
    purchased: false
  });

  itemName.value = "";
  itemQty.value = "";
  itemPrice.value = "";

  save();
  render();
}

function togglePurchased(index) {
  lists[currentList][index].purchased =
    !lists[currentList][index].purchased;
  save();
  render();
}

function render() {
  renderLists();

  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  let total = 0;

  lists[currentList].forEach((item, i) => {
    total += item.total;

    const div = document.createElement("div");
    div.className = "item-card";
    if (item.purchased) div.classList.add("purchased");

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong><br>
        ${item.quantity}x - R$ ${item.total.toFixed(2)}
      </div>
      <button onclick="togglePurchased(${i})">
        ${item.purchased ? "✔" : "○"}
      </button>
    `;

    container.appendChild(div);
  });

  document.getElementById("totalValue").textContent =
    "R$ " + total.toFixed(2);
}

function toggleCopyMenu() {
  document.getElementById("copyMenu").classList.toggle("hidden");
}

function copyTxt() {
  let text = `LISTA: ${currentList}\n\n`;

  lists[currentList].forEach(item => {
    text += `${item.name} - ${item.quantity}x - R$ ${item.total.toFixed(2)}\n`;
  });

  navigator.clipboard.writeText(text);
}

function copyWhatsApp() {
  let text = `🛒 *${currentList}*\n\n`;

  lists[currentList].forEach(item => {
    text += `• ${item.name} - ${item.quantity}x - R$ ${item.total.toFixed(2)}\n`;
  });

  navigator.clipboard.writeText(text);
}

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
