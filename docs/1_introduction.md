---
sidebar_position: 1
title: O que é o GateIn?
---

# O que é o GateIn?

O GateIn é uma plataforma completa de gestão de acesso para terminais logísticos e portuários. Ele conecta **terminais**, **transportadoras** e **motoristas** num único ecossistema digital — do agendamento até a saída pela cancela.

A proposta é simples: eliminar filas, papel e tempo perdido na portaria. Com o GateIn, o motorista já chega com o check-in feito, o ticket digital no bolso e a rota traçada no celular.

---

## Para quem é o GateIn?

### Para o Terminal / Transportadora

Quem opera o terminal ou a transportadora tem controle total sobre o fluxo de veículos. Através de uma **API REST simples**, você envia agendamentos e viagens diretamente do seu sistema (TMS, ERP, WMS) para o GateIn. Não é preciso desenvolver um portal próprio — basta fazer chamadas HTTP com sua chave de API. É integração de verdade, com esforço mínimo.

Além da API, você acessa o **painel web** do GateIn para configurar como cada agendamento e viagem vai aparecer para o motorista, definir o geofence da portaria, publicar comunicados e muito mais.

### Para o Motorista

O motorista usa o **aplicativo GateIn Mobile** (Android/iOS). Lá ele vê todos os seus agendamentos e viagens — com todas as informações que o terminal quiser mostrar —, faz o check-in antecipado antes mesmo de chegar ao gate, recebe o ticket digital em tempo real e ainda pode traçar a rota até o terminal no seu GPS favorito, como o Google Maps.

---

## Como o GateIn funciona na prática?

Imagine o seguinte cenário:

1. O terminal cria um agendamento para o motorista João via API — informando placa, janela horária, tipo de carga e qualquer outro dado relevante.
2. João abre o aplicativo e vê o agendamento com todas as informações, organizadas exatamente como o terminal configurou.
3. Quando João está chegando, o app detecta que ele está dentro da área do terminal (geofence). João clica em "Fazer Check-in" no app.
4. O servidor se comunica em tempo real com o totem físico da portaria via WebSocket. Em segundos, o totem processa o acesso e envia o ticket de volta para o app de João.
5. João chega na cancela, o check-in já está feito, a cancela abre. Sem fila, sem papel, sem espera.

---

## Os ganhos em resumo

| Para o Terminal / Transportadora | Para o Motorista |
| :--- | :--- |
| Integração via API REST simples (POST, PUT, DELETE) | App disponível em Android e iOS |
| Controle total da apresentação das informações via painel web | Todos os agendamentos e viagens em um só lugar |
| Cadastro e atualização automática de dados dos motoristas | Check-in antecipado — a cancela já está pronta quando chega |
| Visibilidade em tempo real dos tickets e status de acesso | Ticket digital — sem papel impresso |
| Eliminação de tickets físicos impressos | Rota até o terminal com distância e tempo de viagem |
| Comunicados direcionados a motoristas agendados ou próximos | Abertura do GPS favorito (ex: Google Maps) direto do app |
| Geofence configurável para validar o check-in por localização | Comunicados e avisos do terminal em tempo real |

---

## Alta personalização, sem complicação

Um dos diferenciais do GateIn é a personalização. Você define, via painel web, **como cada agendamento e viagem vai ser exibido para o motorista**. Isso inclui:

- Quais campos aparecem no card de listagem (o resumo do agendamento)
- Quais informações são mostradas no modal de detalhes (quando o motorista abre o agendamento completo)
- O layout visual do ticket digital gerado no check-in
- Cores, ícones, alertas e seções de destaque

Tudo isso sem precisar alterar uma linha de código. O terminal configura no painel, e o app aplica automaticamente.

---

## Integração mínima, resultado máximo

A integração com o GateIn é feita por **endpoints HTTP convencionais**. Para criar um agendamento, basta um `POST` com os dados do motorista e da operação. Para atualizar, um `PUT`. Para cancelar, um `DELETE`. Sem SDKs proprietários, sem protocolos exóticos.

Veja como criar um agendamento em apenas algumas linhas:

```bash
curl -X POST "https://api.gatein.com/api/v1/appointments" \
  -H "X-API-Key: sk_live_suachave" \
  -H "Content-Type: application/json" \
  -d '[{
    "driver": {
      "tax_id": "12345678909",
      "driver_license_number": "9876543210",
      "license_category": "E"
    },
    "appointment": {
      "ref": "AG-2026-001",
      "layout_ref": "layout-graos-v1",
      "schedule_start_time": "2026-07-20T08:00:00Z",
      "schedule_end_time": "2026-07-20T10:00:00Z",
      "vehicle_plate": "ABC1D23"
    }
  }]'
```

Simples assim.

---

## Estrutura desta documentação

Esta documentação cobre tudo que você precisa para integrar e operar o GateIn:

| Seção | O que você vai encontrar |
| :--- | :--- |
| **Autenticação** | Como gerar e usar sua chave de API |
| **Agendamentos (Appointments)** | API completa para terminais gerenciarem agendamentos |
| **Viagens (Trips)** | API completa para transportadoras gerenciarem viagens |
| **Personalização de Layouts** | Como configurar cards, modais e tickets no painel web |
| **WebSockets & Check-in** | O protocolo de check-in em tempo real via Socket.IO |
| **Geofence** | Configuração do perímetro de validação de localização |
| **Comunicados (Announcements)** | Como publicar avisos para motoristas no app |
| **Serviços Personalizados** | Como hospedar um site embutido no app com autenticação automática |

---

## Estrutura de Resposta Padrão

Todas as respostas de sucesso da API retornam um envelope JSON unificado:

```json title="Resposta de sucesso"
{
  "success": true,
  "data": {
    "id": "apt_123456",
    "status": "scheduled"
  }
}
```

Erros seguem este padrão:

```json title="Resposta de erro"
{
  "detail": {
    "code": "DUPLICATE_KEY",
    "message": "Um ou mais agendamentos já existem com as referências enviadas.",
    "suggestion": "Para alterá-los, utilize a rota PUT /appointments.",
    "conflicting_refs": ["AG-2026-001"]
  }
}
```
