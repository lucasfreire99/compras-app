// ========== VARIÁVEIS GLOBAIS ==========
let items = [];
let categorias = [
    'ALIMENTOS', 
    'BEBIDAS', 
    'LIMPEZA', 
    'HIGIENE', 
    'HORTIFRUTI', 
    'OUTROS',
    'MERCEARIA E DESPENSA',
    'ACOUGUE E GELADEIRA',
    'BISCOITOS E LANCHES',
    'LIMPEZA E LAVANDERIA',
    'HIGIENE E MUNDO BABY'
];
let supermercados = ['COGEAL', 'SALES'];
let deferredPrompt;
let editandoId = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderCategorias();
    renderItems();
    setupEventListeners();
    checkOnlineStatus();
    registerServiceWorker();
    setupInstallPrompt();
});

// ========== CONFIGURAÇÃO DE EVENTOS ==========
function setupEventListeners() {
    // Filtros
    document.getElementById('supermercadoFilter').addEventListener('change', renderItems);
    document.getElementById('categoriaFilter').addEventListener('change', renderItems);
    
    // Botões principais
    document.getElementById('addItemBtn').addEventListener('click', () => openModal());
    document.getElementById('novaCategoriaBtn').addEventListener('click', criarNovaCategoria);
    
    // Botões de cópia
    document.getElementById('copyWhatsapp').addEventListener('click', (e) => {
        e.preventDefault();
        copyList('whatsapp');
    });
    document.getElementById('copyNotepad').addEventListener('click', (e) => {
        e.preventDefault();
        copyList('notepad');
    });
    
    // Botões de importação/exportação
    document.getElementById('downloadModelo').addEventListener('click', (e) => {
        e.preventDefault();
        downloadModelo();
    });
    
    document.getElementById('importCSV').addEventListener('click', (e) => {
        e.preventDefault();
        importarCSV();
    });
    
    document.getElementById('exportCSV').addEventListener('click', (e) => {
        e.preventDefault();
        exportarListaCSV();
    });
    
    // Botões de alteração em lote
    // Nota: Esses botões são adicionados dinamicamente no HTML
    // Os event listeners são configurados quando os botões são clicados
    
    // Input file
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            processarImportacao(file);
        }
        this.value = '';
    });
    
    // Form
    document.getElementById('itemForm').addEventListener('submit', handleFormSubmit);
    
    // Máscara monetária
    document.getElementById('itemValor').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value) {
            value = (value / 100).toFixed(2) + '';
            value = value.replace('.', ',');
            value = value.replace(/(\d)(\d{3})(\d{3},)/, '$1.$2.$3');
            e.target.value = value;
        } else {
            e.target.value = '';
        }
        calcularPreviewTotal();
    });
    
    // Cálculo preview
    document.getElementById('itemQuantidade').addEventListener('input', calcularPreviewTotal);
    
    // Online/Offline
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
}

// ========== FUNÇÕES DE ITENS ==========
function addItem(item) {
    items.push({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        valorTotal: calcularTotalItem(item.quantidade, item.valor || 0)
    });
    saveToLocalStorage();
    renderItems();
    showToast('ITEM ADICIONADO COM SUCESSO!');
}

function editItem(id, novosDados) {
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
        items[index] = {
            ...items[index],
            ...novosDados,
            valorTotal: calcularTotalItem(novosDados.quantidade, novosDados.valor || 0)
        };
        saveToLocalStorage();
        renderItems();
        showToast('ITEM ATUALIZADO!');
    }
}

function deleteItem(id) {
    if (confirm('TEM CERTEZA QUE DESEJA EXCLUIR ESTE ITEM?')) {
        items = items.filter(item => item.id !== id);
        saveToLocalStorage();
        renderItems();
        showToast('ITEM EXCLUÍDO!');
    }
}

function calcularTotalItem(quantidade, valor) {
    const qty = parseFloat(quantidade) || 0;
    const val = parseFloat(valor.toString().replace(',', '.')) || 0;
    return qty * val;
}

