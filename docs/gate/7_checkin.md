---
sidebar_position: 7
title: WebSockets & Check-in em Tempo Real
---

# WebSockets & Check-in em Tempo Real

O check-in no GateIn não é uma simples requisição HTTP — é uma **orquestração em tempo real** entre o app do motorista, o servidor e o equipamento físico da portaria. Essa comunicação acontece via **WebSockets com o protocolo Socket.IO**, garantindo baixa latência e conexão bidirecional persistente.

---

## Por que WebSockets?

Quando o motorista toca em "Fazer Check-in" no app, precisamos que o totem físico da portaria seja notificado **imediatamente** e que a resposta (com o ticket gerado) chegue de volta ao app em segundos. Uma chamada HTTP convencional não seria suficiente para esse tipo de comunicação síncrona entre servidor e hardware físico.

Com WebSockets, o totem mantém uma **conexão aberta e persistente** com o servidor. Quando chega um check-in, o servidor simplesmente envia um evento para o totem — que processa e responde — tudo em tempo real.

---

## Arquitetura do Fluxo

```
 Motorista (App)          Servidor GateIn           Totem (Portaria)
       │                        │                         │
       │── POST /checkin ───────▶│                         │
       │                        │── [Socket.IO event] ───▶│
       │                        │   request_checkin        │
       │                        │                         │ (processa, gera ticket)
       │                        │◀── [Socket.IO ACK] ─────│
       │                        │   [{ticket: {...}}]      │
       │◀── 200 OK + tickets ───│                         │
       │                        │                         │
```

---

## Passo a Passo do Fluxo Completo

### 1. Conexão Persistente do Totem

O equipamento físico da portaria (totem, cancela, sistema de controle de acesso) mantém uma conexão contínua com o servidor GateIn via Socket.IO no namespace `/checkin`. Essa conexão é autenticada pela API Key do terminal e mantida ativa durante toda a operação.

```python title="Exemplo de conexão — cliente Python (para o totem)"
import socketio

sio = socketio.Client()

# Escuta o evento de check-in enviado pelo servidor
@sio.on('request_checkin', namespace='/checkin')
def on_checkin(data):
    tax_id = data.get('tax_id')
    print(f"Check-in solicitado pelo motorista: {tax_id}")
    
    # Aqui o totem faz o processamento local:
    # - conferência física
    # - pesagem na balança
    # - impressão de via (opcional)
    
    # Retorna os tickets gerados para o servidor
    return [
        {
            "appointment_ref": "AG-2026-002",
            "ticket": {
                "layout_ref": "3",
                "content": {
                    "placa": "ABC-1234",
                    "status": "CHECKED_IN",
                    "motorista": "Carlos de Oliveira Souza",
                    "area_coleta": "Quadra C",
                    "booking": "BKG-99281726",
                    "armador": "Maersk Line"
                }
            }
        }
    ]

# Conecta ao servidor com a API Key do terminal
sio.connect(
    'https://api.gatein.com',
    namespaces=['/checkin'],
    auth={'api_key': 'sk_live_suachavesecreta'}
)

sio.wait()
```

```javascript title="Exemplo de conexão — cliente JavaScript (para o totem)"
import { io } from 'socket.io-client';

const socket = io('https://api.gatein.com', {
  namespace: '/checkin',
  auth: { api_key: 'sk_live_suachavesecreta' }
});

socket.on('connect', () => {
  console.log('Totem conectado ao GateIn. Aguardando check-ins...');
});

socket.on('request_checkin', (data, callback) => {
  const { tax_id } = data;
  console.log(`Check-in solicitado: ${tax_id}`);

  // Processa o check-in localmente...

  // Retorna os tickets via callback (Socket.IO ACK)
  callback([
    {
      appointment_ref: 'AG-2026-002',
      ticket: {
        layout_ref: '3',
        content: {
          placa: 'ABC-1234',
          status: 'CHECKED_IN',
          motorista: 'Carlos de Oliveira Souza',
          area_coleta: 'Quadra C'
        }
      }
    }
  ]);
});

socket.on('disconnect', () => {
  console.log('Totem desconectado. Tentando reconectar...');
});
```

