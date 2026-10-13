import { readFile, writeFile } from 'node:fs/promises';

async function join(parts, output) {
  const chunks = [];
  for (const part of parts) chunks.push(await readFile(part, 'utf8'));
  await writeFile(output, chunks.join(''), 'utf8');
}

await join(['source-parts/App.1','source-parts/App.2','source-parts/App.3','source-parts/App.4','source-parts/App.5'], 'src/App.tsx');
await join(['source-parts/styles.1','source-parts/styles.2','source-parts/styles.3','source-parts/styles.4','source-parts/styles.5','source-parts/styles.6','source-parts/styles.7'], 'src/styles.css');
console.log('Fontes do projeto Manus recompostas.');
