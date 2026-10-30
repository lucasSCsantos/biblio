# Serviço de resultados

O site publicado continua estático. O serviço de resultados é um Worker separado, com banco D1. Google Analytics não participa desse fluxo.

## Desenvolvimento e testes

Requer Node.js 22 ou superior. No Windows, o runtime `workerd` também precisa do [Visual C++ Redistributable x64 oficial da Microsoft](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist/). Um encerramento com código `-1073741515` indica uma DLL ausente.

`npm ci`, `npm run build` e `npm run dev` abrem o site local e o Worker com D1 real. O servidor encaminha `/api/` ao Miniflare e configura essa URL apenas na resposta local de `site-config.js`; o arquivo publicado permanece desativado até a configuração de produção. O banco de desenvolvimento persiste em `.scratch/d1`.

Os testes de resultados usam `createSiteServer({ port: 0 })`: cada teste tem seu próprio servidor HTTP, runtime e D1 temporário. A finalização fecha as conexões e executa `dispose()` do runtime. Isso evita que testes simultâneos disputem a mensagem de primeiro jogador ou contaminem os percentuais. Não há endpoint público para limpar dados de teste.

`npm run check` verifica a sintaxe e os links. `npx playwright test tests/results.spec.mjs` verifica comportamento pelo navegador com o banco real, incluindo perda da resposta depois de uma gravação confirmada no D1.

Miniflare está fixado na versão estável 4 para a interface programática usada pelo servidor local. O Wrangler é usado apenas como ferramenta de configuração/publicação; nenhum comando de desenvolvimento cria recursos de produção.

## Identidade e contrato HTTP

Cada navegador gera 32 bytes aleatórios, persistidos como um token de 64 caracteres hexadecimais. As chamadas enviam `Authorization: Bearer <token>`. O Worker guarda somente o SHA-256 desse segredo como identificador. Nunca publicar tokens de administração do Cloudflare no cliente.

- `PUT /api/player`: recebe `{ baselines, capturedAt }`; cria a identidade uma vez. Cada modo tem um baseline com `games`, `wins`, `winStreak`, `maxStreak`, `lastWinDay` e `lastPlayedDay`. Valores inválidos são normalizados. Repetir a chamada não substitui o baseline salvo.
- `POST /api/results`: recebe `{ mode, day, won, attempts }`. Modos: `referencia` ou `palavra`; dia: `YYYY-MM-DD`; tentativas: 1–6, obrigatoriamente 6 em derrota. O dia não pode anteceder o início do Biblio nem estar no futuro além da janela de fuso horário. A resposta contém as estatísticas individuais e a comparação diária.
- `GET /api/stats?mode=palavra&day=YYYY-MM-DD`: leitura individual autenticada, sem listar outros jogadores.
- `GET /api/history?mode=palavra&day=YYYY-MM-DD`: totais individuais, baseline importado e resultados detalhados desse modo em ordem decrescente de data. A resposta não inclui as tentativas digitadas.

As respostas de resultado/consulta têm `{ stats, daily }`. `daily` contém `result` (ou `null`), `otherPlayers`, `beaten`, `percentage` (ou `null`) e `first`. O próprio jogador fica fora do denominador. Empates não contam como resultados superados. O percentual é inteiro, arredondado para baixo. `stats` soma o baseline aceito uma única vez aos resultados detalhados posteriores. A sequência é recalculada em ordem de data e volta a zero após derrota, lacuna ou quando já não está vigente na data consultada.

Respostas inválidas usam 400; falta de identificação usa 401; origem não permitida usa 403; identidade inexistente usa 404; conclusão diferente já registrada para o mesmo modo/dia usa 409. O serviço aceita reenvio idêntico sem criar nova linha.

A tabela `results` tem chave única por jogador, modo e dia. Um trigger `AFTER INSERT` atualiza o histograma `daily_counts` na mesma transação; uma duplicata não incrementa o contador. Cada comparação diária lê no máximo sete grupos de resultado, em vez de percorrer todos os jogadores.

## Contrato do cliente e migração

`window.BiblioResults` expõe:

- `initialize()`: congela os históricos dos dois modos antes de novas conclusões. É síncrono e não exige conexão.
- `record({ mode, day, won, attempts })`: persiste a conclusão na fila antes de tentar enviar.
- `sync()`: registra a identidade e esvazia a fila, sem duplicar partidas. Falhas temporárias usam intervalo crescente de até um minuto e o evento de conexão também dispara nova tentativa.
- `refresh(mode, day)`: sincroniza e consulta as estatísticas/ comparação.
- `snapshot(mode, day)`: devolve a última visão local com `status` e, quando recebido, `data`.

Uma atualização emite `biblio:results-updated` no documento, com `{ mode, day, status, data? }`. Os estados de apresentação são `idle`, `pending`, `ready`, `disabled` ou `unavailable`.

O registro `biblio-results-v1` no localStorage contém versão, token, `baselines`, `capturedAt`, `pending` e `confirmed`. Não depende da opção de Analytics. As chaves anteriores de partidas/estatísticas são mantidas.

Ao adotar a coleta, o cliente captura o baseline dos dois modos. Se a última conclusão ainda estiver recuperável no estado antigo, subtrai seus jogos/vitórias do baseline e coloca esse resultado na fila, evitando somá-lo duas vezes na importação. A sequência anterior é preservada até onde o estado agregado permite inferir. Detalhes antigos inexistentes não são reconstruídos.

A página `estatisticas.html` permite alternar entre os modos, consultar jogos, vitórias, taxa e sequências, e ver resultados detalhados recebidos. Os totais antigos são preservados, mas os seus detalhes não podem ser reconstruídos. Se o serviço estiver indisponível, a página mostra os totais locais e ajusta a sequência pela data atual sem inventar resultados coletivos. O ticket 03 acrescentará as comparações acumuladas à resposta.

## Configuração de produção

O campo `resultsApiUrl` publicado começa vazio. Para ativar a coleta depois de criar e revisar o Worker/banco, preencher com a URL HTTPS terminada em `/api`. O Worker usa `ALLOWED_ORIGIN` para a origem exata do site. O arquivo `wrangler.jsonc` contém um identificador de banco claramente fictício; substituí-lo pelo banco real antes de aplicar migrações ou publicar.

Sem a URL, sem conexão ou em indisponibilidade, o jogo continua localmente. As conclusões ficam pendentes para envio e nenhuma comparação fictícia é apresentada. O plano gratuito pode interromper operações ao atingir limites; nenhuma configuração ativa contratação paga automaticamente.
