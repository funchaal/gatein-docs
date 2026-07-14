---
sidebar_position: 1
title: Serviços Personalizados no App
---

# Serviços Personalizados no App

O GateIn permite que terminais e transportadoras ofereçam **serviços próprios diretamente dentro do aplicativo** — como portais de agendamento, consulta de escala, acesso a benefícios ou qualquer sistema web interno. O motorista acessa o serviço com um único toque, já autenticado automaticamente. Sem login extra, sem senha para lembrar.

---

## Como funciona?

O terminal cadastra a URL do seu site (ou sistema web interno) no painel web do GateIn. Quando o motorista toca no serviço, o app abre uma **WebView** (navegador embutido) apontando para essa URL.

Antes de renderizar a página, o GateIn **injeta automaticamente um token JWT temporário** no `localStorage` do navegador. Seu site lê esse token e valida com a API GateIn para confirmar a identidade do motorista. Tudo isso acontece em milissegundos, sem interação do usuário.

---

## O Fluxo Passo a Passo

```
 Motorista toca no serviço
         │
         ▼
 App GateIn obtém token JWT temporário (3 min de validade)
         │
         ▼
 App abre WebView na URL do seu serviço
         │
         ▼
 App injeta token no localStorage antes da página carregar
   window.localStorage.setItem('auth_token', '<jwt_token>')
         │
         ▼
 Seu JavaScript lê o token e chama a API GateIn para validar
   GET /api/v1/services/validate-user-token
         │
         ▼
 GateIn retorna: tax_id, name, phone, email do motorista
         │
         ▼
 Seu sistema libera o acesso com os dados do usuário
```

---

## O que seu site precisa fazer

Apenas **uma coisa**: ao inicializar, ler o token do `localStorage` e validá-lo com a API GateIn.

```javascript title="Ponto de entrada do seu site (ex: main.js ou App.jsx)"
async function initGateInAuth() {
  const authToken = window.localStorage.getItem('auth_token');
  
  if (!authToken) {
    // Usuário não veio do app GateIn — redirecione para login normal
    return null;
  }
  
  const user = await validateGateInUser(authToken);
  return user;
}

async function validateGateInUser(authToken) {
  const response = await fetch(
    'https://api.gatein.com/api/v1/services/validate-user-token',
    {
      method: 'GET',
      headers: {
        'X-API-Key': 'sk_live_suachavesecreta',  // API Key da sua empresa
        'Auth-Token': authToken                    // Token injetado pelo app
      }
    }
  );

  if (!response.ok) {
    console.error('Token inválido ou expirado');
    return null;
  }

  const { data } = await response.json();
  // data = { tax_id, name, phone, email }
  console.log('Motorista autenticado:', data.name, data.tax_id);
  return data;
}

// Inicializa ao carregar a página
initGateInAuth().then(user => {
  if (user) {
    // Usuário autenticado — libere o acesso
    renderApp(user);
  }
});
```

---

## Validando no Backend (recomendado para dados sensíveis)

Se preferir validar no seu servidor (mais seguro para dados sensíveis), faça a chamada de validação no backend:

```python title="Validação no backend — Python"
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

# No seu endpoint de login/sessão:
@app.post("/session")
def create_session(auth_token: str = Header(...)):
    user = validate_gatein_user(auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Cria sessão no seu sistema com os dados do motorista
    return {"session_id": create_local_session(user["tax_id"])}
```

```javascript title="Validação no backend — Node.js/Express"
const express = require('express');
const fetch = require('node-fetch');

app.get('/session', async (req, res) => {
  const authToken = req.headers['auth-token'];
  
  const response = await fetch(
    'https://api.gatein.com/api/v1/services/validate-user-token',
    {
      headers: {
        'X-API-Key': 'sk_live_suachavesecreta',
        'Auth-Token': authToken
      }
    }
  );

  if (!response.ok) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const { data } = await response.json();
  // data.tax_id, data.name, data.phone, data.email
  
  const sessionToken = createLocalSession(data.tax_id);
  res.json({ session_token: sessionToken, user: data });
});
```

