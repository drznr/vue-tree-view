import { ref } from 'vue';

export function useStorySetup() {
  const model = ref<string[]>([]);

  function updateModel(event: string[]) {
    model.value = event;
  }
  function handleError(error: Error) {
    alert(error.message + '\n' + error.cause);
  }

  return {
    model,
    updateModel,
    handleError,
  };
}
