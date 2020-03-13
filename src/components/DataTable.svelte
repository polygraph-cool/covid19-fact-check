<script>
  import { sortBy } from "./utils.js"
  import { scaleLinear } from "d3-scale"
  import { extent } from "d3-array"
  import { interpolateHcl } from "d3-interpolate"
  import Number from "./Number.svelte"

  export let data = []
  // export let selectedCountry

  $: sortedData = data.sort(sortBy("medals"))
  let colorScales = {}
  const maxColors = [
    "#fff",
    "#9980fa",
    "#e27111",
  ]
  $: _ = ["rank", "gdpRank", "populationRank"].forEach((key, index) => {
    // let domain = extent(data.map(d => d[key]))
    let domain = key == "rank" ? [26, 1] : [60, 1]
    colorScales[key] = scaleLinear()
      .domain(domain)
      .range(["#fff", maxColors[index]])
      // .interpolate(interpolateHcl)
  })
</script>

<div class="group">
  <div class="header row">
    <div class="name">
      Country
    </div>
    <div class="medals cell supercell">
      By medals won
    </div>
    <div class="gdp cell supercell">
      With equal GDP
    </div>
    <div class="population cell supercell">
      With equal population
    </div>
  </div>
  <div class="header row">
    <div class="name"></div>
    <div class="medals cell split-cell">
      <div class="subcell">Rank</div>
      <div class="subcell">Medals</div>
    </div>
    <div class="gdp cell split-cell">
      <div class="subcell">Rank</div>
      <div class="subcell">Medals</div>
    </div>
    <div class="population cell split-cell">
      <div class="subcell">Rank</div>
      <div class="subcell">Medals</div>
    </div>
  </div>
  {#each sortedData as country}
    <div class="row">
      <div class="name">
        { country.name }
      </div>
      <div class="medals cell" style={`background: ${ colorScales["rank"](country.rank) }`}>
        <Number number={ country.rank } />
        <div class="medals-number">
          (<Number number={ country.medals } />)
        </div>
      </div>
      <div class="gdp cell" style={`background: ${ colorScales["gdpRank"](country.gdpRank) }`}>
        <Number number={ country.gdpRank } />
        <div class="medals-number">
          (<Number number={ country.gdpMedals } />)
        </div>
      </div>
      <div class="population cell" style={`background: ${ colorScales["populationRank"](country.populationRank) }`}>
        <Number number={ country.populationRank } />
        <div class="medals-number">
          (<Number number={ country.populationMedals } />)
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .group {
    margin-top: 2em;
    padding-right: 3em;
  }
  .row {
    display: flex;
  }
  .header {
    font-weight: 700;
    position: sticky;
    top: 0;
    padding-top: 0.6em;
    background: white;
  }
  .full {
    flex: 0 0 33em;
    text-align: center;
    border-bottom: 1px solid;
  }
  .header .cell {
    font-weight: 400;
  }
  .header div {
    padding-bottom: 0.5em;
  }
  .name {
    flex: 3;
    padding: 0.5em 0.6em;
    padding-left: 0;
  }
  .cell {
    flex: 0 0 11em;
    padding: 0.5em 0.6em;
    font-weight: 600;
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .medals-number {
    flex: 0 0 4em;
    font-size: 0.9;
    font-weight: 300;
  }
  .header .supercell {
    /* margin-left: 1em; */
    padding-bottom: 0;
  }

  .split-cell {
    /* border-top: 1px solid;
    margin-left: 1em */
    padding-top: 0.2em;
  }
  .subcell {
    font-size: 0.8em;
  }
  .subcell:nth-child(1) {
    font-weight: 600;
  }
  .subcell:nth-child(2) {
    flex: 0 0 4rem;
  }
</style>