### 2. O Motorista Solicita Check-in

Quando o motorista toca em "Fazer Check-in" no app, o aplicativo faz uma chamada `POST /api/mobile/checkin/{terminal_id}`. O servidor verifica se o totem daquele terminal está online e dispara o evento.

### 3. Validação de Presença Online

Antes de enviar qualquer evento, o servidor verifica se há uma conexão ativa registrada para aquele terminal. Se o totem estiver offline, a API retorna imediatamente com `503 Service Unavailable` — sem deixar o motorista esperando.

### 4. Handshake via Socket.IO

Com o totem online, o servidor envia o evento `request_checkin` com o CPF/CNPJ do motorista (`tax_id`) e aguarda a resposta (ACK) do totem por até **10 segundos**.

#### Payload recebido pelo totem:
```json
{
  "tax_id": "12345678909"
}
```

#### Resposta esperada do totem (array de tickets):
```json
[
  {
    "appointment_ref": "AG-2026-002",
    "ticket": {
      "layout_ref": "3",
      "content": {
        "placa": "ABC-1234",
        "status": "CHECKED_IN",
        "armador": "Maersk Line",
        "booking": "BKG-99281726",
        "motorista": "Carlos de Oliveira Souza",
        "created_at": "2026-06-25T14:30:00Z",
        "area_coleta": "Quadra C",
        "placa_carreta": "XYZ-9876",
        "tipo_operacao": "CARREGAMENTO_SOJA"
      }
    }
  }
]
```

### 5. Persistência e Confirmação

O servidor recebe os tickets do totem, valida as referências de layout, marca o agendamento como `CHECKED_IN`, grava os tickets no banco de dados e retorna tudo ao app do motorista com `200 OK`. O ticket aparece imediatamente no app.

---

## Parâmetros de Conexão

| Parâmetro | Valor |
| :--- | :--- |
| **URL base** | `https://api.gatein.com` |
| **Namespace** | `/checkin` |
| **Autenticação** | API Key via `auth.api_key` ou query param `?api_key=sk_live_...` |
| **Evento recebido** | `request_checkin` |
| **Resposta** | Array de tickets via Socket.IO ACK (callback) |
| **Timeout do servidor** | 10 segundos |

---

## Tratamento de Erros

| Situação | Status HTTP | Causa |
| :--- | :--- | :--- |
| Terminal Offline | `503 Service Unavailable` | Totem sem conexão ativa |
| Timeout | `504 Gateway Timeout` | Totem não respondeu em 10s |
| Falha de Comunicação | `500 Internal Server Error` | Erro na camada socket |
| Formato Inválido | `502 Bad Gateway` | Resposta do totem não é um array de tickets |
| Layout Inválido | `502 Bad Gateway` | `layout_ref` retornado não existe no banco |

---

## O Ticket Digital em Tempo Real

O ticket gerado no check-in é a evolução do papel impresso. Ele aparece no app do motorista imediatamente após o check-in ser confirmado, com todas as informações da operação formatadas conforme o layout configurado pelo terminal.

O motorista pode visualizar o ticket a qualquer momento na tela de Tickets do app. Sem papel, sem perda, sem fila no guichê.

> [[PRINT DA TELA DO APP — TICKET DIGITAL EXIBIDO APÓS O CHECK-IN, MOSTRANDO OS CAMPOS CONFIGURADOS PELO TERMINAL]]

---

## Reconexão Automática

O cliente Socket.IO tem suporte nativo a reconexão automática em caso de queda de rede. Recomendamos configurar a política de reconexão no cliente do totem para garantir que a conexão seja restabelecida o mais rápido possível:

```python title="Reconexão automática (Python)"
sio = socketio.Client(
    reconnection=True,
    reconnection_attempts=0,  # Tenta indefinidamente
    reconnection_delay=1,     # Começa com 1 segundo
    reconnection_delay_max=5  # Máximo de 5 segundos entre tentativas
)
```

```javascript title="Reconexão automática (JavaScript)"
const socket = io('https://api.gatein.com', {
  namespace: '/checkin',
  auth: { api_key: 'sk_live_suachavesecreta' },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});
```
