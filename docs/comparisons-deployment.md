# Publicar o serviço de comparações

O site é estático; as comparações usam um Cloudflare Worker separado e um banco D1. O serviço de resultados não depende do Google Analytics nem do consentimento de Analytics. A URL `resultsApiUrl` está vazia por padrão, então a integração só fica ativa depois de configurar essa URL e publicar novamente. Nenhum passo abaixo é executado pelo build local.

## Preparar e publicar

1. Instale e autentique o Wrangler na conta Cloudflare desejada.
2. Crie a base: `npx wrangler d1 create biblio-results`.
3. Copie o `database_id` retornado para `wrangler.jsonc`. Confirme que `database_name` é `biblio-results` e que `ALLOWED_ORIGIN` contém a origem HTTPS exata do site.
4. Aplique as migrações remotamente: `npx wrangler d1 migrations apply biblio-results --remote`.
5. Publique: `npx wrangler deploy`.
6. Atualize `resultsApiUrl` em `site-config.js` para a URL HTTPS do Worker terminada em `/api`, gere o site com `npm run build` e publique os arquivos estáticos.
7. Abra o site publicado, conclua um jogo e confira a chamada de resultado no navegador. Confirme na conta Cloudflare que o Worker e D1 recebem tráfego e acompanhe erros e operações. Não marque a produção como verificada antes de fazer essa checagem.

Consulte os comandos oficiais do [Wrangler D1](https://developers.cloudflare.com/d1/wrangler-commands/) e os limites atuais de [Workers](https://developers.cloudflare.com/workers/platform/limits/) e [D1](https://developers.cloudflare.com/d1/platform/pricing/).

## Uso e custo

No plano gratuito publicado pela Cloudflare, Workers têm cota diária de 100 mil requisições e até 10 ms de CPU por invocação. D1 Free inclui 5 milhões de linhas lidas e 100 mil linhas escritas por dia. Confirme os limites atuais nas páginas oficiais antes de ativar ou estimar capacidade. As consultas diárias usam agregados para limitar leituras; cada resultado novo ainda consome gravações.

Meça o consumo real no painel Cloudflare: use métricas e analytics do Worker para requisições/erros e as métricas de linhas lidas/escritas do D1. Compare os valores com o tráfego diário antes de avaliar qualquer mudança de plano. Ao atingir cotas gratuitas, algumas operações podem falhar até a cota ser renovada. O projeto não habilita upgrade pago automático e não deve fazê-lo sem decisão explícita do responsável.

## Reversão

Para interromper novas chamadas, remova a URL `resultsApiUrl` da configuração publicada e gere/publice novamente o site. Isso não apaga os dados já armazenados. Não remova ou recrie uma base de produção como método de reversão sem uma decisão separada de retenção e cópia de segurança.
