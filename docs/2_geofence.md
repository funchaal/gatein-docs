---
sidebar_position: 8
title: Geofence
---

# Geofence

O geofence é um perímetro circular configurado no mapa, definido pelo terminal no painel web. Ele determina a área de "chegada" — a região onde o check-in antecipado fica disponível para o motorista no app.

Quando o app detecta que o motorista está dentro dessa área, o botão de check-in é liberado. Isso garante que o check-in só acontece quando o motorista está genuinamente próximo do terminal.

---

## Configurando o Geofence

1. Acesse o painel web e clique em **Geofence** no menu lateral.
2. Clique no mapa para posicionar o centro do perímetro (normalmente a entrada principal do terminal).
3. Ajuste o raio em metros no painel lateral.
4. Clique em **Salvar Configurações**.

> [[PRINT DA TELA DO PAINEL WEB — CONFIGURAÇÃO DE GEOFENCE, MOSTRANDO O MAPA COM O CÍRCULO LARANJA DO PERÍMETRO, OS CAMPOS DE LATITUDE/LONGITUDE E O SLIDER DE RAIO]]

> [!TIP]
> Um raio entre **500m e 2km** costuma ser ideal para a maioria dos terminais. Raios muito grandes podem permitir check-in de áreas indesejadas; raios muito pequenos podem causar problemas de GPS em regiões com sinal fraco.

---

## Como o App Usa o Geofence

O aplicativo verifica continuamente a localização do motorista. Quando ele entra na área definida:

- O terminal aparece em destaque no mapa do app.
- Os agendamentos e viagens para aquele terminal ficam marcados como "próximo".
- O botão de check-in é liberado.

Se o motorista sair da área antes de concluir o check-in, o botão é bloqueado novamente.
