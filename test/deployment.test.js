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

test('source entrypoint assets resolve under the GitHub Pages project path', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const css = await readFile(join(root, 'src/style.css'), 'utf8');
  const main = await readFile(join(root, 'src/main.js'), 'utf8');
  assert.match(html, /href="\.\/favicon\.svg"/);
  assert.match(html, /href="\.\/fonts\/cormorant-garamond\.ttf"/);
  assert.match(html, /href="\.\/src\/style\.css"/);
  assert.match(html, /src="\.\/src\/main\.js"/);
  assert.doesNotMatch(main, /import ['"]\.\/style\.css['"]/);
  assert.equal([...css.matchAll(/url\(["']?\.\.\/fonts\/[^"')]+\.ttf["']?\)/g)].length, 4);
});

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
    const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
    const stylesheet = urls.find(url => url.endsWith('.css'));
    assert.ok(stylesheet);
    const baseUrl = new URL(base, 'https://example.test');
    const resolveAssetPath = (url, relativeTo = baseUrl) => {
      const resolved = new URL(url, relativeTo);
      assert.ok(resolved.pathname.startsWith(base), `Asset outside ${base}: ${url}`);
      return join(directory, decodeURIComponent(resolved.pathname.slice(base.length)));
    };
    const stylesheetUrl = new URL(stylesheet, baseUrl);
    const css = await readFile(resolveAssetPath(stylesheet), 'utf8');
    const fonts = [...css.matchAll(/url\(["']?([^"')]+\.ttf)["']?\)/g)].map(match => match[1]);
    assert.equal(new Set(fonts).size, 4);

    for (const url of urls) {
      assert.ok((await stat(resolveAssetPath(url))).isFile(), `Missing asset: ${url}`);
    }
    for (const font of fonts) {
      assert.ok((await stat(resolveAssetPath(font, stylesheetUrl))).isFile(), `Missing font: ${font}`);
    }
  });
}
