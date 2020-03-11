<script>
  import { scaleLinear, scaleSqrt } from "d3-scale"
  import { extent } from "d3-array"
  import { sortBy } from "./utils.js"

  export let data
  export let metric
  export let selectedCountry

  const continents = [...new Set(data.map(d => d.continent))]
    .filter(d => d !== undefined)

  $: sortedData = data.sort(sortBy(metric))
    .filter(d => d.medals > 0)
    .map((d, i) => ({
      ...d,
      rank: i,
    }))

  $: xScale = scaleLinear()
    .domain([0, sortedData.length])
    .range([0, 100])

  $: dataByContinent = continents.map(continent => {
    const countryData = sortedData.filter(d => d.continent == continent)
    return countryData.map(d => ({
      ...d,
      x: xScale(d.rank),
    }))
  })
</script>

<div class="group">
  {#each dataByContinent as countries, i}
    <div class="row">
      <div class="row-label">
        { continents[i] }
      </div>
      <div class="row-items">
        {#each countries as country (country.name)}
          <div
            class="country"
            class:active={selectedCountry == country.name}
            style={`transform: translate(-50%, -50%); left: ${country.x}%`} title={country.name}>
            { country.rank }
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .row {
    display: flex;
    width: 100%;
  }
  .row-label {
    flex: 0 0 8em;
    width: 8em;
  }
  .row-items {
    position: relative;
    flex: 1;
    margin: 1em 0;
    border-top: 1px solid #eaeaee;
  }
  .country {
    position: absolute;
    height: 2.3em;
    width: 2.3em;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #9980fa77;
    font-size: 0.76em;
    border-radius: 100%;
    mix-blend-mode: multiply;
    transition: all 1s ease-out;
  }
  .country.active {
    background: #efa22e;
  }
</style>