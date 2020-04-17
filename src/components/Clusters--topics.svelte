<script>
  import { draw, fade } from "svelte/transition"
  import { scaleOrdinal, scaleLinear, scaleSqrt } from "d3-scale"
  import { extent, max, min, range } from "d3-array"
  import { color } from "d3-color"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { Delaunay } from "d3-delaunay"
  import { timeParse } from "d3-time-format"
  import { timeDay } from "d3-time"
  import { debounce, getDistanceBetweenPoints, getPositionFromAngle, scaleCanvas } from "./utils"
  import { dateAccessor, parseDate, tags, tagCategories, tagCategoryMap, tagsAccessor, tagColors, ratings, ratingAccessor, ratingPaths, titleAccessor } from "./data-utils"

  import ItemTooltip from "./ItemTooltip.svelte"
  import DataSource from "./DataSource.svelte"

  export let data
  export let isFiltered
  export let filterIteration
  export let filterFunction
  export let filterColor
  export let iteration
  export let isEmbedded

  let width = 1200
  $: constant = width / 1000
  $: isVertical = width < 666
  $: height = width * (
    width < 333  ? (503 - width) / 70 :
    isVertical   ? 1.25 :
    width < 1200 ? 0.66 :
      0.6
  )

  // const types = [...tags, "none"]
  const types = tags
  $: bubbleSize = Math.max(1, Math.round(width / 700))
  let hoveredClaim = null
  let hoveredClaimIsFlipped = false
  let canvasElement

  const updateSpiralPositions = (n=2000) => {
    let angle = 0
    spiralPositions = new Array(n).fill(0).map((_, i) => {
      const radius = Math.sqrt(i + 0.3) * bubbleSize * 1.9
      angle += Math.asin(1 / radius) * bubbleSize * 3.2
      angle = angle % (Math.PI * 2)
      return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        angle,
      ]
    })
  }
  let spiralPositions = []
  const debounceUpdateSpiralPositions = debounce(updateSpiralPositions, 100)
  $: iteration, bubbleSize, debounceUpdateSpiralPositions()

  $: xScale = scaleLinear()
    .domain([-1, types.length])
    .range([0, width])
  $: ageScale = scaleLinear()
    .domain([
      min([new Date(), max(data.map(dateAccessor))]),
      min(data.map(dateAccessor)),
    ])
    .range([1, 0.2])
  $: rScale = scaleSqrt()
    .domain(extent(data.map(d => d)))
    .range([10, 20])
  $: groupRScale = scaleSqrt()
    .domain([0, max(types.map(type => (
      data.filter(d => tagsAccessor(d).includes(type)).length
    )))])
    .range([10, width * 0.4])

  let typeColors = tagColors
  let typeBorderColors = {}

  $: types.forEach((type, i) => {
    // typeColors[type] = colors[i % colors.length]
    const typeColor = typeColors[type] || "#d4d4d4"
    typeBorderColors[type] = color(typeColor).darker(0.6).formatHex()
  })

  let categoryOffsets = {}
  $: tagCategories.map((category, i) => {
    const angle = (360 / tagCategories.length) * i
    categoryOffsets[category] = getPositionFromAngle(angle, Math.min(height, width) / 5)
  })

  let groupBubbles = []
  let bubbles = []
  const updateGroups = () => {
    updateSpiralPositions()
    const groups = types.map((type, i) => {
      // const angle = 360 / types.length * i
      // const [x, y] = getPositionFromAngle(angle, 100)
      const [x, y] = categoryOffsets[tagCategoryMap[type]]

      const bubbleCount = data.filter(d => tagsAccessor(d).includes(type)).length
      const r = Math.max(
        Math.sqrt(bubbleCount * Math.PI * Math.pow(bubbleSize * 1.2, 2) * (Math.sqrt(7) / Math.PI)) + 20,
        36
      )
      const parsedColor = typeColors[type] || "#d4d4d4"
      const darkerColor = color(parsedColor)
        .darker(0.3)
        .formatHex()

      return {
        type,
        r: r / constant,
        labelR: Math.max(r + (height * 0.002), 30) / constant,
        x: (x + width / 2) / constant,
        y: (y + height / 2) / constant,
        color: parsedColor,
        darkerColor,
      }
    }).filter(d => d)

    groupBubbles = [...groups]
    let simulation = forceSimulation(groupBubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(isVertical ? 0.5 : 0.1))
      .force("y", forceY(d => d.y).strength(isVertical ? 0.1 : 0.4))
      .force("collide", forceCollide(d => d.r + 10).strength(0.4))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .stop()

    range(0, 100).forEach(i => {
      simulation.tick()
      groupBubbles.forEach(d => {
        d.x = Math.max(d.labelR, Math.min((width / constant) - d.labelR, d.x))
        d.y = Math.max(d.labelR, Math.min((height / constant) - d.labelR, d.y))
      })
    })

    let groupBubblesByCategory = {}
    groupBubbles.forEach(d => {
      groupBubblesByCategory[d.type] = d
    })

    let runningTopicIndices = {}
    let claims = []
    data.forEach((d, i) => {
      const topics = tagsAccessor(d)
      if (!topics.length) return

      const rating = ratingAccessor(d)
      const title = titleAccessor(d)
      const r = bubbleSize / constant
      const opacity = ageScale(dateAccessor(d))

      topics.forEach(topic => {
        const groupPosition = groupBubblesByCategory[topic]
        if (!groupPosition) return

        if (!runningTopicIndices[topic]) runningTopicIndices[topic] = 0

        const spiralPosition = spiralPositions[runningTopicIndices[topic]] || []

        const [x, y] = [
          groupPosition.x + spiralPosition[0] / constant,
          groupPosition.y + spiralPosition[1] / constant,
        ]
        runningTopicIndices[topic]++

        let typeColor = color(typeColors[topic])
        typeColor.opacity = opacity

        const parsedColor = typeColor.formatRgb()
        const darkerColor = typeColor.darker(0.3).formatRgb()

        claims.push({
          ...d,
          r,
          x,
          y,
          category: topic,
          title,
          color: parsedColor,
          darkerColor,
        })
      })
    })

    bubbles = claims
    // let bubbleSimulation = forceSimulation(bubbles)
    //   // .force("x", forceX(d => d.x).strength(1))
    //   .force("x", forceX(d => d.x).strength(0.1))
    //   .force("y", forceY(d => d.y).strength(0.1))
    //   .force("collide", forceCollide(d => d.r * 1.8))
    //   // .force("r", forceRadial(d => d.distance).strength(5))
    //   .on("tick", drawCanvas)
    //   .alphaMin(0.06)
    //   // .stop()

    // range(0, 500).forEach(i => bubbleSimulation.tick())
  }

  let delaunay = null
  const updateDelaunay = () => {
    setTimeout(() => {
    delaunay = Delaunay.from(
      bubbles,
      d => d.x * constant,
      d => d.y * constant,
    )
    })
  }
  const debounceUpdateDelaunay = debounce(updateDelaunay, 100)
  $: iteration, bubbles, width, debounceUpdateDelaunay()

  $: iteration, width, updateGroups()

  const drawCanvas = () => {
    if (!canvasElement) return
    const ctx = canvasElement.getContext("2d")
    scaleCanvas(canvasElement, ctx, width, height)

    ctx.globalAlpha = 0.2
    groupBubbles.forEach(({x, y, r, color, type}, i) => {
      let gradient = ctx.createRadialGradient(
        x * constant, y * constant, 0, x * constant, y * constant, r * constant,
      )

      gradient.addColorStop(0, color)
      gradient.addColorStop(0.47, color)
      gradient.addColorStop(1, `${color}00`)
      ctx.fillStyle = gradient

      ctx.beginPath()
      ctx.arc(x * constant, y * constant, r * constant, 0, 2 * Math.PI, false)
      // ctx.fillStyle = color
      ctx.fill()
    })

    // ctx.globalAlpha = 1
    // groupBubbles.forEach(({x, y, r, darkerColor, type}, i) => {
    //   ctx.fillStyle = darkerColor
    //   fillTextCircle(ctx, type.toUpperCase(), x * constant, y * constant, r * constant * 1.1)
    // })

    ctx.globalAlpha = 1

    bubbles.forEach((d, i) => {
      const { x, y, color, darkerColor } = d
      const isBubbleFilteredOut = isFiltered && !filterFunction(d)
      const isBubbleFilteredIn = isFiltered && !isBubbleFilteredOut

      ctx.beginPath()
      // if (Path2D) {
      //   ctx.moveTo(x * constant, y * constant)
      //   const path = new Path2D("M0.834766 0.0570311C0.653906 0.114843 0.487891 0.215234 0.351563 0.351561C0.126563 0.576561 0 0.881638 0 1.2V7.59998C0 7.7617 0.0972656 7.90779 0.246875 7.96951C0.353125 8.01365 0.471094 8.00896 0.571094 7.96131C0.611719 7.94216 0.649609 7.91599 0.682813 7.88279L2.16563 6.39998H6.8C7.11836 6.39998 7.42344 6.27342 7.64844 6.04842C7.87344 5.82342 8 5.51834 8 5.19998V1.2C8 0.881638 7.87344 0.576561 7.64844 0.351561C7.42344 0.126562 7.11836 0 6.8 0H1.2C1.075 0 0.951953 0.0195312 0.834766 0.0570311Z")
      // } else {
      //   // ctx.arc(x * constant, y * constant, r * constant, 0, 2 * Math.PI, false)
      // }
      ctx.arc(x * constant, y * constant, bubbleSize, 0, 2 * Math.PI, false)
      ctx.fillStyle = isBubbleFilteredOut ? "#fff" :
        isBubbleFilteredIn && filterColor ? filterColor || color :
                                            color
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x * constant, y * constant, bubbleSize, 0, 2 * Math.PI, false)
      ctx.strokeStyle = isBubbleFilteredOut ? "#eaeaea" :
        isBubbleFilteredIn && filterColor ? filterColor || darkerColor :
                                            darkerColor
      ctx.stroke()
    })
  }

  const debouncedDrawCanvas = debounce(drawCanvas, 500)
  // $: (() => {{
  //   const _ = width
  //   drawCanvas()
  // }})
  // onMount(drawCanvas)
  $: debouncedDrawCanvas()
  $: width, bubbles, filterIteration, debouncedDrawCanvas()

  $: topLeftBubble = delaunay && bubbles[delaunay.find(constant * 0.05, 0)]

  // const onMouseOver = point => {
  //   hoveredClaim = point
  // }

  $: onMouseMove = e => {
    if (!delaunay) return
    if (!canvasElement) return

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
      [hoveredBubble.x * constant, hoveredBubble.y * constant],
    )
    if (distance < 30) {
      hoveredClaim = hoveredBubble
      hoveredClaimIsFlipped = y < 300
    } else {
      hoveredClaim = null
    }
  }

  const clearTooltip = () => hoveredClaim = null
  // const debouncedOnMouseOver = debounce(onMouseOver, 50)
