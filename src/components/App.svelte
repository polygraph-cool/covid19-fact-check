<script>
	import { onMount } from 'svelte'
	import Intro from "./Intro.svelte"
	import Timeline from "./Timeline.svelte"
	import Header from "./Header.svelte"
	import Clusters from "./Clusters.svelte"
	import MapClusters from "./MapClusters.svelte"
	import Quadrant from "./Quadrant.svelte"
	import Bubbles from "./Bubbles.svelte"
	import List from "./List.svelte"
	import ListFilter from "./ListFilter.svelte"
	import Footer from "./Footer.svelte"
  import { debounce, flatten } from "./utils"
  import { categoryAccessor, categoryColors, categories, ratings, sources, titleAccessor, countriesAccessor, organizationAccessor, ratingAccessor, sourceAccessor } from "./data-utils"

	// import rawData from "./../data/data.json"

	const dataUrl = "https://pudding.cool/misc/covid-fact-checker/data.json"
	let iteration = 0
	let filterIteration = 0
	let allData = []
	let data = []
	let countries = []
	let organizations = []
	let isLoading = true

	onMount(async () => {
		const res = await fetch(dataUrl)
		const resJson = await res.json()
		allData = data = resJson.data
		isLoading = false
		countries = [...new Set(flatten(data.map(countriesAccessor)))].sort()
		organizations = [...new Set(data.map(organizationAccessor))]
		iteration++
	})

	let searchString = ""
	let searchStringRaw = ""
  const onUpdateSearchString = e => {
    const newValue = searchStringRaw
    searchString = newValue
		// scrollToTop()
		filterIteration++
	}
	const debouncedOnUpdateSearchString = debounce(onUpdateSearchString, 300)
	$: searchStringRaw, debouncedOnUpdateSearchString()

	let selectedCategory = null
	let selectedCountry = null
	let selectedRating = null
	let selectedSource = null
	let selectedOrg = null
	$: filterFunction = d => (
		(!selectedCategory || (categoryAccessor(d) == selectedCategory))
		&& (!selectedCountry || (countriesAccessor(d).includes(selectedCountry)))
		&& (!selectedRating || (ratingAccessor(d) == selectedRating))
		&& (!selectedOrg || (organizationAccessor(d) == selectedOrg))
		&& (!selectedSource || (sourceAccessor(d) == selectedSource))
		&& (!searchString || ((titleAccessor(d).toLowerCase().includes(searchString.toLowerCase()))))
	)

	$: isFiltered = searchString || selectedCategory || selectedCountry || selectedRating || selectedOrg || selectedSource
	$: filterColor = isFiltered && (
		selectedCategory && !(searchString || selectedCountry) ? categoryColors[selectedCategory] : null
	)
	$: selectedCategory, selectedCountry, selectedRating, selectedOrg, selectedSource, filterIteration++
</script>

<Header />

<main>
	<!-- <select class="select" bind:value={selectedType}>
		{#each types as type}
			<option>{ type }</option>
		{/each}
	</select> -->

	<Intro {data} {isLoading} />
	<div class="input-container">
		<div class="sticky">
			<div class="sticky-contents">
				<ListFilter
					label="Filter the fact checks"
					options={categories}
					placeholder="Search for a fact check..."
					bind:value={searchStringRaw}
					type="input"
				/>
				<ListFilter
					label="Category"
					options={categories}
					bind:value={selectedCategory}
				/>
				<ListFilter
					label="Country"
					options={countries}
					bind:value={selectedCountry}
				/>
				<ListFilter
					label="Rating"
					options={ratings}
					bind:value={selectedRating}
				/>
				<ListFilter
					label="Source"
					options={sources}
					bind:value={selectedSource}
				/>
				<ListFilter
					label="Fact-checker"
					options={organizations}
					bind:value={selectedOrg}
				/>
			</div>
		</div>

			<div class="section" id="categories">
				<p style="margin-bottom: 3em; margin-top: 3em;">
					We've grouped each of these fact-checks into categories:
				</p>
				<Clusters {data} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} />
			</div>
			<!-- <Quadrant /> -->
			<!-- <Bubbles /> -->

			<div class="section" id="countries">
				<p class="map-title">
					We also looked at what country each fact check originated in.
				</p>
				<MapClusters {data} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} />
			</div>

			<div class="section" id="list">
				<List {data} {isLoading} {isFiltered} {filterIteration} {filterFunction} {filterColor} />
			</div>
	</div>

</main>

<Footer {organizations} />

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
		min-height: 6em;
		margin: 3em 0 2em;
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
	.sticky {
		position: sticky;
		top: 0;
		margin-top: 3em;
		padding: 0.6em 1em;
    background: #f4f5fa;
    box-shadow: 0px 8px 10px -8px rgba(52, 73, 94, .2), 0 1px 1px rgba(52, 73, 94, 0.1);
		z-index: 500;
	}
	.sticky-contents {
		display: flex;
		/* align-items: center; */
		align-items: flex-end;
		max-width: 60em;
		margin: 0 auto;
	}
	.search {
		flex: 1;
		/* padding-right: 0.6em; */
		/* margin-bottom: 0.1em; */
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
	.map-title {
		max-width: 20em;
		margin-bottom: -5vw;
	}
	select {
		position: fixed;
		top: 0;
		right: 0;
		font-size: 0.8em;
		z-index: 1000;
	}

	@media (max-width: 900px) {
		.sticky {
			position: relative;
		}
		.sticky-contents {
			flex-wrap: wrap;
		}
		.map-title {
			margin-bottom: 2em;
		}
	}
</style>