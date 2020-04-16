<script>
  import { bin, extent, max, min } from "d3-array"
  import { scaleLinear, scaleTime } from "d3-scale"
  import { area, line, curveMonotoneX } from "d3-shape"
  import { timeFormat, timeParse } from "d3-time-format"
  import { timeDay, timeMonth } from "d3-time"
  import { dateAccessor, parseDate, categories, categoryAccessor, categoryColors, tags, tagAccessor, tagColors, countriesAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizationAccessor } from "./data-utils"
  import { debounce, scaleCanvas } from "./utils"

  export let filterFunction
  export let data
  export let isFiltered
  export let color
  export let overrideWidth
  export let iteration

  let containerHeight = 190
  let height = containerHeight - 20
  let containerWidth = 1200
  let canvasElement

  $: width = overrideWidth || containerWidth

  const formatDay = timeFormat("%d/%m/%Y")
  const prettyMonth = timeFormat("%B")
  const today = new Date()

  let bins = []
  let filteredBins = []
  let xTicks = []
  let yTicks = []
  let xScale
  let yScale
  let itemWidth = 10

  const updateBins = () => {
    const allDates = data.map(dateAccessor)
    const xExtent = [
      min(allDates),
      min([new Date(), max(allDates)]),
    ]
    const days = timeDay.range(...xExtent)

    bins = bin()
      .value(d => dateAccessor(d))
      .thresholds(
        days
      )
      (data)

    const filteredData = data.filter(filterFunction)
    filteredBins = bin()
      .value(d => dateAccessor(d))
      .thresholds(days)
      (filteredData)

    xScale = scaleTime()
      .domain(xExtent)
      .range([0, width])

    itemWidth = bins[1] ? Math.floor(
      xScale(bins[1].x0) - xScale(bins[0].x0) - (width < 500 ? 0 : 1)
    ) : 10

    xTicks = timeMonth.range(
      ...xExtent,
    ).map(d => [
      prettyMonth(d),
      xScale(d),
    ])

    const maxCount = max(bins.map(d => d.length))
    yScale = scaleLinear()
      .domain([0, maxCount])
      .range([height, 0])

    yTicks = [
      Math.round(maxCount),
      Math.round(maxCount / 2),
    ].map(d => [
        d,
        yScale(d),
      ])
  }

  $: iteration, width, updateBins()

  $: parsedBins = bins.map(bin => {
    let runningY = height
    const bars = [{
      y: yScale(bin.length),
      height: height - yScale(bin.length),
      color: "#dbdbeb",
    },
    ...(!isFiltered ?
      tags.map(tag => {
        const barHeight = height - yScale(bin.filter(d => tagAccessor(d) == tag).length)
        runningY -= barHeight
        return {
          y: runningY,
          height: barHeight,
          color: tagColors[tag] || "#dbdbeb",
          isTag: true,
        }
      })
    : [])
    ]

    return {
      x: xScale(bin.x0) - itemWidth,
      bars,
    }
  })

  // $: tagBins = bins.map(bin => {
  //   let runningY = 0
  //   return tags.map(tag => {
  //     const numberInTag = bin.filter(d => tagAccessor(d) == tag).length
  //     runningY += numberInTag
  //     return {
  //       start: runningY - numberInTag,
  //       end: runningY,
  //       color: tagColors[tag],
  //     }
  //   })
  // })


  const drawCanvas = () => {
    if (!canvasElement) return

    const ctx = canvasElement.getContext("2d")
    scaleCanvas(canvasElement, ctx, width, height)

    // ctx.imageSmoothingEnabled = false
    ctx.strokeWidth = 3
    const drawItem = ({ x, y, color }) => {
      ctx.beginPath()
      ctx.moveTo(Math.round(x - itemWidth / 2), Math.round(y))
      ctx.lineTo(Math.round(x + itemWidth / 2), Math.round(y))
      ctx.strokeWidth = 1
      ctx.strokeStyle = color
      ctx.stroke()
    }

    parsedBins.forEach(({ x, bars }, i) => {
      // const x = xScale(bin.x0)
      // const numberOfFilteredItems = (filteredBins[i] || []).length
      bars.forEach(({ y, height, color: barColor, isTag }, j) => {

        ctx.fillStyle = barColor
        ctx.fillRect(x, y, itemWidth, height + 1)

        // const tag = tagAccessor(item)
          // ? numberOfFilteredItems >= j ? (color || "#57a039") : "#dbdbeb"
          // : (tagBins[i][
          //   tagBins[i].findIndex(({ start, end }) => start < j && end >= j)
          // ] || {}).color || "#dbdbeb"
        // const y = height + -j * 2
      })

      ctx.fillStyle = "#fff"
      ctx.fillRect(x + itemWidth, 0, 1, height)
      ctx.fillStyle = "#fff"
      ctx.fillRect(x - 1, 0, 1, height)

      ctx.fillStyle = color || "#656275"
      const y = isFiltered ? yScale((filteredBins[i] || []).length) : height
      ctx.fillRect(x, y, itemWidth, height - y)
    })
  }

  const debouncedDrawCanvas = debounce(drawCanvas, 300)
  // $: (() => {{
  //   const _ = width
  //   drawCanvas()
  // }})
  // onMount(drawCanvas)
  $: debouncedDrawCanvas()
  $: width, iteration, debouncedDrawCanvas()

