---
sidebar_position: 6
title: Tickets Digitais
---

# Tickets Digitais

Os tickets digitais são os comprovantes de acesso gerados no momento do check-in. Eles substituem completamente o papel impresso na portaria e ficam disponíveis no app do motorista em tempo real.

> [!IMPORTANT]
> **Ticket vs. Agendamento:** O `layout_ref` do agendamento controla como ele aparece no app (card e modal de detalhes). O `layout_ref` do ticket é separado e controla como o comprovante é renderizado após o check-in. Ambos são configurados no painel web em seções distintas: **Appointment Layouts** e **Ticket Layouts**.

---

## Quando os tickets são criados?

Na maioria dos casos, os tickets são criados automaticamente durante o processo de check-in: o servidor do terminal os gera e retorna via Socket.IO ACK. O GateIn os persiste e os entrega ao motorista em tempo real.

No entanto, também é possível criar, atualizar e remover tickets via API — o que permite integrações mais avançadas onde o próprio sistema do terminal gerencia o ciclo de vida dos tickets.

---

## Schema do Ticket

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `appointment_ref` | `string` | Referência (`ref`) do agendamento ao qual o ticket pertence |
| `layout_ref` | `string` | Referência do layout de ticket (configurado no painel web em **Ticket Layouts**) |
| `content` | `object` | Dados chave-valor do ticket — renderizados conforme o layout configurado |

### Elementos do Layout de Ticket

| Elemento | Descrição |
| :--- | :--- |
| `field` | Linha chave-valor (rótulo em cinza, valor em negrito) |
| `section` | Divisor com título de agrupamento em caixa alta |
| `divider` | Linha separadora horizontal |
| `tag_container` | Grupo de etiquetas coloridas arredondadas |
| `attention` | Caixa de alerta com borda e ícone (ex: uso de EPI obrigatório) |
| `instruction` | Lista numerada com o passo-a-passo que o motorista deve seguir |
| `text` | Parágrafo de texto livre (avisos, regras, termos) |
| `highlight` / `highlight_grid` | Dado em destaque com fonte grande (ex: número da baia, peso na balança) |

---

## Criar Ticket(s) (POST)

**Endpoint:** `POST /api/v1/tickets` — **`201 Created`**

> [!NOTE]
> Este endpoint aceita tanto um **único objeto** quanto uma **lista (array) de objetos** para criação em lote.

### Regras de Negócio

- **Fail-Fast (Layout Inválido):** `layout_ref` inexistente retorna `400 Bad Request`.
- **Fail-Fast (Agendamento Não Encontrado):** Se `appointment_ref` não existir para este terminal, retorna `404 Not Found`.

### Payload de Exemplo

```json
[
  {
    "appointment_ref": "AG-2026-009",
    "layout_ref": "ticket-graos-v1",
    "content": {
      "placa": "ABC-1234",
      "motorista": "Carlos de Oliveira Souza",
      "area_coleta": "Quadra C",
      "booking": "BKG-99281726",
      "armador": "Maersk Line",
      "tipo_operacao": "CARREGAMENTO_SOJA",
      "status": "CHECKED_IN"
    }
  }
]
```

### Exemplos de Código

#### cURL
```bash
curl -X POST "https://api.gatein.com/api/v1/tickets" \
  -H "X-API-Key: sk_live_suachave" \
  -H "Content-Type: application/json" \
  -d '[{"appointment_ref":"AG-2026-009","layout_ref":"ticket-graos-v1","content":{"placa":"ABC-1234","motorista":"Carlos de Oliveira Souza"}}]'
```

