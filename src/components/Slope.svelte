<script>
  import { scaleLinear, scaleSqrt } from "d3-scale"
  import { min } from "d3-array"
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import Number from "./Number.svelte"
  import { smoothScrollTo, sortBy } from "./utils.js"
  import flags from "./flags/all.js"

  export let data
  export let metric
  export let selectedCountry

  let component
  let currentSortMetric = "rank"

  $: continents = [...new Set(data.map(d => d.continent))]
    .filter(d => d !== undefined)
  // const continentColors =

  $: countryIndices = {}
  $: sortedData = [...data]
    // .sort(sortBy(metric))
    .sort(sortBy(currentSortMetric))
    .reverse()

  $: sortedData.map((d,i) => {
    countryIndices[d.name] = i
  })

  $: xScale = scaleLinear()
    .domain([0, sortedData.length])
    .range([0, 92])

  const rowHeight = 40
  $: yScale = scaleLinear()
    .domain([0, data.length])
    .range([0, data.length * rowHeight])

  $: countryData = data.map(d => {
    const start = d.rank
    const end = d[metric]
    const startX = xScale(start)
    const endX = xScale(end)

    return {
      name: d.name,
      id2: d.id2,
      start,
      end,
      startX,
      endX,
      left: Math.min(startX, endX),
      right: Math.max(startX, endX),
      y: yScale(countryIndices[d.name]),
    }
  })

  $: (() => {
    const _ = metric
    if (!component) return
    const newOffset = countryIndices[selectedCountry] * rowHeight
    const yOffset = newOffset - window.innerHeight / 2
    setTimeout(() => {
      if (!component) return
      // const element = component.querySelector(".row.active")
      // element.scrollIntoView({
      //   behavior: 'smooth'
      // })
      smoothScrollTo(yOffset, 1300, component)
    }, 600)
  })()

  $: doesNeedResort = metric != currentSortMetric

  const rankLabels = {
    rank: "rank by medals won",
    gdpRank: "rank with equal GDP",
    populationRank: "rank with equal population",
  }
</script>

<div class="container">
  <div class="group" bind:this={component}>
    {#if doesNeedResort}
      <button class="sort" on:click={() => currentSortMetric = metric}>
        Re-sort countries by { rankLabels[metric] }
      </button>
    {/if}
    <div class="wrapper" style={`height: ${(data.length + 1) * rowHeight}px`}>
      {#each countryData as { name, id2, y, start, end, startX, endX, left, right }, i (name)}
        <div
          class="row"
          class:active={selectedCountry == name}
          style={`transform: translateY(${y}px)`}
          animate:flip="{{ duration: 2000, delay: 100 + i * 10 }}"
          >
          <div class="row-label">
            <div class="flag">
              {@html flags[(id2 || "").toLowerCase()] }
            </div>
            { name }
          </div>
          <div class="row-items">
            <div class="row-slider"
              style={`transform: translateX(${endX}%); z-index: 100`}>
              <div
                class="country"
                class:active={selectedCountry == name}
                title={name}
                >
                <Number isOrdinal number={ end } />
              </div>
            </div>
            {#if metric != "rank"}
              <div class="row-slider"
                style={`transform: translateX(${startX}%)`}>
                <div class="country-ghost">
                  <Number isOrdinal number={ start } />
                </div>
              </div>
            {/if}
            <svg
              width="100%"
              height={rowHeight}
              viewBox="0 -1 100 2"
              preserveAspectRatio="none"
              style={`transform: translateX(${start > end ? "2em" : "0"})`}>
              <path
                class="arrow-line"
                d={[
                  "M", left, 0,
                  "L", right, 0,
                ].join(" ")}
                vector-effect="non-scaling-stroke"
              />
              {#if start > end}
                <path
                  class="arrow-line"
                  d={[
                    "M", left + 1, -0.25,
                    "l", -1, 0.25,
                    "l", 1, 0.25,
                  ].join(" ")}
                  vector-effect="non-scaling-stroke"
                />
              {/if}
              {#if start < end}
                <path
                  class="arrow-line"
                  d={[
                    "M", right - 1, -0.25,
                    "l", 1, 0.25,
                    "l", -1, 0.25,
                  ].join(" ")}
                  vector-effect="non-scaling-stroke"
                />
              {/if}
            </svg>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .container {
    position: relative;
    width: 100%;
    max-height: 100vh;
  }
  .container:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 1em;
    background: linear-gradient(
      to top,
      transparent 0%,
      #f3f8fb 95%
    );
    z-index: 100;
  }
  .container:after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2em;
    height: 1em;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      #f3f8fb 95%
    );
    z-index: 100;
  }
  .group {
    padding: 1em 0;
    max-height: 100vh;
    overflow: auto;
  }
  .wrapper {
    position: relative;
  }
  .row {
    display: flex;
    align-items: center;
    width: calc(100% - 1.6em);
    position: absolute;
    left: 0;
    top: 0;
    height: 40px;
    padding: 0 0 0 1.6em;
    background: #f3f8fb99;
    /* transition: all 1s ease-out; */
  }
  .row.active {
    background: white;
    z-index: 100;
  }
  .row-label {
    display: flex;
    align-items: center;
    flex: 0 0 12em;
    width: 12em;
    white-space: nowrap;
  }

  .flag {
    width: 1.3em;
    height: 1.3em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.3em;
    border-radius: 100%;
    overflow: hidden;
    border: 3px solid #fff;
  }
  .flag :global(svg) {
    flex: 0 0 200%;
    width: 200%;
    /* height: 200%; */
  }
  .row-items {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
    /* margin: 1em 0; */
  }
  .country {
    height: 2.3em;
    width: 2.3em;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #cbbdff;
    color: #342892;
    font-size: 0.76em;
    border-radius: 100%;
    transition: all 1s ease-out;
    z-index: 12;
  }
  .country.active {
    background: #efa22e;
  }
  .country-ghost {
    height: 2.3em;
    width: 2.3em;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #cbbdff;
    font-size: 0.76em;
    border-radius: 100%;
    transition: all 1s ease-out;
    background: white;
    border: 1px dashed #c8d5dd;
    z-index: 10;
    color: #99adb8;
  }
  /* .country-line {
    position: absolute;
    top: 0;
  }
  .country-line:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0.8em;
    right: 0.8em;
    border-top: 1px solid #c8d5dd;
  }
  .country-arrow {
    position: absolute;
    top: 0;
    left: 0.8em;
    width: 0.3em;
    height: 0.3em;
    border: 0 solid #c8d5dd;
    border-top-width: 1px;
    border-left-width: 1px;
    transform-origin: top left;
    transform: rotate(-45deg);
  }
  .country-arrow.right {
    left: auto;
    right: 0.8em;
    border-width: 1px 1px 0 0;
    transform-origin: top right;
    transform: rotate(45deg);
  } */

  .row-slider {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    transition: all 1s ease-out;
    z-index: 10;
  }
  .arrow-line {
    fill: none;
    stroke: #c8d5dd;
    stroke-width: 1px;
  }
  svg,
  path {
    transition: all 1s ease-out;
  }

  .sort {
    background: white;
    padding: 0.5em 1.5em;
    position: absolute;
    bottom: 1em;
    right: 2em;
    z-index: 200;
    appearance: none;
    border: 1px solid #eaeaee;
    font-weight: 600;
    color: #4e4597;
    cursor: pointer;
    box-shadow: 0 13px 11px -3px #cccccc33, 0 2px 2px #cccccc66;
  }
</style>