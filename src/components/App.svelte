
<script>
	import { onMount } from 'svelte'
	import Select from "svelte-select"

	import Intro from "./Intro.svelte"
	import DataTable from "./DataTable.svelte"
	// import Select from "./Select.svelte"
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

	$:console.log(selectedCountry)
</script>

<main>
	<h1>
		Alternative Olympics Medal Table
	</h1>
	<h3>
		How is <Select
			class="select"
			selectedValue={selectedCountry}
			on:select={res => selectedCountry = res.detail.value}
			items={countries}
			isClearable={false}
			containerStyles="
			display: inline-block;
			z-index: 100;
			border-width: 0;
			border-bottom-width: 1px;
			padding: 0 0 0.1em 0.3em;
			vertical-align: sub;
			"
		/> doing in the Olympics?
	</h3>


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

	.select :global(.selectedItem) {
    padding: 0;
	}
	.select :global(input) {
    width: auto;
	}
</style>