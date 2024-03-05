import { throttle } from '../utils';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

type TOptions = IntersectionObserverInit & { throttleMs?: number };

export function useElementVisibility(element: Ref<HTMLElement | null>, options: TOptions = {}) {
  const { throttleMs = 100, ...observerOptions } = options;
  const observer = ref<IntersectionObserver | null>(null);
  const isVisible = ref<boolean>(false);

  onMounted(() => {
    if (!element.value) return;

    observer.value = new IntersectionObserver(
      throttle(entries => {
        let isIntersecting = isVisible.value;

        let latestTime = 0;
        for (const entry of entries) {
          if (entry.time >= latestTime) {
            latestTime = entry.time;
            isIntersecting = entry.isIntersecting;
          }
        }
        isVisible.value = isIntersecting;
      }, throttleMs),
      observerOptions
    );
    observer.value.observe(element.value);
  });

  onUnmounted(() => observer.value?.disconnect());

  return isVisible;
}
