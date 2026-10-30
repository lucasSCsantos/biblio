# Comparações por navegador em um serviço próprio

As comparações entre jogadores usam um serviço em Cloudflare Workers com banco D1, mantendo a hospedagem estática do Biblio. O serviço recebe conclusões por modo e data local, identifica o participante por um segredo persistido no navegador e aceita uma importação única dos totais locais anteriores. Isso permite comparações independentes do Google Analytics, preserva a experiência sem cadastro e evita usar relatórios de análise como fonte operacional dos resultados.

Trocar de navegador ou apagar seus dados cria outra identidade; os totais importados são histórico informado pelo navegador, não resultados antigos verificados. As comparações são recreativas, sem lista pública de nomes ou garantia antifraude. Começamos no plano gratuito, com resultados pendentes e histórico local disponíveis quando o serviço falhar ou atingir os limites; qualquer contratação paga é uma decisão posterior.
