<script>
  import { scaleLinear } from "d3-scale"
  import { extent } from "d3-array"
  import { geoEqualEarth, geoPath, geoCentroid, geoGraticule10 } from "d3-geo"
  import countryShapes from "./countries.json"
  import { sortBy } from "./utils.js"

  export let data
  export let metric
  export let selectedCountry

  let width = 800
  let height = 600

  const projectionName = "geoEqualEarth"
  const sphere = ({type: "Sphere"})
  const projection = geoEqualEarth()
    .fitSize([width * 1.3, height * 1.3], countryShapes)
  const pathGenerator = geoPath(projection)

  const earthPath = pathGenerator(sphere)
  const graticulePath = pathGenerator(geoGraticule10())
  let countryShapesMap = {}


  $: colorScale = scaleLinear()
    .domain([60, 1])
    // .domain(extent(data.map(d => d[metric])).reverse())
    .range(["#dadadd", "#9980fa"])

  $: countries = countryShapes.features.map(shape => {
    const countryData = data.find(d => d["code"] == shape.properties["su_a3"]) || {}
    return {
      shape: pathGenerator(shape),
      centroid: pathGenerator.centroid(shape),
      ...countryData,
      value: countryData[metric],
      isSelected: countryData.name == selectedCountry,
    }
  })

  $: topCountries = countries
    .sort((a,b) => b.value ? a.value - b.value : -1000)
    .slice(0, 3)
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
    {#each countries as country}
      <path
        d={country.shape}
        fill={country.value ? colorScale(country.value)  : "#dadadd"}
        class:active="{ country.isSelected }"
      >
        <title>{ country.name }: { country.value }</title>
      </path>
    {/each}
    {#each topCountries as country, index}
      <g
        transform={`translate(${country.x}, ${country.y})`}
      >
        <circle
          r="16"
          style="fill: #efa22e"
        />
        <circle
          r="12"
        />
        <text>
          { index + 1 }
        </text>
      </g>
    {/each}
  </svg>
</div>

<style>
  .group {
    margin: 2em auto;
  }
  svg {
    overflow: visible;
  }
  path {
    transition: fill 0.3s ease-out;
  }
  g {
    transition: transform 0.3s ease-out;
  }
  circle {
    fill: #fbcb5e;
    /* mix-blend-mode: multiply;
    fill-opacity: 0.5; */
  }
  text {
    fill: #e27111;
    font-weight: 800;
    text-anchor: middle;
    dominant-baseline: middle;
  }
  .active {
  }
</style>