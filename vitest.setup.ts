import { config, type VueWrapper, DOMWrapper } from '@vue/test-utils';

const customBehaviors = (wrapper: VueWrapper) => ({
  findByText<T extends Element>(text: string, selector = '*'): DOMWrapper<T> | null {
    const elements = wrapper.findAll<T>(selector);
    return elements.find(el => el.text().trim() === text.trim()) ?? null;
  },
  findAllByText<T extends Element>(text: string, selector = '*') {
    return wrapper.findAll<T>(selector).filter(el => el.text().trim() === text.trim());
  },
  findByTestId<T extends Element>(testId: string) {
    return wrapper.get<T>(`[data-testid="${testId}"]`);
  },
  findAllByTestId<T extends Element>(testId: string) {
    return wrapper.findAll<T>(`[data-testid="${testId}"]`);
  },
});

config.plugins.VueWrapper.install(customBehaviors);
