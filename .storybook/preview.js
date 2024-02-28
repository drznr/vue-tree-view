import '../src/output.css';
import { setup } from '@storybook/vue3';
import Vuetify from '../src/plugins/vuetify';

setup(app => app.use(Vuetify));

/** @type { import('@storybook/vue3').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
