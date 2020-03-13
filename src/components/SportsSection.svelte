<script>
	import { onMount } from 'svelte'
  import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
	import { expoIn } from 'svelte/easing';
	import Scroller from "./Scroller.svelte"
	import { max, mean, range } from 'd3-array'
	import { scaleLinear } from 'd3-scale'
	import { format } from 'd3-format'

	import { sum } from './utils.js'
	import Number from "./Number.svelte"
	import rawSportsInterestData from "./../data/sportsInterestData.json"
  import rawSportsMedalData from "./../data/sportsMedalData.json"

	export let selectedCountry

  let sportsInterestData = []
  let sportsMedalData = []
  let sports = []
  let offset = 0

	onMount(async () => {
		// const res = await fetch(dataUrl)
		sportsInterestData = rawSportsInterestData
    sportsMedalData = rawSportsMedalData
    sports = Object.keys(sportsInterestData)
	})

	let selectedCountryScores = {}
	$: Object.keys(sportsInterestData).map(sport => {
		const countries = sportsInterestData[sport]
		selectedCountryScores[sport] = countries[selectedCountry]
	})

	$: totalSportsMedals = {}
	$: sports.map(sport => {
		totalSportsMedals[sport] = sum(Object.values(sportsMedalData[sport]))
	})

	$: scoreScales = {}
	$: sports.map(sport => {
		scoreScales[sport] = scaleLinear()
			.domain([0, sum(Object.values(sportsInterestData[sport]))])
			.range([0, totalSportsMedals[sport]])
	})

	$: sportsData = sports.map(sport => {
		const total = totalSportsMedals[sport]
		const interest = selectedCountryScores[sport]
		const scale = scaleLinear()
			.domain([0, total])
			.range([0, 1])
		const score = selectedCountryScores[sport]

		const actual = (sportsMedalData[sport] || {})[selectedCountry] || 0
		const expected = Math.round(
			scoreScales[sport](interest) || 0
		)

		return {
			sport,
			actual,
			expected,
			total,
			status: actual == expected ? "even" :
				actual > expected ? "over" : "under",
		}
	})

	const popScale = scaleLinear()
		.domain([0, 0.5, 1])
		.range([0, 1.3, 1])

	const pop = (node, { delay, duration=1000 }) => ({
		delay,
		duration,
		css: t => (
			`transform: scale(${
				popScale(expoIn(t))
			})`
		)
	})

	$: isHidden = offset < 0

	const statusColors = {
		over: "rgb(196, 182, 252)",
		even: "#34495e",
		under: "#efa22e",
	}
	const statusLabels = {
		over: "over-performing",
		even: "even",
		under: "under-performing",
	}
	const comparisonLabels = {
		over: "more than",
		even: "exactly what would be",
		under: "fewer than",
	}
</script>

<div class="group">
	<Scroller bind:offset>
		<div slot="foreground">
			<section class="sports">
				{#each sportsData as { sport, actual, expected, total, status }, sportI}
					<div class="sport">
						<div class="label">{ sport }</div>
						<!-- { format(",.3f")(selectedCountryScores.find(d => d.sport == sport).score) } -->
						{ selectedCountry } has won <span style="display: contents; font-weight: 600"><Number number={ actual } /> of <Number number={ total } /> medals</span>,
						<br />
						which is <span style={`font-weight: 600; color: ${statusColors[status]}; display: contents`}>{#if expected != actual}<Number number={ Math.abs(expected - actual) } /> {/if}{ comparisonLabels[status] } expected</span>.
						<div class="medals-container">
							<div class="medals">
								{#each range(total) as i}
									<svg
										viewBox="-1 -1 2 2"
										class="medal"
										class:active={i < actual}
										class:expected={i < expected}
									>
										{#if i < actual && !isHidden}
											<circle
												vector-effect="non-scaling-stroke"
												r="0.8"
												class="fill"
												in:pop="{{ delay: 20 * i }}"
												out:pop="{{ delay: total - (20 * i) }}"
												title={i}
											/>
										{/if}
										<circle
											vector-effect="non-scaling-stroke"
											r="0.8"
											class="outline"
										/>
									</svg>
								{/each}
							</div>
						</div>
						<!-- <div class="circle-outline" style={`transform: scale(${
							sportsMedalsScales[i]((sportsMedalData[sport] || {})[selectedCountry])
						})`}></div> -->
					</div>
				{/each}
			</section>
		</div>
	</Scroller>
</div>

<style>
	@media (min-width: 1300px) {
		.group {
			width: calc(100% + 10em);
			margin: 0 -5em;
		}
	}
	.sports {
		display: flex;
		flex-wrap: wrap;
		/* align-items: center; */
		justify-content: center;
	}
	.sport {
		position: relative;
		padding: 2.6em 1.6em;
		flex: 0 0 15em;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		max-width: 20em;
		background: white;
		z-index: 1;
	}
	.sport:hover {
		z-index: 100;
	}
	.sport:hover .medals {
		box-shadow: 0 13px 11px -3px #cccccc33, 0 2px 2px #cccccc66;
	}
	.sport:hover .medals-container {
		overflow: visible;
	}
	.sport:hover .medals-container:after {
		opacity: 0;
	}
	.label {
		font-weight: 700;
		font-size: 1.3em;
		line-height: 1.3em;
		margin-bottom: 0.6em;
	}
	.medals-container {
		position: relative;
		max-height: 5.2em;
		overflow: hidden;
		z-index: 100;
	}
	.medals-container:after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2em;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			white 100%
		);
	}
	.medals {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		margin-top: 1em;
		background: white;
		padding-bottom: 1em;
		padding-left: 1em;
		margin-left: -1em;
		margin-right: -1em;
		padding-right: 1em;
	}
	@keyframes popIn {
		  0% { transform: scale(0); }
		 80% { transform: scale(1.3); }
		100% { transform: scale(1); }
	}
	.medal {
		flex: 0 0 0.9em;
		height: 0.9em;
		width: 0.9em;
		/* transition: all 0.3s ease-out; */
		overflow: visible;
	}
	.outline {
		fill: none;
		stroke: #bdbdd1;
		stroke-width: 0.5;
    /* stroke-dasharray: 2 1.7; */
	}
	.fill {
		fill: rgb(196, 182, 252);
		/* transform: scale(0);
		animation-fill-mode: forwards; */
	}
	.medal.active .fill {
		/* animation-name: popIn;
		animation-duration: 0.5s;
		animation-timing-function: ease-out; */
		/* border-style: solid; */
		transform: scale(1);
	}
	.medal.expected .outline {
    stroke: #e49724;
		stroke-width: 1.2;
		stroke-dasharray: 0;
	}
	.medal.active.expected .fill {
		fill: #f7a935;
	}
	.medal.active:not(.expected) .outline {
		stroke: rgb(175, 161, 231);
	}
</style>