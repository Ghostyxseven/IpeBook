#!/usr/bin/env bash
# Gera public/fonts/Roboto-pt-br.woff2 a partir de assets/Roboto.ttf, mantendo só os caracteres usados
# em português e os eixos variáveis de peso e largura. Requer: pip install fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."
pyftsubset assets/Roboto.ttf \
  --output-file=public/fonts/Roboto-pt-br.woff2 --flavor=woff2 --no-hinting \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+0160-0161,U+0178,U+017D-017E,U+0192,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+20AC,U+2122,U+2190-2199,U+2212" \
  --layout-features='kern,liga,ccmp,locl,mark,mkmk,calt'
ls -l public/fonts/Roboto-pt-br.woff2