</script>

<svelte:window on:scroll={clearTooltip} />

<div class="c" bind:clientWidth={width} on:mousemove={onMouseMove}>
  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />

  <svg {width} {height}>
    {#each groupBubbles as { type, x, y, r, labelR, color, darkerColor }, i}
      <g fill={color} transform={`translate(${x * constant}, ${y * constant})`}>
        <!-- <circle
          r={r}
          fill-opacity="0.1"
        /> -->

        <path
          class="hidden"
          d={[
            ["M", 0, -((labelR * constant) - 16)].join(" "),
            ["A", ((labelR * constant) - 16), ((labelR * constant) - 16), 0, 0, 1, 0, ((labelR * constant) - 16)].join(" "),
            ["A", ((labelR * constant) - 16), ((labelR * constant) - 16), 0, 0, 1, 0, -((labelR * constant) - 16)].join(" "),
          ].join(" ")}
          fill="none"
          id={`path-${type}`}
          transform={`rotate(-147)`}
        />
        <text transition:fade={{ duration: 1000 + 300 * i }}>
          <textPath
            href={`#path-${type}`}
            class="boundary-label"
            startOffset="40%"
            fill={darkerColor}
          >
            { type || "Other" }
          </textPath>
        </text>
      </g>
    {/each}

    {#if topLeftBubble && Number.isFinite(topLeftBubble.x)}
      <path
        class="annotation-line"
        d={[
          "M", topLeftBubble.x * constant - bubbleSize, topLeftBubble.y * constant,
          "Q", topLeftBubble.x * constant - 50, topLeftBubble.y * constant,
          topLeftBubble.x * constant - 50, topLeftBubble.y * constant - 45
        ].join(" ")}
      />
    {/if}
  </svg>

  {#if hoveredClaim}
    <ItemTooltip
      item={hoveredClaim}
      x={Math.min(width - 200, Math.max(200, hoveredClaim.x * constant))}
      y={hoveredClaim.y * constant - (bubbleSize * (hoveredClaimIsFlipped ? -1 : 1))}
      isFlipped={hoveredClaimIsFlipped}
    />
    <div
      class="hovered-claim-highlight"
      style={`
        height: ${bubbleSize * 2 + 1.5}px;
        width: ${bubbleSize * 2 + 1.5}px;
        transform: translate(${hoveredClaim.x * constant - bubbleSize - 2}px, ${hoveredClaim.y * constant - bubbleSize - 2}px);
      `}
    />
  {/if}

  {#if topLeftBubble}
    <div class="annotation" style={`transform: translate(${Math.max(130, topLeftBubble.x * constant - (isVertical ? 0 : 50))}px, ${topLeftBubble.y * constant - 50}px)`}>
      <div class="annotation-contents">
        Each fact check is represented as a circle, which fades with age
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
  g {
    transition: all 0.2s ease-out;
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
    font-weight: 700;
    user-select: none;
  }
  .hidden {
    fill-opacity: 0;
  }

  .annotation {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
  }
  .annotation-contents {
    max-width: 11em;
    text-align: right;
    font-size: 0.8em;
    transform: translate(-100%, -100%);
  }
  .annotation-line {
    fill: none;
    stroke: #b9b6ca;
    stroke-width: 1;
  }

  @media (max-width: 800px) {
    .c {
      margin-top: 3em;
    }
    .annotation {
      font-size: 0.8em;
    }
    text {
      font-size: 0.6em;
    }
  }
  @media (max-width: 600px) {
    .c {
      margin-top: 5em;
    }
  }

  @media (max-width: 486px) {
    .c {
      pointer-events: none;
    }
    .annotation {
      margin-top: -1em;
    }
    .annotation-line {
      display: none;
    }
  }
</style>