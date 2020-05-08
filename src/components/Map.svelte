<script>
  import { onMount } from "svelte"
  import { scaleOrdinal, scaleLinear, scaleSqrt, scaleTime } from "d3-scale"
  import { extent, max, range } from "d3-array"
  import { color } from "d3-color"
  import { interpolateHclLong } from "d3-interpolate"
  import { format } from "d3-format"
  import { timer } from "d3-timer"
  import { Delaunay } from "d3-delaunay"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { timeFormat, timeParse } from "d3-time-format"
  import { geoArmadillo } from "d3-geo-projection"
  import { timeDay } from "d3-time"
  import { easeCubicOut } from "d3-ease"
  import { geoEqualEarth, geoOrthographic, geoPath, geoCentroid, geoGraticule10 } from "d3-geo"

  // import countryShapes from "./countries.json"
  import { debounce, getDistanceBetweenPoints, getPositionFromAngle, scaleCanvas } from "./utils"
  import { dateAccessor, parseDate, countryAccessor, categories, categoryColors, categoryAccessor } from "./data-utils"
  import { countryShapes, countryCentroids, countryCentroidsVertical } from "./countryData"
  import ItemTooltip from "./ItemTooltip.svelte"
  import DataSource from "./DataSource.svelte"

  export let data = []
  export let isFiltered
  export let filterIteration
  export let filterFunction
  export let countries
  export let iteration
  export let isEmbedded

  // const parseDate = timeParse("%Y-%m-%d")
  const formatDate = timeFormat("%A %B %-d, %Y")
  let hoveredClaim = null
  let canvasElement = null
  // let windowWidth = 1200
  let width = 1200
  $: isVertical = width < 445
  $: height = width * (
    isVertical ? 2 : 0.7
  )
  $: bubbleSize = width * (isVertical ? 0.0027 : 0.0015)
  let highlightIndex = null
  let timeElapsed = 0
  let initTransitionProgress = 1
  let hasHovered = false
  let hasInited = false

  const windowGlobal = typeof window !== "undefined" && window
  const pixelRatio = windowGlobal.devicePixelRatio || 1

  const sphere = ({type: "Sphere"})
  $: projection = isVertical ? (
    geoOrthographic()
    .fitSize([width, width], sphere)
    .rotate([-60, -20])
  ) : (
    geoArmadillo()
    .fitSize([width, height], sphere)
    .rotate([-9, 0])
  )
  $: projection2 = isVertical && (
    geoOrthographic()
      .fitSize([width, width], sphere)
      .translate([width / 2, height * 0.7])
      .rotate([90, -20])
  )
  $: svgPathGenerator = geoPath(projection)

  let categoryOffsets = {}
  categories.forEach((category, i) => {
    const angle = 360 / categories.length * i
    categoryOffsets[category] = getPositionFromAngle(angle, 1)
  })

  let bubbles = []
  let countryData = {}
  let numberOfTotalClaimsByCountry = {}
  const updateBubbles = () => {
    countryData = {}
    const claimsByCountry = {}

    data.forEach(d => {
      const country = countryAccessor(d)
      if (!country) return
      numberOfTotalClaimsByCountry[country] = (numberOfTotalClaimsByCountry[country] || 0) + 1
      if (isFiltered && !filterFunction(d)) return
      if (!claimsByCountry[country]) claimsByCountry[country] = []
      claimsByCountry[country].push(d)
    })
    const rScale = scaleSqrt()
      .domain([0, max(Object.values(claimsByCountry).map(d => d.length))])
      .range([0, 37])

    const colorScale = scaleLinear()
      .domain([0, max(Object.values(claimsByCountry).map(d => d.length))])
      .range(["#67B244", "#67B244"])

    countries.forEach(country => {
      const countryCentroid = isVertical ? countryCentroidsVertical[country] : countryCentroids[country]
      if (!countryCentroid) return {x: 0, y: 0, r: 0}
      if (!countryCentroid[0] && !countryCentroid[1]) return {x: 0, y: 0, r: 0}

      const numberOfPoints = (claimsByCountry[country] || [])
        .length

      const r = rScale(numberOfPoints * 3)

      countryData[country] = {
        name: country,
        x: countryCentroid[0],
        y: countryCentroid[1],
        count: numberOfPoints,
        r: r / width,
        labelR: (r + 19) / width,
        color: colorScale(numberOfPoints),
      }
    })

    // // bubbles = claims
    // bubbles = [...claims]
    // let simulation = forceSimulation()
    //   // .force("x", forceX(d => d.x).strength(1))
    //   .force("x", forceX(d => d.x).strength(0.05))
    //   .force("y", forceY(d => d.y).strength(0.05))
    //   .force("collide", forceCollide(d => (bubbleSize / width) * 1.3).strength(1))
    //   // .force("r", forceRadial(d => d.distance).strength(5))
    //   .nodes(bubbles)
    //   .alphaMin(0.006)
    //   .on("tick", drawBubbles)

    // range(0, 220).forEach(i => simulation.tick())
  }
  $: iteration, filterIteration, isVertical, updateBubbles()

  let blankMap

  const drawCanvas = () => {
    if (!canvasElement) return
    const ctx = canvasElement.getContext("2d")
    scaleCanvas(canvasElement, ctx, width, height)

    const drawMap = projection => {
      const path = geoPath(projection, ctx)
      const drawPath = shape => {
        ctx.beginPath()
        path(shape)
      }
      drawPath(sphere)
      if (!isVertical) ctx.clip()

      const fill = color => {
        ctx.fillStyle = color
        ctx.fill()
      }
      const stroke = color => {
        ctx.strokeStyle = color
        ctx.stroke()
      }
      drawPath(sphere)
      fill("#fff")
      stroke("#bbb")
      drawPath(geoGraticule10())
      stroke("#eee")
      countryShapes.forEach((shape) => {
        drawPath(shape)
        fill("#f8f8f8")
        stroke("#ccc")
      })
      ctx.restore() // stop clipping

      drawPath(sphere)
      stroke("#ccc")
    }
    drawMap(projection)
    if (projection2) drawMap(projection2)

    blankMap = ctx.getImageData(0, 0, width * 2, height * 2)
  }

  const debouncedDrawCanvas = debounce(drawCanvas, 500)
  $: debouncedDrawCanvas()
  $: width, bubbles, filterIteration, (() => {
    debouncedDrawCanvas()
  })()

  const clearTooltip = () => hoveredClaim = null

  $: highlightedClaim = hoveredClaim || (!hasHovered && bubbles[highlightIndex])

  $: topLeftBubble = (countryData["United States of America"] || {}).r ? countryData["United States of America"]
    : (Object.values(countryData).filter(d => (d || {}).r).sort((a,b) => a.x - b.x)[0] || {}).r ? Object.values(countryData).filter(d => d.r).sort((a,b) => a.x - b.x)[0]
    : null

  $: sortedCountries = countries.sort((a,b) => (countryData[a] || {}).r > (countryData[b] || {}).r ? -1 : 1)
