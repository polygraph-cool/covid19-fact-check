<script>
  import { bin, extent, max } from "d3-array"
  import { scaleLinear, scaleTime } from "d3-scale"
  import { area, line, curveMonotoneX } from "d3-shape"
  import { timeFormat, timeParse } from "d3-time-format"
  import { timeDay, timeMonth } from "d3-time"
  import { data, dateAccessor, countries, countriesAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizations, organizationAccessor, tags, tagsAccessor } from "./data-utils"
  import { debounce } from "./utils"

  export let filter
  export let iteration

  let height
  let width
  let canvasElement

  const formatDay = timeFormat("%d/%m/%Y")
  const parseDay = timeParse("%d/%m/%Y")
  const prettyMonth = timeFormat("%B")
  const today = new Date()

  $: xExtent = extent(
    data.map(dateAccessor)
  )
  $: days = timeDay.range(...xExtent)

  $: bins = bin()
    .value(d => dateAccessor(d))
    .thresholds(
      days
    )
    (data)

  $: filteredData = data.filter(filter)
  $: filteredBins = bin()
    .value(d => dateAccessor(d))
    .thresholds(days)
    (filteredData)

  $: xScale = scaleTime()
    .domain(xExtent)
    .range([0, width])

  $: xTicks = timeMonth.range(
    ...xExtent,
  ).map(d => [
    prettyMonth(d),
    xScale(d),
  ])
  $:console.log(xTicks)

  $: yScale = scaleLinear()
    .domain([0, max(bins.map(d => d.length))])
    .range([height, 0])

  $: fullArea = area()
      .x(d => xScale(d.x0))
      .y0(height)
      .y1(d => yScale(d.length))
      .curve(curveMonotoneX)
      (bins)

  $: filteredArea = area()
      .x(d => xScale(d.x0))
      .y0(height)
      .y1(d => yScale(d.length))
      .curve(curveMonotoneX)
      (filteredBins)

</script>

<div class="c" bind:clientWidth={width} bind:clientHeight={height}>
  <svg {height} {width}>
    <path class="full-area" d={fullArea} />
    <path class="filtered-area" d={filteredArea} />

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
</div>

<style>
  .c {
    width: 100%;
    height: 70px;
    margin-bottom: 20px;
  }
  svg {
    overflow: visible;
  }
  .full-area {
    fill: #dbdbeb;
  }
  .filtered-area {
    fill: #000;
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