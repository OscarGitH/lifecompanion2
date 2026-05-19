<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  inputEventManager,
} from '../../../features/services/editor/interaction/InputEventManager';

const MOVEMENT_SPEED = 20;

const mouseX = ref(100);
const mouseY = ref(100);

let unsubscribe: (() => void) | null = null;

const handleKeyboardEvent = (event: Event) => {
  if (event instanceof KeyboardEvent) {

    switch (event.key) {
      case "ArrowUp":
        mouseY.value = Math.max(0, mouseY.value - MOVEMENT_SPEED);
        break;
      case "ArrowDown":
        mouseY.value = Math.min(window.innerHeight, mouseY.value + MOVEMENT_SPEED);
        break;
      case "ArrowLeft":
        mouseX.value = Math.max(0, mouseX.value - MOVEMENT_SPEED);
        break;
      case "ArrowRight":
        mouseX.value = Math.min(window.innerWidth, mouseX.value + MOVEMENT_SPEED);
        break;
      case "Enter":
        console.log("[VIRTUAL MOUSE] Click simulé :", {
          x: mouseX.value,
          y: mouseY.value,
        });
        break;
      default:
        break;
    }
  }
};

onMounted(() => {
  unsubscribe = inputEventManager().subscribe(handleKeyboardEvent);
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <div>
    <div
        class="mouse-cursor"
        :style="{
				left: `${mouseX}px`,
				top: `${mouseY}px`,
			}"
    >
      <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
      >
        <path
            d="M 2 3 L 2 21 L 8 15 L 14 24 L 18 22 L 12 13 L 20 13 Z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.mouse-cursor {
  position: fixed;
  width: 24px;
  height: 24px;
  transform: translate(-2px, -2px);
  pointer-events: none;
  z-index: 9999;
}
</style>