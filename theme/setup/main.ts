import { defineAppSetup } from '@slidev/types'
import Test from '../examples/Test.vue?raw'
import App from '../examples/App.vue?raw'
import HelloWorld from '../examples/HelloWorld.vue?raw'

const examples = {
  Tests: Test,
  Multiple: {
    'App.vue': App,
    'HelloWorld.vue': HelloWorld,
  },
}

export default defineAppSetup(({ app }) => {
  app.provide('sfc-examples', examples)
})
