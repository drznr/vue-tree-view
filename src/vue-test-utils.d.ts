import { DOMWrapper } from '@vue/test-utils';

declare module '@vue/test-utils' {
  export class VueWrapper {
    findByTestId<T extends Node>(selector: string): DOMWrapper<T>;
    findAllByTestId<T extends Node>(selector: string): DOMWrapper<T>[];
    findByText<T extends Node>(text: string, selector?: string): DOMWrapper<T>;
    findAllByText<T extends Node>(text: string, selector?: string): DOMWrapper<T>[];
  }
}
