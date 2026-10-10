# Mirror consolidado — branch test

Base confirmada no GitHub e no checkout: `85a1e4edf3905808fd602eb99949a5594c3cef01`.
Backup completo verificado: `/workspace/backups/joabest-teste-test-85a1e4e.bundle`.
Nenhuma outra branch, backend ou arquivo do site original foi alterado.

## Implementação

As 358 páginas capturadas agora são documentos estáticos. O HTML de conteúdo,
os stylesheets locais e os dados estruturados foram preservados. Removemos a
hidratação/RSC do Next exportado: esse runtime dependia de respostas de servidor
inexistentes no mirror e competia com os patches locais. A navegação entre páginas
usa links normais, sem interceptar fetch/history ou alterar protótipos do navegador.

Cada documento carrega exatamente uma vez:

- `/assets/js/nav.js`: menu mobile, foco, fechamento por botão, fora, link e Escape;
  body restaurado e scroll interno nativo por touch. Dropdowns desktop nativos.
- `/assets/js/method.js`: cinco fases em sequência; scroll vertical traduz a faixa
  horizontal da direita para a esquerda no desktop. Mobile e movimento reduzido
  usam blocos verticais com altura de conteúdo, sem sticky ou captura de wheel/touch.
- `/assets/js/globe.js`: canvas exclusivamente desktop, transparente, pontos brancos,
  verso com menor opacidade, borda sutil, duas conexões entre coordenadas reais das
  cidades, uma rosa. ONLINE identifica Monterrey, não uma localização inventada do
  visitante. Usa o GeoJSON local; pausa fora da viewport e em abas ocultas. Sem zoom.
- `/assets/js/progress.js`: somente bolinhas rosas à direita; bandeiras ficam à esquerda.
- `/assets/js/media.js`: imagens lazy/async; vídeos com poster, fontes adiadas,
  preload none fora da viewport, metadata ao entrar, pausa ao sair. Autoplay e hover
  de desktop só reproduzem vídeos visíveis; movimento reduzido respeitado.
- `/assets/js/blog.js`: 20 → 40 → 60 → 80 → 100 → 103; último lote de três;
  botão escondido ao terminar. Também funciona no índice em espanhol.
- `/assets/js/forms.js`: envio real ao endpoint local de leads; erro explícito quando
  indisponível. As ferramentas não inventam resultados de análise.
- `/assets/js/services.js`: filtros e grade/lista preservados; seleção manual de
  imagens das etapas do serviço. Carrosséis de posts relacionados tornam-se listas
  estáticas dos links presentes na captura, sem botões inativos.

`/assets/css/mobile.css` contém os estilos consolidados e os hovers de Services/SEO.
O formulário final da Home ganhou campos nome/email/empresa/telefone/mensagem,
consentimento e contatos diretos, em fluxo normal e com isolamento de empilhamento.
Máscara, gotas, tinta e transição branca foram retiradas do HTML ativo. A frase do
footer não tem esfera, canvas ou outro objeto de partículas atrás dela. O badge
Awwwards e o progresso percentual foram removidos na origem do HTML.

`next-stability-guard.js` passou de 10.460 bytes para um comentário explicativo.
Nenhuma recuperação por reload, observer, loader, patch visual ou reescrita para o
host original permanece. `scripts/apply_mirror_fixes.py` agora apenas executa a
validação; nunca reescreve páginas ou ressuscita patches.

## Automações e limpeza

Removidos os cinco workflows que escreviam/commitavam patches ou HTML:

- `.github/workflows/apply-mirror-fixes.yml`
- `.github/workflows/perf-html-cleanup.yml`
- `.github/workflows/perf-mobile-v10.yml`
- `.github/workflows/perf-mobile-v11.yml`
- `.github/workflows/perf-mobile-v12.yml`

Preservado `.github/workflows/capture-live-home.yml`: captura somente em artefatos,
com permissão de leitura, sem aplicar patches nem publicar arquivos no repositório.

Os 20 arquivos antigos foram removidos após verificar que nenhum arquivo mantido
de HTML, JavaScript, CSS, Python, workflow ou configuração os referenciava. A lista
completa de arquivos alterados/criados/removidos está em `changed-files.txt`.
Chunks originais arquivados não são carregados; não houve limpeza indiscriminada
de arquivos de terceiros ou de capturas cuja proveniência precisa ser preservada.

