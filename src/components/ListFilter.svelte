<script>
  export let label
  export let value
  export let options
  export let scrollToTop

  const getTextWidth = (str="") => (
    typeof str == "string"
      ? Math.max(str.length * 1.3 + 0.9, 6)
      : 6
  )
</script>

<div class="filter">
  <div class="filter-label">
    { label }
  </div>
  <select bind:value={value} on:change={scrollToTop} style={`width: ${getTextWidth(value)}em`}>
    <option value="">Any</option>
    {#each options as option}
      <option
        value={option}>
        { option }
      </option>
    {/each}
  </select>
</div>

<style>
  .filter {
    display: block;
    font-size: 1.2em;
    margin: 0 0;
    padding: 0.6em 0.3em;
    background: none;
    border: none;
    text-align: right;
    width: 100%;
    /* appearance: none; */
    /* cursor: pointer; */
  }
  select {
    max-width: 10em;
    margin-top: 0.5em;
    padding: 0.6em 0.1em 0.6em 0.6em;
    text-align: right;
    border: none;
  }
</style>