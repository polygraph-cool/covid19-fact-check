<script>
	import { onMount } from 'svelte'
	import Intro from "./Intro.svelte"
	import Timeline from "./Timeline.svelte"
	import Clusters from "./Clusters.svelte"
	import MapClusters from "./MapClusters.svelte"
	import Quadrant from "./Quadrant.svelte"
	import Bubbles from "./Bubbles.svelte"
	import List from "./List.svelte"
  import { flatten } from "./utils"
  import { categoryAccessor, countriesAccessor, organizationAccessor } from "./data-utils"

	// import rawData from "./../data/data.json"

	const dataUrl = "https://pudding.cool/misc/covid-fact-checker/data.json"
	let iteration = 0
	let data = []
	let categories = []
	let organizations = []
	let countries = []
	let isLoading = true

	onMount(async () => {
		const res = await fetch(dataUrl)
		const resJson = await res.json()
		data = resJson.data
		isLoading = false
		organizations = [...new Set(data.map(organizationAccessor))]
		countries = [...new Set(flatten(data.map(countriesAccessor)))]
		iteration++
	})
</script>

<main>
	<!-- <select class="select" bind:value={selectedType}>
		{#each types as type}
			<option>{ type }</option>
		{/each}
	</select> -->

	<Intro {data} {organizations} />

	<div class="section" id="categories">
    <p>
      We've grouped each of these fact-checks into categories:
    </p>
		<Clusters {data} {iteration} />
	</div>
	<!-- <Quadrant /> -->
	<!-- <Bubbles /> -->

	<div class="section" id="countries">
		<p style="max-width: 20em; margin-bottom: -3em">
			We also looked at what country each fact check originated in.
		</p>
		<MapClusters {data} {iteration} {isLoading} {organizations} {countries} />
	</div>

	<div class="section" id="list">
		<List {data} {countries} {organizations} />
	</div>

	{#if isLoading}
		Loading fact checks...
	{/if}
</main>

<style>
	/* @import url('https://rsms.me/inter/inter.css'); */

	main {
		/* max-width: 70em; */
		width: 100%;
		margin: 3em auto;
		/* padding: 6em 4em; */
		color: #1f2025;
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		/* text-align: center; */
		/* background: #f3f8fb; */
	}


	.section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	p {
		max-width: 60em;
		/* text-align: left; */
		text-align: center;
		margin: 1em 0;
		padding: 0 3rem;
		font-size: 1.3em;
		line-height: 1.6em;
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
</style>