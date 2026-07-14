---
sidebar_position: 1
title: Painel Web — Visão Geral
---

# Painel Web (Web App)

O painel web é o centro de controle do GateIn para terminais e transportadoras. É por lá que você configura layouts, gerencia usuários, define o geofence, cria comunicados e muito mais — tudo sem precisar alterar uma linha de código ou abrir um chamado de suporte.

O acesso é feito com **login e senha**, em `https://app.gatein.com` (ou na URL personalizada do seu terminal).

---

## O que cada tipo de empresa pode acessar

O GateIn distingue dois tipos de empresa — terminais e transportadoras — e cada um tem acesso a módulos distintos do painel:

### Terminal

| Módulo | Descrição |
| :--- | :--- |
| **Appointment Layouts** | Configura como os agendamentos aparecem no app do motorista (card e modal) |
| **Ticket Layouts** | Configura o layout do ticket digital gerado no check-in |
| **Geofence** | Define o perímetro de validação para o check-in antecipado |
| **Comunicados** | Publica avisos para motoristas agendados ou próximos |
| **Serviços** | Cadastra URLs de serviços externos que ficam disponíveis no app |
| **Informações da Empresa** | Dados cadastrais, endereço, contato |
| **Usuários** | Gerencia acessos ao painel web |
| **Chaves de API** | Gera e rotaciona a chave de integração |

> [!NOTE]
> Terminais **não têm acesso** ao módulo de Trip Layouts — que é exclusivo das transportadoras.

### Transportadora

| Módulo | Descrição |
| :--- | :--- |
| **Trip Layouts** | Configura como as viagens aparecem no app do motorista (card e modal) |
| **Comunicados** | Publica avisos para motoristas |
| **Serviços** | Cadastra URLs de serviços externos |
| **Informações da Empresa** | Dados cadastrais |
| **Usuários** | Gerencia acessos ao painel web |
| **Chaves de API** | Gera e rotaciona a chave de integração |

> [!NOTE]
> Transportadoras **não têm acesso** aos módulos de Appointment Layouts, Ticket Layouts e Geofence — que são exclusivos dos terminais.

---

## Primeiro Acesso

O primeiro usuário administrador é criado pela equipe GateIn durante o onboarding e entregue ao cliente por e-mail seguro. A partir daí, o administrador pode criar novos usuários diretamente no painel, em **Usuários**.

---

## Gestão de Usuários

O painel suporta múltiplos usuários com permissões granulares. Cada usuário tem um **username** e **senha** próprios, e o administrador controla o que cada um pode ver e modificar.

### Níveis de Permissão por Módulo

| Nível | O que permite |
| :--- | :--- |
| `none` | Sem acesso ao módulo |
| `read` | Pode visualizar, mas não modificar |
| `write` | Acesso completo de leitura e escrita |

### Permissões Padrão para Novos Usuários

| Módulo | Permissão padrão |
| :--- | :--- |
| Serviços | `read` |
| Informações da Empresa | `read` |
| Comunicados | `write` |
| Usuários | `none` |
| Chaves de API | `none` |
| Geofence / Layouts | `none` (requer concessão explícita do admin) |

> [!IMPORTANT]
> Usuários com `is_admin = true` têm acesso irrestrito a todos os módulos disponíveis para o tipo da sua empresa. Para operações sensíveis (Chaves de API, Usuários), recomenda-se restringir o acesso apenas a usuários de confiança.

> [[PRINT DA TELA DO PAINEL WEB — LISTAGEM DE USUÁRIOS, MOSTRANDO OS CARDS DE USUÁRIOS COM SEUS RESPECTIVOS NÍVEIS DE ACESSO E O BOTÃO DE CONVIDAR NOVO USUÁRIO]]

---

## Chaves de API

Disponível no menu **Chaves de API** / **Integrações**. Cada empresa tem apenas uma chave ativa. Ao rotacionar, a chave anterior é invalidada imediatamente.

> [!CAUTION]
> Salve a chave em um gerenciador de segredos assim que ela for gerada. Por razões de segurança, ela é exibida **apenas uma vez**.

---

## Navegação Geral

O painel é organizado em módulos acessíveis pelo menu lateral. Cada módulo exibe uma indicação visual de somente leitura quando o usuário não tem permissão de escrita.

> [[PRINT DA TELA PRINCIPAL DO PAINEL WEB, MOSTRANDO O MENU LATERAL COM OS MÓDULOS DISPONÍVEIS E A TELA HOME COM INDICADORES DE ATIVIDADE]]
