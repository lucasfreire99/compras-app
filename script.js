// ==================== Estado da Aplicação ====================
let items = [];
let editingId = null;
let deferredPrompt = null;
let categories = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Hortifruti', 'Outros'];
let confirmDialog = null;

// ==================== Inicialização ====================
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderItems();
    setupEventListeners();
    checkOnlineStatus();
    registerServiceWorker();
    setupInstallPrompt();
    initializeCategories();
});

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Formulário de item
    document.getElementById('item-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('clear-form').addEventListener('click', clearForm);
    
    // Filtros e ordenação
    document.getElementById('filter-category').addEventListener('change', renderItems);
    document.getElementById('sort-by').addEventListener('change', renderItems);
    
    // Supermercado
    document.getElementById('supermarket-select').addEventListener('change', saveSupermarket);
    
    // Botão copiar
    document.getElementById('copy-list-btn').addEventListener('click', copyList);
    
    // Nova categoria
    document.getElementById('new-category').addEventListener('input', handleNewCategory);
    
    // Online/Offline
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Preços com máscara
    document.getElementById('item-price').addEventListener('input', handlePriceInput);
}

// ==================== Gerenciamento de Itens ====================
function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value.trim();
    const quantity = parseFloat(document.getElementById('item-quantity').value);
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;
    const supermarket = document.getElementById('item-supermarket').value.trim();
    const newCategory = document.getElementById('new-category').value.trim();
    
    // Validação
    if (!name || !quantity || !price || !category) {
        showToast('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    if (quantity <= 0 || price <= 0) {
        showToast('Quantidade e preço devem ser maiores que zero!', 'error');
        return;
    }
    
    // Adicionar nova categoria se fornecida
    let finalCategory = category;
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        updateCategorySelects();
        finalCategory = newCategory;
    }
    
    const item = {
        id: editingId || Date.now().toString(),
        name,
        quantity,
        price,
        category: finalCategory,
        supermarket,
        total: quantity * price
    };
    
    if (editingId) {
        // Editar item existente
        const index = items.findIndex(i => i.id === editingId);
        items[index] = item;
        editingId = null;
        document.getElementById('item-form').querySelector('button[type="submit"]').textContent = '➕ Adicionar';
        showToast('Item atualizado com sucesso!');
    } else {
        // Adicionar novo item
        items.push(item);
        showToast('Item adicionado com sucesso!');
    }
    
    saveToLocalStorage();
    clearForm();
    renderItems();
}

function deleteItem(id) {
    showConfirmDialog('Tem certeza que deseja excluir este item?', () => {
        items = items.filter(item => item.id !== id);
        saveToLocalStorage();
        renderItems();
        showToast('Item excluído com sucesso!');
    });
}

function editItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    editingId = id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-price').value = item.price.toFixed(2);
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-supermarket').value = item.supermarket || '';
    
    document.getElementById('item-form').querySelector('button[type="submit"]').textContent = '✏️ Atualizar';
    
    // Scroll suave até o formulário
    document.querySelector('.add-item-section').scrollIntoView({ behavior: 'smooth' });
}

function clearForm() {
    document.getElementById('item-name').value = '';
    document.getElementById('item-quantity').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-category').value = '';
    document.getElementById('item-supermarket').value = '';
    document.getElementById('new-category').value = '';
    editingId = null;
    document.getElementById('item-form').querySelector('button[type="submit"]').textContent = '➕ Adicionar';
}

