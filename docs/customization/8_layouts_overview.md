---
sidebar_position: 1
title: Visão Geral da Personalização
---

# Personalização de Layouts

Uma das funcionalidades mais poderosas do GateIn é a capacidade de o terminal ou transportadora definir **como as informações serão exibidas para o motorista no aplicativo**. Isso é feito diretamente no painel web, sem necessidade de desenvolvimento.

Cada agendamento (Appointment) e viagem (Trip) tem um `layout_ref` — uma referência para um modelo de layout cadastrado no painel. Esse layout define exatamente o que aparece na tela do motorista, do card de listagem até o ticket digital gerado no check-in.

---

## Por que isso importa?

Terminais têm operações muito diferentes entre si. Um terminal de grãos precisa mostrar dados diferentes de um terminal de contêineres. Com o sistema de layouts, cada terminal configura sua experiência ideal sem depender de atualizações do app ou do servidor.

---

## O que você pode personalizar

### Appointment Card
O card de listagem de agendamentos — o que o motorista vê na tela principal ao listar seus agendamentos. Você configura o título, subtítulo, tags de status coloridas e linhas de informação no corpo do card.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO APPOINTMENT CARD, MOSTRANDO O BUILDER COM CAMPOS DRAG-AND-DROP E O PREVIEW AO LADO]]

### Appointment Details Modal
Quando o motorista toca em um agendamento, abre o modal de detalhes. Aqui você configura seções, campos chave-valor, alertas coloridos com ícones e até um QR Code gerado dinamicamente a partir dos dados do agendamento.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO APPOINTMENT MODAL, COM SEÇÕES EXPANDIDAS E PREVIEW AO VIVO DO MODAL]]

### Trip Card
Igual ao Appointment Card, mas para viagens. O card de viagem mostra o resumo da rota com origem e destino, além de campos customizáveis pelo operador.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO TRIP CARD]]

### Trip Details Modal
O modal de detalhes da viagem, também personalizável com seções, campos, alertas e dados de rota.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO TRIP MODAL]]

### Ticket Digital
O ticket gerado no momento do check-in. É o "comprovante digital" que substitui o ticket impresso. Você configura todas as informações que devem constar no ticket, com suporte a campos, seções, tags coloridas, caixas de atenção, instruções numeradas e dados em destaque.

> [[PRINT DA TELA DO PAINEL WEB — EDITOR DO TICKET LAYOUT, COM O TICKET RENDERIZADO AO LADO]]

---

## Elementos disponíveis por contexto

### Card e Modal de Agendamento / Viagem

| Elemento | Descrição |
| :--- | :--- |
| `section` | Título de seção agrupador |
| `field` | Linha com rótulo + valor extraído dinamicamente dos dados do agendamento |
| `alert` | Bloco de destaque com cores (`purple`, `blue`, `green`, `yellow`, `red`, `gray`) e ícones |
| `qrcode` | QR Code renderizado a partir de qualquer campo dos dados |

### Ticket Digital

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

## Como funciona na prática?

No painel web, você vai até a seção de layouts (Appointments ou Trips) e cria um novo layout. Cada layout tem um `ref` (identificador único) que você vai usar no campo `layout_ref` ao criar agendamentos e viagens via API.

```json title="Exemplo: passando layout_ref ao criar um agendamento"
{
  "appointment": {
    "ref": "AG-2026-009",
    "layout_ref": "layout-graos-v1"
  }
}
```

O app vai buscar esse layout e renderizar a tela do motorista exatamente como você configurou.

> [!TIP]
> Você pode ter múltiplos layouts para diferentes tipos de operação. Por exemplo: `layout-graos`, `layout-containers`, `layout-minerio`. Cada agendamento referencia o layout correto para sua operação.

---

## Dados dinâmicos nos campos

Os campos dos layouts podem referenciar **qualquer chave presente nos dados do agendamento ou viagem**, incluindo o objeto `custom_data`. Isso significa que você pode enviar dados específicos da sua operação via API e configurar o app para exibi-los exatamente onde e como quiser.

Exemplo: se você envia `custom_data: { "nota_fiscal": "45982", "area_coleta": "Quadra C" }`, pode criar campos no layout que mostram esses valores ao motorista com os rótulos que você definiu.

> [[PRINT DA TELA DO PAINEL WEB — CAMPO MAPEADO PARA custom_data.area_coleta COM PREVIEW AO LADO]]
