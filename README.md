# ShowME-thePATH 

> "Stop guessing where you are. Let your code tell you."

**ShowME-thePATH** é uma extensão para VS Code focada em contexto. Ela adiciona automaticamente o caminho relativo do arquivo no topo do código como um comentário toda vez que você salva.

Ideal para quem vibe coda loucamente e quer dar mais contexto para as IA's que tá usando 

## ✨ Features

- **🚀 Automação ao Salvar:** Não precisa rodar comandos. Salvou, comentou.
- **🧠 Root Intelligence:** Usa o arquivo `.gitignore` para determinar a raiz real do projeto, garantindo caminhos relativos que fazem sentido.
- **🛡️ Non-Destructive:**
  - Se já existe um comentário de path antigo, ele atualiza.
  - Se existe um comentário diferente (ex: Copyright, TODO), ele insere o path acima, preservando seu código.
- **🌍 Cross-Platform:** Normaliza as barras para o padrão Unix (`/`) mesmo se você estiver no Windows.
- **⚡ Lazy Loading:** Só é ativada quando necessário, economizando memória.

## 🛠️ Linguagens Suportadas

A extensão detecta automaticamente a linguagem e aplica a sintaxe correta de comentário:

| Linguagem | Sintaxe | Exemplo |
| :--- | :--- | :--- |
| **Python** | `#` | `# src/backend/services/api.py` |
| **JavaScript** | `//` | `// src/utils/helper.js` |
| **TypeScript** | `//` | `// src/types/index.ts` |
| **React (JSX/TSX)**| `//` | `// src/components/Button.tsx` |

## 📦 Instalação (Local / VSIX)

Como este é um projeto pessoal, você pode instalar manualmente:

0. Gere o .vsix localmente
1. No VS Code, vá em **Extensions** (`Ctrl+Shift+X`).
2. Clique no menu `...` (Views and More Actions).
3. Selecione **Install from VSIX...** e escolha o arquivo.

## ⚙️ Como funciona a Lógica?

1. Ao salvar um arquivo (`onWillSaveTextDocument`), a extensão verifica a extensão do arquivo.
2. Ela sobe a árvore de diretórios procurando pelo primeiro `.gitignore`.
3. Calcula o caminho relativo entre o `.gitignore` (raiz) e o arquivo atual.
4. Verifica a primeira linha:
   - Se for o path correto: **Não faz nada**.
   - Se for um path antigo/errado: **Substitui**.
   - Se for código ou outro comentário: **Insere no topo**.

## 💻 Desenvolvimento

Clone o repositório e instale as dependências:

```bash
git clone [https://github.com/BerPapaSeg/showME-thePATH](https://github.com/BerPapaSeg/showME-thePATH)
cd showme-thepath
npm install
```

