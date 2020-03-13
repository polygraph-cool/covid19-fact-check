<script>
  export let value
  export let options
  $:console.log(value)

  let isOpen = true
  let searchString = null

  $: filteredOptions = options.filter(d => (
    !searchString ? true : d.includes(searchString)
  ))
</script>

<div class="group">
  <!-- <div class="label" on:click={() => isOpen = true}>
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
  {/if} -->
  <select {value} on:change={e => { value = e.target.value }}>
    {#each options as option}
      <option>{ option }</option>
    {/each}
  </select>
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

  select {
    padding: 0.2em 0 0.2em 0.5em;
    font-size: 1em;
    border-width: 0 0 1px 0;
    background: #f3f8fb;
  }
</style>