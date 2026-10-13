import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const htmlPath = resolve('dist/index.html');
const serverEntry = pathToFileURL(resolve('dist-ssr/entry-server.js')).href;
const { render } = await import(serverEntry);
const html = await readFile(htmlPath, 'utf8');
const body = render();
const shell = '<div id="root"></div>';

if (!html.includes(shell)) {
  throw new Error('Não foi possível localizar o contêiner root no HTML de produção.');
}

await writeFile(htmlPath, html.replace(shell, `<div id="root">${body}</div>`));
console.log(`Pré-render concluído: conteúdo HTML incorporado em ${htmlPath}`);
