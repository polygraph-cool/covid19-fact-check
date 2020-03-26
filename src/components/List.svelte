<script>
  import { draw, fly } from "svelte/transition"
  // import VirtualList from '@sveltejs/svelte-virtual-list';
  import { data, dateAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizations, organizationAccessor, tags, tagsAccessor } from "./data-utils"
  import { debounce, smoothScrollTo } from "./utils"

  import flags from "./flags/all.js"
  import ListItem from "./ListItem.svelte"
  // export let data

  let selectedType = null
  let selectedRating = null
  // let selectedLang = null
  let selectedOrg = null
  let selectedTag = null
  let searchString = ""
  let containerElement
  let inputElement

  const langFlagMap = { "en": "gb", "fr": "fr", "es": "es", "de": "de", "it": "it", "zh": "cn", "id": "id", "pt": "pt", "pl": "pl", "ru": "ru", "el": "gr", "ta": "in", "hi": "in", "bn": "bn", "tr": "tr", "ar": "ar", "hr": "hr", "fa": "ir", "ms": "ms", "te": "te", "no": "no", "ca": "ca", "sk": "sk", "mr": "mr", "ml": "ml", "gu": "gu", }

  const colors = ["#58B19F", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3", "#0fb9b1"]
  let typeColors = sourceColors
  let totalHeight = 300

  $: dataWithIds = data.sort((a,b) => (
    dateAccessor(a) > dateAccessor(b) ? -1 : 1
  )).map((d,i) =>({
      ...d,
      id: i,
    }))
  $: ids = dataWithIds.map(({ id }) => id)
  const metadata = {}
  $: (() => {
    let runningYs = [0, 0, 0]
    let runningColumnId = 0
    dataWithIds.forEach(d => {
      const isShowing = (
        !selectedType
        || (sourceAccessor(d).includes(selectedType))
      ) && (
        !selectedRating
        || (ratingAccessor(d) == selectedRating)
      ) && (
        !selectedOrg
        || (organizationAccessor(d) == selectedOrg)
      ) && (
        !selectedTag
        || (tagsAccessor(d).includes(selectedTag))
      // ) && (
      //   !selectedLang
      //   || (selectedLang == d["language_code"])
      ) && (
        !searchString
        || (d["what"].toLowerCase().includes(searchString.toLowerCase()))
      )

      if (!isShowing) {
        metadata[d.id] = {
          ...d,
          x: 0,
          y: 0,
          height: 0,
          columnId: -1,
          mainSource: sourceAccessor(d)[0],
          isShowing: false,
        }
        return
      }

      const height = Math.max(
          2,
          Math.round(
            d.what.length
            * 2
            // * (d.language_code == "zh" ? 3.5 : 2)
            / 30
          )
        )
        * 30
        + 120
      metadata[d.id] = {
        ...d,
        x: runningColumnId * 378,
        y: runningYs[runningColumnId],
        height,
        columnId: runningColumnId,
        mainSource: sourceAccessor(d)[0],
        isShowing: true,
      }
      runningYs[runningColumnId] += height + 60
      runningColumnId = (runningColumnId + 1) % 3
    })

    totalHeight = Math.max(...runningYs)
  })()

  $: itemsCount = data.length
  $: showingItemsCount = Object.values(metadata).filter(d => d.isShowing).length

  const scrollToTop = () => {
    containerElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start' ,
    })
    // const elementY = containerElement.offsetTop - 100
    // console.log(elementY)
    // smoothScrollTo(elementY, 300)
  }

  const filterTo = (type, newValue) => {
    if (type == "type") {
      selectedType = newValue
    }
    scrollToTop()
  }
  const onUpdateSearchString = e => {
    const newValue = e.target.value
    searchString = newValue
    scrollToTop()
  }
  const debouncedOnUpdateSearchString = debounce(onUpdateSearchString, 300)

  const getTextWidth = (str="") => (
    typeof str == "string"
      ? Math.max(str.length * 1.3 + 0.9, 6)
      : 6
  )
</script>

