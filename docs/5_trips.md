---
sidebar_position: 5
title: Gestão de Viagens (Trips)
---
# Gestão de Viagens (Trips)

O módulo de viagens foi projetado para **Transportadoras, Embarcadores e Operadores de Frota** registrarem e rastrearem a locomoção de cargas entre pontos de coleta (origem) e entrega (destino). As requisições são processadas em lote (batch) para alta performance.

---

## Schemas

### Driver

> [!NOTE]
> Os campos marcados com `*` são obrigatórios.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `*tax_id` | `string` | CPF ou CNPJ do motorista (apenas números) |
| `*driver_license_number` | `string` | Número da CNH |
| `*license_category` | `string` | Categoria de habilitação (ex: `C`, `D`, `E`) |

### Trip

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `*ref` | `string` | Referência única da viagem no seu TMS/ERP (ex: número do MDF-e ou CT-e). Usada em todas as consultas e atualizações |
| `*layout_ref` | `string` | Código do layout dinâmico associado |
| `vehicle_plate` | `string` | Placa do caminhão/carreta |
| `summary` | `string` | Observações ou detalhes adicionais da rota |
| `start_time` | `string` ISO-8601 | Início previsto da viagem |
| `end_time` | `string` ISO-8601 | Término previsto |
| `schedule_start_tolerance` | `integer` | Margem de tolerância em minutos antes do início (default: `0`) |
| `schedule_end_tolerance` | `integer` | Margem de tolerância em minutos após o término (default: `0`) |
| `custom_data` | `object` | Metadados dinâmicos estruturados da viagem |

### Dados Geográficos de Origem

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `from_location` | `string` | Descrição textual da origem (ex: `Fábrica de Cimento Votorantim`) |
| `origin_street` | `string` | Nome da rua/avenida |
| `origin_number` | `string` | Número predial |
| `origin_city` | `string` | Cidade |
| `origin_state` | `string` | Estado (sigla com 2 caracteres, ex: `SP`) |
| `origin_country` | `string` | País |
| `origin_zip` | `string` | CEP (apenas números) |
| `origin_lat` | `float` | Latitude para geofencing (ex: `-20.1219`) |
| `origin_lng` | `float` | Longitude para geofencing (ex: `-44.1997`) |

### Dados Geográficos de Destino

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `to_location` | `string` | Descrição textual do destino (ex: `Centro de Distribuição Cajamar`) |
| `destiny_street` | `string` | Nome da rua/avenida |
| `destiny_number` | `string` | Número predial |
| `destiny_city` | `string` | Cidade |
| `destiny_state` | `string` | Estado (sigla com 2 caracteres) |
| `destiny_country` | `string` | País |
| `destiny_zip` | `string` | CEP (apenas números) |
| `destiny_lat` | `float` | Latitude do destino |
| `destiny_lng` | `float` | Longitude do destino |

---

## Criar Viagem(ns) (POST)

**Endpoint:** `POST /api/v1/trips` — **`201 Created`**

> [!NOTE]
> Este endpoint aceita tanto um **único objeto** quanto uma **lista (array) de objetos** para criação em lote.

### Regras de Negócio

> **Importante:**
> * **Fail-Fast (Chaves Duplicadas):** Se algum `ref` já existir associado à sua empresa, toda a transação falha (`409 Conflict`).
> * **Fail-Fast (Layout Inválido):** Referências de layout inexistentes retornam `400 Bad Request`.

### Payload de Exemplo
```json
[
  {
    "driver": {
      "tax_id": "98765432109",
      "driver_license_number": "1234567890",
      "license_category": "D"
    },
    "trip": {
      "ref": "TR-MDFE-4819",
      "layout_ref": "layout-mineracao-v2",
      "vehicle_plate": "BRA2E19",
      "start_time": "2026-07-16T06:00:00Z",
      "end_time": "2026-07-16T18:00:00Z",
      "schedule_start_tolerance": 30,
      "schedule_end_tolerance": 60,
      "from_location": "Sede Mineradora Brumadinho",
      "origin_city": "Brumadinho",
      "origin_state": "MG",
      "origin_lat": -20.1219,
      "origin_lng": -44.1997,
      "to_location": "Porto de Tubarão",
      "destiny_city": "Vitória",
      "destiny_state": "ES",
      "destiny_lat": -20.2878,
      "destiny_lng": -40.2882,
      "summary": "Transporte de Minério de Ferro bruto.",
      "custom_data": {
        "mdf_key": "31260712345678901234580010000048191000048198"
      }
    }
  }
]
```

### Exemplos de Código

