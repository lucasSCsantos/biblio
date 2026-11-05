# Modos de referência e ampliação de palavras

Solicitado pelo usuário em 2026-11-05 após aprovação do protótipo.

- Adicionar modo Hard ao jogo de referência com uma casa inicial opcional para 1, 2 ou 3.
- Começar por letra pula essa casa. Backspace apaga o último caractere preenchido.
- Sortear todos os livros nos modos normal e Hard, mantendo capítulos e versículos em dois dígitos.
- Normal ignora numeral: 1sm e 2sm respondem com SM. Hard distingue 1SM e 2SM.
- Livros sem numeral deixam a primeira casa vazia no Hard.
- Hard mantém progresso, estatísticas, histórico e comparações próprios.
- Ampliar respostas revisadas de Palavra com palavras comuns de cinco letras, verbos e plurais; excluir nomes próprios e conectivos.
- Preservar partidas do dia já iniciadas ao atualizar a seleção.

Interfaces de teste confirmadas pelo usuário: interface do jogador e API pública de resultados.
Base de revisão: f4662d50b855e598f35df32379a7c9eebbead6a4.
Protótipo aprovado: `prototype-numeral.html`, arquivado na branch `prototype/numeral` (35fc27e).
