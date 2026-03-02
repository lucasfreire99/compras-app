const categoriasPadrao = [
  "Alimentos", "Bebidas", "Limpeza",
  "Higiene", "Hortifruti", "Outros"
];

let itens = JSON.parse(localStorage.getItem("itens")) || [];
let categorias = JSON.parse(localStorage.getItem("categorias")) || categoriasPadrao;

const lista = document.getElementById("lista");
const totalGeralEl = document.getElementById("totalGeral");
const contador = document.getElementById("contador");

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function addItem() {
  const nome = document.getElementById("nome").value.trim();
  const quantidade = parseFloat(document.getElementById("quantidade").value);
  const valor = parseFloat(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;
  const supermercado = document.getElementById("supermercadoGlobal").value;

  if (!nome || quantidade <= 0 || valor <= 0) {
    alert("Preencha os campos corretamente.");
    return;
  }

  itens.push({ id: Date.now(), nome, quantidade, valor, categoria, supermercado });
  saveToLocalStorage();
  render();
}

function deleteItem(id) {
  if (!confirm("Excluir item?")) return;
  itens = itens.filter(item => item.id !== id);
  saveToLocalStorage();
  render();
}

function calculateGrandTotal() {
  const total = itens.reduce((acc, item) => acc + item.quantidade * item.valor, 0);
  totalGeralEl.textContent = formatarMoeda(total);
}

function render() {
  lista.innerHTML = "";
  const filtro = document.getElementById("filtroCategoria").value;

  let filtrados = filtro === "todas"
    ? itens
    : itens.filter(i => i.categoria === filtro);

  filtrados.forEach(item => {
    const totalItem = item.quantidade * item.valor;

    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
      <div>
        <strong>${item.nome}</strong><br>
        ${item.quantidade}x — ${formatarMoeda(totalItem)}<br>
        <small>${item.categoria}</small>
      </div>
      <button onclick="deleteItem(${item.id})">X</button>
    `;
    lista.appendChild(div);
  });

  contador.textContent = `Itens: ${filtrados.length}`;
  calculateGrandTotal();
}

function saveToLocalStorage() {
  localStorage.setItem("itens", JSON.stringify(itens));
}

function copyList() {
  let supermercado = document.getElementById("supermercadoGlobal").value;
  let texto = `Supermercado: ${supermercado || "Não informado"}\n`;

  let total = 0;
  itens.forEach(item => {
    let subtotal = item.quantidade * item.valor;
    total += subtotal;
    texto += `${item.nome} (${item.quantidade}x) — ${formatarMoeda(subtotal)}\n`;
  });

  texto += `Total: ${formatarMoeda(total)}`;

  navigator.clipboard.writeText(texto);
  showToast("Lista copiada!");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

function loadCategorias() {
  const select = document.getElementById("categoria");
  const filtro = document.getElementById("filtroCategoria");

  select.innerHTML = "";
  filtro.innerHTML = `<option value="todas">Todas Categorias</option>`;

  categorias.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
    filtro.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

document.getElementById("addBtn").addEventListener("click", addItem);
document.getElementById("copiarBtn").addEventListener("click", copyList);
document.getElementById("filtroCategoria").addEventListener("change", render);

window.addEventListener("online", () => document.getElementById("offlineBadge").classList.add("hidden"));
window.addEventListener("offline", () => document.getElementById("offlineBadge").classList.remove("hidden"));

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

loadCategorias();
render();
