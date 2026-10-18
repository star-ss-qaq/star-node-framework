export type WithAlias<T extends string> = `${T} as ${string}`;
export type AliasAble<T extends string> = T | `${T} as ${string}`;
