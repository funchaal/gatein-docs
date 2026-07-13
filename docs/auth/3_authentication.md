---
sidebar_position: 3
title: Autenticação via API Key
---
# Autenticação via API Key

Para autenticar suas requisições, inclua a sua chave de API no header `X-API-Key` de todas as chamadas.

## Headers Obrigatórios

| Header | Formato | Exemplo |
| :--- | :--- | :--- |
| `X-API-Key` | Começa com `sk_live_` | `sk_live_prod_abc123xyz` |

## Resposta do endpoint `/validate-api-key`

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `success` | `boolean` | `true` em caso de sucesso |
| `data.type` | `string` | Tipo da empresa: `terminal` ou `trucking` |
| `data.username` | `string` | Username da empresa no GateIn |
| `data.name` | `string` | Razão social da empresa |
| `data.tax_id` | `string` | CNPJ da empresa |

## Erros

| HTTP | `code` | Causa |
| :--- | :--- | :--- |
| `401` | `INVALID_API_KEY_FORMAT` | Chave sem prefixo `sk_live_` ou malformada |
