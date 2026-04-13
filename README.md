[![CI](https://img.shields.io/github/actions/workflow/status/Tox1469/yaml-lite/ci.yml?style=flat-square&label=ci)](https://github.com/Tox1469/yaml-lite/actions)
[![License](https://img.shields.io/github/license/Tox1469/yaml-lite?style=flat-square)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Tox1469/yaml-lite?style=flat-square)](https://github.com/Tox1469/yaml-lite/releases)
[![Stars](https://img.shields.io/github/stars/Tox1469/yaml-lite?style=flat-square)](https://github.com/Tox1469/yaml-lite/stargazers)

---

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