</script>

<svelte:window on:scroll={clearTooltip} />

<!-- <svelte:window bind:innerWidth={windowWidth} /> -->

<div class="c"
  bind:clientWidth={width}>
  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />
  <svg {width} {height}>
    {#each sortedCountries as country}
      {#if countryData[country]}
        <g class="bubble-group" transform={`translate(${countryData[country].x * width}, ${countryData[country].y * width})`}>
          <circle
            class="bubble"
            r={countryData[country].r * width}
            fill={countryData[country].color}
          />

          <g class="label">
            <text y={(country == "United States of America" ? 0 : -countryData[country].r * width) - 20} class="text-middle text-bg">
              { country }
            </text>
            <text y={(country == "United States of America" ? 0 : -countryData[country].r * width) - 20} class="text-middle text-fg">
              { country }
            </text>
            <text y={(country == "United States of America" ? 0 : -countryData[country].r * width) - 6} class="text-middle text-bg">
              { format(",")(countryData[country].count) } {#if isFiltered}{` of ${format(",")(numberOfTotalClaimsByCountry[country])}`}{/if} fact checks
            </text>
            <text y={(country == "United States of America" ? 0 : -countryData[country].r * width) - 6} class="text-middle text-fg">
              { format(",")(countryData[country].count) } {#if isFiltered}{` of ${format(",")(numberOfTotalClaimsByCountry[country])}`}{/if} fact checks
            </text>
          </g>
        </g>
      {/if}
    {/each}
    {#if topLeftBubble && Number.isFinite(topLeftBubble.x)}
      <path
        class="annotation-line"
        d={[
          "M", (topLeftBubble.x - topLeftBubble.r) * width, topLeftBubble.y * width,
          "Q", (topLeftBubble.x - topLeftBubble.r) * width - 50, topLeftBubble.y * width,
          (topLeftBubble.x - topLeftBubble.r) * width - 50, topLeftBubble.y * width - 45
        ].join(" ")}
      />
    {/if}
  </svg>

  {#if topLeftBubble}
    <div class="annotation" style={`transform: translate(${Math.max(150, (topLeftBubble.x - topLeftBubble.r) * width - (isVertical ? 0 : 50))}px, ${topLeftBubble.y * width - 50}px)`}>
      <div class="annotation-contents">
        Each circle represents the number of fact checks {#if isFiltered} (with the applied filters){/if} that primarily originated in a country
      </div>
    </div>
  {/if}

  {#if !isEmbedded}
    <DataSource />
  {/if}
</div>

<style>
  .c {
    position: relative;
    width: 99%;
    margin: -2em auto 0;
    /* height: 65%; */
    /* overflow: hidden; */
  }
  svg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  text {
    font-size: 0.8em;
  }
  .text-bg {
    stroke: white;
    stroke-width: 3;
  }
  .text-number {
    fill: white;
    /* fill: #171c4f; */
    /* mix-blend-mode: multiply; */
    text-anchor: middle;
    font-weight: 700;
    font-size: 0.86em;
    dominant-baseline: middle;
  }
  .hovered-claim-highlight {
    position: absolute;
    top: 0;
    left: 0;
    width: 8px;
    height: 8px;
    border-radius: 100%;
    border: 1.5px solid;
  }
  .annotation {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 5;
  }
  .annotation-contents {
    max-width: 11em;
    text-align: right;
    font-size: 0.9em;
    line-height: 1.3em;
    transform: translate(-100%, -100%);
  }
  .annotation-line {
    fill: none;
    stroke: #171c4f;
    stroke-width: 1;
  }

  .bubble {
    mix-blend-mode: multiply;
    transition: all 0.3s ease-out;
  }

  text {
    pointer-events: none;
    font-weight: 700;
  }
  .bubble-group .label {
    opacity: 0;
  }
  .bubble-group:hover .label {
    opacity: 1;
  }
  .bubble-group:hover .bubble {
    mix-blend-mode: normal;
    stroke: #171c4f;
  }
  .text-middle {
    text-anchor: middle;
  }
	@media (max-width: 800px) {
    .c {
      margin-top: -1em;
    }
    .annotation {
      font-size: 0.7em;
    }
    .annotation-line {
      display: none;
    }
  }
	@media (max-width: 590px) {
    .c {
      margin-top: 0;
    }
  }
</style>