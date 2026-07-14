---
sidebar_position: 3
title: Check-in Antecipado
---

# Check-in Antecipado

O check-in antecipado é um dos principais diferenciais do GateIn. Ele permite que o motorista faça o check-in **antes de chegar na cancela** — e quando a carreta encosta no gate, a passagem já está liberada. Zero espera, zero papel.

---

## Como Funciona

Quando o motorista está dentro do geofence do terminal:

1. O app libera o botão de check-in.
2. O motorista toca em **Fazer Check-in**.
3. O app envia a solicitação ao servidor GateIn.
4. O GateIn se comunica em tempo real com o **servidor do terminal** via WebSocket.
5. O servidor do terminal processa o acesso (pode incluir pesagem, conferência ou geração de dados) e devolve o ticket.
6. O ticket digital aparece no app do motorista em segundos.
7. O status do agendamento é atualizado automaticamente para `CHECKED_IN`.
8. O motorista chega na cancela — que já está pronta para abrir.

> [!NOTE]
> O status `CHECKED_IN` é aplicado automaticamente pelo GateIn assim que o handshake com o servidor do terminal é confirmado. Quando o veículo passa fisicamente pela cancela, é responsabilidade do servidor do terminal atualizar o status para `ON_GOING` via `PUT /api/v1/appointments`.

---

## Mapa e Rota até o Terminal

O app também oferece uma tela de **Mapa** completa. O motorista pode:

- Ver os terminais próximos com marcadores no mapa
- Selecionar um terminal e traçar a **rota** até ele
- Ver a **distância** e o **tempo estimado de viagem** em tempo real
- Abrir o GPS favorito — como o **Google Maps** — com a rota já calculada, com um único toque

> [[PRINT DA TELA DE MAPA DO APP, MOSTRANDO O MAPA COM MARCADORES DE TERMINAIS, UMA ROTA TRAÇADA E O PAINEL INFERIOR COM DISTÂNCIA E TEMPO DE VIAGEM, E O BOTÃO "ABRIR NO MAPS"]]

---

## Protocolo de Comunicação

A comunicação entre o servidor GateIn e o servidor do terminal durante o check-in é feita via **WebSockets com Socket.IO**. Para detalhes técnicos completos sobre o protocolo, eventos e exemplos de código, consulte a seção **Portaria e WebSockets**.
