<script lang="ts">
  import MinimiseIcon from 'svelte-icons/io/IoMdRemove.svelte';
  import MaximiseIcon from 'svelte-icons/io/IoIosSquareOutline.svelte';
  import CloseIcon from 'svelte-icons/io/IoIosClose.svelte';
  export let hasFocus = true;
  export let title: string = 'New Window';
</script>

<div class:focused={hasFocus}
    on:mouseenter
    on:mouseleave
  >
  <h1>{title}</h1>
  <nav>
    <button> <MinimiseIcon strokeSize={4} /> </button>
    <button> <MaximiseIcon /> </button>
    <button class="close"> <CloseIcon /> </button>
  </nav>
</div>

<style>
  div {
    display: flex;
    justify-content: space-between;
    height: 29px;
  }
  h1 {
    font-size: 12px;
    font-weight: 400;
    padding-left: 8px;
    margin: 0;
    display: flex;
    align-self: center;
  }
  div,
  button {
    background: var(--lightest-black);
    color: var(--grey);
  }
  nav {
    display: flex;
    justify-self: flex-end;
  }
  button {
    border: none;
  }
  .focused,
  .focused button {
    background: var(--darkest-black);;
    color: var(--lightest-white);
  }
  button:hover,
  .focused button:hover {
    background: var(--light-black);
    color: var(--lightest-white);
  }
  button.close:hover,
  .focused button.close:hover {
    background: var(--red);
  }
</style>
