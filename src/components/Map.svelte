<script>
  import { onMount } from "svelte"
  import { draw, fade } from "svelte/transition"
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
  export let filterColor
  export let iteration
  export let isEmbedded

  // const parseDate = timeParse("%Y-%m-%d")
  const formatDate = timeFormat("%A %B %-d, %Y")
  let hoveredClaim = null
  let canvasElement = null
  // let windowWidth = 1200
  let width = 1200
  $: isVertical = width < 800
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
  const updateBubbles = () => {
    const claimsByCountry = {}

    data.forEach(d => {
      const country = countryAccessor(d)
      if (!country) return
      if (isFiltered && !filterFunction(d)) return
      if (!claimsByCountry[country]) claimsByCountry[country] = []
      claimsByCountry[country].push(d)
    })
    const rScale = scaleSqrt()
      .domain([0, max(Object.values(claimsByCountry).map(d => d.length))])
      .range([1, 37])
    const colorScale = scaleLinear()
      .domain([0, max(Object.values(claimsByCountry).map(d => d.length))])
      .range(["#d9e7e4", "#67B244"])
      .interpolate(interpolateHclLong)

    const countries = Object.keys(claimsByCountry)
    const claims = countries.map(country => {
      const countryCentroid = isVertical ? countryCentroidsVertical[country] : countryCentroids[country]
      // if (!countryCentroid) console.log(country, countryCentroid)
      // if (!Number.isFinite((countryCentroid || [])[0])) console.log(country, countryCentroid)
      if (!countryCentroid) return

      const numberOfPoints = claimsByCountry[country]
        .filter(categoryAccessor)
        .length

      const r = rScale(numberOfPoints * 3)
      let runningAngle = 0
      let angles = categories.map(cat => {
        const nInCat = claimsByCountry[country].filter(d => categoryAccessor(d) == cat).length
        const percentInCat = nInCat / numberOfPoints
        const angleIncrement = percentInCat * (Math.PI * 2)
        runningAngle += angleIncrement
        return {
          start: runningAngle - angleIncrement,
          end: runningAngle,
          color: categoryColors[cat],
        }
      })
      angles = [...angles, {
        start: angles.slice(-1)[0].end,
        end: Math.PI * 2,
        color: "#eaeaee",
      }]

      return {
        name: country,
        x: countryCentroid[0],
        y: countryCentroid[1],
        count: numberOfPoints,
        r: r / width,
        labelR: (r + 19) / width,
        color: colorScale(numberOfPoints),
        angles,
      }
    })
    .sort((a,b) => b.r - a.r)
    .filter(d => d)

    bubbles = claims.filter(d => d.x && d.y)

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
    // console.log("simu Map")
  }
  $: iteration, filterIteration, isVertical, updateBubbles()

  let delaunay = []

  $: data, width, (() => {
    delaunay = Delaunay.from(
      bubbles,
      d => d.x * width,
      d => d.y * width,
    )
  })()

  $: onMouseMove = e => {
    const x = e.clientX
      - canvasElement.getBoundingClientRect().left
    const y = e.clientY
      - canvasElement.getBoundingClientRect().top

    const mousePosition = [x, y]
    const pointIndex = delaunay.find(...mousePosition)
    if (pointIndex == -1) return null
    const hoveredBubble = bubbles[pointIndex] || {}
    const distance = getDistanceBetweenPoints(
      mousePosition,
      [hoveredBubble.x * width, hoveredBubble.y * width],
    )
    if (distance < 30) {
      // hoveredClaim = hoveredBubble
    } else {
      hoveredClaim = null
    }

    hasHovered = true
    // if (interval) {
    //   clearInterval(interval)
    //   interval = null
    // }
  }

  let blankMap

  const drawCanvas = () => {
    // console.log("drawCanvas Map")
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
      stroke("#b4b7c9")
      drawPath(geoGraticule10())
      stroke("#eaedff")
      countryShapes.forEach((shape) => {
        drawPath(shape)
        fill("#f8f8fb")
        stroke("#c9cde2")
      })
      ctx.restore() // stop clipping

      drawPath(sphere)
      stroke("#c9cde2")
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

  $: topLeftBubble = bubbles.find(d => d.name == "United States of America")
    || bubbles.sort((a,b) => a.x - b.x)[0]
</script>


<svelte:window on:scroll={clearTooltip} />

<!-- <svelte:window bind:innerWidth={windowWidth} /> -->

<div class="c"
  on:mousemove={onMouseMove}
  bind:clientWidth={width}>
  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />
  {#if highlightedClaim}
    <ItemTooltip
      item={highlightedClaim}
      x={Math.min(width - 160, Math.max(160, highlightedClaim.x * width))}
      y={highlightedClaim.y * width - bubbleSize}
    />
    <!-- <ItemTooltip item={highlightedClaim} {...highlightedClaim} y={highlightedClaim.y - bubbleSize} /> -->
    <div
      class="hovered-claim-highlight"
      style={`
        height: ${bubbleSize * 2.5}px;
        width: ${bubbleSize * 2.5}px;
        margin: ${-(bubbleSize * 1.75)}px;
        transform: translate(${highlightedClaim.x * width}px, ${highlightedClaim.y * width}px);
      `}
    />
  {/if}

  <svg {width} {height}>
    {#each bubbles as { name, x, y, count, r, labelR, color }, i}
      <g class="bubble-group" transform={`translate(${x * width}, ${y * width})`}>
        <circle
          class="bubble"
          r={r * width}
          fill={color}
        />

        <g class="label">
          {#if (labelR * width) > 30}
            <path
              class="hidden"
              d={[
                ["M", 0, -((labelR * width) - 16)].join(" "),
                ["A", ((labelR * width) - 16), ((labelR * width) - 16), 0, 0, 1, 0, ((labelR * width) - 16)].join(" "),
                ["A", ((labelR * width) - 16), ((labelR * width) - 16), 0, 0, 1, 0, -((labelR * width) - 16)].join(" "),
              ].join(" ")}
              fill="none"
              id={`path-${name}`}
              transform={`rotate(-95)`}
            />
            <text transition:fade={{ duration: 1000 + 300 * i }}>
              <textPath
                href={`#path-${name}`}
                class="text-bg"
                startOffset="20%"
              >
                { name }
              </textPath>
            </text>
            <text transition:fade={{ duration: 1000 + 300 * i }}>
              <textPath
                href={`#path-${name}`}
                class="text-fg"
                startOffset="20%"
              >
                { name }
              </textPath>
            </text>
            <text transform={`translate(0, ${-r * width * 0})`} class="text-number">
              { format(",")(count) }
            </text>
          {:else}
            <text y="-10" class="text-middle text-bg" transition:fade={{ duration: 1000 + 300 * i }}>
              { name } ({ count })
            </text>
            <text y="-10" class="text-middle text-fg" transition:fade={{ duration: 1000 + 300 * i }}>
              { name } ({ count })
            </text>
          {/if}
        </g>
      </g>
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
    <div class="annotation" style={`transform: translate(${Math.max(130, (topLeftBubble.x - topLeftBubble.r) * width - (isVertical ? 0 : 50))}px, ${topLeftBubble.y * width - 50}px)`}>
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
    width: 90%;
    margin: 0 auto;
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
</style>