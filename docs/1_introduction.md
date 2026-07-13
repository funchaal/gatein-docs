---
sidebar_position: 1
title: Getting Started
---

# Getting Started

Bem-vindo à documentação oficial da **API de Integração Externa do GateIn**. 

Esta API foi desenvolvida para permitir que parceiros, transportadoras e terminais integrem seus sistemas de forma nativa com a plataforma GateIn. Através deste canal, você pode automatizar fluxos de agendamentos, viagens e validações cadastrais em tempo real.

---

## O que você pode fazer?

Esta API expõe endpoints projetados especificamente para cenários de integração de sistemas B2B:

1. **Gestão de Agendamentos (Appointments):** Ideal para **Terminais** controlarem janelas horárias, placas de veículos, dados cadastrais de motoristas e acompanharem logs detalhados de execução.
2. **Gestão de Viagens (Trips):** Ideal para **Transportadoras** e **Embarcadores** informarem a movimentação de frotas, definirem origens/destinos, associarem motoristas e realizarem rastreabilidade.
3. **Validação Cadastral e Autenticação:** Endpoints utilitários para checar credenciais de chaves de API e decodificar tokens JWT utilizados em dispositivos móveis.

---

## Estrutura de Retorno Padrão

Todas as respostas de sucesso da nossa API retornam um envelope JSON unificado com a seguinte assinatura:

```json title="Exemplo de Resposta (Sucesso)"
{
  "success": true,
  "data": {
    "id": "apt_123456",
    "status": "scheduled"
  }
}
```
