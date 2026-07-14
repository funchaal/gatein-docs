---
sidebar_position: 4
title: Gestão de Agendamentos (Appointments)
---

# Gestão de Agendamentos (Appointments)

O módulo de agendamentos foi feito sob medida para **Terminais logísticos e Portuários** gerenciarem o fluxo planejado de entradas e saídas de motoristas e veículos. Todas as operações são feitas em lote (batch) para otimizar a performance da rede e o processamento de dados.

---

## Status do Agendamento

O campo `status` reflete o ciclo de vida de cada agendamento ao longo da operação:

| Status | Quando ocorre |
| :--- | :--- |
| `SCHEDULED` | Agendamento criado — aguardando o motorista |
| `CHECKED_IN` | Check-in realizado pelo motorista no app. **Atribuído automaticamente** pelo servidor GateIn assim que o check-in é confirmado pelo servidor do terminal |
| `ON_GOING` | Motorista passou pela cancela e está em operação. Atribuído pelo servidor do terminal via API ao confirmar a passagem física |
| `COMPLETED` | Operação encerrada |
| `DELETED` | Agendamento cancelado/removido |

> [!NOTE]
> O status `CHECKED_IN` é definido automaticamente pelo GateIn assim que o handshake de check-in é confirmado. Já o status `ON_GOING` é responsabilidade do servidor do terminal — ele deve chamar o endpoint `PUT /api/v1/appointments` para atualizar o status após detectar a passagem do veículo pela cancela.

---

## Schemas

### Driver

> [!NOTE]
> Os campos marcados com `*` são obrigatórios.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `*tax_id` | `string` | CPF ou CNPJ do motorista (apenas números, sem pontos ou traço) |
| `*driver_license_number` | `string` | Número da CNH |
| `*license_category` | `string` | Categoria de habilitação (ex: `C`, `D`, `E`) |


### Appointment

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `*ref` | `string` | Chave única no seu sistema de origem (ex: ID da Ordem de Carga). Usada para buscar, alterar ou remover o registro |
| `*layout_ref` | `string` | ID do layout de **agendamento** (card e modal) a aplicar a este agendamento. Configura como o agendamento é exibido no app do motorista |
| `schedule_start_time` | `string` ISO-8601 | Horário inicial agendado (ex: `2026-07-15T08:00:00Z`) |
| `schedule_end_time` | `string` ISO-8601 | Horário limite final agendado (ex: `2026-07-15T12:00:00Z`) |
| `schedule_start_tolerance` | `integer` | Margem de tolerância em minutos antes do início (default: `0`) |
| `schedule_end_tolerance` | `integer` | Margem de tolerância em minutos após o término (default: `0`) |
| `vehicle_plate` | `string` | Placa do cavalo mecânico ou veículo principal |
| `summary` | `string` | Observações ou notas textuais sobre a operação |
| `custom_data` | `object` | Campos adicionais chave-valor para armazenamento livre e exibição no app |

---

## Layout de Agendamento vs. Layout de Ticket

> [!IMPORTANT]
> O `layout_ref` do agendamento e o `layout_ref` do ticket são **conceitos diferentes**:
>
> - **`layout_ref` do Appointment** — controla como o agendamento aparece para o motorista no app (card de listagem, modal de detalhes). É definido aqui, na criação do agendamento.
> - **`layout_ref` do Ticket** — controla como o ticket digital é renderizado após o check-in. É definido pelo servidor do terminal na resposta do handshake de check-in (ou via API de Tickets).
>
> Os layouts são configurados separadamente no painel web: **Appointment Layouts** e **Ticket Layouts**.

---

## Customização Dinâmica de Layout (`layout_ref`)

A propriedade `layout_ref` vincula o agendamento a um modelo de layout dinâmico cadastrado, ditando como o GateIn App renderiza o card e o modal de detalhes do agendamento para o motorista.

### Elementos do Card / Modal (`card_layout` / `modal_layout`)

| Elemento | Descrição |
| :--- | :--- |
| `section` | Título de seção agrupador |
| `field` | Linha com rótulo + valor extraído dinamicamente (ex: `driver.name`, `custom_data.nota_fiscal`) |
| `alert` | Bloco de destaque com cores (`purple`, `blue`, `green`, `yellow`, `red`, `gray`) e ícones |
| `qrcode` | Código QR renderizado a partir de uma chave de dados |

---

## Criar Agendamento(s) (POST)

**Endpoint:** `POST /api/v1/appointments` — **`201 Created`**

> [!NOTE]
> Este endpoint aceita tanto um **único objeto** quanto uma **lista (array) de objetos** para criação em lote.

### Regras de Negócio

> **Importante:**
> * **Fail-Fast (Chaves Duplicadas):** Se algum `ref` já existir, toda a transação sofre rollback (`409 Conflict`).
> * **Fail-Fast (Layout Inválido):** `layout_ref` inexistente retorna `400 Bad Request`.
> * **Criação Inteligente de Motoristas:** Se o `tax_id` não existir, o motorista é criado automaticamente. Se já existir, os dados da CNH são atualizados.

