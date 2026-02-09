import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    // LOG 1: Saber se a extensão acordou
    console.log('>>> EXTENSÃO CARREGADA! (Se não aparecer isso, o activationEvents tá errado) <<<');

    const disposable = vscode.workspace.onWillSaveTextDocument(event => {
        const document = event.document;
        const filename = document.fileName;

        console.log(`--- Tentando salvar: ${filename} ---`);

        // 1. Filtro de Linguagens
        const ext = path.extname(filename).toLowerCase();
        const validExtensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
        
        if (!validExtensions.includes(ext)) {
            console.log(`[ABORTADO] Extensão '${ext}' não é suportada.`);
            return; 
        }

        console.log('[OK] Extensão de arquivo válida.');

        // 2. Achar a raiz do .gitignore
        const dirName = path.dirname(filename);
        console.log(`Procurando .gitignore subindo a partir de: ${dirName}`);
        
        const rootPath = findGitIgnoreRoot(dirName);
        
        if (!rootPath) {
            console.log('[ERRO CRÍTICO] Não encontrei nenhum .gitignore subindo as pastas. A extensão parou aqui.');
            return; 
        }

        console.log(`[SUCESSO] Raiz do projeto encontrada em: ${rootPath}`);

        // 3. Lógica do Path
        const isPython = ext === '.py';
        const commentPrefix = isPython ? '# ' : '// ';

        let relativePath = path.relative(rootPath, filename).split(path.sep).join('/');
        const expectedComment = `${commentPrefix}${relativePath}`;

        console.log(`Comentário esperado: "${expectedComment}"`);

        const firstLine = document.lineAt(0);
        const firstLineText = firstLine.text;

        if (firstLineText.trim() === expectedComment) {
            console.log('[PULA] O comentário já está correto.');
            return;
        }

        let edit: vscode.TextEdit;
        const startsWithPrefix = firstLineText.trim().startsWith(commentPrefix.trim());
        const looksLikeAPath = startsWithPrefix && (
            firstLineText.includes('/') || 
            firstLineText.includes('\\') || 
            firstLineText.trim().endsWith(ext)
        );

        if (looksLikeAPath) {
            console.log('[AÇÃO] Substituindo path antigo...');
            const range = firstLine.range;
            edit = vscode.TextEdit.replace(range, expectedComment);
        } else {
            console.log('[AÇÃO] Inserindo path no topo...');
            edit = vscode.TextEdit.insert(new vscode.Position(0, 0), expectedComment + '\n');
        }

        event.waitUntil(Promise.resolve([edit]));
        console.log('--- Edição enviada para o VS Code ---');
    });

    context.subscriptions.push(disposable);
}

function findGitIgnoreRoot(currentDir: string): string | null {
    const parse = path.parse(currentDir);
    const root = parse.root;
    let dir = currentDir;

    while (true) {
        const gitIgnorePath = path.join(dir, '.gitignore');
        // console.log(`Checando: ${gitIgnorePath}`); // Descomente se quiser ver o loop
        
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