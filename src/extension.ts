import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extensão "path-header-comment" ativa com lógica de substituição inteligente!');

    const disposable = vscode.workspace.onWillSaveTextDocument(event => {
        const document = event.document;
        const filename = document.fileName;

        // 1. Filtro de Linguagens
        const ext = path.extname(filename).toLowerCase();
        // Adicionei mais variações comuns de JS/TS
        const validExtensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
        
        if (!validExtensions.includes(ext)) {
            return; 
        }

        // 2. Achar a raiz do .gitignore
        const rootPath = findGitIgnoreRoot(path.dirname(filename));
        if (!rootPath) {
            return; // Segurança: se não achar a raiz, não toca no arquivo
        }

        // 3. Definir prefixo de comentário
        const isPython = ext === '.py';
        const commentPrefix = isPython ? '# ' : '// ';

        // 4. Calcular o path relativo e normalizar barras
        // O .split(path.sep).join('/') garante que no Windows saia "src/app.py" e não "src\app.py"
        let relativePath = path.relative(rootPath, filename).split(path.sep).join('/');
        
        // O texto exato que queremos inserir/verificar
        const expectedComment = `${commentPrefix}${relativePath}`;

        // 5. Analisar a primeira linha existente
        const firstLine = document.lineAt(0);
        const firstLineText = firstLine.text;

        // SE já estiver perfeito, sai fora (economiza processamento)
        if (firstLineText.trim() === expectedComment) {
            return;
        }

        let edit: vscode.TextEdit;

        // Verificação Lógica solicitada:
        const startsWithPrefix = firstLineText.trim().startsWith(commentPrefix.trim());
        
        // Heurística: É um path antigo? 
        // Critério: Começa com comentário E (contém barra '/' OU termina com a extensão do arquivo)
        const looksLikeAPath = startsWithPrefix && (
            firstLineText.includes('/') || 
            firstLineText.includes('\\') || 
            firstLineText.trim().endsWith(ext)
        );

        if (looksLikeAPath) {
            // CASO 1: É um path (antigo ou errado) -> SUBSTITUIR
            // Cria um range que pega a linha inteira (0,0 até 0, tamanho_da_linha)
            const range = firstLine.range;
            edit = vscode.TextEdit.replace(range, expectedComment);
        } else {
            // CASO 2: É um comentário genérico (ex: // TODO: refatorar) ou código -> INSERIR NO TOPO
            // Se for comentário genérico, empurra ele pra baixo.
            // Se for código, empurra pra baixo também.
            edit = vscode.TextEdit.insert(new vscode.Position(0, 0), expectedComment + '\n');
        }

        // Aplica a edição
        event.waitUntil(Promise.resolve([edit]));
    });

    context.subscriptions.push(disposable);
}

// Função auxiliar para achar a raiz
function findGitIgnoreRoot(currentDir: string): string | null {
    const parse = path.parse(currentDir);
    const root = parse.root;
    let dir = currentDir;

    while (true) {
        const gitIgnorePath = path.join(dir, '.gitignore');
        if (fs.existsSync(gitIgnorePath)) {
            return dir; 
        }
        if (dir === root) {
            return null; 
        }
        dir = path.dirname(dir);
    }
}

export function deactivate() {}