## Dependências externas e backend

Não há dependência de `weevolveit.com` para carregar JavaScript, CSS, fontes, vídeos
ou imagens locais. Canonical, hreflang e entidades JSON-LD continuam apontando à
fonte original por motivos de atribuição/SEO; não são loaders. Email/WhatsApp e
links sociais são destinos de contato reais. Avatares de avaliações de terceiros
continuam no Google; as URLs únicas estão em `external-review-avatars.txt`.

Nenhum backend foi implementado, simulado ou encaminhado ao site original.
Endpoints identificados no frontend original, ainda necessários no mirror:

| Endpoint | Uso |
| --- | --- |
| `POST /api/lead` | Contato, diagnóstico e captura de leads com consentimento |
| `PATCH /api/lead` | Associar resultados de análise a um lead existente |
| `GET /api/pagespeed?url=…&strategy=mobile\|desktop` | Análise SEO/velocidade |
| `GET /api/ai-visibility?url=…` | Análise de visibilidade em IA |

As análises dependem também da configuração de fornecedores, proteção antiabuso
e contratos de resposta existentes no backend original. O mirror não apresenta
sucesso de envio nem pontuação fictícia quando esses serviços não existem.

Aliases inglês/espanhol, com e sem `.html`, têm redirects permanentes no Vercel:
Business Diagnosis → `/ai-business-check`, AI Visibility Check → `/ai-check`,
Free SEO Check → `/seo-check` (com prefixo `/es` para espanhol).

## Validação reproduzível

O site não precisa de build npm ou servidor Next. Use o checkout isolado existente;
não crie worktrees sem pedido explícito. Python 3 e Node são suficientes para as
checagens estáticas:

```sh
python scripts/validate_mirror.py
python scripts/serve_mirror.py --port 8080
```

O segundo comando inicia somente um servidor estático local com os rewrites e
redirects exatos de `vercel.json`; não contém handlers de API.
Em outro terminal, com Playwright e Chromium instalados:

```sh
NODE_PATH=/workspace/mirror-tools/node_modules node scripts/test_mirror.cjs
```

`CHROMIUM_PATH`, `MIRROR_BASE_URL` e `MIRROR_TEST_OUTPUT` permitem outros caminhos.
O teste de envio usa dados fictícios somente no servidor local, para confirmar o
erro de endpoint ausente; não envia leads ao original.

Resultados na máquina atual:

- 358 documentos: assets locais, links internos, duplicidade de scripts/loaders,
  sintaxe dos controladores, destinos/redirects Vercel e workflows — passaram.
- Chromium: 360×800, 390×844, 412×915, 1366×768 e 1920×1080 — passaram.
- Menu: gesto touch com submenu expandido, fechamento por botão/fora/link e
  desbloqueio do body — passaram.
- Method: cinco títulos visíveis, fluxo vertical mobile, movimento horizontal
  desktop na ordem correta — passaram.
- Todos os inputs, textarea e botão do formulário final passaram no hit-test de
  sobreposição; footer sem partículas e Home sem canvas no mobile — passaram.
- Blog: 103 cards, 20 iniciais, incrementos/últimos três/botão final — passaram.
- Services: hover, três serviços AI, 16 serviços no total, alternância lista/grade,
  vídeo fora da viewport pausado/com poster/preload none — passaram.
- Nenhum erro JavaScript, asset local com HTTP de erro ou requisição de runtime
  ao host original nas verificações de páginas — passou.

A referência atual foi obtida por GET HTTPS com verificação TLS e confirmou fases
e CTA. Capturas visuais do original no Chromium ficaram bloqueadas pela confiança
no certificado do proxy; não se desativou TLS para contornar isso. Testes mobile
foram emulados no Chromium, não em aparelhos físicos Android ou Safari/iPhone.
Não se afirma equivalência visual pixel a pixel com o original.

A publicação depende da integração GitHub/Vercel da branch test. Um commit/push
não prova que o deploy terminou; consulte o status do commit correspondente.
