---
sidebar_position: 7
---

# Integração de Segurança Online

O GateIn permite que os terminais configurem uma **Integração de Segurança Obrigatória** que os motoristas devem concluir antes de realizar operações no terminal. Esta integração é feita no formato de um vídeo instrutivo que o motorista deve assistir até o fim através do aplicativo móvel.

## Como Funciona

1. **Configuração no Web App (Terminais):**
   - Na página de **Configurações da Empresa** no Web App, os administradores do terminal podem ativar o módulo "Integração de Segurança Online".
   - Deve ser informada a **URL do Vídeo** (por exemplo, um link do YouTube não listado).
   - Opcionalmente, pode ser adicionada uma **URL de Formulário** (ex: Google Forms) para avaliação, se necessário.
   - Existe uma chave **"Bloquear Check-in Remoto"** que, se ativada, impede o motorista de iniciar a viagem (fazer check-in antecipado) caso ele ainda não tenha concluído a integração.

2. **No Aplicativo do Motorista:**
   - Ao visualizar os cards de agendamento na tela inicial ou lista de operações, um alerta azul de **"Integração obrigatória pendente"** será exibido se o motorista estiver com a integração pendente.
   - Ao abrir os detalhes do agendamento, um botão grande direciona o motorista para a tela de visualização do vídeo.
   - A tela de integração obriga o motorista a permanecer na página até o final do vídeo. O botão de concluir fica desabilitado e mostra o progresso. Apenas ao final o motorista pode registrar a conclusão.

3. **Validade e Registro:**
   - O sistema do GateIn registra a data de conclusão da integração vinculada ao CPF (`tax_id`) do motorista e ao `company_id` do terminal.
   - Com isso, a integração tem validade e, se vencida (configurável), o sistema exigirá que o vídeo seja assistido novamente em futuras operações.

## Casos de Uso

*   **Instruções de Segurança Específicas do Site:** Ideal para apresentar rotas internas, uso de EPIs e proibições antes mesmo de o caminhão chegar à portaria.
*   **Redução de Tempo em Portaria:** Ao repassar o treinamento de integração para o aplicativo móvel antes da chegada, o tempo de fila e retenção na portaria é reduzido significativamente.
