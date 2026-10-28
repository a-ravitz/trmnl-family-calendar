// Guards the script-breakout escape chain in src/agenda.liquid.template, the
// same way scriptInjectionGuard.test.js guards full.liquid.template. The chain
// is read out of full.liquid.template's IDX_0 injection, so both templates must
// carry the exact same escapes on every polled value.

import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const FULL = read('src/full.liquid.template');
const CHAIN = FULL.match(/\{\{ IDX_0 \| json (\|[^}]*)\}\}/)[1];

describe('agenda and month template injection guard', () => {
  for (const file of ['src/agenda.liquid.template', 'src/agenda.liquid', 'src/month.liquid.template', 'src/month.liquid']) {
    const src = read(file);
    const injections = [...src.matchAll(/\{\{ (IDX_\d) \| json (\|[^}]*)\}\}/g)];

    test(`${file} injects all three polled values`, () => {
      expect(injections.map((m) => m[1]).sort()).toEqual(['IDX_0', 'IDX_1', 'IDX_2']);
    });

    test(`${file} carries the full escape chain on every injection`, () => {
      expect(CHAIN).toContain('\\u003c');
      for (const m of injections) expect(m[2]).toBe(CHAIN);
    });

    test(`${file} has no raw polled-value injection`, () => {
      expect(src).not.toMatch(/\{\{ IDX_\d \}\}/);
      expect(src).not.toMatch(/\{\{ IDX_\d \| json \}\}/);
    });

    test(`${file} never contains a script end tag inside the script`, () => {
      expect(src.split('</' + 'script>').length - 1).toBe(1);
    });
  }
});
