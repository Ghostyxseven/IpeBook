# Plano

Manter Expo 57, React DOM e MVVM. A navegação permanece em `useBookNavigation`; o controlador de gesto e as faixas são estado visual na camada View. Usar Pointer Events com captura após intenção horizontal, mantendo `pan-y pinch-zoom`. Reutilizar tokens e interpolar transformações/opacidade em até um quadro por atualização; nenhuma renderização React por movimento.

Preparar 12 faixas por virada, reutilizá-las durante o gesto e finalização. Uma animação WAAPI serve de relógio com a curva do token; retomar do progresso atual ao interromper. Sem nova decisão de stack/persistência ou dependência, portanto sem novo ADR.

Referências consultadas: Expo SDK 57; MDN Pointer Events e Animation.currentTime; estrutura Figma `53:185` (Web / Login Intro). A interação em livro continua uma divergência deliberada solicitada pelo usuário, já documentada no design system. Esta consulta não implementa uma nova tela Figma.
