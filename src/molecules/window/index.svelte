<script context="module" lang="ts">
  import type { ScreenMeta } from '../routes/index.svelte';
  import { interpret } from 'xstate';
  import { machine } from './machine';
</script>

<script lang="ts">
  import Header from '../../atoms/WindowHeader.svelte';

  const windowService = interpret(machine).start();

  // isn't showing 'resizing' when it should
  $: console.log($windowService.value)

  export let width = 500;
  export let height = 500;
  export let screenMeta: ScreenMeta;
  let el: HTMLElement;
  $: hasFocus = el?.contains(screenMeta?.focused as Node);

  // For resizing
  let isResizing = false;
  let offsetX: number;
  let offsetY: number;
  let resizeArea = 10;
  $: nResize = offsetY > 0 && offsetY < resizeArea;
  $: sResize = offsetY < height && offsetY > height - resizeArea;
  $: wResize = offsetX > 0 && offsetX < resizeArea;
  $: eResize = offsetX < width && offsetX > width - resizeArea;

  // For window moving/focusing
  let isMoving = false;
  let initial = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };
  let current = { ...initial };

  function dragStart(e: TouchEvent | MouseEvent) {
    if (e instanceof TouchEvent) {
      initial.left = e.touches[0].clientX - current.left;
      initial.top = e.touches[0].clientY - current.top;
    } else {
      initial.left = e.clientX - current.left;
      initial.top = e.clientY - current.top;
    }
    windowService.send('MOVE')
    isMoving = true;
  }

  function dragEnd() {
    initial.top = current.top;
    initial.left = current.left;
    isMoving = false;
    windowService.send('STOP_MOVING')
  }

  const setWithinBounds =
    (min: number, max: number) =>
    (dimension: number): number => {
      if (dimension < min) return min;
      if (dimension > max) return max;
      return dimension;
    };

  $: setWithinHeight = setWithinBounds(0, screenMeta?.height - height);
  $: setWithinWidth = setWithinBounds(0, screenMeta?.width - width);

  function drag(e: TouchEvent | MouseEvent) {
    e.preventDefault();
    if (e instanceof TouchEvent) {
      if (isMoving) {
        current.left = setWithinWidth(e.touches[0].clientX - initial.left);
        current.top = setWithinHeight(e.touches[0].clientY - initial.top);
      }
    } else {
      if (isResizing) {
        if (nResize) {
          current.top = setWithinHeight(e.clientY - initial.top);
        }
      } else if (isMoving) {
        current.left = setWithinWidth(e.clientX - initial.left);
        current.top = setWithinHeight(e.clientY - initial.top);
      }
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
  class:n-resize={nResize}
  class:e-resize={eResize}
  class:s-resize={sResize}
  class:w-resize={wResize}
  on:mousedown
  on:mousedown={() => {
    if(isResizing = nResize || eResize || sResize || wResize) {
windowService.send('RESIZING')
  }
  }}
  on:mouseup={() => windowService.send('STOP_RESIZING')}
  on:mousemove={({ offsetX: x, offsetY: y }) => {
    offsetX = x;
    offsetY = y;
  }}
  bind:this={el}
  class:focused={hasFocus}
  style={`
    left: ${current.left}px; 
    top: ${current.top}px;
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
  .n-resize {
    cursor: n-resize;
  }
  .e-resize {
    cursor: e-resize;
  }
  .s-resize {
    cursor: s-resize;
  }
  .w-resize {
    cursor: w-resize;
  }
  .n-resize.e-resize {
    cursor: ne-resize;
  }
  .s-resize.e-resize {
    cursor: se-resize;
  }
  .s-resize.w-resize {
    cursor: sw-resize;
  }
  .n-resize.w-resize {
    cursor: nw-resize;
  }
</style>
