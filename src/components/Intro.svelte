<script>
  import { onMount } from "svelte"
  import { draw, fade } from "svelte/transition"
  import ListItem from "./ListItem.svelte"
  import { dateAccessor, titleAccessor, organizations, categories, categoryColors } from "./data-utils"

  export let data
  let focusedIndex = 0
  let isHovering = false

  onMount(() => {
    const interval = setInterval(() => {
      if (isHovering) return
      if (!data.length) return
      focusedIndex = Math.min(data.length - 1, focusedIndex + 1)
    }, 4000)

    return () => {
      clearInterval(interval)
    }
  })

  $: factChecksByDate = [...data]
    .sort((a,b) => dateAccessor(b) - dateAccessor(a))
    .map((d,i) => ({
      ...d,
      id: i,
    }))
  $: lastFactChecks = [{}, {}, ...factChecksByDate]
    .slice(
      focusedIndex,
      focusedIndex + 5
    )
</script>

<div class="c">

  <div class="text">
    <h1>
      Covid 2019
      <b>Misinformation Explorer</b>
    </h1>
    <!-- <h2>
      Understand what false claims are spreading; what you may have unknowingly read.
    </h2> -->
    <p>
      We compiled fact-checks from over 100 organizations around the world to combat misinformation about Covid-19.
    </p>

    <p>
      Explore to find what false claims are being made about Covid-19 and where they're being spread.
    </p>

    <p>
      We've grouped each of these fact-checks into categories:
    </p>
    <!-- <div class="orgs">
      {#each organizations as organization}
        <div class="org">
          { organization }
        </div>
      {/each}
    </div> -->
  </div>

  <div class="focus" on:mouseover={() => isHovering = true} on:mouseleave={() => isHovering = false}>
    {#each lastFactChecks as item, i (item.id || `null-${i}`)}
      {#if item.id}
        <div class={`list-item list-item--${i}`} on:click={() => focusedIndex = Math.min(data.length - 1, Math.max(0, focusedIndex + (i - 2)))}>
          <ListItem
            {item}
          />
        </div>
      {/if}
    {/each}
  </div>
  <!-- <div class="grid">
    {#each lastFactChecks as item, i}
      <div class="grid-item" transition:fade={{ duration: 2000, delay: i * 100 }}>
        <ListItem
          {item}
        />
      </div>
    {/each}
  </div> -->

</div>

<div class="sticky">
  {#each categories as category, i}
    {
      !i                           ? ""       :
      i == (categories.length - 1) ? ", and " :
                                     ", "
    }
    <span style={`color: ${categoryColors[category]}`}>
      { category }
    </span>
  {/each}
</div>

<style>
  .c {
    display: flex;
    align-items: center;
    position: relative;
  }
  h1 {
		/* font-size: 3em;
		line-height: 1.6em; */
		font-weight: 900;
		/* max-width: 90%; */
		margin-bottom: 0.3em;
		/* font-weight: 900; */
		font-size: 4em;
		line-height: 1em;
	}
  h1 b {
    font-size: 0.7em;
    line-height: 1em;
    /* font-weight: 300; */
    white-space: nowrap;
  }
	h2 {
		font-weight: 300;
		font-size: 2.3em;
		line-height: 1.3em;
		color: #888ca1;
		max-width: 30em;
	}
	h3 {
		font-size: 2.3em;
		line-height: 1.1em;
		font-weight: 500;
		max-width: 90%;
		margin-bottom: 1.2em;
	}

	p {
		max-width: 60em;
		margin: 1em 0;
		font-size: 1.3em;
		line-height: 1.6em;
	}

  .sticky {
    position: sticky;
    top: 0;
    padding: 0.5em 3em 0.5em 1em;
    background: var(--background-color);
    font-size: 1.2em;
    z-index: 100;
  }
	.orgs {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		max-width: 80em;
		margin-bottom: 2em;
	}
	.org {
		margin: 0.5em 1em;
		font-size: 0.7em;
		line-height: 1.1em;
		opacity: 0.4;
	}
  .focus {
    position: relative;
    display: flex;
    flex: 1;
    height: 30em;
    overflow: hidden;
  }
  .focus:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5em;
    background: linear-gradient(
      to bottom,
      #f4f5fa 0%,
      transparent 100%
    );
    z-index: 100;
    pointer-events: none;
  }
  .focus:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5em;
    background: linear-gradient(
      to top,
      #f4f5fa 0%,
      transparent 100%
    );
    z-index: 100;
    pointer-events: none;
  }
  .list-item {
    position: absolute;
    top: 50%;
    height: 15em;
    text-align: left;
    width: 33em;
    transform: translate(0, -50%);
    transition: opacity 0.5s ease-out,
      transform 0.5s ease-out;
    font-size: 0.9em;
    pointer-events: all;
    cursor: pointer;
  }
  .list-item :global(.card-wrapper) {
    width: 100%;
    pointer-events: none;
  }
  .list-item--0 {
    opacity: 0;
    transform: translate(0, -275%);
  }
  .list-item--1 {
    opacity: 0.6;
    transform: translate(0, -175%);
  }
  .list-item--2 {
    z-index: 10;
    pointer-events: none;
  }
  .list-item--3 {
    opacity: 0.6;
    transform: translate(0, 75%);
  }
  .list-item--4 {
    opacity: 0;
    transform: translate(0, 175%);
  }
  .grid {
    position: relative;
    flex: 1;
    height: 16em;
    /* position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0; */
    /* overflow: hidden; */
    /* display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 3em;
    grid-column-gap: 1em; */
  }
  .grid-item {
    font-size: 0.6em;
    width: 27em;
    position: absolute;
  }
  .grid-item:nth-child(1) {}
  .grid-item:nth-child(2) {
    transform: translate(18em, 6em);
    z-index: 2;
  }
  .grid-item:nth-child(3) {
    transform: translate(36em, 12em);
    z-index: 3;
  }
  .grid-item:nth-child(4) {
    top: 20em;
    /* transform: translate(15em, 8em); */
    z-index: 4;
  }
  .grid-item:nth-child(5) {
    top: 20em;
    transform: translate(18em, 6em);
    z-index: 5;
  }
  .grid-item:nth-child(6) {
    top: 20em;
    transform: translate(36em, 12em);
    z-index: 6;
  }
  .text {
    /* padding: 0 20em; */
    text-align: left;
    padding: 1em 3em;
    flex: 1;
  }
</style>