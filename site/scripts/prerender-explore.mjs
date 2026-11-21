import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import react from '@vitejs/plugin-react';
import { createServer, resolveConfig } from 'vite';

const config = await resolveConfig({}, 'build', 'production');
const base = config.base;
const output = resolve(config.root, config.build.outDir);
const template = await readFile(resolve(output, 'index.html'), 'utf8');
const server = await createServer({
  configFile: false,
  root: config.root,
  mode: 'production',
  base,
  plugins: [react()],
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

try {
  const { exploreArticles } = await server.ssrLoadModule('/src/data/explore.ts');
  const { ExploreArticleDocument } = await server.ssrLoadModule('/src/pages/ExploreArticleDocument.tsx');
  for (const [id, article] of Object.entries(exploreArticles)) {
    const route = `explore/${id}`;
    const body = renderToStaticMarkup(React.createElement(
      StaticRouter,
      { basename: base, location: `${base}${route}` },
      React.createElement('main', null,
        React.createElement('a', { href: `${base}explore`, className: 'explore-back' }, 'Back to Explore'),
        React.createElement(ExploreArticleDocument, { id }),
      ),
    ));
    const html = template
      .replace(/<title>.*?<\/title>/, () => `<title>${escapeHtml(article.title)} | Gulsum Islamoglu</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/, () => `<meta name="description" content="${escapeHtml(article.description)}" />`)
      .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
    const directory = resolve(output, route);
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), html);
  }
  await copyFile(resolve(output, 'index.html'), resolve(output, '404.html'));
  console.log(`Prerendered ${Object.keys(exploreArticles).length} Explore articles.`);
} finally {
  await server.close();
}
