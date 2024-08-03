<template>
  <div :class="{ active: player.id === currentPlayer }" class="player-info">
    <span class="time">
      <img v-if="player.id === 2" src="/shuriken_b.png" class="icon" />
      <img v-if="player.id === 1" src="/shuriken_w.png" class="icon" />
      TIME: {{ formatTime(time) }}
    </span>
    <span>SCORE: {{ player.score }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Player } from '@/models/Player';
import { CELL_STATUS } from '@/models/Board';

export default defineComponent({
  name: 'PlayerInfo',
  props: {
    player: {
      type: Object as () => Player,
      required: true,
    },
    currentPlayer: {
      type: Number as () => CELL_STATUS,
      required: true,
    },
  },
  setup(props) {
    const time = ref(props.player.time); // Local state for the time
    const timer = ref<number | null>(null);

    const startTimer = () => {
      if (timer.value !== null) {
        clearInterval(timer.value);
      }
      if (props.player.id === props.currentPlayer) {
        timer.value = setInterval(() => {
          time.value += 1; // Update local time state instead of props
        }, 1000);
      }
    };

    const formatTime = (seconds: number): string => {
      return [Math.floor((seconds % 3600) / 60), seconds % 60]
        .join(':')
        .replace(/\b(\d)\b/g, '0$1');
    };

    watch(
      () => props.currentPlayer,
      () => {
        startTimer();
      },
    );

    onMounted(() => {
      startTimer();
    });

    onBeforeUnmount(() => {
      if (timer.value !== null) {
        clearInterval(timer.value);
      }
    });

    return {
      formatTime,
      time, // Expose time for the template
    };
  },
});
</script>

<style scoped lang="css">
.player-info {
  height: 50px;
  width: 100%;
  background-color: #aaaaaa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 40px;
}
.active {
  box-shadow: inset 0 0 70px #001f3f;
}
.icon {
  height: 40px;
  width: 40px;
}
.time {
  img {
    vertical-align: top;
  }
}
</style>
