<script>
  import { scaleLinear } from "d3-scale"
  import { extent } from "d3-array"

  export let data
  export let metric
  export let selectedCountry

  let width = 500
  let height = 500

  let xScale = scaleLinear()
    .domain(extent(data.map(d => d[metric])))
    .range([0, width])
  let yScale = scaleLinear()
    .domain(extent(data.map(d => d["rank"])).reverse())
    .range([height, 0])

</script>

<div class="group">
  {#each data as country}
    <div
      cx={xScale(country[metric])}
      class:active="{ selectedCountry == country.name }"
    >
      <title>{ country.name }</title>
    </div>
  {/each}
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
  }
  svg {
    overflow: visible;
  }
  circle {
    fill: #1abc9c;
    mix-blend-mode: multiply;
    fill-opacity: 0.5;
  }
  circle.active {
    fill: #9b59b6;
    fill-opacity: 1;
  }
</style>