# Revisão do modo Hard

Base: `f4662d50b855e598f35df32379a7c9eebbead6a4`.
Implementação: `d51d914` e correção responsiva subsequente.
Spec: [spec.md](spec.md).

## Standards

Nenhuma violação documentada ou smell material identificado. O vocabulário acompanha o glossário atualizado, e os resultados continuam separados por modo conforme o ADR 0001.

Risco encontrado: Hard conservava larguras fixas de casas, podendo ultrapassar telas estreitas. Confirmado em 361px, com borda esquerda em -5,17px.

Revisão suplementar: risco de layout resolvido. A regra `.hard-grid .box` aplica largura e altura proporcionais à tela e mantém as casas quadradas. Sua especificidade também prevalece sobre o breakpoint de 360px. O teste cobre 361px e 360px, além de 375px e 320px, verificando tanto o tabuleiro quanto a largura total da página. Nenhum novo achado de padrões.

## Spec

Nenhum desvio material encontrado.

- Hard acrescenta a casa opcional, distingue os numerais e começa na segunda casa quando a entrada inicial é uma letra.
- O normal inclui os livros numerados e remove o numeral da resposta.
- Progresso, estatísticas, histórico e comparações usam identificadores próprios para Hard.
- A migração copia os dados existentes e recria índices e triggers; os agregados diários permanecem preservados.
- A casa inicial vazia participa das pistas e mantém sua cor após recarregar.
- A lista de Palavra foi ampliada, e as respostas já carregadas permanecem salvas.

## Validação

- Build e `npm run check` passaram: 66 livros, 30.210 referências disponíveis.
- Suíte completa: 102 testes passaram em desktop e mobile.
- Após ajustes finais na tabela de regras e nas casas vazias: 6 testes direcionados passaram.
- Após correção responsiva: 14 testes de Hard passaram em desktop e mobile, incluindo migração e telas estreitas.
- Protótipo aprovado arquivado em `prototype/numeral` (`35fc27e`).
- Produção não publicada; aplicar `0003-hard-mode.sql` e publicar Worker antes do site.

Resultado final: 0 achados pendentes de Standards e 0 de Spec. Um risco de layout identificado e corrigido.
