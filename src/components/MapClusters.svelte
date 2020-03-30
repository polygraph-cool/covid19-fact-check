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
  // const parseDate = timeParse("%Y-%m-%d")
  const formatDate = timeFormat("%A %B %-d, %Y")
  let hoveredClaim = null
  let canvasElement = null
  // let windowWidth = 1200
  let width = 1200
  $: height = width * 0.65
  $: bubbleSize = width * 0.002
  let highlightIndex = null
  let timeElapsed = 0
  let initTransitionProgress = 0
  let hasHovered = false

  // $: width = windowWidth * 0.9
  // $: height = width * 0.65

  // const debouncedOnMouseOver = debounce(onMouseOver, 50)
  const duration = 12000

  const windowGlobal = typeof window !== "undefined" && window
  const pixelRatio = windowGlobal.devicePixelRatio || 1

  // let interval
  // onMount(() => {
  //   interval = setInterval(() => highlightIndex += 1, 3000)

  //   // initTransitionProgress = 0
  //   // const initTimer = timer(elapsed => {
  //   //   initTransitionProgress = Math.min(
  //   //     1,
  //   //     easeCubicOut(elapsed / duration)
  //   //   );

  //   //   drawCanvas()

  //   //   if (initTransitionProgress > 1) {
  //   //     initTimer.stop()
  //   //   }
  //   // });
  //   return () => {
  //     clearInterval(interval)
  //     // initTimer.stop()
  //   }
  // })

    const sphere = ({type: "Sphere"})
    $: projection = geoArmadillo()
      .fitSize([width, height], sphere)
      .rotate([-9, 0])

    $: svgPathGenerator = geoPath(projection)
    const countryCentroids = {}
    $: countries = countryShapes.features.map(shape => {
      const countryData = data.find(d => (
        countryAccessor(data) == shape.properties["geounit"]
      )) || {}
      countryCentroids[shape.properties["geounit"]] = svgPathGenerator.centroid(shape)

      return {
        name: shape.properties["geounit"],
        shape,
        centroid: svgPathGenerator.centroid(shape),
        ...countryData,
      }
    }).filter(d => d.centroid[0])

    $: ageScale = scaleTime()
      .domain(extent(data.map(dateAccessor)))
      .range(["#fff", "#778beb"])

    let categoryOffsets = {}
    categories.forEach((category, i) => {
      const angle = 360 / categories.length * i
      categoryOffsets[category] = getPositionFromAngle(angle, 6)
    })

    $: claims = data.map((d, i) => {
      const country = countryAccessor(d)
      if (!country) return
      const [x, y] = countryCentroids[country] || []
      if (!x && !y) {

        return
      }

      const category = categoryAccessor(d)
      const categoryOffset = categoryOffsets[category] || [0, 0]

      const parsedColor = categoryColors[category] || "#adb2be"

      return {
        ...d,
        r: bubbleSize,
        x: x + categoryOffset[0],
        y: y + categoryOffset[1],
        color: parsedColor,
        // opacity: ageScale(daysAgo),
        opacity: 1,
        // darkerColor: topicBorderColors[d.category],
      }
    }).filter(d => d)

    $: bubbles = (() => {
      let bubbles = [...claims]
      let simulation = forceSimulation(bubbles)
        // .force("x", forceX(d => d.x).strength(1))
        .force("x", forceX(d => d.x).strength(0.2))
        .force("y", forceY(d => d.y).strength(0.2))
        .force("collide", forceCollide(d => d.r + 0.9).strength(1))
        // .force("r", forceRadial(d => d.distance).strength(5))
        .stop()

      range(0, 300).forEach(i => simulation.tick())
      return bubbles
    })()

    $: delaunay = Delaunay.from(
      bubbles,
      d => d.x,
      d => d.y,
    )

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
      [bubbles[pointIndex].x, bubbles[pointIndex].y],
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
    bubbles.forEach(({x, y, r, color}, i) => {
      const transitionR = bubbleSize * Math.max(
        0,
        // initTransitionProgress + 0.1 - (i / bubbles.length)
        1,
      )

      ctx.beginPath()
      ctx.arc(x, y, transitionR, 0, 2 * Math.PI, false)
      fill(color)
    })
  }
  const debouncedDrawCanvas = debounce(drawCanvas, 500)
  // $: (() => {{
  //   const _ = width
  //   drawCanvas()
  // }})
  // onMount(drawCanvas)
  $: debouncedDrawCanvas()
  $: (() => {
    const _ = width
    debouncedDrawCanvas()
  })()

  $: highlightedClaim = hoveredClaim || (!hasHovered && bubbles[highlightIndex])
</script>

<!-- <svelte:window bind:innerWidth={windowWidth} /> -->

<div class="c"
  on:mousemove={onMouseMove}
  on:resize={debouncedDrawCanvas}
  bind:clientWidth={width}>
  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />
  {#if highlightedClaim}
    <ItemTooltip item={highlightedClaim} {...highlightedClaim} y={highlightedClaim.y - bubbleSize} />
    <ItemTooltip item={highlightedClaim} {...highlightedClaim} y={highlightedClaim.y - bubbleSize} />
    <div
      class="hovered-claim-highlight"
      style={`
        height: ${bubbleSize * 2 + 4}px;
        width: ${bubbleSize * 2 + 4}px;
        margin: ${-(bubbleSize + 4)}px;
        transform: translate(${highlightedClaim.x}px, ${highlightedClaim.y}px);
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