---
sidebar_position: 7
title: WebSockets & Check-in em Tempo Real
---

# WebSockets & Check-in em Tempo Real

O check-in no GateIn não é uma simples requisição HTTP — é uma **orquestração em tempo real** entre o app do motorista, o servidor GateIn e o servidor do terminal. Essa comunicação acontece via **WebSockets com o protocolo Socket.IO**, garantindo baixa latência e conexão bidirecional persistente.

---

## Por que WebSockets?

Quando o motorista toca em "Fazer Check-in" no app, precisamos que o servidor do terminal seja notificado **imediatamente** e que a resposta (com o ticket gerado) chegue de volta ao app em segundos. Uma chamada HTTP convencional não seria suficiente para esse tipo de comunicação síncrona entre servidor e equipamento físico.

Com WebSockets, o servidor do terminal mantém uma **conexão aberta e persistente** com o servidor GateIn. Quando chega um check-in, o GateIn simplesmente envia um evento para o servidor do terminal — que processa e responde — tudo em tempo real.

---

## Arquitetura do Fluxo

```
 Motorista (App)          Servidor GateIn           Servidor do Terminal
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

### 1. Conexão Persistente do Servidor do Terminal

O servidor do terminal mantém uma conexão contínua com o servidor GateIn via Socket.IO no namespace `/checkin`. Essa conexão é autenticada pela API Key do terminal e mantida ativa durante toda a operação.

```python title="Exemplo de conexão e handler — Python"
import socketio

sio = socketio.Client()

# Escuta o evento de check-in enviado pelo servidor GateIn
@sio.on('request_checkin', namespace='/checkin')
def on_checkin(data):
    tax_id = data.get('tax_id')
    print(f"Check-in solicitado pelo motorista CPF: {tax_id}")
    
    # Aqui o servidor do terminal faz o processamento local:
    # - Consulta o agendamento vinculado ao CPF
    # - Registra a entrada no sistema interno
    # - Retorna o(s) ticket(s) gerado(s) para o GateIn
    
    return [
        {
            "appointment_ref": "AG-2026-002",
            "ticket": {
                "layout_ref": "ticket-graos-v1",
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

# Conecta ao servidor GateIn com a API Key do terminal
sio.connect(
    'https://api.gatein.com',
    namespaces=['/checkin'],
    auth={'api_key': 'sk_live_suachavesecreta'}
)

sio.wait()
```

```javascript title="Exemplo de conexão e handler — JavaScript"
import { io } from 'socket.io-client';

const socket = io('https://api.gatein.com', {
  namespace: '/checkin',
  auth: { api_key: 'sk_live_suachavesecreta' }
});

socket.on('connect', () => {
  console.log('Servidor do terminal conectado ao GateIn. Aguardando check-ins...');
});

socket.on('request_checkin', (data, callback) => {
  const { tax_id } = data;
  console.log(`Check-in solicitado pelo motorista: ${tax_id}`);

  // Processar localmente e retornar o ticket via callback (Socket.IO ACK)
  callback([
    {
      appointment_ref: 'AG-2026-002',
      ticket: {
        layout_ref: 'ticket-graos-v1',
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
  console.log('Desconectado do GateIn. Tentando reconectar...');
});
```

### 2. O Motorista Solicita Check-in

Quando o motorista toca em "Fazer Check-in" no app, o aplicativo faz uma chamada `POST /api/mobile/checkin/{terminal_id}`. O servidor GateIn verifica se o servidor do terminal está online e dispara o evento.

### 3. Validação de Presença Online

O servidor GateIn mantém um registro em memória das conexões ativas. Se o servidor do terminal estiver offline, a API retorna imediatamente com `503 Service Unavailable` — sem deixar o motorista esperando.

### 4. Handshake via Socket.IO

Com o servidor do terminal online, o GateIn envia o evento `request_checkin` com o CPF do motorista e aguarda a resposta (ACK) por até **10 segundos**.

#### Payload recebido pelo servidor do terminal:
```json
{
  "tax_id": "12345678909"
}
```

#### Resposta esperada (array de tickets):
```json
[
  {
    "appointment_ref": "AG-2026-002",
    "ticket": {
      "layout_ref": "ticket-graos-v1",
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

O GateIn recebe os tickets do servidor do terminal, valida as referências de layout, marca o agendamento como `CHECKED_IN`, persiste os tickets no banco de dados e retorna tudo ao app com `200 OK`. O ticket aparece no app do motorista imediatamente.

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
| Servidor do terminal offline | `503 Service Unavailable` | Sem conexão ativa do servidor do terminal |
| Timeout | `504 Gateway Timeout` | Servidor do terminal não respondeu em 10s |
| Falha de Comunicação | `500 Internal Server Error` | Erro na camada socket |
| Formato Inválido | `502 Bad Gateway` | Resposta não é um array de tickets |
| Layout Inválido | `502 Bad Gateway` | `layout_ref` retornado não existe no banco |

---

## Reconexão Automática

O Socket.IO suporta reconexão automática em caso de queda de rede. Configure no servidor do terminal para garantir que a conexão seja restabelecida rapidamente:

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

---

## Atualizando o Status para ON_GOING

Após o check-in (`CHECKED_IN`), quando o veículo passa fisicamente pela cancela, o servidor do terminal deve atualizar o agendamento para `ON_GOING`:

```python title="Atualizando status após passagem pela cancela (Python)"
import requests

def mark_ongoing(appointment_ref: str):
    requests.put(
        "https://api.gatein.com/api/v1/appointments",
        headers={
            "X-API-Key": "sk_live_suachavesecreta",
            "Content-Type": "application/json"
        },
        json=[{
            "ref": appointment_ref,
            "appointment": {
                "status": "ON_GOING"
            }
        }]
    )
```
