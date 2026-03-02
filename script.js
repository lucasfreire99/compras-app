let lists = JSON.parse(localStorage.getItem("lists")) || {
  "Padrão": []
};

let currentList = Object.keys(lists)[0];

function save() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  Object.keys(lists).forEach(name => {
    const btn = document.createElement("button");
    btn.className = "btn-light full";
    btn.innerText = `${name} (${lists[name].length})`;
    btn.onclick = () => {
      currentList = name;
      renderItems();
      document.getElementById("currentListTitle").innerText = name;
    };
    container.appendChild(btn);
  });
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

  save();
  renderItems();
}

function renderItems() {
  const tbody = document.getElementById("itemsContainer");
  tbody.innerHTML = "";
  let total = 0;

  lists[currentList].forEach((item, i) => {
    total += item.total;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <button onclick="toggle(${i})">
          ${item.purchased ? "✔" : "○"}
        </button>
      </td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>R$ ${item.price.toFixed(2)}</td>
      <td>R$ ${item.total.toFixed(2)}</td>
      <td>
        <button onclick="removeItem(${i})">Excluir</button>
      </td>
    `;

    if (item.purchased) {
      row.style.textDecoration = "line-through";
      row.style.opacity = "0.6";
    }

    tbody.appendChild(row);
  });

  totalValue.innerText = "R$ " + total.toFixed(2);
  renderLists();
}

function toggle(i) {
  lists[currentList][i].purchased = !lists[currentList][i].purchased;
  save();
  renderItems();
}

function removeItem(i) {
  lists[currentList].splice(i, 1);
  save();
  renderItems();
}

function createNewList() {
  const name = prompt("Nome da nova lista:");
  if (!name) return;
  lists[name] = [];
  currentList = name;
  save();
  renderLists();
  renderItems();
}

function toggleCopyMenu() {
  document.getElementById("copyMenu").classList.toggle("hidden");
}

renderLists();
renderItems();
