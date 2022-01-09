import { createMachine, assign } from 'xstate';

type CursorClass =
  | 'n-resize'
  | 'e-resize'
  | 's-resize'
  | 'w-resize'
  | 'ne-resize'
  | 'se-resize'
  | 'nw-resize'
  | 'sw-resize';

interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface Context extends Position {
  height: number;
  width: number;
  resizeGrabArea: number;
  cursorClass?: CursorClass;
  currentPosition: Position;
}
export default createMachine<Context>(
  {
    id: 'windowMachine',
    initial: 'unfocused',
    states: {
      unfocused: {
        on: {
          IS_FOCUSED: 'focused'
        }
      },
      focused: {
        initial: 'idle',
        states: {
          idle: {
            on: {
              IS_UNFOCUSED: '#windowMachine.unfocused',
              mousemove: 'mouseMoving',
              mousedown: {
                target: 'moving',
                cond: 'isOverHeader'
              }
            }
          },
          mouseMoving: {
            entry: 'getResizeCursorClass',
            always: [
              {
                target: 'resizeMode',
                cond: 'isResizeCursor'
              },
              { target: 'idle' }
            ]
          },
          moving: {
            on: {
              mouseup: 'idle',
              mousemove: 'moveWindow'
            }
          },
          moveWindow: {
            entry: 'moveWindow',
            always: 'moving'
          },
          resizeMode: {
            on: {
              mousemove: 'mouseMoving',
              mousedown: 'resizing'
            }
          },
          resizing: {
            on: { mouseup: 'idle' }
          },
          resizeWindow: {
            entry: 'resizeWindow',
            always: 'resizing'
          }
        }
      }
    }
  },
  {
    actions: {
      getResizeCursorClass: assign({
        cursorClass(context, event) {
          const { resizeGrabArea, height, width } = context;
          const { offsetX, offsetY } = event;

          const hasNorth = offsetY > 0 && offsetY < resizeGrabArea;
          const hasEast = offsetX < width && offsetX > width - resizeGrabArea;
          const hasSouth = offsetY < height && offsetY > height - resizeGrabArea;
          const hasWest = offsetX > 0 && offsetX < resizeGrabArea;

          switch (true) {
            case hasNorth:
              if (hasEast) return 'ne-resize';
              if (hasWest) return 'nw-resize';
              return 'n-resize';
            case hasSouth:
              if (hasEast) return 'se-resize';
              if (hasWest) return 'sw-resize';
              return 's-resize';
            case hasEast:
              return 'e-resize';
            case hasWest:
              return 'w-resize';
            default:
              return;
          }
        }
      }),
      dragStart: assign((context, event) => ({
        currentPosition: {
          ...context.currentPosition,
          left: event.clientX - context.left,
          top: event.clientY - context.top
        }
      })),
      dragEnd: assign((context) => ({
        currentPosition: {
          ...context.currentPosition,
          top: context.top,
          left: context.left
        }
      }))
    },
    guards: {
      isResizeCursor: ({ cursorClass }) => !!cursorClass
    }
  }
);
