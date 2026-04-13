/**
 * yaml-lite
 * Tiny YAML subset parser: block maps, block lists, scalars, flow inline.
 */

function parseScalar(v: string): unknown {
  const t = v.trim();
  if (t === "" || t === "~" || t === "null") return null;
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^-?\d+\.\d+$/.test(t)) return parseFloat(t);
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  if (t.startsWith("[") && t.endsWith("]")) {
    return parseFlow(t);
  }
  if (t.startsWith("{") && t.endsWith("}")) {
    return parseFlow(t);
  }
  return t;
}

function splitTop(src: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  let quote: string | null = null;
  for (const ch of src) {
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      parts.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim() !== "") parts.push(buf);
  return parts;
}

function parseFlow(src: string): unknown {
  const s = src.trim();
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return splitTop(inner).map((p) => parseScalar(p));
  }
  if (s.startsWith("{") && s.endsWith("}")) {
    const inner = s.slice(1, -1).trim();
    const obj: Record<string, unknown> = {};
    if (!inner) return obj;
    for (const pair of splitTop(inner)) {
      const idx = pair.indexOf(":");
      if (idx < 0) continue;
      obj[pair.slice(0, idx).trim()] = parseScalar(pair.slice(idx + 1));
    }
    return obj;
  }
  return parseScalar(s);
}

interface Line {
  indent: number;
  text: string;
}

function tokenize(src: string): Line[] {
  return src
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "" && !l.trim().startsWith("#"))
    .map((l) => {
      const m = /^(\s*)(.*)$/.exec(l)!;
      return { indent: m[1].length, text: m[2] };
    });
}

function build(
  lines: Line[],
  idx: { i: number },
  indent: number
): unknown {
  // Determine if list or map.
  const first = lines[idx.i];
  if (!first) return null;
  if (first.text.startsWith("- ")) {
    const arr: unknown[] = [];
    while (idx.i < lines.length) {
      const l = lines[idx.i];
      if (l.indent < indent) break;
      if (l.indent > indent) break;
      if (!l.text.startsWith("- ")) break;
      const rest = l.text.slice(2);
      idx.i++;
      if (rest.includes(":") && !rest.startsWith("[") && !rest.startsWith("{")) {
        // inline map item
        const ki = rest.indexOf(":");
        const key = rest.slice(0, ki).trim();
        const val = rest.slice(ki + 1).trim();
        const obj: Record<string, unknown> = {};
        if (val !== "") obj[key] = parseScalar(val);
        else {
          const next = lines[idx.i];
          obj[key] = next && next.indent > l.indent ? build(lines, idx, next.indent) : null;
        }
        arr.push(obj);
      } else {
        arr.push(parseScalar(rest));
      }
    }
    return arr;
  }
  const obj: Record<string, unknown> = {};
  while (idx.i < lines.length) {
    const l = lines[idx.i];
    if (l.indent < indent) break;
    if (l.indent > indent) break;
    const ki = l.text.indexOf(":");
    if (ki < 0) {
      idx.i++;
      continue;
    }
    const key = l.text.slice(0, ki).trim();
    const val = l.text.slice(ki + 1).trim();
    idx.i++;
    if (val !== "") {
      obj[key] = parseScalar(val);
    } else {
      const next = lines[idx.i];
      if (next && next.indent > l.indent) {
        obj[key] = build(lines, idx, next.indent);
      } else {
        obj[key] = null;
      }
    }
  }
  return obj;
}

export function parseYaml(input: string): unknown {
  const lines = tokenize(input);
  if (lines.length === 0) return null;
  const idx = { i: 0 };
  return build(lines, idx, lines[0].indent);
}

export default parseYaml;
