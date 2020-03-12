
<script>
	import { onMount } from 'svelte'

	import Intro from "./Intro.svelte"
	import DataTable from "./DataTable.svelte"
	import SportsSection from "./SportsSection.svelte"
	import { parseData, sortBy } from "./utils.js"
	import rawData from "./../data/data.json"

	// let data = []

	// onMount(async () => {
		// const res = await fetch(dataUrl)
	const data = parseData(rawData)
	// })

	$: countries = data
		.filter(d => d.rank)
		.map(d => d.name)
		.sort()
	// TODO: what to do about countries w/o medals

	// $: selectedMetric = metrics[0]
	let selectedMetric = "rank"

	$: selectedCountry = "Hungary"
	const onChangeSelectedMetric = metric => selectedMetric = metric
</script>

<main>
	<h1>
		Alternative Olympics Medal Table
	</h1>
	<h3>
		How is { selectedCountry } doing in the Olympics?
	</h3>

	<select value={selectedCountry} on:change={e => selectedCountry = e.target.value}>
		{#each countries as country}
			<option>{ country }</option>
		{/each}
	</select>


	<!-- <select value={selectedMetric} on:change={e => selectedMetric = e.target.value}>
		{#each metrics as metric}
			<option>{ metric }</option>
		{/each}
	</select> -->

	<Intro {...{data, selectedCountry, selectedMetric, onChangeSelectedMetric}} />

	<div class="sports">
		<h2>
			What about specific sports?
		</h2>

		<p>
			Different countries are more interested in some sports than others. For example, people in the United States are very interested in basketball — does that translate to higher medal counts?
		</p>
		<p>
			Let's look at the interest of people in { selectedCountry } for each Olympic sport, and the number of medals { selectedCountry } has earned.
		</p>

		<SportsSection {...{selectedCountry}} />
	</div>

	<h2>
		Let's look at the data in detail:
	</h2>

	<!-- <MapBubbles metric="gdpRank" selectedCountry={selectedCountry} /> -->

	<!-- <MapBubbles metric="populationRank" selectedCountry={selectedCountry} /> -->

	<DataTable data={data} selectedCountry={selectedCountry} />
</main>

<style>
	@import url('https://rsms.me/inter/inter.css');
	main {
		max-width: 90em;
		margin: 0 auto;
		padding: 3em 4em;
		color: #1d1e24;
		font-family: 'Inter', sans-serif;
		/* background: #f3f8fb; */
	}
  h1 {
		font-size: 4em;
		line-height: 1.1em;
		font-weight: 900;
		max-width: 90%;
		margin-bottom: 0.5em;
	}
	h2 {
		font-size: 2.3em;
		line-height: 1.1em;
		font-weight: 500;
		max-width: 90%;
		margin: 0 0 3em;
	}
	h3 {
		font-size: 2.3em;
		line-height: 1.1em;
		font-weight: 500;
		max-width: 90%;
		margin-bottom: 0.9em;
	}

	/* .right:before {
		content: "";
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: #f3f8fb;
		z-index: -1;
	} */
	select {
		position: fixed;
		top: 0;
		right: 0;
		font-size: 0.8em;
		z-index: 1000;
	}
	.sports {
		margin: 9em 0;
	}
</style>