---

## O Endpoint de Validação

**`GET /api/v1/services/validate-user-token`**

### Headers da Requisição

| Header | Obrigatório | Descrição |
| :--- | :--- | :--- |
| `X-API-Key` | ✅ | API Key da sua empresa (`sk_live_...`) |
| `Auth-Token` | ✅ | O JWT lido do `localStorage.auth_token` |

### Resposta de Sucesso (`200 OK`)

```json
{
  "success": true,
  "data": {
    "tax_id": "12345678909",
    "name": "Carlos de Oliveira Souza",
    "phone": "11999887766",
    "email": null
  }
}
```

### Campos da Resposta

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `tax_id` | `string` | CPF ou CNPJ do motorista (identificador principal) |
| `name` | `string \| null` | Nome completo do motorista |
| `phone` | `string \| null` | Telefone com DDD |
| `email` | `string \| null` | E-mail cadastrado (pode ser nulo) |

### Erros

| HTTP | `code` | Causa |
| :--- | :--- | :--- |
| `401` | `EXPIRED_TOKEN` | Token gerado há mais de 3 minutos |
| `401` | `INVALID_TOKEN` | Token malformado ou assinatura inválida |
| `401` | `USER_NOT_FOUND` | Usuário referenciado no token não existe mais |
| `401` | `INVALID_API_KEY` | A `X-API-Key` fornecida é inválida |

---

## Segurança

| Aspecto | Detalhe |
| :--- | :--- |
| Algoritmo JWT | HS256, assinado pelo servidor GateIn |
| Expiração do token | **3 minutos** — valide imediatamente ao carregar a página |
| Escopo | Apenas leitura dos dados do usuário — sem permissões de escrita |
| Reutilização | Um novo token é gerado a cada abertura do serviço |
| Transmissão | O token é injetado no `localStorage` — use HTTPS em produção |

> [!IMPORTANT]
> O token expira em 3 minutos. Valide-o assim que a página carregar. Se o usuário ficar com a aba aberta e tentar validar depois, o token já terá expirado — gere uma nova sessão local no seu sistema logo após a validação inicial.

---

## Exemplo de Implementação Completa (React)

```jsx title="App.jsx — Exemplo de app React integrado ao GateIn"
import { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authToken = window.localStorage.getItem('auth_token');
    
    if (!authToken) {
      setError('Acesso permitido apenas pelo app GateIn.');
      setLoading(false);
      return;
    }

    fetch('https://api.gatein.com/api/v1/services/validate-user-token', {
      headers: {
        'X-API-Key': 'sk_live_suachavesecreta',
        'Auth-Token': authToken
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Token inválido ou expirado');
        return res.json();
      })
      .then(({ data }) => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Autenticando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h1>Bem-vindo, {user.name}!</h1>
      <p>CPF: {user.tax_id}</p>
      {/* Seu conteúdo personalizado aqui */}
    </div>
  );
}
```

---

## Cadastrando um Serviço no Painel Web

> [[PRINT DA TELA DO PAINEL WEB — SEÇÃO DE SERVIÇOS DA EMPRESA, MOSTRANDO A LISTAGEM DE SERVIÇOS CADASTRADOS E O FORMULÁRIO DE ADIÇÃO COM CAMPOS DE NOME, URL E ÍCONE]]

1. Acesse o painel web e vá em **Serviços** no menu lateral.
2. Clique em **Adicionar Serviço**.
3. Informe o nome do serviço (que aparecerá no app para o motorista), a URL e um ícone.
4. Salve. O serviço já ficará disponível no app para os motoristas associados à sua empresa.

> [!TIP]
> Seu site precisa ser acessível via HTTPS para funcionar na WebView do app. URLs `http://` não são suportadas em produção por razões de segurança.