### Payload de Exemplo
```json
[
  {
    "driver": {
      "tax_id": "12345678909",
      "driver_license_number": "9876543210",
      "license_category": "E"
    },
    "appointment": {
      "ref": "AG-2026-009",
      "layout_ref": "layout-graos-v1",
      "schedule_start_time": "2026-07-15T14:00:00Z",
      "schedule_end_time": "2026-07-15T16:00:00Z",
      "schedule_start_tolerance": 30,
      "schedule_end_tolerance": 60,
      "summary": "Descarregamento de Soja Orgânica",
      "vehicle_plate": "ABC1D23",
      "custom_data": {
        "nota_fiscal": "45982",
        "peso_estimado_kg": 42000
      }
    }
  }
]
```

### Exemplos de Código

#### cURL
```bash
curl -X POST "https://api.gatein.com/api/v1/appointments" \
  -H "X-API-Key: sk_live_suachave" \
  -H "Content-Type: application/json" \
  -d '[{"driver":{"tax_id":"12345678909","driver_license_number":"9876543210","license_category":"E"},"appointment":{"ref":"AG-2026-009","layout_ref":"layout-graos-v1"}}]'
```

#### Python
```python
import requests

url = "https://api.gatein.com/api/v1/appointments"
headers = {"X-API-Key": "sk_live_suachave", "Content-Type": "application/json"}
payload = [
    {
        "driver": {"tax_id": "12345678909", "driver_license_number": "9876543210", "license_category": "E"},
        "appointment": {
            "ref": "AG-2026-009",
            "layout_ref": "layout-graos-v1",
            "schedule_start_time": "2026-07-15T14:00:00Z",
            "schedule_end_time": "2026-07-15T16:00:00Z",
            "vehicle_plate": "ABC1D23"
        }
    }
]

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

---

## Atualizar Agendamento(s) (PUT)

**Endpoint:** `PUT /api/v1/appointments`

> [!NOTE]
> Este endpoint aceita tanto um **único objeto** de atualização quanto uma **lista (array) de objetos** para atualização em lote.

### Campos Protegidos (não editáveis)

| Campo | Motivo |
| :--- | :--- |
| `id` | Chave primária interna |
| `terminal_id` | Vínculo de propriedade imutável |
| `ref` | Chave de referência externa — usada como identificador |
| `user_tax_id` | Identidade do motorista vinculado |

### Payload de Exemplo
```json
[
  {
    "ref": "AG-2026-009",
    "appointment": {
      "vehicle_plate": "XYZ9Z99",
      "status": "ON_GOING",
      "summary": "Veículo passou pela cancela às 14h32."
    }
  }
]
```

> [!TIP]
> Use `"status": "ON_GOING"` ao detectar a passagem do veículo pela cancela. O GateIn aplica `CHECKED_IN` automaticamente no check-in — o `ON_GOING` fica a cargo do servidor do terminal.

---

## Cancelar / Deletar Agendamento(s) (DELETE)

**Endpoint:** `DELETE /api/v1/appointments`

> [!NOTE]
> Este endpoint aceita tanto uma **única string** de referência quanto um **array de strings** para cancelamento em lote.

Altera o status do agendamento para `DELETED` e insere logs de auditoria. Exemplo de envio em lote:

```json
["AG-2026-009", "AG-2026-010"]
```

---

## Consultar Logs e Histórico (GET)

**Endpoint:** `GET /api/v1/appointments/logs`

### Query Parameters

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `refs` | `string[]` | Repita o parâmetro para múltiplos valores: `?refs=AG-2026-009&refs=AG-2026-010` |


### Resposta de Exemplo
```json
{
  "success": true,
  "data": [
    {
      "ref": "AG-2026-009",
      "found": true,
      "data": {
        "appointment": {
          "id": "c1f72782-b7e1-4560-84c4-f2a8c17df20b",
          "terminal_id": "e3a817a9-17d2-4e92-bc91-2a1c8f1e56ab",
          "ref": "AG-2026-009",
          "layout_ref": "layout-graos-v1",
          "user_tax_id": "12345678909",
          "status": "CHECKED_IN",
          "summary": "Descarregamento de Soja Orgânica",
          "vehicle_plate": "ABC1D23",
          "schedule_start_time": "2026-07-15T14:00:00Z",
          "schedule_end_time": "2026-07-15T16:00:00Z",
          "schedule_start_tolerance": 30,
          "schedule_end_tolerance": 60,
          "custom_data": { "nota_fiscal": "45982" },
          "created_at": "2026-07-15T10:00:00Z",
          "updated_at": "2026-07-15T14:05:00Z"
        },
        "driver": {
          "tax_id": "12345678909",
          "driver_license_number": "9876543210",
          "driver_license_category": "E"
        },
        "logs": [
          { "event": "checked_in", "message": "Check-in realizado.", "created_at": "2026-07-15T14:05:00.000000" },
          { "event": "created", "message": "Agendamento criado via API.", "created_at": "2026-07-15T10:00:00.000000" }
        ]
      }
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
| `409` | `DUPLICATE_KEY` | Um ou mais `ref`s já existem no banco |
| `404` | `REFS_NOT_FOUND` | `ref`s informados no PUT/DELETE não foram encontrados |
