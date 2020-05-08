<script>
	import { onMount } from 'svelte'
	import { csv } from "d3-request"

	// // import Header from "./Header.svelte"
	import Intro from "./Intro.svelte"
	import Clusters from "./Clusters--topics.svelte"
	import MapClusters from "./MapClusters.svelte"
	import Map from "./Map.svelte"
	import List from "./List.svelte"
	import ListTimeline from "./ListTimeline.svelte"
	import ListFilter from "./ListFilter.svelte"
	import Footer from "./Footer.svelte"
  import { debounce, flatten, getUrlParams } from "./utils"
  import { categoryAccessor, categoryColors, categories, dateAccessor, ratings, sources, titleAccessor, countryAccessor, countriesAccessor, organizationAccessor, ratingAccessor, sourceAccessor, getMatchingTags, tags, tagsAccessor, tagColors } from "./data-utils"

	// const dataUrl = "https://pudding.cool/misc/covid-fact-checker/data.json"
	const dataUrl = "https://pudding.cool/misc/covid-fact-checker/data.csv"
	let iteration = 0
	let filterIteration = 0
	let data = []
	let countries = []
	let organizations = []
	let isLoading = true
	let embed = null
	const allSections = [
		"intro",
		"filters",
		"clusters",
		"map",
		"timeline",
		"list",
		"footer",
	]
	// let sections = ["intro"]
	let sections = []
	const sortedTags = [...tags].sort()
	const sortedSources = sources.sort()

	onMount(() => {
		// const res = await fetch(dataUrl)
		const urlParams = getUrlParams()
		sections = urlParams["embed"] ? urlParams["embed"].split(",") : allSections
		if (sections.length < 3) {
			document.body.classList.add("embedded")
		}

		csv(dataUrl)
		.row(d => ({
			...d,
			date: d["When did you see the claim?"],
			countries: (d["Countries"] || "").split(","),
			organization: d["Organization"],
			category: d["Category"],
			rating: d["Final rating"],
			lang: d["Language of your fact-check"],
			url: d["URL to fact-checked article (in your language)"],
			source: d["Who said/posted it?"],
			title: d["What did you fact-check?"],
			tags: d["manual topic override"] ? [d["manual topic override"]] : getMatchingTags(d["What did you fact-check?"]),
		}))
		.get(resJson => {
			data = resJson
				.sort((a,b) => (
					dateAccessor(a) > dateAccessor(b) ? -1 : 1
				)).map((d,i) =>({
					...d,
					id: i,
				}))
			isLoading = false
			countries = [...new Set(flatten(data.map(countriesAccessor)))].sort()
			organizations = [...new Set(data.map(organizationAccessor))].sort()
			iteration++
		})
	})

	let searchString = ""
	let searchStringRaw = ""
  const onUpdateSearchString = e => {
    const newValue = searchStringRaw
    searchString = newValue
		filterIteration++
	}
	const debouncedOnUpdateSearchString = debounce(onUpdateSearchString, 300)
	$: searchStringRaw, debouncedOnUpdateSearchString()

	// let selectedCategory = null
	let selectedTag = null
	let selectedCountry = null
	let selectedRating = null
	let selectedSource = null
	let selectedOrg = null
	$: filterFunction = d => (
		(!selectedTag || (tagsAccessor(d).includes(selectedTag)))
		&& (!selectedCountry || (countryAccessor(d) == selectedCountry))
		&& (!selectedRating || (ratingAccessor(d) == selectedRating))
		&& (!selectedOrg || (organizationAccessor(d) == selectedOrg))
		&& (!selectedSource || (sourceAccessor(d) == selectedSource))
		&& (!searchString || ((titleAccessor(d).toLowerCase().includes(searchString.toLowerCase()))))
	)

	$: isFiltered = searchString || selectedTag || selectedCountry || selectedRating || selectedOrg || selectedSource
	$: filterColor = isFiltered && (
		selectedTag && !(searchString || selectedCountry) ? tagColors[selectedTag] : null
	)
	$: selectedTag, selectedCountry, selectedRating, selectedOrg, selectedSource, filterIteration++