</script>

<div class="c" bind:clientWidth={containerWidth} style={`height: ${containerHeight}px`}>
  <svg {height} {width}>
    <!-- {#each parsedBins as { x, bars }, i}
      {#each bars as { y, height, color, isTag }}
        <rect
          class="full-area"
          x={x}
          y={y}
          width={itemWidth}
          height={height}
          style={`fill: ${!isFiltered || !isTag ? color : ""}`}
        />
      {/each}
      <rect
        class="filtered-area"
        y={isFiltered ? yScale((filteredBins[i] || []).length) : height}
        height={isFiltered ? height - yScale((filteredBins[i] || []).length) : 0}
        x={x}
        width={itemWidth}
        style={`fill: ${color}`}
      />
    {/each} -->
    {#each xTicks as [label, offset]}
      <line
        class="tick-mark"
        x1={offset}
        x2={offset}
        y1={height}
        y2={height + 5}
      />
      <text class="x-tick" x={offset} y={height + 19}>
        { label }
      </text>
    {/each}
    {#each yTicks as [label, offset], i}
      <line
        class="grid-mark"
        x1={0}
        x2={width}
        y1={offset}
        y2={offset}
      />
      <text class="y-tick" x={0} y={offset - 5}>
        { label }{ !i ? " new fact checks per day" : "" }
      </text>
    {/each}
    <line
      class="tick-mark"
      x1={0}
      x2={width}
      y1={height + 1}
      y2={height + 1}
    />
  </svg>
  <canvas
    style={`height: ${height}px; width: ${width}px`}
    bind:this={canvasElement}
  />
</div>

<style>
  .c {
    width: 100%;
    margin-top: 2em;
    /* overflow: hidden; */
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
  svg {
    overflow: visible;
  }
  rect {
    /* shape-rendering: crispEdges; */
    transition: all 0.3s ease-out;
  }
  .full-area {
    fill: #dbdbeb;
  }
  .filtered-area {
    fill: #656275;
    transition: all 0.3s ease-out;
  }
  text {
    fill: #8b8ba0;
    font-size: 0.65em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .x-tick {
    text-anchor: middle;
  }
  .tick-mark {
    stroke: #cacadb;
  }
  .grid-mark {
    stroke: #e5e5ee;
  }
  .y-tick {
    /* text-anchor: end; */
    text-anchor: start;
    /* dominant-baseline: middle; */
  }

  @media (min-width: 800px) {
    .c {
      margin-top: 3.6em;
    }
  }
</style>