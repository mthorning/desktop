<script context="module" lang="ts">
  import type { ScreenMeta } from '../routes/index.svelte';
</script>

<script lang="ts">
  import Header from '../atoms/WindowHeader.svelte';

  export let width = 500;
  export let height = 500;
  export let screenMeta: ScreenMeta;
  let el: HTMLElement;
  $: hasFocus = el?.contains(screenMeta?.focused as Node);

  let active = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;
  let xOffset = 0;
  let yOffset = 0;
  let top = 0;
  let left = 0;

  function dragStart(e: TouchEvent | MouseEvent) {
    if (e instanceof TouchEvent) {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }
    active = true;
  }

  function dragEnd() {
    initialX = currentX;
    initialY = currentY;
    active = false;
  }

  const setWithinBounds = (min: number, max: number) => (dimension: number): number => {
    if (dimension < min) return min;
    if (dimension > max) return max;
    return dimension;
  }
  const setWithinHeight = setWithinBounds(0, screenMeta.height - height)
  const setWithinWidth = setWithinBounds(0, screenMeta.width - width)

  function drag(e: TouchEvent | MouseEvent) {
    if (active) {
      e.preventDefault();

      if (e instanceof TouchEvent) {
        currentX = setWithinWidth(e.touches[0].clientX - initialX);
        currentY = setWithinHeight(e.touches[0].clientY - initialY);
      } else {
      currentX = setWithinWidth(e.clientX - initialX);
      currentY = setWithinHeight(e.clientY - initialY);
      }

      xOffset = currentX;
      yOffset = currentY;

      top = setWithinHeight(currentY);
      left = setWithinWidth(currentX);
    }
  }

</script>

<svelte:body
  on:touchend={dragEnd}
  on:mouseup={dragEnd}
  on:mousemove={drag}
  on:touchmove={drag}
  on:pointerleave={dragEnd} />
<div
  on:mousedown
  bind:this={el}
  class:focused={hasFocus}
  style={`
    left: ${left}px; 
    top: ${top}px;
    width: ${width}px;
    height: ${height}px;
  `}
>
  <Header {hasFocus} on:touchstart={dragStart} on:mousedown={dragStart} />
</div>

<style>
  div {
    user-select: none;
    position: absolute;
    background: var(--medium-black);
    border: 1px solid var(--grey);
  }
  .focused {
    z-index: 999;
  }
</style>