</script>

<!-- <Header /> -->

<main>
	{#if sections.includes("intro")}
		<Intro {data} {isLoading} />
	{/if}

	{#if sections.includes("filters")}
			<div class="sticky">
				<div class="sticky-contents">
					<div class="filters-label">
						Filter the {#if sections.filter(d => d != "filters").length == 1}
							{ sections.filter(d => d != "filters") }
						{:else}
							fact checks
						{/if}
					</div>
					<ListFilter
						label="Filter the fact checks"
						options={categories}
						placeholder="Search for a fact check..."
						bind:value={searchStringRaw}
						type="input"
					/>
					<ListFilter
						label="Topic"
						options={sortedTags}
						bind:value={selectedTag}
					/>
					<!-- <ListFilter
						label="Primary Country"
						options={countries}
						bind:value={selectedCountry}
					/> -->
					<!-- <ListFilter
						label="Rating"
						options={ratings}
						bind:value={selectedRating}
					/> -->
					<!-- <ListFilter
						label="Source"
						options={sortedSources}
						bind:value={selectedSource}
					/> -->
					<ListFilter
						label="Fact-checker"
						options={organizations}
						bind:value={selectedOrg}
					/>
				</div>
			</div>
		{/if}

		{#if sections.includes("map") && sections.includes("clusters")}
				<p style="margin-bottom: 3em; margin-top: 0;">
					We've grouped each of these fact-checks into categories:
				</p>
		{/if}

		{#if sections.includes("clusters")}
			<div class="section" id="categories">
				<Clusters {data} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} isEmbedded={sections.length < allSections.length} />
			</div>
		{/if}

		{#if sections.includes("map") && sections.includes("clusters")}
			<p class="map-title" style="margin: 3em auto -3em">
				We also looked at what country each fact check primarily originated in.
			</p>
		{/if}

		{#if sections.includes("map")}
			<div class="section" id="countries">
				<Map {data} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} {countries} isEmbedded={sections.length < allSections.length} />
			</div>
		{/if}

		{#if sections.includes("timeline")}
			<ListTimeline
				{data}
				{filterFunction}
				iteration={filterIteration + iteration}
				color={filterColor}
				{isFiltered}
			/>
		{/if}

		{#if sections.includes("list")}
			<div class="section" id="list">
				<List {data} {isLoading} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} />
			</div>
		{/if}
</main>

{#if sections.includes("footer")}
	<Footer {organizations} />
{/if}

<style>
	@font-face {
		font-family: "Poynter Gothic";
		src: url('assets/PoynterGothicText-Regular.woff') format('woff');
		font-weight: 500;
	}
	@font-face {
		font-family: "Poynter Gothic";
		src: url('assets/PoynterGothicText-Bold.woff') format('woff');
		font-weight: 700;
	}

	main {
		/* max-width: 70em; */
		width: 100%;
		margin: 0 auto;
		/* padding: 6em 4em; */
		color: #1f2025;
		display: flex;
		flex-direction: column;
		font-family: "Poynter Gothic", Helvetica, Arial, sans-serif;
		/* align-items: center; */
		/* text-align: center; */
		/* background: #f3f8fb; */

		--max-lines: 20;
	}

	.section {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 6em;
	}
	.section + .section {
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
		margin-top: 0.2em;
		padding: 0.3em 1em 0.5em;
    background: #fff;
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
	.filters-label {
    margin: 0 1em 0.5em 0;
	}
	@media (max-width: 800px) {
		.sticky-contents {
			font-size: 0.8em;
		}
		.filters-label {
			width: 100%;
			margin: 1em 0 0 1em;
			margin-bottom: 1em;
		}
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

	:global(.embedded) {
		overflow: hidden;
	}
</style>