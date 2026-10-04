// Estende o app.json. No build do app para a Web (EXPO_PUBLIC_WEB_APP=1), o Expo Router e os
// arquivos exportados passam a viver em /app, ao lado da apresentação institucional (ADR 0025).
module.exports = ({ config }) =>
  process.env.EXPO_PUBLIC_WEB_APP === '1'
    ? { ...config, experiments: { ...config.experiments, baseUrl: '/app' } }
    : config;
