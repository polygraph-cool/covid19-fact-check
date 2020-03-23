
<script>
	import { onMount } from 'svelte'
	import Timeline from "./Timeline.svelte"
	import Clusters from "./Clusters.svelte"
	import MapClusters from "./MapClusters.svelte"
	import Quadrant from "./Quadrant.svelte"
	import Bubbles from "./Bubbles.svelte"
	import List from "./List.svelte"

	import rawData from "./../data/data.json"

	// let data = []

	// onMount(async () => {
		// const res = await fetch(dataUrl)
	const data = rawData
	// })

</script>

<main>
	<h1>
		Misinformation + COVID 2019
	</h1>
	<h2>
		Understand what false claims are spreading; what you may have unknowingly read.
	</h2>

	<MapClusters {data} />
	<!-- <Clusters {data} /> -->
	<!-- <Timeline {data} /> -->
	<!-- <Quadrant {data} /> -->
	<!-- <Bubbles {data} /> -->
	<List {data} />
</main>

<style>
	/* @import url('https://rsms.me/inter/inter.css'); */
	:global(body) {
		background: #edeef3;
	}
	:global(body),
	:global(button) {
		font-family: 'Product Sans', sans-serif;
	}
	main {
		max-width: 70em;
		width: 100%;
		margin: 0 auto;
		padding: 6em 4em;
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