function calcularPreviewTotal() {
    const qty = document.getElementById('itemQuantidade').value;
    const val = document.getElementById('itemValor').value.replace(',', '.');
    const total = (parseFloat(qty) || 0) * (parseFloat(val) || 0);
    document.getElementById('itemTotalPreview').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function calculateGrandTotal() {
    return items.reduce((acc, item) => acc + (parseFloat(item.valorTotal) || 0), 0);
}

// ========== RENDERIZAÇÃO ==========
function renderItems() {
    const itemsList = document.getElementById('itemsList');
    const supermercadoFilter = document.getElementById('supermercadoFilter').value;
    const categoriaFilter = document.getElementById('categoriaFilter').value;
    
    let filteredItems = [...items];
    
    if (supermercadoFilter) {
        filteredItems = filteredItems.filter(item => item.supermercado === supermercadoFilter);
    }
    
    if (categoriaFilter) {
        filteredItems = filteredItems.filter(item => item.categoria === categoriaFilter);
    }
    
    // Ordenar por categoria
    filteredItems.sort((a, b) => a.categoria.localeCompare(b.categoria));
    
    if (filteredItems.length === 0) {
        itemsList.innerHTML = '<div class="empty-state">NENHUM ITEM ENCONTRADO</div>';
    } else {
        itemsList.innerHTML = filteredItems.map(item => {
            // Verificar se tem preço (se for 0, mostrar como pendente)
            const temPreco = item.valor && item.valor > 0;
            
            return `
            <div class="item-card ${!temPreco ? 'item-sem-preco' : ''}">
                <div class="item-header">
                    <span class="item-nome">${item.nome}</span>
                    <span class="item-categoria">${item.categoria}</span>
                </div>
                <div class="item-detalhes">
                    <span>QTD: <strong>${item.quantidade}</strong></span>
                    <span>UN: <strong>${temPreco ? 'R$ ' + formatarMoeda(item.valor) : '⏳ PENDENTE'}</strong></span>
                    <span>TOTAL: <strong>${temPreco ? 'R$ ' + formatarMoeda(item.valorTotal) : '⏳ PENDENTE'}</strong></span>
                    ${item.supermercado ? `<span class="item-supermercado">${item.supermercado}</span>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="openModal('${item.id}')">EDITAR</button>
                    <button class="btn-delete" onclick="deleteItem('${item.id}')">EXCLUIR</button>
                </div>
            </div>
        `}).join('');
    }
    
    // Atualizar contador e total
    document.getElementById('itemCount').textContent = `${filteredItems.length} ITENS`;
    
    const totalGeral = calculateGrandTotal();
    const totalFormatado = totalGeral > 0 ? `R$ ${formatarMoeda(totalGeral)}` : 'R$ 0,00';
    document.getElementById('grandTotal').textContent = totalFormatado;
    
    // Atualizar badge de itens pendentes
    atualizarBadgePendentes();
}

function atualizarBadgePendentes() {
    const itensPendentes = items.filter(item => !item.valor || item.valor === 0).length;
    const badge = document.getElementById('pendingBadge');
    const banner = document.getElementById('priceUpdateBanner');
    
    if (itensPendentes > 0) {
        if (badge) {
            badge.style.display = 'flex';
            badge.innerHTML = `<span class="pending-count">${itensPendentes}</span> ITENS SEM PREÇO`;
        }
        if (banner) {
            banner.style.display = 'flex';
        }
    } else {
        if (badge) badge.style.display = 'none';
        if (banner) banner.style.display = 'none';
    }
}

function renderCategorias() {
    const selectCategoria = document.getElementById('itemCategoria');
    const filterCategoria = document.getElementById('categoriaFilter');
    
    // Ordenar categorias alfabeticamente
    const categoriasOrdenadas = [...categorias].sort((a, b) => a.localeCompare(b));
    
    const options = categoriasOrdenadas.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    selectCategoria.innerHTML = '<option value="">SELECIONE</option>' + options;
    filterCategoria.innerHTML = '<option value="">TODAS CATEGORIAS</option>' + options;
}

// ========== MODAL ==========
function openModal(id = null) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('itemForm');
    
    if (id) {
        // Modo edição
        const item = items.find(i => i.id === id);
        if (item) {
            editandoId = id;
            document.getElementById('modalTitle').textContent = 'EDITAR ITEM';
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemNome').value = item.nome;
            document.getElementById('itemQuantidade').value = item.quantidade;
            document.getElementById('itemValor').value = item.valor ? formatarMoeda(item.valor).replace('R$ ', '') : '';
            document.getElementById('itemSupermercado').value = item.supermercado || '';
            document.getElementById('itemCategoria').value = item.categoria;
            calcularPreviewTotal();
        }
    } else {
        // Modo adição
        editandoId = null;
        document.getElementById('modalTitle').textContent = 'ADICIONAR ITEM';
        form.reset();
        document.getElementById('itemTotalPreview').textContent = 'R$ 0,00';
    }
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const nome = document.getElementById('itemNome').value.toUpperCase().trim();
    const quantidade = document.getElementById('itemQuantidade').value;
    const valor = document.getElementById('itemValor').value.replace(',', '.');
    const supermercado = document.getElementById('itemSupermercado').value;
    const categoria = document.getElementById('itemCategoria').value;
    
    if (!nome || !quantidade || !categoria) {
        showToast('PREENCHA NOME, QUANTIDADE E CATEGORIA!');
        return;
    }
    
    const itemData = {
        nome,
        quantidade: parseFloat(quantidade),
        valor: valor ? parseFloat(valor) : 0,
        supermercado,
        categoria
    };
    
    if (editandoId) {
        editItem(editandoId, itemData);
    } else {
        addItem(itemData);
    }
    
    closeModal();
}

// ========== CATEGORIAS ==========
function criarNovaCategoria() {
    const novaCategoria = prompt('DIGITE O NOME DA NOVA CATEGORIA:').toUpperCase().trim();
    if (novaCategoria && !categorias.includes(novaCategoria)) {
        categorias.push(novaCategoria);
        renderCategorias();
        saveToLocalStorage();
        showToast('CATEGORIA CRIADA!');
    } else if (categorias.includes(novaCategoria)) {
        showToast('CATEGORIA JÁ EXISTE!');
    }
}

// ========== COPY FUNCTIONS ==========
function copyList(tipo) {
    if (items.length === 0) {
        showToast('LISTA VAZIA!');
        return;
    }
    
    const supermercadoFilter = document.getElementById('supermercadoFilter').value;
    let texto = '';
    
    if (tipo === 'whatsapp') {
        texto = gerarTextoWhatsapp(supermercadoFilter);
    } else {
        texto = gerarTextoNotepad(supermercadoFilter);
    }
    
    navigator.clipboard.writeText(texto).then(() => {
        showToast('LISTA COPIADA!');
    }).catch(() => {
        // Fallback para navegadores sem suporte a clipboard
        alert('Copie o texto manualmente:\n\n' + texto);
    });
}

function gerarTextoWhatsapp(filter) {
    let itemsFiltrados = filter ? items.filter(i => i.supermercado === filter) : items;
    itemsFiltrados.sort((a, b) => a.categoria.localeCompare(b.categoria));
    
    let texto = `*LISTA DE COMPRAS*`;
    if (filter) texto += ` - ${filter}`;
    texto += `\n\n`;
    
    let categoriaAtual = '';
    itemsFiltrados.forEach(item => {
        if (item.categoria !== categoriaAtual) {
            categoriaAtual = item.categoria;
            texto += `*${categoriaAtual}*\n`;
        }
        
        const temPreco = item.valor && item.valor > 0;
        if (temPreco) {
            texto += `• ${item.nome} - ${item.quantidade} x R$ ${formatarMoeda(item.valor)} = R$ ${formatarMoeda(item.valorTotal)}\n`;
        } else {
            texto += `• ${item.nome} - ${item.quantidade} un (preço pendente)\n`;
        }
    });
    
    const total = calculateGrandTotal();
    texto += `\n*TOTAL GERAL: ${total > 0 ? 'R$ ' + formatarMoeda(total) : 'PENDENTE'}*`;
    return texto;
}

function gerarTextoNotepad(filter) {
    let itemsFiltrados = filter ? items.filter(i => i.supermercado === filter) : items;
    itemsFiltrados.sort((a, b) => a.categoria.localeCompare(b.categoria));
    
    let texto = `LISTA DE COMPRAS`;
    if (filter) texto += ` - ${filter}`;
    texto += `\n==================\n\n`;
    
    let categoriaAtual = '';
    itemsFiltrados.forEach(item => {
        if (item.categoria !== categoriaAtual) {
            categoriaAtual = item.categoria;
            texto += `${categoriaAtual}\n`;
        }
        
        const temPreco = item.valor && item.valor > 0;
        if (temPreco) {
            texto += `${item.nome}\t${item.quantidade}\tR$ ${formatarMoeda(item.valor)}\tR$ ${formatarMoeda(item.valorTotal)}\n`;
        } else {
            texto += `${item.nome}\t${item.quantidade}\tPREÇO PENDENTE\n`;
        }
    });
    
    const total = calculateGrandTotal();
    texto += `\nTOTAL GERAL: ${total > 0 ? 'R$ ' + formatarMoeda(total) : 'PENDENTE'}`;
    return texto;
}

// ========== FUNÇÕES DE IMPORTAÇÃO/EXPORTAÇÃO ==========

/**
 * Download do modelo CSV para importação
 */
function downloadModelo() {
    // Cabeçalho do CSV - Formato mínimo (3 colunas)
    const headers = ['NOME', 'QUANTIDADE', 'CATEGORIA'];
    
    // Dados de exemplo
    const exemplos = [
        ['ARROZ', '8', 'MERCEARIA E DESPENSA'],
        ['FEIJAO', '1', 'MERCEARIA E DESPENSA'],
        ['CAFE', '3', 'MERCEARIA E DESPENSA']
    ];
    
    // Montar CSV
    let csvContent = headers.join(',') + '\n';
    csvContent += exemplos.map(row => row.join(',')).join('\n');
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_lista_compras.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 MODELO BAIXADO COM SUCESSO!');
}

/**
 * Abrir seletor de arquivo para importação
 */
function importarCSV() {
    document.getElementById('fileInput').click();
}

/**
 * Processar arquivo CSV importado (VERSÃO SIMPLIFICADA E FUNCIONAL)
 */
function processarImportacao(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const conteudo = e.target.result;
            
            // Dividir por linhas
            const linhas = conteudo.split(/\r?\n/);
            
            if (linhas.length < 2) {
                showToast('❌ ARQUIVO VAZIO!');
                return;
            }
            
            // Pular cabeçalho
            let importados = 0;
            let erros = 0;
            
            for (let i = 1; i < linhas.length; i++) {
                const linha = linhas[i].trim();
                if (linha === '') continue;
                
                try {
                    // Dividir por vírgula (CSV simples)
                    const colunas = linha.split(',');
                    
                    if (colunas.length < 3) {
                        erros++;
                        continue;
                    }
                    
                    // Extrair campos (formato mínimo: NOME,QUANTIDADE,CATEGORIA)
                    const nome = colunas[0].trim().toUpperCase().replace(/^["']|["']$/g, '');
                    const quantidade = colunas[1].trim().replace(/^["']|["']$/g, '');
                    const categoria = colunas[2].trim().toUpperCase().replace(/^["']|["']$/g, '');
                    
                    if (!nome || !quantidade || !categoria) {
                        erros++;
                        continue;
                    }
                    
                    // Converter quantidade
                    const qty = parseFloat(quantidade.replace(',', '.'));
                    if (isNaN(qty) || qty <= 0) {
                        erros++;
                        continue;
                    }
                    
                    // Verificar se tem supermercado (opcional)
                    let supermercado = '';
                    if (colunas.length >= 4) {
                        const sup = colunas[3].trim().toUpperCase().replace(/^["']|["']$/g, '');
                        if (sup === 'COGEAL' || sup === 'SALES') {
                            supermercado = sup;
                        }
                    }
                    
                    // Verificar se tem valor (opcional)
                    let valor = 0;
                    if (colunas.length >= 5) {
                        const val = colunas[4].trim().replace(/^["']|["']$/g, '').replace(',', '.');
                        if (val && !isNaN(parseFloat(val))) {
                            valor = parseFloat(val);
                        }
                    }
                    
                    // Adicionar categoria se não existir
                    if (!categorias.includes(categoria)) {
                        categorias.push(categoria);
                    }
                    
                    // Criar item
                    const novoItem = {
                        id: Date.now() + Math.random().toString(36).substr(2, 9) + i,
                        nome: nome,
                        quantidade: qty,
                        valor: valor,
                        supermercado: supermercado,
                        categoria: categoria,
                        valorTotal: qty * valor
                    };
                    
                    items.push(novoItem);
                    importados++;
                    
                } catch (err) {
                    console.error('Erro na linha', i, err);
                    erros++;
                }
            }
            
            // Atualizar interface
            renderCategorias();
            saveToLocalStorage();
            renderItems();
            
            // Mostrar resultado
            if (importados > 0) {
                showToast(`✅ ${importados} ITENS IMPORTADOS! ${erros > 0 ? `(${erros} erros)` : ''}`);
            } else {
                showToast('❌ NENHUM ITEM IMPORTADO!');
            }
            
        } catch (err) {
            console.error('Erro ao processar arquivo:', err);
            showToast('❌ ERRO AO PROCESSAR ARQUIVO!');
        }
    };
    
    reader.readAsText(file);
}

/**
 * Exportar lista atual como CSV
 */
function exportarListaCSV() {
    if (items.length === 0) {
        showToast('LISTA VAZIA!');
        return;
    }
    
    // Formato completo
    const headers = ['NOME', 'QUANTIDADE', 'VALOR', 'SUPERMERCADO', 'CATEGORIA'];
    const dados = items.map(item => [
        item.nome,
        item.quantidade,
        item.valor > 0 ? item.valor.toFixed(2).replace('.', ',') : '',
        item.supermercado || '',
        item.categoria
    ]);
    
    // Montar CSV
    const csvContent = [
        headers.join(','),
        ...dados.map(row => row.join(','))
    ].join('\n');
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista_compras_${new Date().toISOString().slice(0,10)}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📤 LISTA EXPORTADA!');
}

// ========== FUNÇÕES DE ALTERAÇÃO EM LOTE ==========

/**
 * Abrir modal para alteração em lote do supermercado
 */
function abrirAlteracaoLoteSupermercado() {
    if (items.length === 0) {
        showToast('LISTA VAZIA!');
        return;
    }

    // Criar modal dinamicamente
    const modalHTML = `
        <div id="loteSupermercadoModal" class="modal" style="display: flex;">
            <div class="modal-content">
                <h2>ALTERAR SUPERMERCADO EM LOTE</h2>
                <div class="form-group">
                    <label>FILTRAR POR CATEGORIA (OPCIONAL)</label>
                    <select id="loteCategoriaFiltro" class="filter-select">
                        <option value="">TODAS AS CATEGORIAS</option>
                        ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>FILTRAR POR SUPERMERCADO ATUAL (OPCIONAL)</label>
                    <select id="loteSupermercadoOrigem" class="filter-select">
                        <option value="">TODOS OS SUPERMERCADOS</option>
                        <option value="COGEAL">COGEAL</option>
                        <option value="SALES">SALES</option>
                        <option value="SEM_SUPERMERCADO">SEM SUPERMERCADO</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>NOVO SUPERMERCADO *</label>
                    <select id="loteNovoSupermercado" class="filter-select" required>
                        <option value="">SELECIONE</option>
                        <option value="COGEAL">COGEAL</option>
                        <option value="SALES">SALES</option>
                        <option value="">REMOVER SUPERMERCADO</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>ITENS A SEREM ALTERADOS: <span id="loteContadorItens">${items.length}</span></label>
                    <div class="progress-bar">
                        <div id="loteProgresso" class="progress-fill" style="width: 100%;"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="fecharModalLote()">CANCELAR</button>
                    <button type="button" class="btn-primary" onclick="confirmarAlteracaoLote()">ALTERAR</button>
                </div>
            </div>
        </div>
    `;

    // Remover modal existente se houver
    const modalExistente = document.getElementById('loteSupermercadoModal');
    if (modalExistente) {
        modalExistente.remove();
    }

    // Adicionar modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adicionar event listeners para filtros
    document.getElementById('loteCategoriaFiltro').addEventListener('change', atualizarContadorLote);
    document.getElementById('loteSupermercadoOrigem').addEventListener('change', atualizarContadorLote);
}

/**
 * Atualizar contador de itens baseado nos filtros
 */
function atualizarContadorLote() {
    const categoriaFiltro = document.getElementById('loteCategoriaFiltro').value;
    const supermercadoOrigem = document.getElementById('loteSupermercadoOrigem').value;
    
    let itensFiltrados = [...items];
    
    if (categoriaFiltro) {
        itensFiltrados = itensFiltrados.filter(item => item.categoria === categoriaFiltro);
    }
    
    if (supermercadoOrigem === 'SEM_SUPERMERCADO') {
        itensFiltrados = itensFiltrados.filter(item => !item.supermercado || item.supermercado === '');
    } else if (supermercadoOrigem) {
        itensFiltrados = itensFiltrados.filter(item => item.supermercado === supermercadoOrigem);
    }
    
    const contador = document.getElementById('loteContadorItens');
    const progresso = document.getElementById('loteProgresso');
    
    contador.textContent = itensFiltrados.length;
    
    const percentual = (itensFiltrados.length / items.length) * 100;
    progresso.style.width = `${percentual}%`;
    
    if (itensFiltrados.length === 0) {
        progresso.style.backgroundColor = '#cf6679';
    } else {
        progresso.style.backgroundColor = '#bb86fc';
    }
}

/**
 * Confirmar e executar alteração em lote do supermercado
 */
function confirmarAlteracaoLote() {
    const novoSupermercado = document.getElementById('loteNovoSupermercado').value;
    const categoriaFiltro = document.getElementById('loteCategoriaFiltro').value;
    const supermercadoOrigem = document.getElementById('loteSupermercadoOrigem').value;
    
    if (!novoSupermercado && novoSupermercado !== '') {
        showToast('SELECIONE O NOVO SUPERMERCADO!');
        return;
    }
    
    // Filtrar itens para alteração
    let itensParaAlterar = [...items];
    
    if (categoriaFiltro) {
        itensParaAlterar = itensParaAlterar.filter(item => item.categoria === categoriaFiltro);
    }
    
    if (supermercadoOrigem === 'SEM_SUPERMERCADO') {
        itensParaAlterar = itensParaAlterar.filter(item => !item.supermercado || item.supermercado === '');
    } else if (supermercadoOrigem) {
        itensParaAlterar = itensParaAlterar.filter(item => item.supermercado === supermercadoOrigem);
    }
    
    if (itensParaAlterar.length === 0) {
        showToast('NENHUM ITEM PARA ALTERAR!');
        fecharModalLote();
        return;
    }
    
    // Confirmar alteração
    const mensagem = `CONFIRMA ALTERAR ${itensParaAlterar.length} ITENS PARA O SUPERMERCADO ${novoSupermercado || 'VAZIO'}?`;
    
    if (!confirm(mensagem)) {
        return;
    }
    
    // Executar alteração
    let alterados = 0;
    
    itensParaAlterar.forEach(item => {
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            items[index].supermercado = novoSupermercado || '';
            alterados++;
        }
    });
    
    // Salvar e atualizar
    saveToLocalStorage();
    renderItems();
    fecharModalLote();
    
    showToast(`✅ ${alterados} ITENS ALTERADOS COM SUCESSO!`);
}

/**
 * Fechar modal de lote
 */
function fecharModalLote() {
    const modal = document.getElementById('loteSupermercadoModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Abrir modal para alteração em lote da categoria
 */
function abrirAlteracaoLoteCategoria() {
    if (items.length === 0) {
        showToast('LISTA VAZIA!');
        return;
    }

    // Criar modal dinamicamente
    const modalHTML = `
        <div id="loteCategoriaModal" class="modal" style="display: flex;">
            <div class="modal-content">
                <h2>ALTERAR CATEGORIA EM LOTE</h2>
                <div class="form-group">
                    <label>FILTRAR POR CATEGORIA ATUAL *</label>
                    <select id="loteCategoriaOrigem" class="filter-select" required>
                        <option value="">SELECIONE</option>
                        ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>FILTRAR POR SUPERMERCADO (OPCIONAL)</label>
                    <select id="loteSupermercadoFiltro" class="filter-select">
                        <option value="">TODOS OS SUPERMERCADOS</option>
                        <option value="COGEAL">COGEAL</option>
                        <option value="SALES">SALES</option>
                        <option value="SEM_SUPERMERCADO">SEM SUPERMERCADO</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>NOVA CATEGORIA *</label>
                    <select id="loteNovaCategoria" class="filter-select" required>
                        <option value="">SELECIONE</option>
                        ${categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>ITENS A SEREM ALTERADOS: <span id="loteContadorItensCat">0</span></label>
                    <div class="progress-bar">
                        <div id="loteProgressoCat" class="progress-fill" style="width: 0%;"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="fecharModalLoteCategoria()">CANCELAR</button>
                    <button type="button" class="btn-primary" onclick="confirmarAlteracaoLoteCategoria()">ALTERAR</button>
                </div>
            </div>
        </div>
    `;

    // Remover modal existente se houver
    const modalExistente = document.getElementById('loteCategoriaModal');
    if (modalExistente) {
        modalExistente.remove();
    }

    // Adicionar modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adicionar event listeners para filtros
    document.getElementById('loteCategoriaOrigem').addEventListener('change', atualizarContadorLoteCategoria);
    document.getElementById('loteSupermercadoFiltro').addEventListener('change', atualizarContadorLoteCategoria);
}

/**
 * Atualizar contador de itens para alteração de categoria
 */
function atualizarContadorLoteCategoria() {
    const categoriaOrigem = document.getElementById('loteCategoriaOrigem').value;
    const supermercadoFiltro = document.getElementById('loteSupermercadoFiltro').value;
    
    if (!categoriaOrigem) {
        document.getElementById('loteContadorItensCat').textContent = '0';
        document.getElementById('loteProgressoCat').style.width = '0%';
        return;
    }
    
    let itensFiltrados = items.filter(item => item.categoria === categoriaOrigem);
    
    if (supermercadoFiltro === 'SEM_SUPERMERCADO') {
        itensFiltrados = itensFiltrados.filter(item => !item.supermercado || item.supermercado === '');
    } else if (supermercadoFiltro) {
        itensFiltrados = itensFiltrados.filter(item => item.supermercado === supermercadoFiltro);
    }
    
    const contador = document.getElementById('loteContadorItensCat');
    const progresso = document.getElementById('loteProgressoCat');
    
    contador.textContent = itensFiltrados.length;
    
    const percentual = (itensFiltrados.length / items.length) * 100;
    progresso.style.width = `${percentual}%`;
}

/**
 * Confirmar e executar alteração em lote de categoria
 */
function confirmarAlteracaoLoteCategoria() {
    const categoriaOrigem = document.getElementById('loteCategoriaOrigem').value;
    const novaCategoria = document.getElementById('loteNovaCategoria').value;
    const supermercadoFiltro = document.getElementById('loteSupermercadoFiltro').value;
    
    if (!categoriaOrigem || !novaCategoria) {
        showToast('SELECIONE CATEGORIA DE ORIGEM E NOVA CATEGORIA!');
        return;
    }
    
    if (categoriaOrigem === novaCategoria) {
        showToast('A CATEGORIA DE ORIGEM É IGUAL À NOVA CATEGORIA!');
        return;
    }
    
    // Filtrar itens para alteração
    let itensParaAlterar = items.filter(item => item.categoria === categoriaOrigem);
    
    if (supermercadoFiltro === 'SEM_SUPERMERCADO') {
        itensParaAlterar = itensParaAlterar.filter(item => !item.supermercado || item.supermercado === '');
    } else if (supermercadoFiltro) {
        itensParaAlterar = itensParaAlterar.filter(item => item.supermercado === supermercadoFiltro);
    }
    
    if (itensParaAlterar.length === 0) {
        showToast('NENHUM ITEM PARA ALTERAR!');
        fecharModalLoteCategoria();
        return;
    }
    
    // Confirmar alteração
    const mensagem = `CONFIRMA ALTERAR ${itensParaAlterar.length} ITENS DA CATEGORIA "${categoriaOrigem}" PARA "${novaCategoria}"?`;
    
    if (!confirm(mensagem)) {
        return;
    }
    
    // Executar alteração
    let alterados = 0;
    
    itensParaAlterar.forEach(item => {
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            items[index].categoria = novaCategoria;
            alterados++;
        }
    });
    
    // Salvar e atualizar
    saveToLocalStorage();
    renderCategorias();
    renderItems();
    fecharModalLoteCategoria();
    
    showToast(`✅ ${alterados} ITENS ALTERADOS COM SUCESSO!`);
}

/**
 * Fechar modal de lote de categoria
 */
function fecharModalLoteCategoria() {
    const modal = document.getElementById('loteCategoriaModal');
    if (modal) {
        modal.remove();
    }
}

// ========== PERSISTÊNCIA ==========
function saveToLocalStorage() {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
    localStorage.setItem('shoppingCategorias', JSON.stringify(categorias));
}

function loadFromLocalStorage() {
    const savedItems = localStorage.getItem('shoppingItems');
    const savedCategorias = localStorage.getItem('shoppingCategorias');
    
    if (savedItems) {
        items = JSON.parse(savedItems);
    }
    
    if (savedCategorias) {
        categorias = JSON.parse(savedCategorias);
    }
}

// ========== UTILITÁRIOS ==========
function formatarMoeda(valor) {
    return parseFloat(valor || 0).toFixed(2).replace('.', ',');
}

function showToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function checkOnlineStatus() {
    const status = document.getElementById('onlineStatus');
    if (navigator.onLine) {
        status.textContent = '● ONLINE';
        status.className = 'online-status online';
    } else {
        status.textContent = '● OFFLINE';
        status.className = 'online-status offline';
    }
}

// ========== PWA ==========
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registrado!', reg))
            .catch(err => console.log('Erro ao registrar Service Worker:', err));
    }
}

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('installButton').style.display = 'block';
    });
    
    document.getElementById('installButton').addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            document.getElementById('installButton').style.display = 'none';
        }
        
        deferredPrompt = null;
    });
    
    window.addEventListener('appinstalled', () => {
        document.getElementById('installButton').style.display = 'none';
        showToast('APP INSTALADO COM SUCESSO!');
    });
}

/**
 * Atualizar preços em lote (útil após importação)
 */
function atualizarPrecosEmLote() {
    const itensSemPreco = items.filter(item => !item.valor || item.valor === 0);
    
    if (itensSemPreco.length === 0) {
        showToast('TODOS OS ITENS JÁ TÊM PREÇO!');
        return;
    }
    
    if (confirm(`${itensSemPreco.length} ITENS SEM PREÇO. DESEJA EDITAR UM POR UM?`)) {
        // Abrir o primeiro item sem preço para edição
        const primeiroItem = itensSemPreco[0];
        if (primeiroItem) {
            openModal(primeiroItem.id);
        }
    }
}

// Tornar funções globais para acesso pelo HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.deleteItem = deleteItem;
window.atualizarPrecosEmLote = atualizarPrecosEmLote;
window.abrirAlteracaoLoteSupermercado = abrirAlteracaoLoteSupermercado;
window.abrirAlteracaoLoteCategoria = abrirAlteracaoLoteCategoria;
window.fecharModalLote = fecharModalLote;
window.fecharModalLoteCategoria = fecharModalLoteCategoria;
