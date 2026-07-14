---
sidebar_position: 1
title: Personalização de Layouts
---

# Personalização de Layouts

Uma das funcionalidades mais poderosas do GateIn é a capacidade de o terminal ou transportadora definir **como as informações serão exibidas para o motorista no aplicativo**. Isso é feito diretamente no painel web, sem necessidade de desenvolvimento.

Cada agendamento (Appointment) e viagem (Trip) tem um `layout_ref` — uma referência para um modelo de layout cadastrado no painel. Esse layout define exatamente o que aparece na tela do motorista, do card de listagem até o modal de detalhes.

Os **tickets digitais** têm seu próprio `layout_ref` separado, configurado em **Ticket Layouts** — um conjunto de layouts distinto dos layouts de agendamento.

---

## Tipos de Layout

| Tipo | Onde configurar | O que controla |
| :--- | :--- | :--- |
| **Appointment Layout** | Painel → Appointment Layouts | Card e modal de agendamentos |
| **Ticket Layout** | Painel → Ticket Layouts | Ticket digital gerado no check-in |
| **Trip Layout** | Painel → Trip Layouts | Card e modal de viagens (transportadoras) |

---

## Appointment Card e Modal

### O Card
O card de listagem de agendamentos é o que o motorista vê ao abrir a tela de agendamentos. Você configura:
- **Header**: título principal do card (ex: referência do agendamento ou tipo de operação)
- **Sub-header**: informação secundária (ex: nome da transportadora)
- **Status tags**: etiquetas coloridas que indicam o status visualmente
- **Body rows**: linhas de informação adicionais (ex: placa, horário)

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO APPOINTMENT CARD, COM O BUILDER À ESQUERDA E O PREVIEW DO CARD AO LADO DIREITO]]

### O Modal de Detalhes
Quando o motorista toca no card, abre o modal com todas as informações detalhadas. Você configura seções, campos, alertas coloridos e QR Codes.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO APPOINTMENT MODAL, COM SEÇÕES EXPANDIDAS E O PREVIEW DO MODAL AO LADO]]

### Elementos disponíveis no Card e Modal

| Elemento | Descrição |
| :--- | :--- |
| `section` | Título de seção agrupador |
| `field` | Linha com rótulo + valor extraído dinamicamente dos dados (ex: `custom_data.nota_fiscal`) |
| `alert` | Bloco de destaque com cores (`purple`, `blue`, `green`, `yellow`, `red`, `gray`) e ícones |
| `qrcode` | QR Code renderizado a partir de qualquer campo dos dados |

---

## Ticket Layout

O ticket digital é o comprovante de acesso gerado no check-in. Você define exatamente o que deve constar, com suporte a mais tipos de elementos do que o card/modal.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO TICKET LAYOUT, COM O PREVIEW DO TICKET RENDERIZADO AO LADO DIREITO, MOSTRANDO CAMPOS, SEÇÕES E TAGS]]

### Elementos do Ticket

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

## Trip Card e Modal

Idêntico ao Appointment Layout, mas para viagens — e disponível apenas para transportadoras. O motorista vê o card com o resumo da rota (origem → destino) e, ao tocar, abre o modal com todos os detalhes configurados.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO TRIP CARD, COM O PREVIEW DO CARD DE VIAGEM]]

---

## Dados Dinâmicos

Os campos dos layouts referenciam **qualquer chave presente nos dados do agendamento ou viagem**, incluindo o objeto `custom_data`. Isso significa que você pode enviar dados específicos da sua operação via API e configurar o app para exibi-los com os rótulos que você definir.

Exemplo: se você envia `custom_data: { "area_coleta": "Quadra C", "nota_fiscal": "45982" }`, pode criar campos no layout que mostram esses valores ao motorista.

> [[PRINT DA TELA DO PAINEL WEB — CAMPO MAPEADO PARA custom_data.area_coleta COM O PREVIEW AO LADO MOSTRANDO O VALOR RENDERIZADO]]

---

## Como vincular um layout a um agendamento/viagem

No painel, cada layout tem um identificador `ref` (ex: `layout-graos-v1`). Ao criar agendamentos ou viagens via API, você passa esse identificador no campo `layout_ref`:

```json title="Vinculando layout ao criar um agendamento"
{
  "appointment": {
    "ref": "AG-2026-009",
    "layout_ref": "layout-graos-v1"
  }
}
```

> [!TIP]
> Você pode ter múltiplos layouts para diferentes tipos de operação: `layout-graos`, `layout-containers`, `layout-minerio`. Cada agendamento referencia o layout correto para sua operação.
