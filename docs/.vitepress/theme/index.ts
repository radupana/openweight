import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LiveValidator from '../components/LiveValidator.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LiveValidator', LiveValidator)
  }
} satisfies Theme