<div class="c" style={`height: ${totalHeight}px`} bind:this={containerElement}>
  <div class="filters">
    <div class="filter">
      <div class="filter-label">
        Source
      </div>
      <select bind:value={selectedType} on:change={scrollToTop} style={`width: ${getTextWidth(selectedType)}em`}>
        <option value="">All</option>
        {#each sources as source}
          <option
            style={`color: ${
              (!selectedType || (selectedType == source))
              && typeColors[source]
            }`}
            value={source}>
            { source }
          </option>
        {/each}
      </select>
    </div>
    <div class="filter">
      <div class="filter-label">
        Rating
      </div>
      <select bind:value={selectedRating} on:change={scrollToTop} style={`width: ${getTextWidth(selectedRating)}em`}>
        <option value="">Any</option>
        {#each ratings as rating}
          <option
            value={rating}>
            { rating }
          </option>
        {/each}
      </select>
    </div>
    <div class="filter">
      <div class="filter-label">
        Fact-checker
      </div>
      <select bind:value={selectedOrg} on:change={scrollToTop} style={`width: ${getTextWidth(selectedOrg)}em`}>
        <option value="">Any</option>
        {#each organizations as org}
          <option
            value={org}>
            { org }
          </option>
        {/each}
      </select>
    </div>
    <div class="filter">
      <div class="filter-label">
        Tags
      </div>
      <select bind:value={selectedTag} on:change={scrollToTop} style={`width: ${getTextWidth(selectedTag)}em`}>
        <option value="">Any</option>
        {#each tags as tag}
          <option
            value={tag}>
            { tag }
          </option>
        {/each}
      </select>
    </div>
    <!-- {#each Object.keys(langFlagMap) as lang}
      <button
        class="filter"
        on:click={() => (
          selectedLang = selectedLang == lang ? null : lang
        )}>
        <div class="flag">
          {@html flags[langFlagMap[lang] || lang || ""] }
        </div>
      </button>
    {/each} -->
  </div>
  <div class="input" bind:this={inputElement}>
    <input placeholder="Search for a fact check..." on:keydown={debouncedOnUpdateSearchString} />
    <div class="count">
      Showing { showingItemsCount } of { itemsCount } fact checks about Covid-19
    </div>
  </div>
  <div class="list">
    {#each ids.slice(0, 300) as id}
      {#if metadata[id]}
        <div
          class={`card card--column-${metadata[id].columnId} card-${
            metadata[id].what.length <  60 ?   "s" :
            metadata[id].what.length <  90 ?   "m" :
            metadata[id].what.length < 160 ?   "l" :
            metadata[id].what.length < 200 ?  "xl" :
                                              "xxl"
          }`}
          class:hidden={!metadata[id].isShowing}
          style={[
            `transform: translate(${metadata[id].x}px, ${metadata[id].y}px)`,
            `height: ${metadata[id].height}px`,
          ].join(";")}
          >
          <ListItem
            item={metadata[id]}
          />
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .c {
    /* display: flex;
    flex-direction: column; */
    position: relative;
    max-width: 69.6em;
    width: 100%;
    margin: 3em auto;
    padding: 0 10em;
  }
  .list {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 70px;
    grid-gap: 2em;
    grid-column-gap: 4em;
    margin-top: 3em;
  }
  @media (min-width: 1200px) {
    .list {
      grid-auto-rows: 50px;
        /* grid-template-columns: repeat(auto-fill, minmax(30%, 1fr)); */
    }
  }
  .flag {
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.3em;
    width: 2em;
    height: 1.4em;
  }
  .flag :global(svg) {
    width: 100%;
    height: 100%;
  }
  .filters {
    position: sticky;
    top: 0;
    /* flex: 0 0 15em; */
    flex: 0 0 0;
    width: 15em;
    height: 0;
    /* height: 17em; */
    margin-left: -17em;
    /* margin-top: 2em; */
    margin-right: 2em;
    padding-top: 6em;
    text-align: right;
  }
  .filter {
    display: block;
    font-size: 1.2em;
    margin: 0 0;
    padding: 0.6em 0.3em;
    background: none;
    border: none;
    text-align: right;
    width: 100%;
    appearance: none;
    cursor: pointer;
  }
  select {
    max-width: 10em;
    margin-top: 0.5em;
    padding: 0.6em 0.1em 0.6em 0.6em;
    text-align: right;
    border: none;
  }
  option {
    /* direction: rtl; */
  }
  .input {
    position: sticky;
    top: 0;
    width: 100%;
    margin-top: -6.6em;
    margin-bottom: 3.6em;
    padding-top: 1em;
    padding-bottom: 1.2em;
    background: #EDEEF3;
    box-shadow: 0px 8px 10px -8px rgba(52, 73, 94, .2), 0 1px 1px rgba(52, 73, 94, 0.1);
    z-index: 100;
  }
  .input input {
    width: calc(100% - 2.9em);
    padding: 0.8em 1.2em;
    font-size: 1.2em;
    line-height: 1em;
    border: none;
  }

  @keyframes popIn {
      0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .card {
    /* max-width: 25em; */
    /* margin: 1em; */
    position: absolute;
    top: 0;
    left: 0;
    text-align: left;
    width: 345px;
    /* padding-bottom: 6px;
    padding-left: 6px;
    padding-right: 2px;
    padding-top: 2px; */
    /* overflow: hidden; */
    transition: transform 0.6s ease-out;
    background: black;

    /* transform: translateY(30px); */
    /* opacity: 0; */
    /* animation-name: popIn;
    animation-duration: 0.3s;
    animation-fill-mode: forwards; */
  }
  .card--column--1 {
    opacity: 0;
  }
  /* .card--column-1 { left: 33%; }
  .card--column-2 { left: 66%; } */
  /* .card:nth-child(9n+4) {
    grid-column: span 2;
    grid-row: span 2;
  }
  .card:nth-child(9n+4).card-l,
  .card:nth-child(9n+4).card-xl,
  .card:nth-child(9n+4).card-xxl {
    grid-row: span 3;
  }
  .card-xs {
    grid-row: span 2;
  }
  .card-s {
    grid-row: span 3;
  }
  .card-m {
    grid-row: span 4;
  }
  .card-l {
    grid-row: span 5;
  }
  .card-xl {
    grid-row: span 6;
  }
  .card-xl {
    grid-row: span 7;
  } */
  .hidden {
    opacity: 0;
    pointer-events: none;
  }
</style>