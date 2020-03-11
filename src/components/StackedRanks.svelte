<script>
  import { scaleLinear } from "d3-scale"
  import { extent, max } from "d3-array"
  import { interpolateHcl } from "d3-interpolate"
	import { sortBy } from "./utils.js"
  import flags from "./flags/all.js"

  export let data
  export let step
  export let overrideStep
  export let selectedCountry
  export let onChangeStep = () => {}

  $: activeStep = Number.isFinite(overrideStep) ? overrideStep : step

  let width = 500
  let height = 500

  const filteredCountries = [...data]
    .filter(d => d.medals > 0)
  const countriesRanked = [...filteredCountries]
    .sort(sortBy("medals"))
  const countriesRankedByGdp = [...filteredCountries]
    .sort(sortBy("gdpRank", true))
  const countriesRankedByPopulation = [...filteredCountries]
    .sort(sortBy("populationRank", true))

  const colorScaleGdp = scaleLinear()
    .domain(extent(filteredCountries.map(d => d["gdp"])))
    .range(["#ecf0f1", "#9980fa"])
    .interpolate(interpolateHcl)
  const colorScalePopulation = scaleLinear()
    .domain(extent(filteredCountries.map(d => d["population"])))
    .range(["#ecf0f1", "#9980fa"])
    .interpolate(interpolateHcl)

</script>

