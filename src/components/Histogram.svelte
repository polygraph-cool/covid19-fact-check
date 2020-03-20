<script>
  import { scaleLinear } from "d3-scale"
  import { area, line, curveMonotoneX } from "d3-shape"
  // import { curveMonotoneX } from "d3-interpolate"
  import { bin, extent, max } from "d3-array"

  export let data
  export let metric
  export let selectedCountry

  let width = 500
  let height = 90

  $: bins = bin()
    .value(d => d[metric])
    .thresholds(100)
    (data)

  let firstBin = []
  firstBin.x0 = 0
  firstBin.x1 = 0
  let lastBin = []
  $: lastBin.x0 = bins.slice(-1)[0].x1 + 1
  $: lastBin.x1 = bins.slice(-1)[0].x1 + 1
  $: allBins = [firstBin, ...bins, lastBin]

  $: xScale = scaleLinear()
    .domain([
      allBins[0].x0,
      allBins.slice(-1)[0].x1,
    ])
      // extent(data.map(d => d[metric]))
    // )
    .range([0, width])
    .clamp(true)

  $: yScale = scaleLinear()
    .domain([0, max(allBins.map(d => d.length))])
    .range([height, 0])

  $: pathD = line()
    .x(d => xScale(d.x0))
    .y(d => yScale(d.length))
    .curve(curveMonotoneX)
    (allBins)
  $: areaD = area()
    .x(d => xScale(d.x0))
    .y0(height)
    .y1(d => yScale(d.length))
    .curve(curveMonotoneX)
    (allBins)

  $: selectedCountryData = data.find(({ name }) => (
    name == selectedCountry
  )) || {}
  $: selectedCountryX = bins.find(({ x0, x1 }) => (
    x0 <= selectedCountryData[metric]
    && x1 > selectedCountryData[metric]
  ))

</script>

<div class="group">
  <svg {width} {height}>
    <!-- {#each bins as bin}
      {#each bin as country, countryI}
        <circle
          cx={xScale(bin.x0)}
          cy={height + countryI * -10}
          r="5"
          class:active="{ selectedCountry == country.name }"
        >
          <title>{ country.name }</title>
        </circle>
      {/each}
    {/each} -->
    <path
      d={pathD}
      class="line"
    />
    <path
      d={areaD}
      class="area"
    />
    <circle
      cx={xScale(selectedCountryX)}
      cy={height - 30}
      r="5"
    />
  </svg>
  <!-- <svg width={width} height={height}>
    {#each data as country}
      <circle
        cx={xScale(country[metric])}
        cy={yScale(country["rank"])}
        r="9"
        class:active="{ selectedCountry == country.name }"
      >
        <title>{ country.name }</title>
      </circle>
    {/each}
  </svg> -->
</div>

<style>
  .group {
    margin: 2em auto;
    width: 100%;
  }
  svg {
    width: 100%;
    overflow: visible;
  }
  .area {
    fill: #cbbdff;
    fill-opacity: 0.5;
  }
  .line {
    fill: none;
    stroke: #af9df0;
    stroke-width: 2;
  }
  circle {
    fill: #fbcb5e;
    stroke: #efa22e;
    stroke-width: 1;
    /* mix-blend-mode: multiply; */
    /* fill-opacity: 0.5; */
  }
  circle.active {
    fill: #9b59b6;
    fill-opacity: 1;
  }
</style>