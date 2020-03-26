<script>
	import { onMount } from 'svelte'
	import Timeline from "./Timeline.svelte"
	import Clusters from "./Clusters.svelte"
	import MapClusters from "./MapClusters.svelte"
	import Quadrant from "./Quadrant.svelte"
	import Bubbles from "./Bubbles.svelte"
	import List from "./List.svelte"

  import { organizations } from "./data-utils"
	import rawData from "./../data/data.json"

	// let data = []

	// onMount(async () => {
		// const res = await fetch(dataUrl)
	// const data = rawData
	// })

	const types = [
		"map", "clusters", "timeline"
	]
	let selectedType = types[0]

</script>

<main>
	<select class="select" bind:value={selectedType}>
		{#each types as type}
			<option>{ type }</option>
		{/each}
	</select>
	<h1>
		Misinformation + COVID 2019
	</h1>
	<h2>
		Understand what false claims are spreading; what you may have unknowingly read.
	</h2>
	<p>
		We compiled fact-checks from over 100 organizations around the world to combat misinformation about Covid-19.
	</p>
	<div class="orgs">
		{#each organizations as organization}
			<div class="org">
				{ organization }
			</div>
		{/each}
	</div>

	{#if selectedType == "map"}
		<MapClusters />
	{:else if selectedType == "clusters"}
		<Clusters />
	{:else if selectedType == "timeline"}
		<Timeline />
	{/if}
	<!-- <Quadrant /> -->
	<!-- <Bubbles /> -->
	<List />
</main>

<style>
	/* @import url('https://rsms.me/inter/inter.css'); */
	:global(body) {
		background: #f4f5fa;
	}
	:global(body),
	:global(button) {
		font-family: 'Product Sans', sans-serif;
	}
	main {
		/* max-width: 70em; */
		width: 100%;
		margin: 3em auto;
		/* padding: 6em 4em; */
		color: #1f2025;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		/* background: #f3f8fb; */
	}
  h1 {
		/* font-size: 3em;
		line-height: 1.6em; */
		font-weight: 300;
		/* max-width: 90%; */
		margin-bottom: 0;
		/* font-weight: 900; */
		font-size: 4em;
		line-height: 1.1em;
	}
	h2 {
		font-weight: 300;
		font-size: 2.3em;
		line-height: 1.3em;
		color: #888ca1;
		max-width: 30em;
	}
	h3 {
		font-size: 2.3em;
		line-height: 1.1em;
		font-weight: 500;
		max-width: 90%;
		margin-bottom: 1.2em;
	}

	p {
		max-width: 60em;
		margin: 1em auto;
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
	.sports {
		margin: 9em 0;
	}

	.select :global(.selectedItem) {
    padding: 0;
	}
	.select :global(input) {
    width: auto;
	}

	.orgs {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		max-width: 80em;
		margin-bottom: 2em;
	}
	.org {
		margin: 0.5em 1em;
		font-size: 0.7em;
		line-height: 1.1em;
		opacity: 0.4;
	}
</style>