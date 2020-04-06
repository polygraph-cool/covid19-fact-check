<script>
  import { draw, fade } from "svelte/transition"
  import { scaleOrdinal, scaleLinear, scaleSqrt } from "d3-scale"
  import { extent, max, range } from "d3-array"
  import { color } from "d3-color"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { timeParse } from "d3-time-format"
  import { timeDay } from "d3-time"
  import { getPositionFromAngle, debounce } from "./utils"
  import { dateAccessor, parseDate, categories, categoryAccessor, categoryColors, ratings, ratingAccessor, ratingPaths, titleAccessor } from "./data-utils"

  import ItemTooltip from "./ItemTooltip.svelte"

  export let data
  // console.log(data.length, data[0])

  const windowGlobal = typeof window !== "undefined" && window
  const width = (windowGlobal.innerWidth || 1200) * 0.9
  const height = width * 0.5

  const types = categories
  const bubbleR = Math.round(width / 300)
  let hoveredClaim = null

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

  // $: topicsCountScale = scaleLinear()
  //   .domain(extent(types.map(topic => (
  //     data.filter(d => d.category == topic).length
  //   ))))
  //   .range([360 / types.length, 360 / types.length * 6])

  // const darkerColors = colors.map(c => (
  //   color(c)
  //     .darker(0.6)
  //     .formatHex()
  // ))
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

  $: groups = types.map((type, i) => {
    const angle = 360 / types.length * i
    const [x, y] = getPositionFromAngle(angle, 100)

    const bubbleCount = data.filter(d => categoryAccessor(d) == type).length
    const r = Math.max(
      Math.sqrt(bubbleCount * Math.PI * Math.pow(bubbleR * 1.09, 2) * (Math.sqrt(12) / Math.PI)) + 20,
      20
    )
    const parsedColor = typeColors[type]
    const darkerColor = color(parsedColor)
      .darker(0.3)
      .formatHex()

    return {
      type,
      r,
      labelR: Math.max(r + 20, 30),
      x: x + width / 2,
      y: y + height / 2,
      color: parsedColor,
      darkerColor,
    }
  }).filter(d => d)

  $: groupPositions = (() => {
    let bubbles = [...groups]
    let simulation = forceSimulation(bubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.1))
      .force("y", forceY(d => d.y).strength(1))
      .force("collide", forceCollide(d => d.r + 16))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .stop()

    range(0, 350).forEach(i => simulation.tick())

    return bubbles
  })()

  $: claims = data.map(d => {
    const category = categoryAccessor(d)
    if (!category) return

    const groupPosition = groupPositions.find(({ type }) => type == category) || {}
    const {x, y, r} = groupPosition
    // if (!d.category) return
    const daysAgo = timeDay.range(dateAccessor(d), new Date()).length
    const rating = ratingAccessor(d)

    const parsedColor = typeColors[category]
    const darkerColor = color(parsedColor)
      .darker(0.3)
      .formatHex()

    return {
      ...d,
      r: bubbleR,
      x: x + (rAgeScale(daysAgo) * r),
      y: y - (rAgeScale(daysAgo) * r),
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

  $: bubbles = (() => {
    let bubbles = [...claims]
    let simulation = forceSimulation(bubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.1))
      .force("y", forceY(d => d.y).strength(0.1))
      .force("collide", forceCollide(d => d.r + bubbleR * 0.7))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .stop()

    range(0, 500).forEach(i => simulation.tick())

    return bubbles
  })()

  const onMouseOver = point => {
    hoveredClaim = point
  }
  const debouncedOnMouseOver = debounce(onMouseOver, 50)
</script>

<div class="c">
  <svg {width} {height}>
    <defs>
      <path
        id="bubble"
        d="M0.834766 0.0570311C0.653906 0.114843 0.487891 0.215234 0.351563 0.351561C0.126563 0.576561 0 0.881638 0 1.2V7.59998C0 7.7617 0.0972656 7.90779 0.246875 7.96951C0.353125 8.01365 0.471094 8.00896 0.571094 7.96131C0.611719 7.94216 0.649609 7.91599 0.682813 7.88279L2.16563 6.39998H6.8C7.11836 6.39998 7.42344 6.27342 7.64844 6.04842C7.87344 5.82342 8 5.51834 8 5.19998V1.2C8 0.881638 7.87344 0.576561 7.64844 0.351561C7.42344 0.126562 7.11836 0 6.8 0H1.2C1.075 0 0.951953 0.0195312 0.834766 0.0570311Z"
        transform={`translate(-4, -4) scale(${bubbleR * (1/4)})`}
      />
      {#each ratings as rating}
        <g id={`rating-${rating}`}>
          {@html ratingPaths[rating]}
        </g>
      {/each}
    </defs>
    {#each groups as { type, x, y, r, labelR, color, darkerColor }, i}
      <g fill={color} transform={`translate(${x}, ${y})`}
          on:mouseleave={() => onMouseOver(null)}>
        <circle
          r={r}
          fill-opacity="0.1"
        />

        <path
          class="hidden"
          d={[
            ["M", 0, -(labelR - 16)].join(" "),
            ["A", (labelR - 16), (labelR - 16), 0, 0, 1, 0, (labelR - 16)].join(" "),
            ["A", (labelR - 16), (labelR - 16), 0, 0, 1, 0, -(labelR - 16)].join(" "),
          ].join(" ")}
          fill="none"
          id={`path-${type}`}
          transform={`rotate(-80)`}
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

    {#each claims as claim}
      <g
        class="claim"
        transform={`translate(${claim.x}, ${claim.y})`}
        fill={claim.color}
        on:mouseenter={() => onMouseOver(claim)}>
        <circle
          r={bubbleR + 5}
          class="hidden"
          class:active={hoveredClaim == claim}
        />

        <use
          href="#bubble"
          transform={`rotate(${Math.random() * 30 - 35}) scale(0.86)`}
          opacity={claim.opacity}
        />
        <!-- <use
          href={`#rating-${ratingAccessor(claim)}`}
          transform={`translate(${-bubbleR}, ${-bubbleR}) rotate(${Math.random() * 30 - 35}) scale(0.86)`}
        /> -->

      <!-- <circle
        cx={x}
        cy={y}
        r={r}
        fill={color}
        stroke={darkerColor}
        {opacity}
      >
        <title>
          { mainSource }: { title }
        </title>
      </circle> -->
      </g>
    {/each}

    <!-- <text transform={`translate(${ width / 2 }, 20)`} style={"font-weight: 700"}>
      Medical Consensus
    </text>
      <text transform={`translate(${xPositions[c]}, ${60})`}>
        { c }
      </text>
    {/each} -->

    <!-- <text transform={`translate(${ 0 }, ${height / 2}) rotate(-90)`} style={"font-weight: 700"}>
      Medical Consensus
    </text>
      <text transform={`translate(${60}, ${yPositions[c]})`}>
        { c }
      </text>
    {/each} -->
  </svg>

  {#if hoveredClaim}
    <ItemTooltip item={hoveredClaim} {...hoveredClaim} />
  {/if}
</div>

<style>
  .c {
    position: relative;
  }
  svg {
    margin: 1em 0;
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
    font-weight: 100;
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