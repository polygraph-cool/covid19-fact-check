<script>
  export let label
  export let value
  export let options
  export let scrollToTop
  export let type = "dropdown"
  export let colors = {}

  const onSelect = option => {
    value = option == value ? null : option
    scrollToTop()
  }
</script>

<div class="filter">
  <div class="label">
    { label }
  </div>
  {#if type == "dropdown"}
    <select bind:value={value} on:change={scrollToTop}>
      <option value="">Any</option>
      {#each options as option}
        <option
          value={option}>
          { option }
        </option>
      {/each}
    </select>
  {:else}
  <div class="options">
    {#each options as option}
      <button
        class="option"
        class:active={option == value}
        class:inactive={value && option != value}
        style={`color: ${colors[option]}`}
        on:click={() => onSelect(option)}>
        { option }
      </button>
    {/each}
  </div>

  {/if}
</div>

<style>
  .filter {
    display: block;
    margin-left: 0.6em;
    /* padding: 0.6em 0; */
    background: none;
    border: none;
    /* text-align: right; */
    width: 15em;
    /* appearance: none; */
    /* cursor: pointer; */
  }
  .label {
    padding-left: 0.7em;
    font-size: 0.9em;
    margin-bottom: 0.5em;
  }
  select {
    max-width: 10em;
    padding: 0.6em 0.1em 0.6em 0.6em;
    background: white;
    border: none;
  }
  .options {
    margin-top: 0.5em;
  }
  .option {
    display: block;
    width: calc(100% + 0.6em);
    margin: 0 -0.6em 0 0;
    text-align: right;
    padding: 0.3em 0.6em;
    font-size: 0.8em;
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
  }
  .option.inactive {
    color: #81818f !important;
  }
</style>