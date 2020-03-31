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
  import countryShapes from "./countries.json"
  import { debounce, getDistanceBetweenPoints, getPositionFromAngle, scaleCanvas } from "./utils"
  import { dateAccessor, parseDate, countryAccessor, categories, categoryColors, categoryAccessor } from "./data-utils"
  import ItemTooltip from "./ItemTooltip.svelte"

  export let data = []
  export let iteration
  // const parseDate = timeParse("%Y-%m-%d")
  const formatDate = timeFormat("%A %B %-d, %Y")
  let hoveredClaim = null
  let canvasElement = null
  // let windowWidth = 1200
  let width = 1200
  $: height = width * 0.65
  $: bubbleSize = width * 0.0015
  let highlightIndex = null
  let timeElapsed = 0
  let initTransitionProgress = 0
  let hasHovered = false
  let hasInited = false

  // $: width = windowWidth * 0.9
  // $: height = width * 0.65

  // const debouncedOnMouseOver = debounce(onMouseOver, 50)
  const duration = 12000
  let runningTimer
  const initTimer = () => {
    if (!data.length) return
    if (hasInited) return
    hasInited = true
    setTimeout(() => {
      runningTimer = timer(elapsed => {
        initTransitionProgress = Math.min(1, easeCubicOut(elapsed / duration))

        if (initTransitionProgress >= 1) {
          runningTimer.stop()
        }
      })
    })
  }
  $: iteration, initTimer()

  const windowGlobal = typeof window !== "undefined" && window
  const pixelRatio = windowGlobal.devicePixelRatio || 1

    const sphere = ({type: "Sphere"})
    $: projection = geoArmadillo()
      .fitSize([width, height], sphere)
      .rotate([-9, 0])

    $: svgPathGenerator = geoPath(projection)
    const countryCentroids = {}
    let countries = []
    $: data, (() => {
      countries = countryShapes.features.map(shape => {
        const countryData = data.find(d => (
          countryAccessor(data) == shape.properties["geounit"]
        )) || {}
        const centroid = svgPathGenerator.centroid(shape)
        const scaledCentroid = [
          centroid[0] / width,
          centroid[1] / height,
        ]
        countryCentroids[shape.properties["geounit"]] = scaledCentroid

        return {
          name: shape.properties["geounit"],
          shape,
          centroid: scaledCentroid,
          ...countryData,
        }
      }).filter(d => d.centroid[0])
    })()

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
      const claims = data.map((d, i) => {
        const country = countryAccessor(d)
        if (!country) return
        const [x, y] = countryCentroids[country] || []
        if (!x && !y) return

        const category = categoryAccessor(d)
        const categoryOffset = [
          categoryOffsets[category] ? categoryOffsets[category][0] * 2 / width : 0,
          categoryOffsets[category] ? categoryOffsets[category][1] * 2 / width : 0,
          // 0, 0,
        ]

        const parsedColor = categoryColors[category] || "#adb2be"

        return {
          ...d,
          // r: bubbleSize,
          x: x + categoryOffset[0],
          y: y + categoryOffset[1],
          color: parsedColor,
          // opacity: ageScale(daysAgo),
          opacity: 1,
          // darkerColor: topicBorderColors[d.category],
        }
      }).filter(d => d)

      bubbles = [...claims]
      let simulation = forceSimulation(bubbles)
        // .force("x", forceX(d => d.x).strength(1))
        .force("x", forceX(d => d.x).strength(0.2))
        .force("y", forceY(d => d.y).strength(0.2))
        .force("collide", forceCollide(d => (bubbleSize / width) * 1.6).strength(1))
        // .force("r", forceRadial(d => d.distance).strength(5))
        .stop()

      range(0, 300).forEach(i => simulation.tick())
      console.log("simu", bubbles)
    }
    $: iteration, updateBubbles()

    let delaunay = []

    $: data, width, (() => {
      delaunay = Delaunay.from(
        bubbles,
        d => d.x * width,
        d => d.y * height,
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
    const distance = getDistanceBetweenPoints(
      mousePosition,
      [bubbles[pointIndex].x * width, bubbles[pointIndex].y * height],
    )
    if (distance < 30) {
      hoveredClaim = bubbles[pointIndex]
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
    countries.forEach(({shape}) => {
      drawPath(shape)
      fill("#f8f8fb")
      stroke("#c9cde2")
    })
    ctx.restore() // stop clipping

    drawPath(sphere)
    stroke("#c9cde2")

    blankMap = ctx.getImageData(0, 0, width, height)
  }

  const drawBubbles = () => {
    if (!canvasElement) return
    if (!blankMap) return
    const ctx = canvasElement.getContext("2d")
    ctx.putImageData(blankMap, 0, 0)

// console.log("bubbles", bubbles)
    bubbles.forEach(({x, y, color}, i) => {
      const transitionR = bubbleSize * Math.min(1, Math.max(
        0,
        // initTransitionProgress
        initTransitionProgress * 2 - (i / bubbles.length)
        // 1,
      ))

      ctx.beginPath()
      ctx.arc(x * width, y * height, transitionR, 0, 2 * Math.PI, false)

      ctx.fillStyle = color
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
  $: width, bubbles, (() => {
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
    <ItemTooltip item={highlightedClaim} {...highlightedClaim} x={highlightedClaim.x * width} y={highlightedClaim.y * height - bubbleSize} />
    <!-- <ItemTooltip item={highlightedClaim} {...highlightedClaim} y={highlightedClaim.y - bubbleSize} /> -->
    <div
      class="hovered-claim-highlight"
      style={`
        height: ${bubbleSize * 2.5}px;
        width: ${bubbleSize * 2.5}px;
        margin: ${-(bubbleSize * 1.75)}px;
        transform: translate(${highlightedClaim.x * width}px, ${highlightedClaim.y * height}px);
      `}
    />
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