<script>
  import { draw, fade } from "svelte/transition"
  import { scaleLinear, scaleSqrt } from "d3-scale"
  import { extent } from "d3-array"
  import { geoEqualEarth, geoOrthographic, geoPath, geoCentroid, geoGraticule10 } from "d3-geo"
  import { interpolateHcl } from "d3-interpolate"
  import countryShapes from "./countries.json"
  import { sortBy } from "./utils.js"

  export let data
  export let metric
  export let selectedCountry

  let width = 660
  let height = 660

  const projectionName = "geoEqualEarth"
  const sphere = ({type: "Sphere"})
  // const projection = geoEqualEarth()
  const projection = geoOrthographic()
    .fitSize([width, height], sphere)
  $: pathGenerator = geoPath(projection)

  $: selectedCountryId = data.find(d => d.name == selectedCountry).id3
  $: currentCountryShape = countryShapes.features.find(shape => (
    shape.properties["adm0_a3"] == selectedCountryId
  ))

  // $: currentCountryCenter = pathGenerator.centroid(currentCountryShape)
  // $: if (currentCountryShape) projection.center(currentCountryCenter)
  // $: pathGenerator = geoPath(projection)

  $: earthPath = pathGenerator(sphere)
  $: graticulePath = pathGenerator(geoGraticule10())

  $: sizeScale = scaleSqrt()
    // .domain([60, 1])
    .domain(extent(data.map(d => d[metric])).reverse())
    .range([6, 30])
    .clamp(true)

  $: colorScale = scaleLinear()
    // .domain([60, 1])
    .domain(extent(data.map(d => d[metric])).reverse())
    .range(["#f3f8fb", "#9980fa"])
    .interpolate(interpolateHcl)

  $: countries = countryShapes.features.map(shape => {
    const countryData = data.find(d => (
      d["id3"] == shape.properties["adm0_a3"]
    )) || {}
    // if (!countryData.name) console.log(shape.properties)
    return {
      shape: pathGenerator(shape),
      centroid: pathGenerator.centroid(shape),
      ...countryData,
      value: countryData[metric],
      isSelected: countryData.name == selectedCountry,
      size: sizeScale(countryData[metric]),
    }
  }).filter(d => d.centroid[0])

  $: countriesWithMedals = countries.filter(d => Number.isFinite(d.value))

  $: topCountries = [
      ...countries
        .sort((a,b) => b.value ? a.value - b.value : -1000)
        .slice(0, 3),
      ...countries.filter(d => d.name == selectedCountry),
    ]
    .map(country => {
      const [x, y] = country.centroid
      return {
        ...country,
        x, y,
      }
    })

</script>

<div class="group">
  <svg width={width} height={height}>
    <path
      d={pathGenerator(sphere)}
      class="earth"
    />

    {#each countries as country}
      <path
        d={country.shape}
        class="country-path"
      >
        <title>{ country.name }: { country.value }</title>
      </path>
    {/each}

    {#each countriesWithMedals as country, index (country.properties ? country.properties["su_a3"] : index)}
      <circle
        r={country.size}
        class="country"
        fill={country.value ? colorScale(country.value)  : "#dadadd"}
        class:active="{ country.isSelected }"
        cx={country.centroid[0]}
        cy={country.centroid[1]}
      >
        <title>{ country.name }: { country.value }</title>
      </circle>
    {/each}

    {#each topCountries as country, index}
      <g
        class="medal"
        class:gold={country.name == selectedCountry}
        transform={`translate(${country.x}, ${country.y})`}
        style={`transform-origin: ${country.centroid[0]}px ${country.centroid[1]}px`}
      >
        <circle
          class="medal-outline"
          r="16"
        />
        <path
          class="hidden"
          id={`path-${country.code}`}
          d={[
            ["M", 0, -23].join(" "),
            ["A", 23, 23, 0, 0, 1, 0, 23].join(" "),
            ["A", 23, 23, 0, 0, 1, 0, -23].join(" "),
          ].join(" ")}
        />
        <circle
          r="12"
        />
        <text>
          { country[metric] }
        </text>
        <g style={`transform: rotate(-110deg)`}>
          <text transition:fade={{ duration: 1000 + 300 * index }}>
            <textPath
              href={`#path-${country.code}`}
              class="country-name"
              startOffset="40%"
              style="stroke: white; stroke-width: 2">
              { country["name"] }
            </textPath>
          </text>
        </g>
        <g style={`transform: rotate(-110deg)`}>
          <text transition:fade={{ duration: 1000 + 300 * index }}>
            <textPath
              href={`#path-${country.code}`}
              class="country-name"
              startOffset="40%">
              { country["name"] }
            </textPath>
          </text>
        </g>
      </g>
    {/each}
  </svg>
</div>

<style>
  .group {
    /* padding-top: 2em; */
    margin: 2em auto;
  }
  svg {
    /* margin-left: 5em; */
    overflow: visible;
  }
  circle, g {
    transition: all 1s ease-out;
  }
  .earth {
    fill: #e9eef7;
  }
  .country-path {
    fill: #fff;
    stroke: #d7dfe4;
    stroke-width: 1;
  }
  .country {
    mix-blend-mode: multiply;
    fill-opacity: 0.3;
  }
  .medal {
    fill: #fff;
  }
  .medal .medal-outline {
    fill: #e1eef6;
  }
  .medal text {
    fill: #576269;
  }
  .gold {
    fill: #fbcb5e;
    /* mix-blend-mode: multiply;
    fill-opacity: 0.5; */
  }
  .gold .medal-outline {
    fill: #efa22e;
  }
  .gold text {
    fill: #e27111;
  }
  text {
    font-weight: 800;
    text-anchor: middle;
    dominant-baseline: middle;
  }
  .country-name {
    fill: #34495e;
    font-size: 0.6em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }
  .active {
    fill: rgb(221, 112, 139);
    fill-opacity: 1;
    background-blend-mode: normal;
  }
  .hidden {
    fill: none;
    pointer-events: none;
  }
</style>