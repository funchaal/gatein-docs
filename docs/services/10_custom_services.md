---
sidebar_position: 1
title: Serviços Personalizados no App
---

# Serviços Personalizados no App

Imagine dar ao motorista acesso ao **portal de agendamento da sua empresa, um sistema de benefícios, consulta de escala ou qualquer outro sistema interno** — diretamente dentro do aplicativo GateIn, sem que ele precise baixar nada ou lembrar de outro login.

É isso que os Serviços Personalizados oferecem. Com apenas a URL do seu site cadastrada no painel web, o GateIn abre sua página dentro do app com o motorista **já autenticado automaticamente**. Sem tela de login, sem senha para digitar.

---

## Como Cadastrar um Serviço

1. Acesse o painel web e clique em **Serviços** no menu lateral.
2. Clique em **Adicionar Serviço**.
3. Informe:
   - **Nome** do serviço (o que o motorista vai ver no app)
   - **URL** do site ou sistema (precisa ser HTTPS)
   - **Ícone** (opcional — para identificação visual)
4. Salve. O serviço já aparece no app para os motoristas da sua empresa.

> [[PRINT DA TELA DO PAINEL WEB — SEÇÃO DE SERVIÇOS, MOSTRANDO OS CARDS DOS SERVIÇOS CADASTRADOS E O FORMULÁRIO DE ADIÇÃO COM OS CAMPOS DE NOME, URL E ÍCONE]]

É só isso. Não precisa de SDK, não precisa de configuração no app. Você informa a URL, e o GateIn cuida do resto.

---

## A Experiência do Motorista

No app, o motorista vê uma seção **Serviços** com os cards dos serviços disponíveis para a empresa dele. Ao tocar em um serviço:

1. O app abre uma tela com o seu site carregado.
2. O motorista já está autenticado — a tela de login do seu site pode ser pulada automaticamente.
3. Ele usa seu sistema normalmente, dentro do app GateIn.

> [[PRINT DA TELA DO APP — LISTAGEM DE SERVIÇOS DISPONÍVEIS, COM OS CARDS DE CADA SERVIÇO E ÍCONES, E A TELA DO WEBVIEW ABERTA COM O SITE CARREGADO]]

---

## Como a Autenticação Funciona

Antes de abrir o seu site, o GateIn injeta automaticamente um **token JWT temporário** no `localStorage` do navegador embutido. Seu site lê esse token e valida com a API GateIn para confirmar a identidade do motorista.

```javascript title="O que o GateIn faz automaticamente (invisível para o usuário)"
(function() {
    window.localStorage.setItem('auth_token', '<jwt_token_temporario>');
})();
```

```javascript title="O que o seu site precisa fazer ao inicializar"
async function init() {
  const authToken = window.localStorage.getItem('auth_token');
  if (!authToken) return; // Usuário não veio do app GateIn

  const response = await fetch(
    'https://api.gatein.com/api/v1/services/validate-user-token',
    {
      headers: {
        'X-API-Key': 'sk_live_suachavesecreta',
        'Auth-Token': authToken
      }
    }
  );

  const { data } = await response.json();
  // data = { tax_id, name, phone, email } — dados do motorista autenticado
  
  // Com o motorista identificado, libere o acesso ao seu sistema
  loginDriver(data.tax_id, data.name);
}

init();
```

Isso é tudo que você precisa implementar. Você recebe o CPF, nome, telefone e e-mail do motorista — o suficiente para identificá-lo no seu sistema.

---

## O Endpoint de Validação

**`GET /api/v1/services/validate-user-token`**

| Header | Obrigatório | Descrição |
| :--- | :--- | :--- |
| `X-API-Key` | ✅ | API Key da sua empresa (`sk_live_...`) |
| `Auth-Token` | ✅ | O JWT lido do `localStorage.auth_token` |

**Resposta de Sucesso:**
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

O token expira em **3 minutos** — valide-o assim que a página carregar.

---

## Validando no Backend (recomendado para dados sensíveis)

Para sistemas mais críticos, faça a validação no servidor em vez do frontend:

```python title="Python"
import requests

def validate_driver(auth_token: str) -> dict | None:
    response = requests.get(
        "https://api.gatein.com/api/v1/services/validate-user-token",
        headers={
            "X-API-Key": "sk_live_suachavesecreta",
            "Auth-Token": auth_token
        }
    )
    return response.json()["data"] if response.ok else None
```

```javascript title="Node.js / Express"
app.post('/login', async (req, res) => {
  const authToken = req.headers['auth-token'];
  const resp = await fetch('https://api.gatein.com/api/v1/services/validate-user-token', {
    headers: { 'X-API-Key': 'sk_live_suachavesecreta', 'Auth-Token': authToken }
  });
  if (!resp.ok) return res.status(401).json({ error: 'Token inválido' });
  const { data } = await resp.json();
  // data.tax_id é o CPF do motorista — use para criar sessão no seu sistema
  const session = createSession(data.tax_id);
  res.json({ session_token: session, driver: data });
});
```

---

## Exemplos de uso

O que você pode oferecer com Serviços Personalizados:

- **Portal de agendamento próprio**: o motorista acessa e vê seus agendamentos sem precisar de outro app
- **Sistema de benefícios**: o motorista consulta saldo, resgata vouchers, tudo autenticado
- **Escala de viagens**: o motorista vê as próximas viagens atribuídas a ele
- **Portal de documentação**: upload de documentos e consulta de status de cadastro
- **Chat de suporte**: integração com sistema de atendimento da transportadora
- **Consulta de notas fiscais e CT-e**: o motorista acessa os documentos da carga

---

## Segurança

| Aspecto | Detalhe |
| :--- | :--- |
| Token JWT | HS256, assinado pelo servidor GateIn |
| Expiração | 3 minutos — valide imediatamente ao carregar |
| Escopo | Apenas leitura dos dados do motorista |
| Transmissão | O site precisa ser HTTPS |
| API Key | Sua chave de API nunca fica exposta no app — fica no seu backend |

> [!CAUTION]
> Nunca exponha sua `X-API-Key` no código JavaScript do frontend. Para validar no lado do cliente, use um endpoint intermediário no seu próprio servidor que detém a chave e faz a chamada ao GateIn.

---

## Erros Comuns

| HTTP | Code | Causa |
| :--- | :--- | :--- |
| `401` | `EXPIRED_TOKEN` | Token gerado há mais de 3 minutos |
| `401` | `INVALID_TOKEN` | Token malformado ou assinatura inválida |
| `401` | `USER_NOT_FOUND` | Motorista referenciado no token não existe mais |
| `401` | `INVALID_API_KEY` | A `X-API-Key` fornecida é inválida |
