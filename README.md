# yaml-lite

Parser mínimo de um subconjunto de YAML: mapas e listas em bloco e escalares simples, além de flow inline `{a: 1, b: [1,2]}`.

## Instalação

```bash
npm install yaml-lite
```

## Uso

```ts
import { parseYaml } from "yaml-lite";

const data = parseYaml(`
name: Tox
age: 30
tags:
  - dev
  - saas
`);
```

## API

- `parseYaml(input: string): unknown` — converte YAML em objeto JS.

## Licença

MIT
