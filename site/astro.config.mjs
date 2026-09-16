import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://tcashel.github.io',
  base: '/forge/',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    starlight({
      title: 'Forge',
      description: 'Run approved engineering work through coding agents, tests, and independent review to a draft pull request.',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/cinderworks.css', './src/styles/forge.css'],
      social: [{ icon: 'github', label: 'Forge on GitHub', href: 'https://github.com/tcashel/forge' }],
      sidebar: [
        { label: 'Overview', slug: '' },
        { label: 'Getting started', slug: 'getting-started' },
        {
          label: 'Guides',
          items: [
            { label: 'Run an epic', slug: 'guides/run-an-epic' },
            { label: 'Inspect and recover', slug: 'guides/inspect-and-recover' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Commands', slug: 'reference/commands' },
            { label: 'Configuration', slug: 'reference/configuration' },
          ],
        },
        { label: 'How it works', slug: 'how-it-works' },
      ],
    }),
  ],
});
