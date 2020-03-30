<script>
  import { bin, extent, max, min } from "d3-array"
  import { scaleLinear, scaleTime } from "d3-scale"
  import { area, line, curveMonotoneX } from "d3-shape"
  import { timeFormat, timeParse } from "d3-time-format"
  import { timeDay, timeMonth } from "d3-time"
  import { dateAccessor, parseDate, categoryAccessor, categoryColors, countries, countriesAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizations, organizationAccessor, tags, tagsAccessor } from "./data-utils"
  import { debounce, sortBy } from "./utils"

  export let filter
  export let data
  export let iteration

  let height = 80
  let width = 1200
  let canvasElement

  const formatDay = timeFormat("%d/%m/%Y")
  const prettyMonth = timeFormat("%B")
  const today = new Date()

  const windowGlobal = typeof window !== "undefined" && window
  const pixelRatio = windowGlobal.devicePixelRatio || 1

  $: allDates = data.map(dateAccessor)
  $: xExtent = [
    min(allDates),
    min([new Date(), max(allDates)]),
  ]
  $: days = timeDay.range(...xExtent)

  $: bins = bin()
    .value(d => dateAccessor(d))
    .thresholds(
      days
    )
    (data)
    .map(d => d.sort((a,b) => (
      categoryAccessor(b) > categoryAccessor(a) ? 1 : -1
    )))

  $: filteredData = data.filter(filter)
  $: filteredBins = bin()
    .value(d => dateAccessor(d))
    .thresholds(days)
    (filteredData)

  $: xScale = scaleTime()
    .domain(xExtent)
    .range([0, width])

  $: itemWidth = bins[1] ? Math.floor(
    xScale(bins[1].x0) - xScale(bins[0].x0) - 1
  ) : 10

  $: xTicks = timeMonth.range(
    ...xExtent,
  ).map(d => [
    prettyMonth(d),
    xScale(d),
  ])

  $: yScale = scaleLinear()
    .domain([0, max(bins.map(d => d.length))])
    .range([height, 0])

  // const drawCanvas = () => {
  //   console.log("drawCanvas")
  //   if (!canvasElement) return
  //   const ctx = canvasElement.getContext("2d")
  //   canvasElement.width = width * pixelRatio
  //   canvasElement.height = height * pixelRatio

  //   ctx.strokeWidth = 3
  //   const drawItem = ({ x, y, color }) => {
  //     ctx.beginPath()
  //     ctx.moveTo(Math.round(x - itemWidth / 2), y)
  //     ctx.lineTo(Math.round(x + itemWidth / 2), y)
  //     ctx.strokeStyle = color
  //     ctx.stroke()
  //   }
  //   bins.forEach((bin, i) => {
  //     const x = xScale(bin.x0)
  //     const numberOfFilteredItems = (filteredBins[i] || []).length
  //     bin.forEach((item, j) => {
  //       // const category = categoryAccessor(item)
  //       const color = numberOfFilteredItems >= j ? "#45aeb1" : "#656275"
  //       const y = height + -j * 2
  //       drawItem({ x, y, color })
  //     })
  //   })

  //   ctx.scale(pixelRatio, pixelRatio)
  // }
  // const debouncedDrawCanvas = debounce(drawCanvas, 500)
  // // $: (() => {{
  // //   const _ = width
  // //   drawCanvas()
  // // }})
  // // onMount(drawCanvas)
  // $: debouncedDrawCanvas()
  // $: width, iteration, debouncedDrawCanvas()

</script>

<div class="c" bind:clientWidth={width} bind:clientHeight={height}>
  <svg {height} {width}>

    {#each bins as bin, i}
      <rect
        class="full-area"
        y={yScale(bin.length)}
        height={height - yScale(bin.length)}
        x={(xScale(bin.x0))}
        width={itemWidth}
      />
      <rect
        class="filtered-area"
        y={yScale((filteredBins[i] || []).length)}
        height={height - yScale((filteredBins[i] || []).length)}
        x={(xScale(bin.x0))}
        width={itemWidth}
      />
    {/each}
    {#each xTicks as [label, offset]}
      <line
        class="tick-mark"
        x1={offset}
        x2={offset}
        y1={height}
        y2={height + 5}
      />
      <text x={offset} y={height + 19}>
        { label }
      </text>
    {/each}
  </svg>
  <!-- <canvas
    {height}
    {width}
    bind:this={canvasElement}
  /> -->
</div>

<style>
  .c {
    width: 100%;
    height: 90px;
    margin-top: 2em;
    margin-bottom: 20px;
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
    text-anchor: middle;
    font-size: 0.65em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .tick-mark {
    stroke: #cacadb;
  }
</style>