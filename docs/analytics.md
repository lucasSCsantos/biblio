# Google Analytics

O Google Analytics 4 é opcional e só é inicializado depois que a pessoa permite análise de uso nas preferências. Sem consentimento, o script não carrega e os eventos não ficam em fila para envio posterior. Revogar a opção interrompe envios futuros; isso não desfaz processamento anterior pelo Google.

## Eventos do jogo

| Evento | Quando ocorre | Contexto enviado |
| --- | --- | --- |
| `game_start` | Primeira letra de uma partida nova | modo, data local e número do desafio |
| `guess_submitted` | Envio de palpite válido | contexto da partida e número da tentativa; nunca o texto do palpite |
| `game_complete` | Conclusão da partida | modo, data, vitória/derrota e tentativas |
| `mode_changed` | Troca explícita do modo | modo anterior, novo modo, data e superfície |
| `statistics_open` | Abertura explícita do painel ou visita à página Estatísticas | modo, data e superfície; abrir automaticamente o resultado não conta |
| `share_button_click` | Clique no controle de compartilhar | contexto do resultado |
| `share_action_result` | O navegador informa o resultado da ação | método (`clipboard` ou `web_share`) e estado observável (`copied`, `shared`, `cancelled` ou `failed`) |

`shared` significa que a API do navegador resolveu a solicitação. Não comprova publicação externa nem que outra pessoa recebeu o conteúdo. Eventos anteriores à permissão não são reproduzidos após o aceite.

## Conferência de produção

Em um ambiente de teste, habilite Analytics nas preferências e execute cada ação. Use os relatórios Realtime ou DebugView da propriedade GA4 para confirmar os nomes e parâmetros recebidos. A documentação oficial explica [Realtime](https://support.google.com/analytics/answer/9271392) e [DebugView](https://support.google.com/analytics/answer/7201382). Esse fluxo depende de uma propriedade, ID de medição e navegador configurados; os testes automatizados interceptam todas as chamadas externas e não validam a recepção por uma propriedade real.

Para consultar parâmetros como `mode`, `challenge_day`, `attempt_number`, `surface` e `outcome` em relatórios padrão, registre-os como dimensões personalizadas no escopo do evento no GA4. A documentação do Google informa que a disponibilidade em relatórios pode levar de 24 a 48 horas após o envio ([dimensões personalizadas](https://support.google.com/analytics/answer/14239696)). Os testes locais confirmam apenas os eventos na camada do navegador, não a configuração da propriedade.

Os testes de navegador verificam os eventos por uma camada `dataLayer` interceptada e abortam requisições HTTPS externas. Nunca use dados reais de jogadores nos testes.
