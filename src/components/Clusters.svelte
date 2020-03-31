<script>
  import { draw, fade } from "svelte/transition"
  import { scaleOrdinal, scaleLinear, scaleSqrt } from "d3-scale"
  import { extent, max, range } from "d3-array"
  import { color } from "d3-color"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { Delaunay } from "d3-delaunay"
  import { timeParse } from "d3-time-format"
  import { timeDay } from "d3-time"
  import { debounce, getDistanceBetweenPoints, getPositionFromAngle, scaleCanvas } from "./utils"
  import { dateAccessor, parseDate, categories, categoryAccessor, categoryColors, ratings, ratingAccessor, ratingPaths, titleAccessor } from "./data-utils"

  import ItemTooltip from "./ItemTooltip.svelte"

  export let data
  export let iteration
  // console.log(data.length, data[0])

  let width = 1200
  $: height = width * 0.45

  const types = categories
  $: bubbleSize = Math.round(width / 300)
  let hoveredClaim = null
  let canvasElement

  $: xScale = scaleLinear()
    .domain([-1, types.length])
    .range([0, width])
  $: ageScale = scaleLinear()
    .domain([1, 60])
    .range([0.2, 1])
  $: rAgeScale = scaleLinear()
    .domain([1, 60])
    .range([-0.1, 0.1])
    .clamp(true)
  $: rScale = scaleSqrt()
    .domain(extent(data.map(d => d)))
    .range([10, 20])
  $: groupRScale = scaleSqrt()
    .domain([0, max(types.map(type => (
      data.filter(d => categoryAccessor(d)[0] == type).length
    )))])
    .range([10, width * 0.4])

  let typeColors = categoryColors
  let typeBorderColors = {}

  $: types.forEach((type, i) => {
    // typeColors[type] = colors[i % colors.length]
    typeBorderColors[type] = color(typeColors[type]).darker(0.6).formatHex()
  })

  let ratingOffsets = {}
  $: ratings.map((rating, i) => {
    const angle = (360 / ratings.length) * i
    ratingOffsets[rating] = getPositionFromAngle(angle, 20)
  })

  let delaunay
  let groupBubbles = []
  let bubbles = []
  const updateGroups = () => {
    const groups = types.map((type, i) => {
      const angle = 360 / types.length * i
      const [x, y] = getPositionFromAngle(angle, 100)

      const bubbleCount = data.filter(d => categoryAccessor(d) == type).length
      const r = Math.max(
        Math.sqrt(bubbleCount * Math.PI * Math.pow(bubbleSize * 1.2, 2) * (Math.sqrt(12) / Math.PI)) + 20,
        20
      )
      const parsedColor = typeColors[type]
      const darkerColor = color(parsedColor)
        .darker(0.3)
        .formatHex()

      return {
        type,
        r: r / width,
        labelR: Math.max(r + 13, 30) / width,
        x: (x + width / 2) / width,
        y: (y + height / 2) / width,
        color: parsedColor,
        darkerColor,
      }
    }).filter(d => d)

    groupBubbles = [...groups]
    let simulation = forceSimulation(groupBubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.1))
      .force("y", forceY(d => d.y).strength(0.5))
      .force("collide", forceCollide(d => d.r * 1.2).strength(0.4))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .stop()

    range(0, 250).forEach(i => simulation.tick())

    const claims = data.map(d => {
      const category = categoryAccessor(d)
      if (!category) return

      const groupPosition = groupBubbles.find(({ type }) => type == category) || {}
      const {x, y} = groupPosition
      // if (!d.category) return
      const daysAgo = timeDay.range(dateAccessor(d), new Date()).length
      const rating = ratingAccessor(d)

      const parsedColor = typeColors[category]
      const darkerColor = color(parsedColor)
        .darker(0.3)
        .formatHex()

      return {
        ...d,
        r: bubbleSize / width,
        x: x,
        y: y,
        // x: x + ((ratingOffsets[rating] || [])[0] || 0),
        // y: y + ((ratingOffsets[rating] || [])[1] || 0),
        category,
        title: titleAccessor(d),
        color: parsedColor,
        opacity: ageScale(daysAgo),
        // opacity: 1,
        darkerColor,
      }
    }).filter(d => d)

    bubbles = [...claims]
    let bubbleSimulation = forceSimulation(bubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.1))
      .force("y", forceY(d => d.y).strength(0.1))
      .force("collide", forceCollide(d => d.r * 1.9))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .stop()

    range(0, 500).forEach(i => bubbleSimulation.tick())
    console.log("simu Clusters")
  }

  $: bubbles, width, (() => {
    delaunay = Delaunay.from(
      bubbles,
      d => d.x * width,
      d => d.y * width,
    )
  })()

  $: iteration, updateGroups()

  const drawCanvas = () => {
    if (!canvasElement) return
    console.log("drawCanvas Clusters")
    const ctx = canvasElement.getContext("2d")
    scaleCanvas(canvasElement, ctx, width, height)

    ctx.globalAlpha = 0.2
    groupBubbles.forEach(({x, y, r, color, type}, i) => {
      let gradient = ctx.createRadialGradient(
        x * width, y * width, 0, x * width, y * width, r * width,
      )

      gradient.addColorStop(0, color)
      gradient.addColorStop(0.7, color)
      gradient.addColorStop(1, `${color}00`)
      ctx.fillStyle = gradient

      ctx.beginPath()
      ctx.arc(x * width, y * width, r * width, 0, 2 * Math.PI, false)
      // ctx.fillStyle = color
      ctx.fill()
    })

    // ctx.globalAlpha = 1
    // groupBubbles.forEach(({x, y, r, darkerColor, type}, i) => {
    //   ctx.fillStyle = darkerColor
    //   fillTextCircle(ctx, type.toUpperCase(), x * width, y * width, r * width * 1.1)
    // })

    ctx.globalAlpha = 1

    bubbles.forEach(({x, y, color, darkerColor, opacity}, i) => {
      // ctx.globalAlpha = opacity
      ctx.beginPath()
      ctx.arc(x * width, y * width, bubbleSize + 1.3, 0, 2 * Math.PI, false)
      ctx.fillStyle = darkerColor
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x * width, y * width, bubbleSize, 0, 2 * Math.PI, false)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  const debouncedDrawCanvas = debounce(drawCanvas, 500)
  // $: (() => {{
  //   const _ = width
  //   drawCanvas()
  // }})
  // onMount(drawCanvas)
  $: debouncedDrawCanvas()
  $: width, bubbles, debouncedDrawCanvas()

  // const onMouseOver = point => {
  //   hoveredClaim = point
  // }

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
    if (distance < 100) {
      hoveredClaim = hoveredBubble
    } else {
      hoveredClaim = null
    }
  }
  // const debouncedOnMouseOver = debounce(onMouseOver, 50)
</script>

<div class="c" bind:clientWidth={width} on:mousemove={onMouseMove}>
  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />

  <svg {width} {height}>
    {#each groupBubbles as { type, x, y, r, labelR, color, darkerColor }, i}
      <g fill={color} transform={`translate(${x * width}, ${y * width})`}>
        <!-- <circle
          r={r}
          fill-opacity="0.1"
        /> -->

        <path
          class="hidden"
          d={[
            ["M", 0, -((labelR * width) - 16)].join(" "),
            ["A", ((labelR * width) - 16), ((labelR * width) - 16), 0, 0, 1, 0, ((labelR * width) - 16)].join(" "),
            ["A", ((labelR * width) - 16), ((labelR * width) - 16), 0, 0, 1, 0, -((labelR * width) - 16)].join(" "),
          ].join(" ")}
          fill="none"
          id={`path-${type}`}
          transform={`rotate(-75)`}
        />
        <text transition:fade={{ duration: 1000 + 300 * i }}>
          <textPath
            href={`#path-${type}`}
            class="boundary-label"
            startOffset="20%"
            fill={darkerColor}
          >
            { type || "Other" }
          </textPath>
        </text>
      </g>
    {/each}
  </svg>

  {#if hoveredClaim}
    <ItemTooltip item={hoveredClaim} {...hoveredClaim}} x={hoveredClaim.x * width} y={hoveredClaim.y * width - bubbleSize} />
    <div
      class="hovered-claim-highlight"
      style={`
        height: ${bubbleSize * 2.5}px;
        width: ${bubbleSize * 2.5}px;
        margin: ${-(bubbleSize * 1.75)}px;
        transform: translate(${hoveredClaim.x * width}px, ${hoveredClaim.y * width}px);
      `}
    />
  {/if}
</div>

<style>
  .c {
    position: relative;
    width: 100%;
    margin: 0 auto;
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
  svg {
    position: absolute;
    top: 0;
    left: 0;
    /* margin: 1em 0; */
    overflow: visible;
    /* shape-rendering: crispEdges; */
  }
  .boundary {
    fill: none;
    stroke: rgb(173, 178, 190);
    stroke-width: 0.5;
    stroke-dasharray: 9 5;
  }
  .boundary-label {
    text-anchor: middle;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    /* font-size: 0.7em; */
    /* font-weight: 100; */
  }
  text {
    fill: rgb(85, 91, 107);
    text-anchor: middle;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.7em;
    font-weight: 600;
    user-select: none;
  }
  .topic-label {
    text-anchor: middle;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.8em;
    font-weight: 700;
  }
  .hidden {
    fill-opacity: 0;
  }

  .active {
    fill-opacity: 0.6;
    fill-opacity: 1;
    fill: white;
    stroke: black;
    stroke-width: 1;
  }

  use {
    mix-blend-mode: multiply;
  }
</style>