// ==================== Renderização ====================
function renderItems() {
    const filterCategory = document.getElementById('filter-category').value;
    const sortBy = document.getElementById('sort-by').value;
    
    let filteredItems = [...items];
    
    // Aplicar filtro
    if (filterCategory) {
        filteredItems = filteredItems.filter(item => item.category === filterCategory);
    }
    
    // Aplicar ordenação
    filteredItems.sort((a, b) => {
        if (sortBy === 'categoria') {
            return a.category.localeCompare(b.category);
        } else if (sortBy === 'nome') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'total') {
            return b.total - a.total;
        }
        return 0;
    });
    
    // Renderizar itens
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    
    if (filteredItems.length === 0) {
        itemsList.innerHTML = '<div class="empty-state">Nenhum item encontrado</div>';
        document.getElementById('item-counter').textContent = '0 itens';
        updateGrandTotal();
        return;
    }
    
    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-header">
                <span class="item-name">${escapeHtml(item.name)}</span>
                <span class="item-category">${escapeHtml(item.category)}</span>
            </div>
            <div class="item-details">
                <div class="item-detail">
                    <span class="label">Quantidade:</span>
                    <span class="value">${item.quantity}</span>
                </div>
                <div class="item-detail">
                    <span class="label">Preço unit.:</span>
                    <span class="value">${formatCurrency(item.price)}</span>
                </div>
                <div class="item-detail">
                    <span class="label">Total item:</span>
                    <span class="value">${formatCurrency(item.total)}</span>
                </div>
            </div>
            ${item.supermarket ? `<div class="item-supermarket">🏪 ${escapeHtml(item.supermarket)}</div>` : ''}
            <div class="item-actions">
                <button class="btn-edit" onclick="editItem('${item.id}')" title="Editar">✏️</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')" title="Excluir">🗑️</button>
            </div>
        `;
        itemsList.appendChild(itemCard);
    });
    
    // Atualizar contador e total
    document.getElementById('item-counter').textContent = `${items.length} ${items.length === 1 ? 'item' : 'itens'}`;
    updateGrandTotal();
}

function updateGrandTotal() {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('grand-total').textContent = formatCurrency(total);
}

// ==================== Formatação e Utilitários ====================
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handlePriceInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2);
    if (!isNaN(value) && value !== 'NaN') {
        e.target.value = value;
    }
}

// ==================== Categorias ====================
function initializeCategories() {
    updateCategorySelects();
}

function handleNewCategory(e) {
    const newCategory = e.target.value.trim();
    if (newCategory && !categories.includes(newCategory)) {
        // Sugerir nova categoria no select
        const categorySelect = document.getElementById('item-category');
        const option = document.createElement('option');
        option.value = newCategory;
        option.textContent = newCategory;
        option.selected = true;
        
        // Remover opções duplicadas
        Array.from(categorySelect.options).forEach(opt => {
            if (opt.value === newCategory) opt.remove();
        });
        
        categorySelect.appendChild(option);
    }
}

function updateCategorySelects() {
    const selects = [
        document.getElementById('item-category'),
        document.getElementById('filter-category')
    ];
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '';
        
        // Adicionar opção padrão
        if (select.id === 'item-category') {
            select.innerHTML += '<option value="">Selecione</option>';
        } else {
            select.innerHTML += '<option value="">Todas as categorias</option>';
        }
        
        // Adicionar categorias
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        
        // Restaurar valor selecionado
        if (currentValue && categories.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

// ==================== Persistência ====================
function saveToLocalStorage() {
    const data = {
        items,
        categories,
        supermarket: document.getElementById('supermarket-select').value
    };
    localStorage.setItem('shoppingList', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('shoppingList');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            items = data.items || [];
            categories = data.categories || ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Hortifruti', 'Outros'];
            
            if (data.supermarket) {
                document.getElementById('supermarket-select').value = data.supermarket;
            }
            
            updateCategorySelects();
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }
}

function saveSupermarket() {
    saveToLocalStorage();
}

// ==================== Copiar Lista ====================
async function copyList() {
    if (items.length === 0) {
        showToast('Lista vazia!', 'error');
        return;
    }
    
    const filterCategory = document.getElementById('filter-category').value;
    const supermarket = document.getElementById('supermarket-select').value;
    
    let listText = `🛒 LISTA DE COMPRAS\n`;
    if (supermarket) listText += `🏪 Supermercado: ${supermarket}\n`;
    listText += `📅 ${new Date().toLocaleDateString('pt-BR')}\n`;
    listText += `═══════════════════════\n\n`;
    
    const itemsToCopy = filterCategory ? 
        items.filter(item => item.category === filterCategory) : 
        items;
    
    // Agrupar por categoria
    const groupedByCategory = itemsToCopy.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});
    
    let totalGeral = 0;
    
    Object.keys(groupedByCategory).sort().forEach(category => {
        listText += `📌 ${category.toUpperCase()}\n`;
        
        groupedByCategory[category].forEach(item => {
            listText += `  • ${item.name}\n`;
            listText += `    Quantidade: ${item.quantity}\n`;
            listText += `    Preço unit.: ${formatCurrency(item.price)}\n`;
            listText += `    Total: ${formatCurrency(item.total)}\n`;
            if (item.supermarket) listText += `    (${item.supermarket})\n`;
            listText += `    ────────────────────\n`;
            
            totalGeral += item.total;
        });
        
        listText += `\n`;
    });
    
    listText += `═══════════════════════\n`;
    listText += `💰 TOTAL GERAL: ${formatCurrency(totalGeral)}\n`;
    listText += `📊 Total de itens: ${itemsToCopy.length}\n`;
    
    try {
        await navigator.clipboard.writeText(listText);
        showToast('Lista copiada com sucesso!');
    } catch (err) {
        showToast('Erro ao copiar lista!', 'error');
    }
}

// ==================== Notificações e Diálogos ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showConfirmDialog(message, onConfirm) {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="confirm-content">
            <p>${message}</p>
            <div class="confirm-buttons">
                <button class="confirm-btn yes">Sim</button>
                <button class="confirm-btn no">Não</button>
            </div>
        </div>
    `;
    
    dialog.querySelector('.yes').addEventListener('click', () => {
        document.body.removeChild(dialog);
        onConfirm();
    });
    
    dialog.querySelector('.no').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    document.body.appendChild(dialog);
}

// ==================== Online/Offline ====================
function checkOnlineStatus() {
    updateOnlineStatus();
}

function updateOnlineStatus() {
    const statusElement = document.getElementById('online-status');
    if (navigator.onLine) {
        statusElement.textContent = 'Online';
        statusElement.className = 'online-status online';
    } else {
        statusElement.textContent = 'Offline';
        statusElement.className = 'online-status offline';
        showToast('Você está offline. Os dados serão salvos localmente.', 'info');
    }
}

// ==================== PWA e Instalação ====================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar ServiceWorker:', error);
            });
    }
}

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
    
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallButton();
        showToast('App instalado com sucesso!');
    });
}

function showInstallButton() {
    const installButton = document.getElementById('install-button');
    installButton.classList.remove('hidden');
    
    installButton.addEventListener('click', handleInstallClick);
}

function hideInstallButton() {
    const installButton = document.getElementById('install-button');
    installButton.classList.add('hidden');
}

async function handleInstallClick() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
    }
    
    deferredPrompt = null;
    hideInstallButton();
}

// ==================== Export para uso nos botões ====================
window.editItem = editItem;
window.deleteItem = deleteItem;
