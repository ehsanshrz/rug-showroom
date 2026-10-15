import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const exec = promisify(execFile);

for (const [githubActions, base] of [['false', '/'], ['true', '/rug-showroom/']]) {
  test(`production build serves scripts, styles, and fonts under ${base}`, async t => {
    const directory = await mkdtemp(join(tmpdir(), 'atelier-vera-build-'));
    t.after(() => rm(directory, { recursive: true, force: true }));
    await exec(process.execPath, [
      join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', directory,
    ], { cwd: root, env: { ...process.env, GITHUB_ACTIONS: githubActions } });

    const html = await readFile(join(directory, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /\/src\/main\.js/);
    assert.match(html, /<script[^>]+src="[^"]*\/assets\/[^"]+\.js"/);
    assert.ok(html.includes(`href="${base}fonts/cormorant-garamond.ttf"`));
    const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
    const stylesheet = urls.find(url => url.endsWith('.css'));
    assert.ok(stylesheet);
    const css = await readFile(join(directory, stylesheet.slice(base.length)), 'utf8');
    const fonts = [...css.matchAll(/url\(["']?([^"')]+\.ttf)["']?\)/g)].map(match => match[1]);
    assert.equal(new Set(fonts).size, 4);

    for (const url of [...urls, ...fonts]) {
      assert.ok(url.startsWith(base), `Asset outside ${base}: ${url}`);
      assert.ok((await stat(join(directory, url.slice(base.length)))).isFile(), `Missing asset: ${url}`);
    }
  });
}
