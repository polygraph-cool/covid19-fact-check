<script>
  export let label
  export let value
  export let options
  export let type = "dropdown"
  export let placeholder = ""
  export let colors = {}

  const onSelect = option => {
    value = option == value ? null : option
  }
</script>

<div class={`filter filter--type-${type}`}>
  <div class="label">
    { label }
  </div>
  {#if value}
    <div class="clear" on:click={() => value = ""}>
      <!-- clear -->
      <svg width="0.7em" height="0.7em" viewBox="0 0 18 18" fill="currentColor">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M16.945 4.88593C17.9213 3.90962 17.9213 2.32671 16.945 1.3504C15.9687 0.374086 14.3858 0.374086 13.4095 1.3504L9.17725 5.58263L4.94501 1.3504C3.9687 0.374086 2.38579 0.374086 1.40948 1.3504C0.433168 2.32671 0.433168 3.90962 1.40948 4.88593L5.64171 9.11816L1.40948 13.3504C0.433168 14.3267 0.433168 15.9096 1.40948 16.8859C2.38579 17.8622 3.9687 17.8622 4.94501 16.8859L9.17725 12.6537L13.4095 16.8859C14.3858 17.8622 15.9687 17.8622 16.945 16.8859C17.9213 15.9096 17.9213 14.3267 16.945 13.3504L12.7128 9.11816L16.945 4.88593Z" />
      </svg>

    </div>
  {/if}
  {#if type == "dropdown"}
    <select bind:value={value}>
      <option value="">Any</option>
      {#each options as option}
        <option
          value={option}>
          { option }
        </option>
      {/each}
    </select>
  {:else if type == "inline"}
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

  {:else if type == "input"}
    <input bind:value {placeholder} />
  {/if}
</div>

<style>
  .filter {
    position: relative;
    flex: 1;
    min-width: 7em;
    margin-left: 0.6em;
    /* padding: 0.6em 0; */
    background: none;
    border: none;
    /* text-align: right; */
    /* appearance: none; */
    /* cursor: pointer; */
  }
  .filter--type-input {
    flex: 2;
    min-width: 10em;
  }
  .label {
    padding-left: 0.7em;
    font-size: 0.8em;
    margin-bottom: 0.5em;
  }
  select {
    width: 100%;
    padding: 0.6em 0.1em 0.6em 0.6em;
    background: #f4f4f4;
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
  input {
		width: calc(100% - 1.2em);
    padding: 0.56em 0.6em;
		font-size: 0.9em;
		line-height: 1em;
    border: none;
    background: #f4f4f4;
	}
  .clear {
    position: absolute;
    top: 0;
    right: 0;
    /* text-transform: uppercase; */
    /* letter-spacing: 0.06em; */
    font-size: 0.6em;
    /* font-weight: 700; */
    height: 1em;
    width: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #9696ad;
    background: #e3e3e9;
    padding: 0.5em;
    border-radius: 100%;
    transition: background 0.2s ease-out;
  }
  .clear:hover {
    background: #d2d2db;
  }
	@media (max-width: 900px) {
    .filter {
      /* margin: 1em; */
      width: 100%;
    }
    select {
      max-width: none;
      width: 100%;
    }
  }
	@media (max-width: 800px) {
    input {
      padding: 0.9em 0.1em 0.9em 0.6em;
    }
  }
	@media (max-width: 600px) {
    .filter {
      margin-left: 0.6em;
    }
  }
</style>