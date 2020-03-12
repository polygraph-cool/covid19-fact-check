<script>
  import { median } from 'd3-array'

	import Scroller from "./Scroller.svelte"
	import Medal from "./Medal.svelte"
	import StackedRanks from "./StackedRanks.svelte"
	import MapBubbles from "./MapBubbles.svelte"
	import ByContinent from "./ByContinent.svelte"
	import Slope from "./Slope.svelte"
	import Number from "./Number.svelte"

  export let data
  export let selectedCountry
  export let selectedMetric
  export let onChangeSelectedMetric

  let index = 0

  let dataByCountry = {}
  $: data.forEach(country => dataByCountry[country.name] = country)

  $: selectedCountryData = dataByCountry[selectedCountry] || {}
  $: medianGdp = median(data.map(d => d.gdp)) || 0
  $: console.log(medianGdp, selectedCountryData.gdp/ medianGdp)

  const metrics = ["rank", "gdpRank", "populationRank"]
  $: onChangeSelectedMetric(metrics[Math.min(index, metrics.length - 1)])
</script>

<div class="Intro">
  <div class="left">
    <Scroller bind:index>
      <!-- <div slot="background">
      </div> -->
      <div slot="foreground">
        <section class="section">
          <div class="medal-section">
            <Medal rank={selectedCountryData.rank} medals={selectedCountryData.medals} />
            <div class="medal-section-blurb">
             Athletes from { selectedCountry } won { selectedCountryData.medals } medals, making them the {#if selectedCountryData.rank > 1}<Number isOrdinal number={ selectedCountryData.rank } /> {/if}best country in the Olympics.
            </div>
          </div>
        </section>
        <section class="section">
          <p>
            But the resources for each team aren't equal.
            For example, { selectedCountry }'s GDP is <Number number={ selectedCountryData.gdp > medianGdp ? selectedCountryData.gdp / medianGdp : medianGdp / selectedCountryData.gdp } numberFormat="0.1f" /> times { selectedCountryData.gdp > medianGdp ? "larger" : "smaller" } than the median GDP, which might translate to { selectedCountryData.gdp > medianGdp ? "better" : "worse" } equipment, etc.
          </p>
          <div class="medal-section">
            <Medal rank={selectedCountryData.gdpRank} medals={selectedCountryData.gdpMedals} />
            <div class="medal-section-blurb">
              If all countries had the same GDP, { selectedCountry } might have earned <Number number={ selectedCountryData.gdpMedals } /> gold medals, making them the {#if selectedCountryData.gdpRank > 1}<Number isOrdinal number={ selectedCountryData.gdpRank } /> {/if}best country.
            </div>
          </div>
        </section>
        <section class="section">
          <p>
            What if we looked at Population? Smaller countries are less likely to produce an exceptional athlete.
          </p>

          <div class="medal-section">
            <Medal rank={selectedCountryData.populationRank} medals={selectedCountryData.populationMedals} />
            <div class="medal-section-blurb">
              { selectedCountry } has earned 1 gold medal per <Number number={ selectedCountryData.population / selectedCountryData.medals } /> people. If all countries had equal population, { selectedCountry } would come in <Number isOrdinal number={ selectedCountryData.populationRank } />!
            </div>
          </div>
        </section>
      </div>
    </Scroller>
  </div>
  <div class="right">
    <div class="sticky">
      <!-- <MapBubbles
        metric={selectedMetric}
        selectedCountry={selectedCountry}
      /> -->
      <!-- <StackedRanks
        step={index}
        overrideStep={overrideStep}
        selectedCountry={selectedCountry}
        onChangeStep={newStep => overrideStep = newStep}
      /> -->

      <Slope
        data={data}
        metric={selectedMetric}
        selectedCountry={selectedCountry}
      />
    </div>
  </div>
</div>

<style>
	.Intro {
		display: flex;
	}
	p {
		font-size: 1.3em;
		line-height: 1.6em;
		/* max-width: 30em; */
		/* padding: 1.5em 0;
		background: white; */
	}

	.section {
		min-height: 70vh;
		padding: 5em 0;
	}
	.sticky {
		position: sticky;
		top: 0;
		right: 0;
	}
	.left {
		flex: 0 0 30vw;
		width: 40em;
		max-width: 30vw;
    padding-right: 3em;
	}
	.right {
		position: relative;
		flex: 1;
		/* width: 100%; */
    margin-right: -4em;
		margin-left: 1em;
		padding-bottom: 2em;
		background: #f3f8fb;
	}

  .medal-section {
    display: flex;
    align-items: center;
  }
  .medal-section-blurb {
    flex: 1;
    padding-left: 1em;
		font-size: 1.3em;
		line-height: 1.6em;
  }
</style>