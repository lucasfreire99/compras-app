<div align="center">

# 🛒 Lista de Compras - PWA
  
![PWA](https://img.shields.io/badge/PWA-Instalável-ff9800?style=for-the-badge&logo=pwa)
![Offline First](https://img.shields.io/badge/Offline-First-4caf50?style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-f7df1e?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

</div>

<div align="center">
  
### 📊 Status do Projeto

![GitHub deployments](https://img.shields.io/github/deployments/lucasfreire99/compras-app/github-pages?style=flat-square&label=Deploy&color=bb86fc)
![GitHub issues](https://img.shields.io/github/issues/lucasfreire99/compras-app?style=flat-square&color=ff9800)
![GitHub pull requests](https://img.shields.io/github/issues-pr/lucasfreire99/compras-app?style=flat-square&color=03dac6)
![GitHub stars](https://img.shields.io/github/stars/lucasfreire99/compras-app?style=flat-square&color=ffd700)

### 📈 Métricas

![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/lucasfreire99/compras-app?style=flat-square&label=Código&color=4caf50)
![GitHub language count](https://img.shields.io/github/languages/count/lucasfreire99/compras-app?style=flat-square&label=Linguagens&color=bb86fc)
![GitHub top language](https://img.shields.io/github/languages/top/lucasfreire99/compras-app?style=flat-square&label=Top%20Linguagem&color=f7df1e)

</div>

---

Aplicação web progressiva (PWA) para gerenciamento de lista de compras, desenvolvida com foco em performance, usabilidade e experiência offline.

🔗 **Acesse o projeto online:**  
[https://lucasfreire99.github.io/compras-app/](https://lucasfreire99.github.io/compras-app/)

---

## 🚀 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Design system com tema dark
- **JavaScript Vanilla** - Lógica pura sem frameworks
- **Service Worker** - Cache e funcionamento offline
- **LocalStorage** - Persistência de dados
- **PWA** - Instalável como aplicativo nativo

---

## ✨ Funcionalidades Completas

### 📝 Gerenciamento de Itens
- ✅ **Adicionar itens** com nome, quantidade, valor, supermercado e categoria
- ✏️ **Editar itens** em modal dedicado
- 🗑 **Excluir itens** com confirmação
- 🔄 **Atualização em tempo real** dos cálculos

### 🧮 Cálculos Automáticos
- 💰 **Total por item** (quantidade × valor unitário)
- 📊 **Total geral** da compra em tempo real
- 💵 **Formatação monetária** em Real (R$)
- ⏳ **Itens pendentes** destacados em laranja (valor não preenchido)

### 🗂 Organização
- 🏷 **Categorias dinâmicas** (criar novas categorias)
- 🔎 **Filtro por categoria** e supermercado
- 📋 **Ordenação automática** por categoria
- 🏪 **Supermercados predefinidos**: COGEAL e SALES

### 📋 Formatação para Cópia
- 📱 **Versão WhatsApp** - Formatação com marcadores e negrito
- 📝 **Versão Bloco de Notas** - Formato tabulado
- 📊 **Exportação CSV** - Completa ou formato mínimo
- 📋 **Cópia direta** para área de transferência

### 📥 Importação Inteligente
- 📄 **Modelo para download** com exemplos
- 📂 **Importação CSV flexível** (3, 4 ou 5 colunas)
- 🔄 **Detecta automaticamente** o formato do arquivo
- 🏷 **Cria novas categorias** automaticamente
- ⏳ **Mantém preços pendentes** quando não informados

### 🏷 Alterações em Lote
- 🏪 **Alterar supermercado** em massa com filtros:
  - Por categoria específica
  - Por supermercado atual
  - Combinação de filtros
- 📂 **Alterar categoria** em massa:
  - Seleção de origem
  - Filtro por supermercado
  - Barra de progresso visual

### 💾 Persistência
- 💾 **Salvamento automático** no localStorage
- 🔄 **Carregamento automático** ao abrir
- 🌐 **Funciona completamente offline**

### 📱 PWA (Progressive Web App)
- 📲 **Instalável** como aplicativo nativo
- 🧩 **Manifest.json** com ícones 192x192 e 512x512
- 🔄 **Service Worker** com estratégia Cache First
- 🌍 **Detecção online/offline** com badge visual
- ⚡ **Atualização automática** de cache

### 🎨 Design System (Dark Theme)
- 🎯 **Fundo:** #121212
- 📦 **Cards:** #1E1E1E
- 💜 **Destaque roxo:** #bb86fc
- 💚 **Verde neon:** #03dac6
- 🟠 **Alerta laranja:** #ff9800 (itens pendentes)
- 🔴 **Exclusão:** #cf6679

### ⚡ Experiência do Usuário
- 🍞 **Toast notifications** para feedback
- 🎯 **Modal para edição** com animação
- 🖱 **Microinterações** (hovers, transitions)
- 📱 **Responsivo** para mobile e desktop
- 🔄 **Loading states** para operações
- 🏷 **Badge de itens pendentes** no rodapé
- 🚨 **Banner de atualização** de preços pendentes

---

## 📦 Estrutura do Projeto

```/
├── index.html # Estrutura principal
├── style.css # Estilos e design system
├── script.js # Lógica da aplicação
├── manifest.json # Configuração PWA
├── service-worker.js # Cache offline
├── icons/ # Ícones do app
│ ├── icon-192.png
│ └── icon-512.png
```
---

## 🚀 Como Instalar

### 🌐 No Navegador (Web)
1. Acesse o link do projeto: [https://lucasfreire99.github.io/compras-app/](https://lucasfreire99.github.io/compras-app/)
2. Utilize normalmente no navegador
3. Funciona offline após primeira visita

### 📲 Como PWA (Instalável)
1. Acesse o link no **Chrome/Edge** (Android/Desktop)
2. Clique no botão **"Instalar App"** que aparece no canto inferior esquerdo
3. Confirme a instalação
4. O aplicativo será adicionado à tela inicial

### 🍎 No iPhone (Safari)
1. Acesse o link no Safari
2. Toque no ícone **Compartilhar** (⬆️)
3. Role até **"Adicionar à Tela de Início"**
4. Confirme o nome e adicione

---

## 📋 Formatos de Importação CSV

### 🔹 Formato Completo (5 colunas)
```csv
NOME,QUANTIDADE,VALOR,SUPERMERCADO,CATEGORIA
ARROZ,5,25.90,COGEAL,ALIMENTOS
```

### 🔹 Formato Sem Preço (4 colunas)
```csv
NOME,QUANTIDADE,SUPERMERCADO,CATEGORIA
FEIJAO,3,SALES,ALIMENTOS
```

### 🔹 Formato Mínimo (3 colunas)
```csv
NOME,QUANTIDADE,CATEGORIA
LEITE,12,BEBIDAS
```

---

# 🎯 Funcionalidades em Destaque

## 🏷 Alteração em Lote
- **Supermercado:** Mova todos os itens de COGEAL para SALES de uma vez
- **Categoria:** Agrupe categorias similares em massa
- **Filtros:** Selecione apenas itens específicos para alterar

## ⏳ Itens Pendentes
- Destaque visual em laranja
- Contador no rodapé
- Banner de alerta
- Atualização rápida com botão dedicado

## 📊 Exportação Flexível
- Escolha entre formato completo ou mínimo
- Data no nome do arquivo
- UTF-8 com acentuação

---

# 🔧 Como Contribuir
1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

# 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

# ⭐ Créditos
Desenvolvido como solução completa para gerenciamento de listas de compras, com foco em:
- ✅ Performance
- ✅ Usabilidade
- ✅ Experiência offline
- ✅ Design moderno
- ✅ Funcionalidades avançadas

---

# 📦 Sobre o Projeto
- **Versão:** 2.0.0
- **Última atualização:** Março 2026
- **Status:** Em produção 🚀
