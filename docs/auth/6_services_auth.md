---
sidebar_position: 6
title: Autenticação de Serviços (JWT Handshake)
---

# Autenticação de Serviços — JWT Handshake

Esta seção explica o mecanismo de autenticação que o GateIn usa quando um motorista acessa um **serviço externo cadastrado pelo terminal ou transportadora** diretamente dentro do app.

> [!NOTE]
> Esta seção descreve o **protocolo de autenticação**: como o token é gerado, injetado e validado. Para entender como cadastrar um serviço e a experiência completa do motorista, veja a seção **Serviços no App**.

---

## Como o Handshake Funciona

1. O motorista toca em um serviço no app GateIn Mobile.
2. O app obtém um token JWT de curta duração (3 minutos) junto ao servidor GateIn.
3. O app abre uma WebView na URL do serviço e **injeta o token via JavaScript** no `localStorage` da página antes de ela renderizar.
4. O JavaScript da página lê o token e chama o endpoint `/api/v1/services/validate-user-token` para validar o motorista.
5. O servidor GateIn retorna os dados do motorista e o site libera o acesso.

---

## Como o Token é Injetado

O GateIn Mobile usa `injectedJavaScript` da WebView para gravar o token no `localStorage` da página **antes** de qualquer código da página executar:

```javascript
// Código executado pela WebView do GateIn Mobile ao abrir o serviço
(function() {
    window.localStorage.setItem('auth_token', '<jwt_token>');
})();
```

O site deve ler essa chave ao inicializar:

```javascript
const authToken = window.localStorage.getItem('auth_token');
if (authToken) {
    validateGateInDriver(authToken);
}
```

---

## Validando o Token

Após ler o `auth_token` do `localStorage`, faça uma requisição com sua API Key:

### Headers da Requisição

> [!NOTE]
> Os campos marcados com `*` são obrigatórios.

| Header | Descrição |
| :--- | :--- |
| `*X-API-Key` | Chave de API da sua empresa (`sk_live_...`) |
| `*Auth-Token` | O JWT lido do `localStorage.auth_token` |

### Campos da Resposta (`data`) — Dados do Motorista

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `tax_id` | `string` | CPF do motorista (identificador principal no GateIn) |
| `name` | `string \| null` | Nome completo do motorista |
| `phone` | `string \| null` | Telefone do motorista com DDD |
| `email` | `string \| null` | E-mail cadastrado pelo motorista (pode ser nulo) |

---

## Segurança

| Aspecto | Detalhe |
| :--- | :--- |
| Algoritmo JWT | HS256, assinado com a chave secreta do GateIn |
| Expiração | 3 minutos (180 segundos) — valide imediatamente após abrir a página |
| Autenticação | API Key (`X-API-Key`) obrigatória em todas as chamadas |
| Escopo | O token dá acesso apenas à leitura dos dados do motorista |
| Reutilização | Gere um novo token a cada abertura do serviço |

---

## Exemplos de Integração

### Lendo e validando o token (JavaScript / fetch)

```javascript
async function validateGateInDriver(authToken) {
  const response = await fetch(
    'https://api.gatein.com/api/v1/services/validate-user-token',
    {
      method: 'GET',
      headers: {
        'X-API-Key': 'sk_live_suachavesecreta',
        'Auth-Token': authToken
      }
    }
  );

  if (!response.ok) {
    console.error('Token inválido ou expirado');
    return null;
  }

  const { data } = await response.json();
  // data = { tax_id, name, phone, email } — dados do motorista
  console.log('Motorista autenticado:', data.name, data.tax_id);
  return data;
}

// Ponto de entrada — lê o token injetado pelo GateIn Mobile
const authToken = window.localStorage.getItem('auth_token');
if (authToken) {
  validateGateInDriver(authToken);
}
```

### Validando no backend (Python)

```python
import requests

def validate_gatein_driver(auth_token: str) -> dict | None:
    url = "https://api.gatein.com/api/v1/services/validate-user-token"
    headers = {
        "X-API-Key": "sk_live_suachavesecreta",
        "Auth-Token": auth_token
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()["data"]  # { tax_id, name, phone, email }
    return None
```

---

## Erros Comuns

| HTTP | Code | Causa |
| :--- | :--- | :--- |
| `401` | `EXPIRED_TOKEN` | Token gerado há mais de 3 minutos |
| `401` | `INVALID_TOKEN` | Token malformado ou assinatura inválida |
| `401` | `USER_NOT_FOUND` | Motorista referenciado no token não existe mais |
| `401` | `INVALID_API_KEY` | A `X-API-Key` fornecida é inválida |
