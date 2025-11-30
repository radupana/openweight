import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LiveValidator from '../components/LiveValidator.vue'
import SchemaExplorer from '../components/SchemaExplorer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LiveValidator', LiveValidator)
    app.component('SchemaExplorer', SchemaExplorer)
  }
} satisfies Theme
