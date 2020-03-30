<script>
  import { draw, fly } from "svelte/transition"
  // import VirtualList from '@sveltejs/svelte-virtual-list';
  import { dateAccessor, countries, countriesAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizations, organizationAccessor, tags, tagsAccessor, titleAccessor, categories, categoryAccessor, categoryColors } from "./data-utils"
  import { debounce, smoothScrollTo } from "./utils"

  import flags from "./flags/all.js"
  import ListItem from "./ListItem.svelte"
  import ListFilter from "./ListFilter.svelte"
  import ListTimeline from "./ListTimeline.svelte"
  import Number from "./Number.svelte"

  export let data = []

  let windowWidth = 1200
  let selectedCategory = null
  let selectedType = null
  let selectedRating = null
  // let selectedLang = null
  let selectedOrg = null
  let selectedTag = null
  let selectedCountry = null
  let searchString = ""
  let containerElement
  let inputElement
  let listWidth = 1200
  let filterIteration = 0

  let typeColors = sourceColors
  let totalHeight = 300

  $: dataWithIds = [...data].sort((a,b) => (
    dateAccessor(a) > dateAccessor(b) ? -1 : 1
  )).map((d,i) =>({
      ...d,
      id: i,
    }))

  $: ids = dataWithIds.map(({ id }) => id)
  const metadata = {}
  $: isShowingAccessor = d => (
    !selectedCategory
    || (categoryAccessor(d).includes(selectedCategory))
  ) && (
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
  ) && (
    !selectedCountry
    || (countriesAccessor(d).includes(selectedCountry))
  // ) && (
  //   !selectedLang
  //   || (selectedLang == d["language_code"])
  ) && (
    !searchString
    || (titleAccessor(d).toLowerCase().includes(searchString.toLowerCase()))
  )
  $: selectedCategory, selectedType, selectedRating, selectedOrg, selectedTag, selectedCountry, searchString, filterIteration++

  $: (() => {
    let runningYs = [0, 0, 0]
    let runningColumnId = 0
    const itemsPerRow = Math.round(windowWidth / 500)
    const itemWidth = 378

    dataWithIds.forEach(d => {
      const isShowing = isShowingAccessor(d)

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
            titleAccessor(d).length
            * 1.3
            // * (d.language_code == "zh" ? 3.5 : 2)
            / 30
          )
        )
        * 30
        + 170
      metadata[d.id] = {
        ...d,
        x: runningColumnId * itemWidth,
        y: runningYs[runningColumnId],
        height,
        columnId: runningColumnId,
        mainSource: sourceAccessor(d)[0],
        isShowing: true,
      }
      runningYs[runningColumnId] += height + 60
      runningColumnId = (runningColumnId + 1) % itemsPerRow
    })

    listWidth = itemWidth * (itemsPerRow * 0.98)
    totalHeight = Math.max(...runningYs)
  })()

  $: itemsCount = (data || []).length
  $: showingItemsCount = Object.values(metadata).filter(d => d.isShowing).length

  const scrollToTop = () => {
    containerElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start' ,
    })
    // const elementY = containerElement.offsetTop - 100
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

<svelte:window bind:innerWidth={windowWidth} />

<div class="c" style={`height: ${totalHeight}px; max-width: ${listWidth}px`}>
  <div class="filters">
    <ListFilter
      label="Category"
      options={categories}
      bind:value={selectedCategory}
      type="inline"
      colors={categoryColors}
      {scrollToTop}
    />
    <ListFilter
      label="Country"
      options={countries}
      bind:value={selectedCountry}
      {scrollToTop}
    />
    <ListFilter
      label="Rating"
      options={ratings}
      bind:value={selectedRating}
      {scrollToTop}
    />
    <ListFilter
      label="Source"
      options={sources}
      bind:value={selectedType}
      {scrollToTop}
    />
    <ListFilter
      label="Fact-checker"
      options={organizations}
      bind:value={selectedOrg}
      {scrollToTop}
    />
    <!-- <ListFilter
      label="Tags"
      options={tags}
      bind:value={selectedTag}
      {scrollToTop}
    /> -->
  </div>
  <div bind:this={containerElement}>
    <ListTimeline
      filter={isShowingAccessor}
      iteration={filterIteration}
      {data}
    />
  </div>
  <div class="input">
    <input placeholder="Search for a fact check..." on:keydown={debouncedOnUpdateSearchString} />
    <div class="count">
      Showing
      {#if showingItemsCount == itemsCount}
        <Number number={ itemsCount } />
      {:else}
        <Number number={ showingItemsCount } /> of <Number number={ itemsCount } />
      {/if}
      fact checks about Covid-19
    </div>
  </div>
  <div class="list">
    {#each ids as id}
      {#if metadata[id]}
        <div
          class={`card card--column-${metadata[id].columnId} card-${
            titleAccessor(metadata[id]).length <  60 ?   "s" :
            titleAccessor(metadata[id]).length <  90 ?   "m" :
            titleAccessor(metadata[id]).length < 160 ?   "l" :
            titleAccessor(metadata[id]).length < 200 ?  "xl" :
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
            {searchString}
          />
        </div>
      {/if}
    {/each}
  </div>
  {#if !ids.filter(id => metadata[id].isShowing).length}
    No items found with those filters
  {/if}
</div>

<style>
  .c {
    /* display: flex;
    flex-direction: column; */
    position: relative;
    max-width: calc(100% - 12em);
    max-width: 69em;
    width: 100%;
    margin: 9em auto 3em;
    padding: 3em 1em 10em 10em;
  }
  .list {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    display: grid;
    /* grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 70px;
    grid-gap: 2em;
    grid-column-gap: 4em; */
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
    margin-bottom: -15em;
    padding-top: 6em;
    text-align: right;
  }
  .input {
    position: sticky;
    top: 0;
    width: 100%;
    /* margin-top: -6.6em; */
    margin-bottom: 3.6em;
    padding-top: 1em;
    padding-bottom: 1.2em;
    background: #f4f5fa;
    box-shadow: 0px 8px 10px -8px rgba(52, 73, 94, .2), 0 1px 1px rgba(52, 73, 94, 0.1);
    z-index: 100;
  }
  .input input {
    width: calc(100% - 2.9em);
    padding: 0.8em 1em;
    font-size: 1.1em;
    line-height: 1em;
    border: none;
  }
  .count {
    color: #9093a1;
    text-align: left;
    margin: 0.6em 0 -0.7em 1.8em;
    font-style: italic;
    font-weight: 300;
    font-size: 0.9em;
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