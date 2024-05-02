import { defineConfig } from 'cypress';
import customViteConfig from './vite.config.js';
import registerCodeCoverageTasks from '@cypress/code-coverage/task.js';

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      // optionally pass in vite config
      viteConfig: customViteConfig,
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config)
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    },
    testIsolation: false,
  },
});