<div class="group">
  <div class="flags" class:active={activeStep == 0} on:mouseenter={() => onChangeStep(0)} on:mouseleave={onChangeStep(null)}>
    <div class="group-label"></div>
    {#each countriesRanked.slice(0, 22) as country}
      <div class="item" class:active="{ selectedCountry == country.name }">
        <div class="flag">
          {@html flags[(country.id2 || "").toLowerCase()] }
        </div>
      </div>
    {/each}
  </div>
  <!-- {#if step >= 1}
    <div class="metric" class:active={activeStep == 1} on:mouseenter={() => onChangeStep(1)} on:mouseleave={onChangeStep(null)}>
      <div class="group-label">GDP</div>
      {#each countriesRanked as country}
        <div class="item" class:active="{ selectedCountry == country.name }">
          <div class="metric-item"
            data-gdp={country["gdp"]}
            style={`background: ${colorScaleGdp(country["gdp"])}`}
          />
        </div>
      {/each}
    </div>
  {/if} -->
  {#if step >= 1}
    <div class="slope" class:active={activeStep == 1} on:mouseenter={() => onChangeStep(1)} on:mouseleave={onChangeStep(null)}>
      <div class="group-label"></div>
      <svg preserveAspectRatio="none" viewBox={[0, 0, countriesRanked.length - 1, 1].join(" ")}>
        {#each countriesRanked as country, index}
          <path
            class="slope-item"
            vector-effect="non-scaling-stroke"
            class:active="{ selectedCountry == country.name }"
            d={[
              "M", index, 0,
              "Q", index, 0.5, ((countriesRankedByGdp.findIndex(d => d.name == country.name) == -1 ? 40 : countriesRankedByGdp.findIndex(d => d.name == country.name)) + index) / 2, 0.5,
              "Q", (countriesRankedByGdp.findIndex(d => d.name == country.name) == -1 ? 40 : countriesRankedByGdp.findIndex(d => d.name == country.name)), 0.5, (countriesRankedByGdp.findIndex(d => d.name == country.name) == -1 ? 40 : countriesRankedByGdp.findIndex(d => d.name == country.name)), 1,
            ].join(" ")}
          />
        {/each}
      </svg>
    </div>
  {/if}
  {#if step >= 2}
    <div class="flags" class:active={activeStep == 2} on:mouseenter={() => onChangeStep(2)} on:mouseleave={onChangeStep(null)}>
      <div class="group-label"></div>
      {#each countriesRankedByGdp.slice(0, 22) as country}
        <div class="item" class:active="{ selectedCountry == country.name }">
          <div class="flag"
          >
            {@html flags[(country.id2 || "").toLowerCase()] }
          </div>
        </div>
      {/each}
    </div>
  {/if}
  {#if step >= 3}
    <div class="slope" class:active={activeStep == 3} on:mouseenter={() => onChangeStep(3)} on:mouseleave={onChangeStep(null)}>
      <div class="group-label"></div>
      <svg preserveAspectRatio="none" viewBox={[0, 0, countriesRankedByGdp.length, 1].join(" ")}>
        {#each countriesRankedByGdp as country, index}
          <path
            class="slope-item"
            vector-effect="non-scaling-stroke"
            class:active="{ selectedCountry == country.name }"
            d={[
              "M", index, 0,
              "Q", index, 0.5, ((countriesRankedByPopulation.findIndex(d => d.name == country.name) == -1 ? 40 : countriesRankedByPopulation.findIndex(d => d.name == country.name)) + index) / 2, 0.5,
              "Q", (countriesRankedByPopulation.findIndex(d => d.name == country.name) == -1 ? 40 : countriesRankedByPopulation.findIndex(d => d.name == country.name)), 0.5, (countriesRankedByPopulation.findIndex(d => d.name == country.name) == -1 ? 40 : countriesRankedByPopulation.findIndex(d => d.name == country.name)), 1,
            ].join(" ")}
          />
        {/each}
      </svg>
    </div>
  {/if}
  <!-- {#if step >= 3}
    <div class="metric" class:active={activeStep == 3} on:mouseenter={() => onChangeStep(3)}>
      <div class="group-label">Pop.</div>
      {#each countriesRankedByGdp as country}
        <div class="item" class:active="{ selectedCountry == country.name }">
          <div class="metric-item"
            style={`background: ${colorScalePopulation(country["population"])}`}
          />
        </div>
      {/each}
    </div>
  {/if} -->
  {#if step >= 4}
    <div class="flags" class:active={activeStep == 4} on:mouseenter={() => onChangeStep(4)}>
      <div class="group-label"></div>
      {#each countriesRankedByPopulation.slice(0, 22) as country}
        <div class="item" class:active="{ selectedCountry == country.name }">
          <div class="flag"
            class:active="{ selectedCountry == country.name }"
          >
            {@html flags[(country.id2 || "").toLowerCase()] }
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .group {
    margin: 2em auto;
    overflow: hidden;
  }
  .flags {
    display: flex;
    align-items: center;
    /* margin-top: 1em; */
    padding: 0.2em 1em;
  }
  .flags.active {
    background: #fff;
  }
  .group-label {
    flex: 0 0 3em;
    padding-right: 0.2em;
    text-align: right;
  }
  .item {
    position: relative;
    width: 1.8em;
    height: 1.8em;
    flex: 1;
    margin: 0.12em;
  }
  .flag {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    overflow: hidden;
  }
  .flag :global(svg) {
    flex: 0 0 200%;
    width: 200%;
    /* height: 200%; */
  }
  .metric {
    display: flex;
    align-items: center;
    padding: 0.2em 1em;
  }
  .metric.active {
    background: #fff;
  }
  .metric-item {
    width: 100%;
    height: 100%;
  }
  .item {
    /* opacity: 0.6; */
  }
  .item.active {
    opacity: 1;
  }
  .item.active:before {
    content: "";
    position: absolute;
    top: -16%;
    right: -16%;
    bottom: -16%;
    left: -16%;
    border-radius: 100%;
    background: radial-gradient(
      transparent 0%,
      transparent 55%,
      #e27111 60%,
      #fff 80%
    );
    z-index: 100;
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
  .slope {
    width: 100%;
    height: 2em;
    display: flex;
    align-items: center;
    padding: 0.2em 1em;
  }
  .slope svg {
    height: 100%;
    flex: 1;
    padding-left: 1.5em;
  }
  .slope.active {
    background: #fff;
  }
  .slope-item {
    fill: none;
    mix-blend-mode: darken;
    stroke: #d7dfe4;
    stroke-width: 1;
  }
  .slope-item.active {
    stroke: #e27111;
  }
</style>