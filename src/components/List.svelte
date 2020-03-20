<script>
  import { draw, fly } from "svelte/transition"
  // import VirtualList from '@sveltejs/svelte-virtual-list';

  import flags from "./flags/all.js"
  import ListItem from "./ListItem.svelte"

  export let data

  let selectedCategory = null
  let selectedLang = null
  let searchString = ""

  const langFlagMap = {
    "en": "gb",
    "fr": "fr",
    "es": "es",
    "de": "de",
    "it": "it",
    "zh": "cn",
    "id": "id",
    "pt": "pt",
    "pl": "pl",
    "ru": "ru",
    "el": "gr",
    "ta": "in",
    "hi": "in",
    "bn": "bn",
    "tr": "tr",
    "ar": "ar",
    "hr": "hr",
    "fa": "ir",
    "ms": "ms",
    "te": "te",
    "no": "no",
    "ca": "ca",
    "sk": "sk",
    "mr": "mr",
    "ml": "ml",
    "gu": "gu",
  }

  $: categories = [...new Set(data.map(d => d.category))].filter(d => d)

  const colors = ["#58B19F", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3", "#0fb9b1"]
  let categoryColors = {}
  let totalHeight = 300
  $: categories.forEach((category, i) => {
    categoryColors[category] = colors[i % colors.length]
  })

  $: dataWithIds = data.map((d,i) =>({
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
        !selectedCategory
        || (selectedCategory == d.category)
      ) && (
        !selectedLang
        || (selectedLang == d["language_code"])
      ) && (
        !searchString
        || (d["title"].toLowerCase().includes(searchString.toLowerCase()))
      )

      if (!isShowing) {
        metadata[d.id] = {
          ...d,
          x: 0,
          y: 0,
          height: 0,
          columnId: -1,
        }
        return
      }

      const height = Math.max(
          2,
          Math.round(
            d.title.length
            * (d.language_code == "zh" ? 3.5 : 2)
            / 30
          )
        )
        * 30
        + 120
      metadata[d.id] = {
        ...d,
        x: runningColumnId * 380,
        y: runningYs[runningColumnId],
        height,
        columnId: runningColumnId,
      }
      runningYs[runningColumnId] += height + 30
      runningColumnId = (runningColumnId + 1) % 3
    })

    totalHeight = Math.max(...runningYs)
  })()
</script>

<div class="c" style={`height: ${totalHeight}px`}>
  <div class="filters">
    {#each categories as category}
      <button
        class="filter"
        style={`color: ${
          (!selectedCategory || (selectedCategory == category))
          && categoryColors[category]
        }`}
        on:click={() => (
          selectedCategory = selectedCategory == category ? null : category
        )}>
        { category }
      </button>
    {/each}
    {#each Object.keys(langFlagMap) as lang}
      <button
        class="filter"
        on:click={() => (
          selectedLang = selectedLang == lang ? null : lang
        )}>
        <div class="flag">
          {@html flags[langFlagMap[lang] || lang || ""] }
        </div>
      </button>
    {/each}
  </div>
  <div class="input">
    <input bind:value={searchString} />
  </div>
  <div class="list">
    {#each ids.slice(0, 300) as id}
      {#if metadata[id]}
        <div
          class={`card card--column-${metadata[id].columnId} card-${
            metadata[id].title.length <  60 ?   "s" :
            metadata[id].title.length <  90 ?   "m" :
            metadata[id].title.length < 160 ?   "l" :
            metadata[id].title.length < 200 ?  "xl" :
                                              "xxl"
          }`}
          style={`transform: translate(${metadata[id].x}px, ${metadata[id].y}px); height: ${metadata[id].height}px; background: ${categoryColors[metadata[id].category]}`}
          >
          <ListItem
            {langFlagMap}
            {categoryColors}
            {...metadata[id]}
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
    margin: auto 10em;
    max-width: 80vw;
    width: 100%;
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
    margin-right: 2em;
    padding-top: 3em;
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
  .input {
    width: 100%;
    margin-top: -6.6em;
    margin-bottom: 1.6em;
  }
  .input input {
    width: calc(100% - 4em);
    padding: 1em 2em;
    font-size: 1.3em;
    line-height: 1em;
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
    width: 350px;
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
</style>