#### Python
```python
import requests

url = "https://api.gatein.com/api/v1/tickets"
headers = {"X-API-Key": "sk_live_suachave", "Content-Type": "application/json"}
payload = [
    {
        "appointment_ref": "AG-2026-009",
        "layout_ref": "ticket-graos-v1",
        "content": {
            "placa": "ABC-1234",
            "motorista": "Carlos de Oliveira Souza",
            "area_coleta": "Quadra C",
            "armador": "Maersk Line"
        }
    }
]

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

### Resposta de Sucesso
```json
{
  "success": true,
  "data": {
    "created_ids": ["f5e92716-11f8-4cb3-a5c6-c9a7d36d8f1e"],
    "status": "created"
  }
}
```

---

## Atualizar Ticket(s) (PUT)

**Endpoint:** `PUT /api/v1/tickets`

> [!NOTE]
> Este endpoint aceita tanto um **único objeto** de atualização quanto uma **lista (array) de objetos** para atualização em lote.

A atualização é feita pelo **UUID** do ticket (retornado no `created_ids` ao criar, ou na consulta via GET).

### Payload de Exemplo

```json
[
  {
    "ticket_id": "f5e92716-11f8-4cb3-a5c6-c9a7d36d8f1e",
    "content": {
      "placa": "XYZ-9999",
      "area_coleta": "Quadra D",
      "motorista": "Carlos de Oliveira Souza"
    }
  }
]
```

### Exemplos de Código

#### Python
```python
import requests

url = "https://api.gatein.com/api/v1/tickets"
headers = {"X-API-Key": "sk_live_suachave", "Content-Type": "application/json"}
payload = [
    {
        "ticket_id": "f5e92716-11f8-4cb3-a5c6-c9a7d36d8f1e",
        "content": {"placa": "XYZ-9999", "area_coleta": "Quadra D"}
    }
]

response = requests.put(url, headers=headers, json=payload)
print(response.json())
```

---

## Remover Ticket(s) (DELETE)

**Endpoint:** `DELETE /api/v1/tickets`

> [!NOTE]
> Este endpoint aceita tanto uma **única string** de UUID quanto um **array de strings** para remoção em lote.

```json
["f5e92716-11f8-4cb3-a5c6-c9a7d36d8f1e", "a1b2c3d4-e5f6-7890-abcd-ef1234567890"]
```

#### cURL
```bash
curl -X DELETE "https://api.gatein.com/api/v1/tickets" \
  -H "X-API-Key: sk_live_suachave" \
  -H "Content-Type: application/json" \
  -d '["f5e92716-11f8-4cb3-a5c6-c9a7d36d8f1e"]'
```

---

## Consultar Tickets por Agendamento (GET)

**Endpoint:** `GET /api/v1/tickets`

Retorna todos os tickets vinculados a um ou mais agendamentos.

### Query Parameters

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `appointment_refs` | `string[]` | Repita o parâmetro para múltiplos valores: `?appointment_refs=AG-2026-009&appointment_refs=AG-2026-010` |

### Resposta de Exemplo
```json
{
  "success": true,
  "data": [
    {
      "ref": "AG-2026-009",
      "found": true,
      "data": [
        {
          "id": "f5e92716-11f8-4cb3-a5c6-c9a7d36d8f1e",
          "appointment_id": "c1f72782-b7e1-4560-84c4-f2a8c17df20b",
          "appointment_ref": "AG-2026-009",
          "terminal_id": "e3a817a9-17d2-4e92-bc91-2a1c8f1e56ab",
          "layout_ref": "ticket-graos-v1",
          "content": {
            "placa": "ABC-1234",
            "motorista": "Carlos de Oliveira Souza",
            "area_coleta": "Quadra C",
            "armador": "Maersk Line"
          },
          "created_at": "2026-07-15T14:05:00Z",
          "updated_at": "2026-07-15T14:05:00Z"
        }
      ]
    }
  ]
}
```

---

## Erros Comuns

| HTTP | code | Causa |
| :--- | :--- | :--- |
| `400` | `EMPTY_PAYLOAD` | Array vazio enviado no body |
| `400` | `INVALID_LAYOUT_REF` | `layout_ref` não existe para este terminal |
| `404` | `APPOINTMENT_NOT_FOUND` | `appointment_ref` não encontrado para este terminal |
| `404` | `TICKETS_NOT_FOUND` | UUIDs de ticket informados no PUT/DELETE não foram encontrados |
