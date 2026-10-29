# Publicação e ativação do AdSense

O site continua estático. `npm run build` gera as páginas HTML e o sitemap a partir de `content/` e do template em `scripts/build-pages.mjs`. Publique os HTML da raiz, `styles.css`, `script.js`, `site.js`, `site-config.js`, `bible-index.js`, `bible.json`, `images/`, `fonts/`, `licenses/`, `ads.txt`, `robots.txt` e `sitemap.xml`. As pastas `.git`, `.agents`, `.scratch`, `content` e `scripts` não são conteúdo público. Para desenvolvimento, `npm run dev` abre um servidor apenas em 127.0.0.1:4173. Use HTTP local, não `file://`.

## Antes de solicitar nova revisão

1. Confira o domínio real. O canonical e o sitemap usam `https://bibliooo.com.br/`, já indicado no projeto anterior; se mudar, ajuste o gerador e `robots.txt` e execute o build. Confira o endereço de contato e a identificação do responsável nas páginas públicas.
2. Publique e verifique HTTPS, acesso à página inicial, aos guias e ao JSON sem autenticação, inclusive em um navegador novo. Confirme que a hospedagem não bloqueia os rastreadores do Google. `robots.txt` não corrige bloqueios feitos pela hospedagem ou CDN.
3. Confirme que o ID de editor da conta é `pub-4020170826821314`. Ele está no metadado de verificação do template, em `site-config.js` e em `ads.txt`. Este é o ID que já estava no site, não um ID novo.
4. Confira a política de privacidade em relação às configurações efetivas da sua conta, aos fornecedores e à hospedagem. A origem e a licença do texto bíblico estão em `licenses/BIBLIA-LIVRE.md`.
5. Leia o motivo exato da recusa no painel e solicite nova revisão depois de resolver os pontos indicados. A implementação não comprova aprovação nem estabelece quantidade mínima de artigos ou tráfego.

## Ativar o bloco de anúncios depois da preparação da conta

Por padrão, `adsEnabled` é `false` e `adSlot` está vazio. O espaço abaixo do jogo permanece oculto e nenhum script publicitário é carregado. O metadado no HTML permite a verificação de propriedade sem carregar anúncios antes da escolha do visitante.

1. Crie um bloco responsivo no AdSense e copie seu identificador numérico para `adSlot` em `site-config.js`.
2. Configure Privacidade e mensagens no painel. Para visitantes do EEE, Reino Unido e Suíça, configure uma CMP certificada pelo Google (por exemplo, a mensagem europeia do próprio AdSense). As escolhas locais deste site **não são uma CMP certificada** e não substituem essa obrigação. Verifique a mensagem, os parceiros e as opções de revogação no ambiente publicado antes de liberar a veiculação.
3. Mantenha anúncios automáticos desativados: o projeto usa somente o bloco manual abaixo do jogo. Ativar Auto ads no painel pode criar posições que este código não controla.
4. Só então mude `adsEnabled` para `true` e publique a configuração. O bloco continua dependendo de permissão de publicidade pelo visitante e de uma partida carregada com sucesso. Não exibimos blocos nas páginas informativas nem em telas de erro.
5. Verifique a renderização real em celular e computador e os diagnósticos da conta. Ao testar, não clique nos próprios anúncios. Solicitações sem anúncio disponível podem deixar o espaço vazio.

O Analytics é independente: só carrega depois de o visitante selecionar a opção de análise de uso. Os eventos do jogo não criam uma fila para envio antes dessa escolha. Ao revogar categorias ativas, o site recarrega para encerrar os scripts. A remoção de cookies de terceiros continua sujeita ao navegador.

## Fontes oficiais consultadas

- Conexão e verificação de propriedade: https://support.google.com/adsense/answer/7584263
- Site ainda não pronto: https://support.google.com/adsense/answer/12176698
- Conteúdo da política de privacidade: https://support.google.com/adsense/answer/1348695
- CMP e consentimento: https://support.google.com/adsense/answer/7670013
- Conteúdo de baixo valor: https://support.google.com/publisherpolicies/answer/11112688
- ads.txt: https://support.google.com/adsense/answer/12171612
