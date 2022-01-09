<script context="module" lang="ts">
  import type { Writable } from 'svelte/store';
  import { writable } from 'svelte/store';
  import Window from '../molecules/window/index.svelte';
  import type { ScreenMeta } from '../types';
</script>

<script lang="ts">
  const screenMeta: Writable<ScreenMeta> = writable();

  function resizeObserver(el: HTMLElement) {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect;
      screenMeta.set({ height, width });
    });

    resizeObserver.observe(el);

    return {
      destroy() {
        resizeObserver.unobserve(el);
      }
    };
  }

  function setFocus(e) {
    screenMeta.update((vals) => ({ ...vals, focused: e.target }));
  }
</script>

<div use:resizeObserver>
  {#if $screenMeta}
    <Window screenMeta={$screenMeta} on:mousedown={setFocus} />
  {/if}
</div>

<style>
  :root {
    --darkest-black: rgb(0, 0, 0);
    --medium-black: rgb(32, 32, 32);
    --light-black: rgb(43, 43, 43);
    --lightest-black: rgb(26, 26, 26);
    --grey: rgb(127, 127, 127);
    --dark-white: #222121;
    --lightest-white: rgb(255, 255, 255);

    --red: rgb(232, 17, 35);
  }
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      'Open Sans', 'Helvetica Neue', sans-serif;
  }
  div {
    position: relative;
    height: 100vh;
    width: 100vw;
  }
</style>
