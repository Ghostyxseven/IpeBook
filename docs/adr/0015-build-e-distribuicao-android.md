# 0015 — Build e distribuição do aplicativo Android

Data: 02/10/2026

## Status

Proposto. Configuração escrita para a issue #51; o primeiro build ainda não foi gerado (exige login no Expo e no Play Console).

## Contexto

O trabalho final pede o aplicativo publicado em teste fechado na Google Play (issue #46). O projeto é Expo (SDK 57) e não tem pasta `android/` nativa: o binário precisa ser gerado por um serviço de build ou por `expo prebuild` local. A conta de desenvolvedor da Google Play é do Micael.

## Decisão

1. **EAS Build** gera os binários na nuvem, sem manter projeto nativo no repositório.
2. **Dois perfis** em `eas.json`:
   - `preview`: `.apk` de distribuição interna, para instalar direto num aparelho.
   - `production`: `.aab`, formato exigido pela Google Play, com `autoIncrement` do código de versão.
3. **Versão remota** (`appVersionSource: "remote"`): o EAS controla o `versionCode`, evitando conflito entre pessoas.
4. **Identificador** `br.com.ipebook.app` no Android (`package`) e no iOS (`bundleIdentifier`). Depois do primeiro envio à Play, o `package` não pode mais ser trocado.
5. **Envio** (`eas submit`) para a trilha de **teste interno**, como rascunho, até a equipe validar o fluxo; o teste fechado é configurado no Play Console.
6. **Permissões:** só a de fotos, pelo plugin `expo-image-picker`, com texto em português e sem câmera nem microfone. Combina com o `CoverPicker`, que apenas escolhe da galeria.
7. iOS fica fora do escopo da primeira entrega, pois exige conta Apple paga.

## Consequências

- Qualquer pessoa com acesso ao projeto Expo gera builds sem Android Studio.
- O identificador escolhido vira definitivo após a publicação; se a equipe preferir outro domínio, deve trocar **antes** do primeiro envio.
- O build depende do serviço EAS (fila e cota do plano gratuito).
- A chave de assinatura fica sob guarda do EAS; não entra no repositório.

## Alternativas consideradas

- **`expo prebuild` + Gradle local:** controle total, mas obriga manter Android SDK e projeto nativo, sem ganho para este escopo.
- **Apenas `.apk` distribuído por link:** não atende à exigência de publicar na Google Play.
