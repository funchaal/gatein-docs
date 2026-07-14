---
sidebar_position: 2
title: Geofence & Check-in Antecipado
---

# Geofence e Check-in Antecipado

O check-in antecipado é uma das funcionalidades que mais geram agilidade operacional no GateIn. Ele permite que o motorista faça o check-in **antes mesmo de chegar na cancela**, e quando a carreta encosta no gate, a passagem já está liberada.

---

## O que é o Geofence?

O geofence é um perímetro circular definido no mapa, configurado pelo terminal no painel web. Ele marca a área de "chegada" — a região onde o check-in se torna disponível para o motorista.

Quando o app detecta que o motorista está dentro dessa área, o botão de check-in é liberado. Isso garante que o check-in só acontece quando o motorista está realmente próximo do terminal, e não da cidade ou do estado.

> [[PRINT DA TELA DO PAINEL WEB — CONFIGURAÇÃO DE GEOFENCE, MOSTRANDO O MAPA COM O CÍRCULO LARANJA E OS CONTROLES DE RAIO E COORDENADAS]]

### Configurando o Geofence

1. Acesse o painel web e clique em **Geofence** no menu lateral.
2. Clique no mapa para posicionar o centro do perímetro (geralmente a entrada do terminal).
3. Ajuste o raio em metros de acordo com a área desejada.
4. Clique em **Salvar Configurações**.

> [!TIP]
> Um raio entre 500m e 2km costuma ser ideal para a maioria dos terminais. Raios muito grandes podem permitir check-in de áreas indesejadas; raios muito pequenos podem causar problemas de GPS em áreas com sinal fraco.

---

## O Check-in Antecipado na visão do motorista

No aplicativo, quando o motorista está dentro do geofence:

1. O app detecta automaticamente a proximidade com o terminal.
2. O agendamento ou viagem programada para aquele terminal fica destacado.
3. O botão de check-in é liberado.
4. O motorista toca em "Fazer Check-in".
5. Em segundos, o servidor se comunica com o totem da portaria via WebSocket.
6. O totem processa o acesso (pode incluir pesagem, conferência física, impressão de via) e devolve o ticket.
7. O ticket digital aparece no app do motorista em tempo real.
8. O motorista chega na cancela — que já está pronta para abrir.

**Resultado:** zero espera na portaria, zero papel impresso, máxima agilidade.

---

## O Mapa do Motorista

Além do geofence, o aplicativo tem uma tela de **Mapa** completa. O motorista pode:

- Ver os terminais próximos com marcadores no mapa
- Selecionar um terminal e traçar a **rota** até ele
- Ver a **distância** e o **tempo estimado de viagem**
- Abrir o GPS favorito — como o **Google Maps** — diretamente com a rota já calculada, com um único toque

> [[PRINT DA TELA DE MAPA DO APP, MOSTRANDO O MAPA COM MARCADORES DE TERMINAIS, UMA ROTA TRAÇADA ATÉ O TERMINAL E O PAINEL COM DISTÂNCIA E TEMPO]]

---

## Comunicados (Announcements)

Além do geofence para o check-in, o terminal pode publicar **comunicados** que aparecem para os motoristas no app. Os comunicados são configurados no painel web e podem ter:

- Título e descrição
- Imagem de capa com posicionamento ajustável
- Período de exibição (data/hora de início e fim)
- Status ativo/inativo

Os comunicados são exibidos para motoristas que **têm agendamento ou viagem programada para aquele terminal** ou que **estão próximos da área** — exatamente o público certo, na hora certa.

> [[PRINT DA TELA DO PAINEL WEB — CRIAÇÃO DE COMUNICADO, MOSTRANDO OS CAMPOS DE TÍTULO, DESCRIÇÃO, IMAGEM E PERÍODO DE VALIDADE]]

> [[PRINT DA TELA DO APP — LISTA DE COMUNICADOS ATIVOS, MOSTRANDO O CARD DO COMUNICADO COM IMAGEM E TEXTO]]

---

## Gestão de Usuários do Painel

O painel web do GateIn suporta **múltiplos usuários** com permissões diferentes. O primeiro usuário administrador é criado e enviado pela equipe GateIn no momento do onboarding. A partir daí, o administrador pode criar novos usuários e definir **quais módulos cada um pode acessar e modificar**.

Isso permite, por exemplo, que um operador de portaria veja os agendamentos mas não possa alterar os layouts — enquanto o coordenador de operações tem acesso completo às configurações.

> [[PRINT DA TELA DO PAINEL WEB — GESTÃO DE USUÁRIOS E PERMISSÕES]]
