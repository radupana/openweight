import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'openweight',
  description: 'Open data format for strength training',
  base: '/',

  head: [
    ['meta', { property: 'og:title', content: 'openweight' }],
    ['meta', { property: 'og:description', content: 'Open data format for strength training' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],

  sitemap: {
    hostname: 'https://openweight.dev'
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Schema', link: '/schema/' },
      { text: 'SDK', link: '/sdk/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Playground', link: '/playground/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is openweight?', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/concepts' },
          ]
        }
      ],
      '/schema/': [
        {
          text: 'Schema Reference',
          items: [
            { text: 'Overview', link: '/schema/' },
            { text: 'WorkoutLog', link: '/schema/workout-log' },
            { text: 'WorkoutTemplate', link: '/schema/workout-template' },
            { text: 'Program', link: '/schema/program' },
            { text: 'PersonalRecords', link: '/schema/personal-records' },
          ]
        }
      ],
      '/sdk/': [
        {
          text: 'SDK Reference',
          items: [
            { text: 'Overview', link: '/sdk/' },
            { text: 'TypeScript', link: '/sdk/typescript' },
            { text: 'Kotlin', link: '/sdk/kotlin' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Workout Logs', link: '/examples/workout-logs' },
            { text: 'Templates', link: '/examples/workout-templates' },
            { text: 'Programs', link: '/examples/programs' },
            { text: 'Personal Records', link: '/examples/personal-records' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/radupana/openweight' }
    ],

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright © 2024-present openweight contributors'
    },

    search: {
      provider: 'local'
    }
  }
})
