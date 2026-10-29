# Biblio

Dois jogos bíblicos diários, inspirados em Wordle e Termo. Em **Referência**, descubra o livro, capítulo e versículo. Em **Palavra**, complete uma palavra de cinco letras omitida no versículo, com a referência visível. São seis tentativas por modo, com progresso e estatísticas independentes neste navegador. Gratuito e sem cadastro.

O seletor da página inicial abre cada modo; `/?modo=palavra` leva diretamente ao novo jogo. As referências dos modos são diferentes no mesmo dia. Acentos e cedilha são equivalentes às letras sem diacríticos. As respostas vêm da seleção revisada em `word-game.js`; os palpites aceitos são as palavras de cinco letras do corpus da Bíblia Livre. Todas as ocorrências da resposta ficam ocultas, inclusive no texto compartilhado.

Os botões compactos abaixo do cabeçalho permitem alternar os modos. Uma apresentação do modo Palavra aparece na primeira visita ao jogo e, ao ser fechada, deixa um registro neste navegador para não se repetir.

## Desenvolvimento

Requer Node.js 20 ou superior. `npm ci` instala apenas ferramentas de desenvolvimento; o site publicado não depende de bibliotecas JavaScript externas para funcionar.

```sh
npm run build
npm run dev
```

Acesse http://127.0.0.1:4173. Use HTTP em vez de abrir `index.html` diretamente: o navegador precisa carregar `bible.json` por fetch.

Edite os textos em `content/`; o cabeçalho, rodapé e metadados ficam em `scripts/build-pages.mjs`. Execute o build depois das alterações e publique os HTML gerados. Os detalhes de publicação e ativação de anúncios estão em [docs/adsense.md](docs/adsense.md).

## Verificação

```sh
npm run check
npm test
```

Os testes de navegador requerem `npx playwright install chromium`. As ferramentas ficam restritas ao desenvolvimento.

## Tradução

O jogo usa Bíblia Livre (BLIVRE), edição Textus Receptus, fevereiro de 2018, © Diego Santos, Mario Sérgio e Marco Teles. A distribuição de eBible utilizada declara CC BY 4.0. Consulte [a atribuição e a procedência](licenses/BIBLIA-LIVRE.md).

Para atualizar a tradução, baixe e extraia o pacote VPL indicado nesse documento e execute:

```sh
node scripts/import-bible.mjs caminho/porbr2018_vpl.txt
npm run build
```

O importador gera `bible.json` e `bible-index.js` a partir da mesma fonte. A migração da tradução anterior reinicia apenas a partida; as estatísticas permanecem no navegador.

## Privacidade e publicidade

O jogo funciona sem Analytics ou AdSense. Serviços opcionais dependem de escolha explícita. Anúncios vêm desativados em `site-config.js`; o guia de publicação explica a configuração do bloco manual e do consentimento no painel. A aprovação do site é decidida pelo Google.

Contato: [luc.cristovam10@gmail.com](mailto:luc.cristovam10@gmail.com).

Obrigado meu Senhor, Jesus Cristo ❤✟
