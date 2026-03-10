# 🩺 Protocolos Clínicos para Enfermeiros

App PWA (Progressive Web App) para consulta rápida de protocolos clínicos, desenvolvido para uso pessoal por enfermeiros.

## ✨ Funcionalidades

- 📋 Consulta rápida de protocolos clínicos
- ✏️ Adicionar, editar e excluir situações
- 🗂️ Organização por categorias
- 🔍 Busca por título ou categoria
- 📝 Editor com suporte a Markdown e pré-visualização
- 🔄 Exportar/Importar JSON para sincronizar com o GitHub
- 📱 Instalável no celular como app nativo (PWA)
- 🌐 Funciona offline após a primeira visita

---

## 🚀 Configuração inicial (fazer apenas uma vez)

### 1. Fazer fork ou upload para o GitHub

1. Crie um repositório **público** no GitHub chamado `enfermeiro-app`
2. Faça upload de todos os arquivos desta pasta

### 2. Ajustar o nome do repositório no código

Abra o arquivo `vite.config.js` e confirme que o nome do repositório está correto:

```js
const REPO_NAME = 'enfermeiro-app'  // ← coloque o nome EXATO do seu repo
```

### 3. Ativar o GitHub Pages

1. No GitHub, vá em **Settings → Pages**
2. Em "Source", selecione **GitHub Actions**
3. Salve

### 4. Fazer o primeiro push/commit

Após o push, o GitHub Actions vai:
- Instalar as dependências
- Buildar o projeto
- Publicar automaticamente no GitHub Pages

Aguarde ~2 minutos e acesse:
```
https://SEU_USUARIO.github.io/enfermeiro-app/
```

---

## 📱 Instalar no celular (PWA)

### Android (Chrome)
1. Abra o link do app no Chrome
2. Aparecerá um banner "Adicionar à tela inicial" — toque nele
3. Ou: menu ⋮ → "Adicionar à tela inicial"

### iPhone (Safari)
1. Abra o link no Safari
2. Toque no ícone de compartilhar (quadrado com seta)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Toque em "Adicionar"

O app aparecerá na tela inicial como um ícone nativo! 🎉

---

## 🔄 Fluxo de sincronização (atualizar protocolos)

```
Editar no celular → Exportar JSON → Commit no GitHub → Deploy automático
```

### Passo a passo:

1. **No app** → Tela inicial → "Exportar / Importar (GitHub Sync)"
2. Toque em **"Baixar protocolos.json"**
3. No GitHub, navegue até `src/data/protocolos.json`
4. Clique no ícone de editar (lápis) → "Upload file" → selecione o JSON baixado
5. Faça o commit: "Atualiza protocolos"
6. O GitHub Actions faz o build e deploy automaticamente (~1-2 min)
7. O app no celular se atualiza na próxima abertura (ou force-refresh)

### Trocar de dispositivo / instalar em outro celular:
1. Acesse o link do app no novo dispositivo
2. Instale como PWA
3. Se quiser trazer os dados do celular anterior:
   - Exporte o JSON no celular antigo
   - No novo celular, vá em "Importar do GitHub" e carregue o arquivo

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

## 🛠️ Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173/enfermeiro-app/`

---

## 📂 Estrutura do projeto

```
enfermeiro-app/
├── .github/
│   └── workflows/
│       └── deploy.yml        ← Deploy automático no GitHub Pages
├── public/
│   └── icons/                ← Ícones do PWA (192px e 512px)
├── src/
│   ├── App.jsx               ← Componente principal
│   ├── main.jsx              ← Entry point
│   └── data/
│       └── protocolos.json   ← Dados padrão (seed)
├── index.html
├── vite.config.js            ← Config do Vite + PWA
└── package.json
```

---

## ⚠️ Sobre os dados

- Os dados ficam salvos no **localStorage do celular**
- O `protocolos.json` no repositório é usado apenas na **primeira instalação** (seed)
- Use **Exportar → commit no GitHub** para garantir backup e sincronização
