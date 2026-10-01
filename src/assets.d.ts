/** SVGs de `assets/` viram assets do Metro (id numérico) e são exibidos com `expo-image`. */
declare module '*.svg' {
  const asset: number;
  export default asset;
}
