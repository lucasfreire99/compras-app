let lists = JSON.parse(localStorage.getItem("lists")) || {
  "Padrão": []
};

let currentList = Object.keys(lists)[0];

function saveLists() {
  localStorage.setItem("lists", JSON.stringify(lists));
}

function renderLists() {
  const container = document.getElementById("listsContainer");
  container.innerHTML = "";

  Object.keys(lists).forEach(name => {
    const count = lists[name].length;
    const btn = document.createElement("button");
    btn.className = "btn-secondary";
    btn.style.marginBottom = "5px";
    btn.innerText = `${name} (${count})`;
    btn.onclick = () => {
      currentList = name;
      renderItems();
      document.getElementById("currentListTitle").innerText = name;
    };
    container.appendChild(btn);
  });
}

function addItem() {
  const name = document.getElementById("itemName").value;
  const qty = Number(document.getElementById("itemQty").value);
  const price = Number(document.getElementById("itemPrice").value);

  if (!name || !qty || !price) return;

  lists[currentList].push({
    name,
    quantity: qty,
    price,
    total: qty * price,
    purchased: false
  });

  saveLists();
  renderItems();
}

function renderItems() {
  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  let totalGeral = 0;

  lists[currentList].forEach((item, index) => {
    totalGeral += item.total;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <button onclick="togglePurchased(${index})">
          ${item.purchased ? "✔" : "○"}
        </button>
      </td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>R$ ${item.price.toFixed(2)}</td>
      <td>R$ ${item.total.toFixed(2)}</td>
      <td>
        <button class="btn-danger" onclick="removeItem(${index})">Excluir</button>
      </td>
    `;

    if (item.purchased) {
      row.style.textDecoration = "line-through";
      row.style.opacity = "0.6";
    }

    container.appendChild(row);
  });

  document.getElementById("totalValue").innerText =
    "R$ " + totalGeral.toFixed(2);

  renderLists();
}

function togglePurchased(index) {
  lists[currentList][index].purchased =
    !lists[currentList][index].purchased;
  saveLists();
  renderItems();
}

function removeItem(index) {
  lists[currentList].splice(index, 1);
  saveLists();
  renderItems();
}

function createNewList() {
  const name = prompt("Nome da nova lista:");
  if (!name) return;
  lists[name] = [];
  currentList = name;
  saveLists();
  renderLists();
  renderItems();
}

renderLists();
renderItems();
