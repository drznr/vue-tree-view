import { config, type VueWrapper, DOMWrapper } from '@vue/test-utils';
import type { VueNode } from '@vue/test-utils/dist/types';

export type TestWrapper<T = VueNode> = VueWrapper<T> & ReturnType<typeof customBehaviors>;

const customBehaviors = (wrapper: VueWrapper) => ({
  findByText(text: string, selector = '*'): DOMWrapper<Element> | null {
    const elements = wrapper.findAll(selector);
    return elements.find(el => el.text().trim() === text.trim()) ?? null;
  },
  findAllByText(text: string, selector = '*') {
    return wrapper.findAll(selector).filter(el => el.text().trim() === text.trim());
  },
  findByTestId(testId: string) {
    return wrapper.get(`[data-testid="${testId}"]`);
  },
  findAllByTestId(testId: string) {
    return wrapper.findAll(`[data-testid="${testId}"]`);
  },
});

config.plugins.VueWrapper.install(customBehaviors);
global.structuredClone = (value: unknown) => JSON.parse(JSON.stringify(value));
