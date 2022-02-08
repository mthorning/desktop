<script context="module" lang="ts">
  import { interpret } from 'xstate';
  import machine from './machine';
  import type { ScreenMeta } from '../../types';
</script>

<script lang="ts">
  import { assign } from 'xstate';
  import Header from '../../atoms/WindowHeader.svelte';

  export let width = 500;
  export let height = 500;
  export let screenMeta: ScreenMeta;

  let headerEl: HTMLElement;
  let el: HTMLElement;

  const invert = (n: number, dimension: string): number => screenMeta[dimension] - n;
  let initialPosition = {
    top: 0,
    left: 0,
    right: invert(width, 'width'),
    bottom: invert(height, 'height')
  };
  let offset = { x: 0, y: 0 }

  const windowService = interpret(
    machine
      .withContext({
        currentPosition: initialPosition,
        top: 0,
        left: 0,
        bottom: initialPosition.bottom,
        right: initialPosition.right,
        height,
        width,
        resizeGrabArea: 10
      })
      .withConfig({
        actions: {
          moveWindow: assign((context, event) => {
            const left = event.clientX + context.currentPosition.left - offset.x;
            const right = invert(left + context.width, 'width');

            const top = event.clientY - context.currentPosition.top - offset.y;
            const bottom = invert(top + context.height, 'height');

            return {
              ...context,
              ...(left >= 0 && left + context.width <= screenMeta.width ? { left, right } : {}),
              ...(top >= 0 && top + context.height <= screenMeta.height ? { top, bottom } : {})
            };
          }),
          resizeWindow: assign((context, event) => {
            let top: number, left: number, right: number, bottom;
            switch (context.cursorClass) {
              case 'n-resize':
                top = event.clientY - context.currentPosition.top;
                break;
              case 'w-resize':
                left = event.clientX - context.currentPosition.left;
                break;
              case 'e-resize':
                right = invert(event.clientX, 'width');
                break;
              case 's-resize':
                bottom = invert(event.clientY, 'height');
                break;
            }

            return {
              top,
              left,
              bottom,
              right,
              width: el.clientWidth,
              height: el.clientHeight
            };
          })
        },
        guards: {
          isOverHeader: (_context, event) => headerEl.contains(event.target)
        }
      })
  ).start();
  /* $: console.log($windowService.value, $windowService.context); */

  $: {
    if (el?.contains(screenMeta?.focused as Node)) {
      windowService.send('IS_FOCUSED');
    }
  }

  /* function dragStart(e: TouchEvent | MouseEvent) {
    if (e instanceof TouchEvent) {
      initial.left = e.touches[0].clientX - current.left;
      initial.top = e.touches[0].clientY - current.top;
    } else {
      initial.left = e.clientX - current.left;
      initial.top = e.clientY - current.top;
    }
  } */

  /* function dragEnd() {
    initial.top = current.top;
    initial.left = current.left;
  } */

  /* function drag(e: TouchEvent | MouseEvent) {
    e.preventDefault();
    if (e instanceof TouchEvent) {
      current.left = setWithinWidth(e.touches[0].clientX - initial.left);
      current.top = setWithinHeight(e.touches[0].clientY - initial.top);
    } else {
      if ($windowService.matches('focused.resizing')) {
      } else if ($windowService.matches('focused.moving')) {
      }
    }
  } */
</script>

<svelte:body
  on:mousedown={windowService.send}
  on:mouseup={windowService.send}
  on:mousemove={windowService.send}
  on:mouseleave={windowService.send}
/>
<div
  on:mousedown
  on:mousedown={({ offsetX: x, offsetY: y }) => { offset = { x, y }}}
  bind:this={el}
  class:focused={$windowService.matches('focused')}
  style={`
    left: ${$windowService.context.left}px; 
    right: ${$windowService.context.right}px; 
    bottom: ${$windowService.context.bottom}px;
    top: ${$windowService.context.top}px;
    cursor: ${$windowService.context.cursorClass ?? 'default'};
  `}
>
  <span bind:this={headerEl}>
    <Header hasFocus={$windowService.matches('focused')} on:mousedown={windowService.send} />
  </span>
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
