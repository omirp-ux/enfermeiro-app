# 🩺 Protocolos Clínicos para Enfermeiros

App PWA para consulta rápida de protocolos clínicos, desenvolvido para uso pessoal por enfermeiros.

## ✨ Funcionalidades

- 📋 Consulta rápida de protocolos com busca e filtro por categoria
- ✏️ Adicionar, editar e excluir situações
- 📝 Editor com suporte a Markdown e pré-visualização em tempo real
- 🔄 Exportar/Importar JSON para sincronizar com o GitHub
- 📱 Instalável no celular como app (PWA)
- 🌐 Funciona offline após a primeira visita

---

## 🚀 Publicar no GitHub Pages (fazer apenas uma vez)

### 1. Criar o repositório
- GitHub → **"New repository"**
- Nome: `enfermeiro-app`
- Marcar **Public**
- **Não** marcar nenhuma opção de inicializar
- Clicar em **"Create repository"**

### 2. Fazer upload dos 4 arquivos
Pelo GitHub Desktop ou arrastando no navegador do computador:
```
index.html
manifest.json
sw.js
icon.png
```

### 3. Ativar o GitHub Pages
- Repositório → **Settings → Pages**
- Source: **"Deploy from a branch"**
- Branch: **main** / pasta: **/ (root)**
- Salvar

Aguarde ~1 minuto e acesse:
```
https://SEU_USUARIO.github.io/enfermeiro-app/
```

---

## 📱 Instalar no celular (PWA)

### Android (Chrome)
1. Abra o link do app no Chrome
2. Banner "Adicionar à tela inicial" → toque nele
3. Ou: menu ⋮ → **"Adicionar à tela inicial"**

### iPhone (Safari)
1. Abra o link no Safari
2. Toque no ícone de compartilhar (quadrado com seta para cima)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Toque em **"Adicionar"**

---

## 🔄 Sincronizar atualizações com o GitHub

### Celular → GitHub (após editar protocolos no app)

1. No app → tela inicial → **"Exportar / Importar (GitHub Sync)"**
2. Toque em **"Baixar protocolos.json"**
3. No GitHub, abra o arquivo `protocolos.json`
4. Toque no lápis → 3 pontinhos → **"Upload file"**
5. Selecione o arquivo baixado → **"Commit changes"**

✅ Backup salvo na nuvem. O GitHub Pages atualiza em ~1 minuto.

### GitHub → Celular novo (trocar de dispositivo)

1. Baixe o `protocolos.json` direto do GitHub
2. No app → **"Exportar / Importar"** → **"Carregar protocolos.json"**
3. Todos os protocolos aparecem no novo celular ✅

---

## 📝 Formato Markdown para protocolos

| Sintaxe | Resultado |
|---------|-----------|
| `## Título` | Seção principal |
| `### Subtítulo` | Subseção |
| `- item` | Item de lista |
| `**texto**` | **Negrito** |
| `> Atenção` | Bloco de alerta amarelo |

---

## 📂 Estrutura do projeto

```
enfermeiro-app/
├── index.html      ← app completo (HTML + CSS + JS)
├── manifest.json   ← configuração do PWA
├── sw.js           ← service worker (offline)
├── icon.png        ← ícone do app
└── README.md       ← este arquivo
```

---

## 💾 Sobre os dados

- Os protocolos ficam salvos no **localStorage do celular**
- O GitHub serve como **backup em nuvem** via `protocolos.json`
- Use **Exportar → commit no GitHub** sempre que quiser fazer backup
