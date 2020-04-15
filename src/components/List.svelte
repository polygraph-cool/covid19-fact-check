<script>
  import { draw, fly } from "svelte/transition"
  // import VirtualList from '@sveltejs/svelte-virtual-list';
import { dateAccessor, countriesAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizationAccessor, tagsAccessor, titleAccessor, categories, categoryAccessor, categoryColors } from "./data-utils"
  import { debounce, smoothScrollTo } from "./utils"

  import flags from "./flags/all.js"
  import ListItem from "./ListItem.svelte"
  import ListFilter from "./ListFilter.svelte"
  import ListTimeline from "./ListTimeline.svelte"
  import Number from "./Number.svelte"

  export let isLoading
  export let data = []
  export let iteration
  export let isFiltered
  export let filterIteration
  export let filterFunction
  export let filterColor

  const documentGlobal = typeof document !== "undefined" && document

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

  let typeColors = sourceColors
  let totalHeight = 300

  const pageHeight = 1600
  let pageIndex = 1

  $: ids = data.map(({ id }) => id)
  const metadata = {}
  $: filterIteration, pageIndex = 1

  $: (() => {
    let runningColumnId = 0
    const itemsPerRow = Math.round(windowWidth / 500)
    let runningYs = new Array(itemsPerRow).fill(0)
    const itemWidth = 378

    data.forEach(d => {
      const isShowing = filterFunction(d)

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
    if (itemsPerRow == 1) listWidth = null
    totalHeight = Math.max(...runningYs)
  })()

  $: itemsCount = (data || []).length
  $: showingItemsCount = Object.values(metadata).filter(d => d.isShowing).length

  const scrollToTop = () => {
    if (!containerElement) return
    const elementY = containerElement.offsetTop - 100

    const currentScrollY = documentGlobal && documentGlobal.scrollingElement && documentGlobal.scrollingElement.scrollTop || 0
    // don't scroll down page from vizes above
    if (currentScrollY <= elementY) return

    // containerElement.scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'start' ,
    // })
    smoothScrollTo(elementY, 300)
  }

  // const filterTo = (type, newValue) => {
  //   if (type == "type") {
  //     selectedType = newValue
  //   }
  //   scrollToTop()
  // }
  // const onUpdateSearchString = e => {
  //   const newValue = e.target.value
  //   searchString = newValue
  //   scrollToTop()
  // }
  // const debouncedOnUpdateSearchString = debounce(onUpdateSearchString, 300)
  $: filterIteration && scrollToTop()

  $: listHeight = pageHeight * pageIndex
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="c" style={`width: ${listWidth}px`} bind:this={containerElement}>
  <div class="main-list">
    <!-- <div class="filters">
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
      <ListFilter
        label="Tags"
        options={tags}
        bind:value={selectedTag}
        {scrollToTop}
      />
    </div> -->
    <div class="list" style={`height: ${listHeight + 210}px;`}>
      {#each ids as id}
        {#if metadata[id] && metadata[id].y <= (listHeight)}
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
              `width: ${listWidth ? "345px" : null}`,
            ].join(";")}
            >
            <ListItem
              item={metadata[id]}
            />
          </div>
        {/if}
      {/each}
      {#if !ids.filter(id => metadata[id].isShowing).length}
        <p class="loading">
          {isLoading ? "Loading fact checks..." : "No items found with those filters"}
        </p>
      {/if}

    </div>

    {#if listHeight < totalHeight}
      <button on:click={() => pageIndex++} class="load-more">
        Show more
      </button>
    {/if}

  </div>
</div>

<style>
  .c {
    /* display: flex;
    flex-direction: column; */
    position: relative;
    /* max-width: calc(100% - 12em); */
    /* max-width: 69em; */
    /* width: 100%; */
    padding: 1em 0 10em;
    margin: 0 auto 9em;
    width: 90%;
    /* overflow: hidden; */
  }
  .loading {
    text-align: center;
    padding: 1em;
    font-style: italic;
  }
  .top {
    /* position: sticky;
    top: -155px; */
    /* display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end; */
    /* margin-left: 210px; */
    /* background: #f4f5fa;
    box-shadow: 0px 8px 10px -8px rgba(52, 73, 94, .2), 0 1px 1px rgba(52, 73, 94, 0.1);
    z-index: 100; */
    padding-bottom: 1em;
  }
  /* .input {
    position: sticky;
    top: 0;
    width: 100%;
    padding-top: 1em;
    padding-bottom: 1.2em;
  }
  .input input {
    width: calc(100% - 2.9em);
    padding: 0.8em 1em;
    font-size: 1.1em;
    line-height: 1em;
    border: none;
  } */
  .count {
    color: #9093a1;
    text-align: left;
    margin: 0.6em 0 -0.7em 1.8em;
    font-style: italic;
    font-weight: 300;
    font-size: 0.9em;
  }

  .main-list {
    /* display: flex; */
  }
  .list {
    position: relative;
    margin-top: 5em;
    /* flex: 1; */
    /* display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    display: grid; */
    /* grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 70px;
    grid-gap: 2em;
    grid-column-gap: 4em; */
  }
  /* .filters {
    position: sticky;
    top: 6em;
    flex: 0 0 180px;
    width: 180px;
    height: 37.6em;
    padding-right: 30px;
    text-align: right;
  } */
  .card {
    /* max-width: 25em; */
    /* margin: 1em; */
    position: absolute;
    top: 0;
    left: 0;
    text-align: left;
    width: 100%;
    /* max-width: 90vw; */
    /* padding-bottom: 6px;
    padding-left: 6px;
    padding-right: 2px;
    padding-top: 2px; */
    /* overflow: hidden; */
    transition: transform 0.6s ease-out;

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
  .card :global(.row) {
    margin-top: auto;
    margin-bottom: 1.2em;
  }
  .load-more {
    position: absolute;
    bottom: -6em;
    left: 50%;
    appearance: none;
    font-size: 1.3em;
    font-weight: 700;
    cursor: pointer;
    background: none;
    border: none;
    transform: translateX(-50%);
  }

  @media (max-width: 600px) {
    .list {
      margin-left: 2vw;
    }
  }
</style>