#### cURL
```bash
curl -X POST "https://api.gatein.com/api/v1/trips" \
  -H "X-API-Key: sk_live_suachave" \
  -H "Content-Type: application/json" \
  -d '[{"driver":{"tax_id":"98765432109","driver_license_number":"1234567890","license_category":"D"},"trip":{"ref":"TR-MDFE-4819","layout_ref":"layout-mineracao-v2","vehicle_plate":"BRA2E19"}}]'
```

#### Python
```python
import requests

url = "https://api.gatein.com/api/v1/trips"
headers = {"X-API-Key": "sk_live_suachave", "Content-Type": "application/json"}
payload = [
    {
        "driver": {"tax_id": "98765432109", "driver_license_number": "1234567890", "license_category": "D"},
        "trip": {
            "ref": "TR-MDFE-4819",
            "layout_ref": "layout-mineracao-v2",
            "vehicle_plate": "BRA2E19",
            "from_location": "Filial SP",
            "to_location": "Porto Santos"
        }
    }
]

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

---

## Atualizar Viagem(ns) (PUT)

**Endpoint:** `PUT /api/v1/trips`

> [!NOTE]
> Este endpoint aceita tanto um **único objeto** de atualização quanto uma **lista (array) de objetos** para atualização em lote.

### Campos Protegidos (não editáveis)

| Campo | Motivo |
| :--- | :--- |
| `id` | Chave primária interna |
| `trucking_company_id` | Vínculo de propriedade imutável |
| `ref` | Chave de referência externa — usada como identificador |
| `driver_id` | Identidade do motorista vinculado |


### Payload de Exemplo
```json
[
  {
    "ref": "TR-MDFE-4819",
    "trip": {
      "vehicle_plate": "NEW3A21",
      "summary": "Placa de cavalo mecânico substituída por pane mecânica."
    }
  }
]
```

---

## Cancelar / Deletar Viagem(ns) (DELETE)

**Endpoint:** `DELETE /api/v1/trips`

> [!NOTE]
> Este endpoint aceita tanto uma **única string** de referência quanto um **array de strings** para cancelamento em lote.

Altera o status da viagem para `DELETED`. Exemplo de envio em lote:

```json
["TR-MDFE-4819"]
```

---

## Consultar Logs e Histórico de Rastreamento (GET)

**Endpoint:** `GET /api/v1/trips/logs`

### Query Parameters

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `refs` | `string[]` | Repita o parâmetro para múltiplos valores: `?refs=TR-MDFE-4819&refs=TR-MDFE-4820` |


### Resposta de Exemplo
```json
{
  "success": true,
  "data": [
    {
      "ref": "TR-MDFE-4819",
      "found": true,
      "data": {
        "trip": {
          "id": "f5e92716-11f8-4cb3-a5c6-c9a7d36d8f1e",
          "trucking_company_id": "b3e9281a-12f8-4cb3-a5c6-d9a7e36d8f92",
          "ref": "TR-MDFE-4819",
          "layout_ref": "layout-mineracao-v2",
          "driver_id": "d1d82761-b7e1-4560-84c4-f2a8c17df20b",
          "vehicle_plate": "NEW3A21",
          "status": "CREATED",
          "summary": "Transporte de minério de ferro",
          "schedule_start_time": "2026-07-16T06:00:00Z",
          "schedule_end_time": "2026-07-16T18:00:00Z",
          "schedule_start_tolerance": 30,
          "schedule_end_tolerance": 60,
          "custom_data": {},
          "origin_street": "Avenida Mineral",
          "origin_number": "1000",
          "origin_city": "Brumadinho",
          "origin_state": "MG",
          "origin_country": "BR",
          "origin_zip": "35460000",
          "origin_lat": -20.1219,
          "origin_lng": -44.1997,
          "destiny_street": "Avenida Portuária",
          "destiny_number": "S/N",
          "destiny_city": "Vitória",
          "destiny_state": "ES",
          "destiny_country": "BR",
          "destiny_zip": "29000000",
          "destiny_lat": -20.3184,
          "destiny_lng": -40.2925,
          "from_location": "Sede Mineradora Brumadinho",
          "to_location": "Porto de Tubarão",
          "created_at": "2026-07-12T12:10:00Z",
          "updated_at": "2026-07-12T12:18:14Z"
        },
        "driver": {
          "tax_id": "98765432109",
          "driver_license_number": "1234567890",
          "driver_license_category": "D"
        },
        "logs": [
          { "event": "updated", "message": "Viagem atualizada via API.", "created_at": "2026-07-12T12:18:14.000000" },
          { "event": "created", "message": "Viagem criada via API.", "created_at": "2026-07-12T12:10:00.000000" }
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
| `400` | `INVALID_LAYOUT_REF` | `layout_ref` não existe para esta transportadora |
| `409` | `DUPLICATE_KEY` | Um ou mais `ref`s já existem no banco |
| `404` | `REFS_NOT_FOUND` | `ref`s informados no PUT/DELETE não foram encontrados |
