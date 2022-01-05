import { createMachine } from 'xstate';

// This machine is completely decoupled from Svelte
export const machine = createMachine({
  id: 'toggle',
  initial: 'idle',
  states: {
    idle: {
      on: {
        MOVE: 'moving',
        RESIZE: 'resizing'
      }
    },
    moving: {
      on: { STOP_MOVING: 'idle' }
    },
    resizing: {
      on: { STOP_RESIZING: 'idle' }
    }
  }
});
