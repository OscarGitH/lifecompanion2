import { defineStore } from 'pinia'
import { ref } from 'vue'

import { SelectionMode }
  from '@lifecompanion/model/src/types/selectionMode'

export const useInteractionStore = defineStore('interaction', () => {

    const currentSelectionMode = ref<SelectionMode>(SelectionMode.MOUSE_CLIC)
    function setSelectionMode(mode: SelectionMode) {currentSelectionMode.value = mode}

    return {
      currentSelectionMode,
      setSelectionMode,
    }
  })