<script>
  import { onMount } from "svelte"
  import { draw, fade } from "svelte/transition"
  import { scaleOrdinal, scaleLinear, scaleSqrt, scaleTime } from "d3-scale"
  import { extent, range } from "d3-array"
  import { color } from "d3-color"
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
  import { countryShapes, countryCentroids } from "./countryData"
  import ItemTooltip from "./ItemTooltip.svelte"
  import DataSource from "./DataSource.svelte"

  export let data = []
  export let isFiltered
  export let filterIteration
  export let filterFunction
  export let filterColor
  export let iteration

  // const parseDate = timeParse("%Y-%m-%d")
  const formatDate = timeFormat("%A %B %-d, %Y")
  let hoveredClaim = null
  let canvasElement = null
  // let windowWidth = 1200
  let width = 1200
  $: height = width * 0.7
  $: bubbleSize = width * 0.0015
  let highlightIndex = null
  let timeElapsed = 0
  let initTransitionProgress = 1
  let hasHovered = false
  let hasInited = false

  const windowGlobal = typeof window !== "undefined" && window
  const pixelRatio = windowGlobal.devicePixelRatio || 1

  const getSpiralPositions = (n=3000) => {
    let angle = 0
    return new Array(n).fill(0).map((_, i) => {
      const radius = Math.sqrt(i + 0.3) * 2.3
      angle += Math.asin(1 / radius) * 4
      angle = angle % (Math.PI * 2)
      return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        angle,
      ]
    })
  }
  const spiralPositions = getSpiralPositions()

  const sphere = ({type: "Sphere"})
  $: projection = geoArmadillo()
    .fitSize([width, height], sphere)
    .rotate([-9, 0])

  $: svgPathGenerator = geoPath(projection)

  $: ageScale = scaleTime()
    .domain(extent(data.map(dateAccessor)))
    .range(["#fff", "#778beb"])

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
      if (!claimsByCountry[country]) claimsByCountry[country] = []
      claimsByCountry[country].push(d)
    })
    let claims = []
    Object.keys(claimsByCountry).forEach(country => {
      const countryCentroid = countryCentroids[country]
      // if (!countryCentroid) console.log(country, countryCentroid)
      // if (!Number.isFinite((countryCentroid || [])[0])) console.log(country, countryCentroid)
      if (!countryCentroid) return

      const points = claimsByCountry[country].sort((a,b) => (
        categories.indexOf(categoryAccessor(a))
        - categories.indexOf(categoryAccessor(b))
      ))
      const positions = spiralPositions
        .slice(0, points.length)
        .sort((a,b) => (
          a[2] > b[2] ? -1 : 1
        ))
      let runningIndex = 0
      points.forEach(d => {
        const category = categoryAccessor(d)
        const parsedColor = categoryColors[category] || "#adb2be"
        claims.push({
          ...d,
          x: (positions[runningIndex] || [])[0] / width + countryCentroid[0],
          y: (positions[runningIndex] || [])[1] / width + countryCentroid[1],
          color: parsedColor,
        })
        runningIndex++
      })
    })
    claims = claims.filter(d => d)

    // bubbles = claims
    bubbles = [...claims]
    let simulation = forceSimulation()
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.05))
      .force("y", forceY(d => d.y).strength(0.05))
      .force("collide", forceCollide(d => (bubbleSize / width) * 1.3).strength(1))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .nodes(bubbles)
      .alphaMin(0.006)
      .on("tick", drawBubbles)

    // range(0, 220).forEach(i => simulation.tick())
    // console.log("simu Map")
  }
  $: iteration, updateBubbles()

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
      hoveredClaim = hoveredBubble
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
    const path = geoPath(projection, ctx)
    const drawPath = shape => {
      ctx.beginPath()
      path(shape)
    }
    drawPath(sphere)
    ctx.clip()

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

    blankMap = ctx.getImageData(0, 0, width * 2, height * 2)
  }

  const drawBubbles = () => {
    if (!canvasElement) return
    if (!blankMap) return
    // console.log("drawBubbles Map")
    const ctx = canvasElement.getContext("2d")
    ctx.putImageData(blankMap, 0, 0)

    bubbles.forEach((d, i) => {
      const { x, y, color } = d
      const isBubbleFilteredOut = isFiltered && !filterFunction(d)
      const isBubbleFilteredIn = isFiltered && !isBubbleFilteredOut

      ctx.beginPath()
      ctx.arc(x * width, y * width, bubbleSize, 0, 2 * Math.PI, false)

      ctx.fillStyle = (
        isBubbleFilteredOut ? "#c9cde2" :
        isBubbleFilteredIn  ? filterColor || "#57a039" :
                              color
      )
      ctx.fill()
    })
  }
  const debouncedDrawCanvas = debounce(drawCanvas, 500)
  const debouncedDrawBubbles = debounce(drawBubbles, 500)
  // $: (() => {{
  //   const _ = width
  //   drawCanvas()
  // }})
  // onMount(drawCanvas)
  $: debouncedDrawCanvas()
  $: initTransitionProgress, drawBubbles()
  $: width, bubbles, filterIteration, (() => {
    debouncedDrawCanvas()
    debouncedDrawBubbles()
  })()

  $: highlightedClaim = hoveredClaim || (!hasHovered && bubbles[highlightIndex])
</script>

<!-- <svelte:window bind:innerWidth={windowWidth} /> -->

<div class="c"
  on:mousemove={onMouseMove}
  bind:clientWidth={width}>
  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />
  {#if highlightedClaim}
    <ItemTooltip
      item={highlightedClaim}
      {...highlightedClaim}
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

  <DataSource />
</div>

<style>
  .c {
    position: relative;
    width: 95%;
    margin: 0 auto;
    /* height: 65%; */
    /* overflow: hidden; */
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
</style>