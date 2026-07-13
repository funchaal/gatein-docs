---
sidebar_position: 6
title: Autenticação de Serviços (Services Auth)
---
# Autenticação de Serviços da Empresa (Services Auth)

Quando um usuário acessa um **serviço externo cadastrado por uma empresa parceira** (ex: portal de agendamento, rastreamento de carga ou benefícios), o aplicativo GateIn Mobile autentica o usuário automaticamente através de um handshake seguro baseado em JWT.

---

## Como Funciona o Handshake?

1. O usuário clica em um serviço da empresa no app GateIn Mobile.
2. O app obtém um token JWT de curta duração junto ao servidor GateIn.
3. O app abre uma WebView para a URL do serviço e **injeta o token via JavaScript** no `localStorage` da página antes de ela ser renderizada.
4. O JavaScript da página lê o token do `localStorage` e chama o endpoint `/services/validate-user-token` para validar o usuário.
5. O servidor GateIn retorna os dados do usuário e o site libera o acesso.

---

## Como o Token é Injetado

O GateIn Mobile usa `injectedJavaScript` da WebView para gravar o token no `localStorage` da página do serviço **antes** de qualquer código da página executar:

```javascript
// Código executado pela WebView do GateIn Mobile ao abrir o serviço
(function() {
    window.localStorage.setItem('auth_token', '<jwt_token>');
})();
```

O site da empresa deve ler essa chave ao inicializar:

```javascript
const authToken = window.localStorage.getItem('auth_token');
if (authToken) {
    validateGateInUser(authToken);
}
```

---

## Validando o Token

Após ler o `auth_token` do `localStorage`, faça uma requisição autenticada com sua API Key:

### Headers da Requisição

> [!NOTE]
> Os campos marcados com `*` são obrigatórios.

| Header | Descrição |
| :--- | :--- |
| `*X-API-Key` | Chave de API da sua empresa (`sk_live_...`) |
| `*Auth-Token` | O JWT lido do `localStorage.auth_token` |

### Campos da Resposta (`data`)

> [!NOTE]
> Os campos marcados com `*` são obrigatórios.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `*tax_id` | `string` | CPF ou CNPJ do usuário |
| `name` | `string | null` | Nome completo do usuário |
| `phone` | `string | null` | Telefone com DDD |
| `email` | `string | null` | E-mail cadastrado (pode ser nulo) |

---

## Segurança

| Aspecto | Detalhe |
| :--- | :--- |
| Algoritmo JWT | HS256, assinado com a chave secreta do GateIn |
| Expiração | 3 minutos (180 segundos) — valide imediatamente após abrir a página |
| Autenticação | API Key (`X-API-Key`) obrigatória em todas as chamadas |
| Escopo | O token dá acesso apenas à leitura de dados do usuário |
| Reutilização | Gere um novo token a cada abertura do serviço |


---

## Exemplos de Integração

### Lendo e validando o token (JavaScript / fetch)

```javascript
async function validateGateInUser(authToken) {
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
  console.log('Usuário autenticado:', data.name, data.tax_id);
  return data;
}

// Ponto de entrada — lê o token injetado pelo GateIn Mobile
const authToken = window.localStorage.getItem('auth_token');
if (authToken) {
  validateGateInUser(authToken);
}
```

### Validando no backend (Python)

```python
import requests

def validate_gatein_user(auth_token: str) -> dict | None:
    url = "https://api.gatein.com/api/v1/services/validate-user-token"
    headers = {
        "X-API-Key": "sk_live_suachavesecreta",
        "Auth-Token": auth_token
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()["data"]
    return None
```

---

## Erros Comuns

| HTTP | Code | Causa |
| :--- | :--- | :--- |
| `401` | `EXPIRED_TOKEN` | Token gerado há mais de 3 minutos |
| `401` | `INVALID_TOKEN` | Token malformado ou assinatura inválida |
| `401` | `USER_NOT_FOUND` | Usuário referenciado no token não existe mais |
| `401` | `INVALID_API_KEY` | A `X-API-Key` fornecida é inválida |
