# Issue tracker: Local Markdown

Issues e specs vivem em arquivos Markdown sob `.scratch/`.

## Convenções

- Uma pasta por feature: `.scratch/<feature-slug>/`.
- Spec: `.scratch/<feature-slug>/spec.md`.
- Um arquivo por ticket: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`,
  numerado a partir de `01`.
- Estado de triagem: linha `Status:` perto do início do ticket,
  usando os valores de `triage-labels.md`.
- Comentários: acrescentar ao final, sob `## Comments`.

## Operações das skills

Ao publicar no tracker, crie o arquivo na pasta da feature.
Ao buscar um ticket, leia o arquivo indicado pelo caminho ou número.

## Wayfinding

- Mapa: `.scratch/<effort>/map.md`, com Notes, Decisions-so-far e Fog.
- Tickets: `.scratch/<effort>/issues/NN-<slug>.md`.
- Tipo: linha `Type:` com research, prototype, grilling ou task.
- Execução: linha `Status:` com claimed ou resolved.
- Dependências: linha `Blocked by: NN, NN`.
  Um ticket está desbloqueado quando todas as dependências estão resolved.
- Próximo ticket: primeiro por número que esteja aberto, desbloqueado
  e ainda não tenha sido assumido.
- Assumir: salvar `Status: claimed` antes de iniciar.
- Resolver: acrescentar a resposta em `## Answer`, salvar
  `Status: resolved` e registrar resumo e link no Decisions-so-far do mapa.
