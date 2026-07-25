# NOVA-ERP Etiquetas

Gerador de etiquetas de preço para retalho. Corre no browser ou como aplicação
Windows (Electron) com atualização automática.

## O que faz

- **20 modelos** de etiqueta (Clássico, Premium, Minimal, Promoção, Eco, Retro,
  Neon, Corporate, Bold, Farmácia, Talho, Kraft, Desconto, Boutique, Tech,
  Split, Peixaria, Padaria, Infantil, Atacado) × **7 tamanhos** de XXXS (3×2 cm)
  a XL (13×8 cm).
- **Importação de Excel/CSV** com deteção automática de colunas (`produto`,
  `preço`, `marca`, `secção`, `cod erp`…) e mapeamento manual antes de importar.
- **Personalização**: fonte, cor de destaque, logótipo, faixa (ribbon), alinhamento
  e tamanho do nome/preço, e que campos aparecem (marca, unidade, secção, loja,
  código ERP, código de barras Code 128).
- **Impressão A4** com pré-visualização paginada, colunas e margens configuráveis,
  retrato ou paisagem.
- **Exportação** para PDF, Word, Excel (grelha visual + folha de resumo) e CSV.
- Edição individual e em massa, reordenação por arrastar, seleção múltipla,
  desfazer/refazer, e recuperação da última sessão.

Tudo é local: etiquetas e definições ficam no `localStorage` do dispositivo.
Não há servidor nem conta.

## Atalhos

| Tecla | Ação |
|---|---|
| `N` | Nova etiqueta |
| `I` | Importar Excel |
| `P` | Imprimir tudo |
| `V` | Pré-visualizar A4 |
| `S` | Modo seleção |
| `A` / `D` | Selecionar tudo / limpar seleção (em modo seleção) |
| `Ctrl+Z` / `Ctrl+Y` | Desfazer / refazer |

## Desenvolvimento

```bash
npm install
npm run dev              # Vite em http://localhost:5173
npm run electron:dev     # app Electron com HMR
```

Portão de qualidade antes de qualquer commit:

```bash
npm test                 # Vitest
npm run lint             # ESLint
npm run build            # tsc -b && vite build
```

## Build e release

```bash
npm run electron:build:installer   # instalador NSIS em release/
npm run electron:build:portable    # executável portátil
npm run release:minor              # bump + build + publica no GitHub Releases
```

O auto-updater lê os releases de `Harrydevcod/gerador-de-etiquetas`.

## Estrutura

```
src/
├── renderers/       # 1 ficheiro por modelo — (label, size, config) => string HTML
├── components/      # UI por área: etiquetas, modais, personalizar, impressão, toolbar
├── hooks/           # useLabels (+ histórico), useConfig, usePrint, useExport
├── lib/             # barcode, exportPdf/Word/Excel/Csv, storage, units
├── constants/       # tamanhos, fontes, secções, ribbons
└── types/           # Label, AppConfig
```

**Adicionar um modelo:** criar `src/renderers/<nome>.ts` que exporta uma função
pura `(l: Label, sz: SizeKey, cfg: AppConfig) => string`, usando os helpers de
`renderers/helpers.ts` (fazem escape de todo o texto do utilizador), registá-la em
`renderers/index.ts` e acrescentar a chave a `ModelKey` em `types/config.ts`. Os
testes em `renderers/index.test.ts` cobrem automaticamente dimensões, escape,
cor personalizada e campos ocultáveis para cada modelo registado.

## Notas técnicas

- Os renderers devolvem HTML como string e são injetados com
  `dangerouslySetInnerHTML` — **todo** o texto vindo do utilizador tem de passar
  pelos helpers, que fazem escape. Há testes que falham se um modelo não o fizer.
- As libs pesadas de exportação/importação (`jspdf`, `docx`, `xlsx-js-style`,
  `html2canvas`) são carregadas dinamicamente no clique, fora do chunk inicial.
- Config guardada por outra versão é saneada no arranque (`sanitizeConfig`):
  modelo ou tamanho desconhecido volta ao valor por omissão.
