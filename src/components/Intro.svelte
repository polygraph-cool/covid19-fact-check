<script>
  import { onMount } from "svelte"
  import { draw, fade } from "svelte/transition"

  import ListItem from "./ListItem.svelte"
  import InterpolatedNumber from "./InterpolatedNumber.svelte"
  import { dateAccessor, titleAccessor, categories, categoryColors } from "./data-utils"
  import { smoothScrollTo } from "./utils"

  export let data
  export let isLoading

  let focusedIndex = 1
  let isHovering = false

  const windowGlobal = typeof window !== "undefined" && window
  onMount(() => {
    const interval = setInterval(() => {
      if (isHovering) return
      if (!data.length) return
      focusedIndex = Math.min(data.length - 1, focusedIndex + 1)
    }, 3000)

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

	const scrollOptions = [
    ["categories", "What categories of false claims are being spread?"],
		["countries", "Where are the false claims coming from?"],
		["list", "See all of the claims"],
  ]

  const scrollToSection = id => {
    const sectionElement = document.getElementById(id)
    if (!sectionElement) return

    const onEnd = () => {
      if (!windowGlobal) return
      windowGlobal.location.href = `#${id}`
    }

    smoothScrollTo(
      sectionElement.offsetTop - 200,
      500,
      undefined,
      onEnd,
    )
    // sectionElement.scrollIntoView({
    //   behavior: 'smooth',
    // })
  }
</script>

<div class="c">

  <div class="text">
    <h1>
      COVID-19
      <b>Misinformation Explorer</b>
    </h1>
    <!-- <h2>
      Understand what false claims are spreading; what you may have unknowingly read.
    </h2> -->
    <p>
      We compiled <InterpolatedNumber number={data.length || 1800} /> fact checks from over <a href="#footer" class="inline-link" on:click={() => scrollToSection("footer")}>100 organizations</a> around the world to combat misinformation about Covid-19.
    </p>

    <p>
      Explore to find what false claims are being made about Covid-19 and where they're being spread.
    </p>

    <div class="scroll-list">
      {#each scrollOptions as [id, option], i}
        <a href={`#${id}`} class="scroll-list-item" on:click|preventDefault={() => scrollToSection(id)}>
          <div class="scroll-list-item-number">
            { i + 1 }
          </div>
          <div class="scroll-list-item-name">
            { id }
          </div>
          <div class="scroll-list-item-label">
            { option }
          </div>
        </a>
      {/each}
    </div>
    <!-- <div class="orgs">
      {#each organizations as organization}
        <div class="org">
          { organization }
        </div>
      {/each}
    </div> -->
  </div>

  <div class="focus" on:mouseover={() => isHovering = true} on:mouseleave={() => isHovering = false}>
    {#if isLoading}
      <div class="loading">
        Loading fact checks...
      </div>
    {/if}
    <div class="focus-title">
      Newest fact checks
      <br />
      <a href="#list" on:click={() => scrollToSection("list")}>See all</a>
    </div>
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

<!-- <div class="sticky">
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
</div> -->

<style>
  .c {
    display: flex;
    align-items: center;
    position: relative;
    max-width: 80em;
    margin: 0 auto;
    padding-top: 3em;
    padding-bottom: 5em;
  }
  h1 {
		/* font-size: 3em;
		line-height: 1.6em; */
		font-weight: 900;
		/* max-width: 90%; */
		margin-bottom: 0.6em;
		/* font-weight: 900; */
		font-size: 4em;
		line-height: 1em;
	}
  h1 b {
    display: block;
    font-size: 0.7em;
    line-height: 1em;
    margin-top: 0.1em;
    /* font-weight: 300; */
    /* white-space: nowrap; */
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

  .inline-link {
    color: inherit;
  }

  .sticky {
    position: sticky;
    top: 0;
    /* left: 50%;
    transform: translateX(-50%); */
    padding: 0.5em 3em 0.5em 0;
    background: #fff;
    font-size: 1.2em;
    /* max-width: 100%; */
    /* width: 80em; */
    margin: 0 3em;
    z-index: 100;
  }
  .scroll-list {
    padding: 0.3em 0 1em;
  }
  .scroll-list-item {
    position: relative;
    display: block;
    margin: 0.2em 0 0.2em -1em;
    padding: 0.6em 1em;
    font-size: 1.2em;
    line-height: 1.5em;
    color: inherit;
    text-decoration: none;
    border-radius: 0.6em;
  }
  .scroll-list-item:hover {
    background: white;
  }
  .scroll-list-item-number {
    position: absolute;
    /* top: 50%; */
    /* margin-top: -0.2em; */
    left: -0.3em;
    color: #8b87c5;
    font-size: 0.7em;
    font-weight: 700;
    /* opacity: 0; */
    /* transform: translateY(-50%); */
  }
  .scroll-list-item-name {
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #8b87c5;
    font-size: 0.7em;
    font-weight: 700;
  }
  .scroll-list-item-label {
    font-size: 1.1em;
  }


	/* .orgs {
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
	} */
  .focus {
    position: relative;
    display: flex;
    flex: 1;
    height: 34em;
    margin: 3em 0 0;
    overflow: hidden;
  }
  .focus:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 7em;
    background: linear-gradient(
      to bottom,
      #fff 30%,
      rgba(244, 245, 250, 0.01) 100%
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
      #fff 0%,
      rgba(244, 245, 250, 0.01) 100%
    );
    z-index: 100;
    pointer-events: none;
  }
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    /* font-weight: 700; */
    text-align: center;
    opacity: 0.6;
    font-style: italic;
    transform: translate(-50%, -50%);
  }
  .focus-title {
    position: absolute;
    top: 0;
    left: 50%;
    text-align: center;
    font-weight: 700;
    /* text-transform: uppercase;
    letter-spacing: 0.1em; */
    transform: translateX(-50%);
    z-index: 200;
  }
  .focus-title a {
    position: absolute;
    right: -3.5em;
    top: -0.3em;
    margin-top: 0.3em;
    font-weight: 500;
    /* font-size: 0.9em; */
    opacity: 0.6;
    color: inherit;
  }
  .list-item {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 16.4em;
    text-align: left;
    width: 33em;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease-out;
    font-size: 0.9em;
    pointer-events: all;
    cursor: pointer;
    --max-lines: 4;
  }
  .list-item :global(.card-wrapper) {
    width: 100%;
    pointer-events: none;
  }
  .list-item--0 {
    opacity: 0;
    transform: translate(-50%, -275%);
  }
  .list-item--1 {
    opacity: 0.6;
    transform: translate(-50%, -175%);
  }
  .list-item--2 {
    z-index: 10;
    pointer-events: none;
  }
  .list-item--3 {
    opacity: 0.6;
    transform: translate(-50%, 75%);
  }
  .list-item--4 {
    opacity: 0;
    transform: translate(-50%, 175%);
  }
  .text {
    /* padding: 0 20em; */
    text-align: left;
    padding: 1em 3em;
    flex: 1;
  }
  @media (max-width: 1155px) {
    .c {
      flex-direction: column;
    }
    .focus {
      height: 30em;
      width: 100%;
      flex: none;
    }
    .focus:before {
      left: 0;
      bottom: 0;
      right: auto;
      height: auto;
      width: 5vw;
      background: linear-gradient(
        to right,
        #fff -10%,
        rgba(244, 245, 250, 0.01) 100%
      );
    }
    .focus:after {
      left: auto;
      top: 0;
      right: 0;
      height: auto;
      width: 5vw;
      background: linear-gradient(
        to left,
        #fff -10%,
        rgba(244, 245, 250, 0.01) 100%
      );
    }

    .list-item {
      height: auto;
      top: 6em;
      width: 88vw;
    }
    .list-item--0 {
      transform: translate(-270%, 0);
    }
    .list-item--1 {
      opacity: 1;
      transform: translate(-152%, 0);
    }
    .list-item--2 {
      transform: translate(-50%, 0);
    }
    .list-item--3 {
      opacity: 1;
      transform: translate(52%, 0);
    }
    .list-item--4 {
      transform: translate(170%, 0);
    }
  }
  @media (max-width: 700px) {
    h1 {
      font-size: 2.3em;
    }
    p {
      font-size: 1em;
    }
    .scroll-list-item {
      font-size: 1em;
    }
  }
</style>