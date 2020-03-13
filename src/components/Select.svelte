<script>
  export let value
  export let options

  let isOpen = true
  let searchString = null

  $: filteredOptions = options.filter(d => (
    !searchString ? true : d.includes(searchString)
  ))
</script>

<div class="group">
  <div class="label" on:click={() => isOpen = true}>
    { value }
  </div>
  {#if isOpen}
    <div class="input">
    </div>
    <div class="dropdown">
      {#each filteredOptions as option}
        <div class="option">
          { option }
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .group {
    position: relative;
    display: inline-block;
  }
  .input {
    position: absolute;
    top: 0;
  }
  .dropdown {
    position: absolute;
    background: white;
  }
</style>