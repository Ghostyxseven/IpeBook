# Gerar o build Android

Decisão e motivos: [ADR 0015](adr/0015-build-e-distribuicao-android.md).

## Pré-requisitos

- Conta Expo com acesso ao projeto `ipebook` (a conta do Micael é a dona).
- Conta de desenvolvedor da Google Play verificada.
- Variáveis `EXPO_PUBLIC_*` do Supabase definidas no EAS (`eas env:create`), nunca no repositório.

## Passo a passo

```bash
npm install
npx eas-cli login
npx eas-cli init            # só na primeira vez; vincula o projeto ao Expo
npx eas-cli build --platform android --profile preview
```

Ao terminar, o EAS mostra um link e um QR code com o `.apk`. Instale num Android e confira o fluxo real (entrar, catálogo, publicar anúncio com foto).

## Publicar em teste

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --profile production
```

O `submit` exige, na primeira vez, o app criado no Play Console e uma chave de serviço da Google. Guarde-a fora do repositório.

## Verificação registrada

Pendente: ainda não foi gerado nenhum build (ver issue #51).
