<script>
  import { draw, fade } from "svelte/transition"
  import { scaleOrdinal, scaleLinear, scaleSqrt, scaleTime } from "d3-scale"
  import { extent, range } from "d3-array"
  import { color } from "d3-color"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { timeFormat, timeParse } from "d3-time-format"
  import { geoArmadillo } from "d3-geo-projection"
  import { timeDay } from "d3-time"
  import { geoEqualEarth, geoOrthographic, geoPath, geoCentroid, geoGraticule10 } from "d3-geo"
  import countryShapes from "./countries.json"
  import { debounce, getPositionFromAngle } from "./utils"
  import { data, dateAccessor, parseDate, sources, sourceColors, sourceAccessor } from "./data-utils"
  import ItemTooltip from "./ItemTooltip.svelte"

  // export let data
  // const parseDate = timeParse("%Y-%m-%d")
  const formatDate = timeFormat("%A %B %-d, %Y")
  const countryAccessor = d => {
    const country = (d["country"] || "").split(",")[0]
    return countryNameMap[country] || country
  }
  let hoveredClaim = null

  const windowGlobal = typeof window !== "undefined" && window
  const width = (windowGlobal.innerWidth || 1200) * 0.9
  const height = width * 0.65
  const countryNameMap = {
    USA: "United States of America",
    "United States": "United States of America",
    UK: "United Kingdom",
    BiH: "Bosnia and Herzegovina",
    "South africa": "South Africa",
    Spasin: "Spain",
    Mayanmar: "Myanmar",
    "India/Srilanka": "Sri Lanka",
    Kaxakhstan: "Kazakhstan",
    Korea: "South Korea",
    // "Hong Kong":
  }

  const sphere = ({type: "Sphere"})
  // const projection = geoEqualEarth()
  const projection = geoArmadillo()
    .fitSize([width, height], sphere)
  // const projection = geoOrthographic()

  $: pathGenerator = geoPath(projection)
  $: earthPath = pathGenerator(sphere)
  $: graticulePath = pathGenerator(geoGraticule10())

  const countryCentroids = {}
  $: countries = countryShapes.features.map(shape => {
    const countryData = data.find(d => (
      countryAccessor(data) == shape.properties["geounit"]
      // data["primary_country"] == shape.properties["iso_a2"]
      // data["primary_country"] == shape.properties["wb_a3"]
    )) || {}
    countryCentroids[shape.properties["geounit"]] = pathGenerator.centroid(shape)

    return {
      name: shape.properties["geounit"],
      shape: pathGenerator(shape),
      centroid: pathGenerator.centroid(shape),
      ...countryData,
      // value: countryData[metric],
      // isSelected: countryData.name == selectedCountry,
      // size: sizeScale(countryData[metric]),
    }
  }).filter(d => d.centroid[0])

  // $: topics = [...new Set(data.map(d => d.category))].filter(d => d)

  $: ageScale = scaleTime()
    .domain(extent(data.map(dateAccessor)))
    .range(["#fff", "#778beb"])

  // $: rScale = scaleSqrt()
  //     .domain(extent(data.map(d => d.claims.length)))
  //     .range([2, 20])

  // $: topicsCountScale = scaleLinear()
  //   .domain(extent(topics.map(topic => (
  //     data.filter(d => d.category == topic).length
  //   ))))
  //   .range([360 / topics.length, 360 / topics.length * 6])

  // const colors = ["#58B19F", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3", "#0fb9b1"]
  // const darkerColors = colors.map(c => (
  //   color(c)
  //     .darker(0.6)
  //     .formatHex()
  // ))
  // let topicColors = {}
  // let topicBorderColors = {}
  // $: topics.forEach((topic, i) => {
  //   topicColors[topic] = colors[i % colors.length]
  //   topicBorderColors[topic] = darkerColors[i % colors.length]
  // })

  let sourceOffsets = {}
  $: sources.forEach((source, i) => {
    const angle = 360 / sources.length * i
    sourceOffsets[source] = getPositionFromAngle(angle, 10)
  })

  $: claims = data.map(d => {
    const country = countryAccessor(d)
    if (!country) return
    const [x, y] = countryCentroids[country] || []
    if (!x && !y) {

      return
    }
    // if (!topicColors[d.category]) return
    // const daysAgo = timeDay.range(parseDate(d["best_date"]), new Date()).length
    // const parsedColor = color(topicColors[d.category])
      // // .darker(ageScale(daysAgo))
      // .formatHex()
    // const parsedColor = ageScale(dateAccessor(d))
    const mainSource = sourceAccessor(d)[0]
    const sourceOffset = sourceOffsets[mainSource] || [0, 0]

    const parsedColor = sourceColors[mainSource] || "#adb2be"

    return {
      ...d,
      r: 2.6,
      x: x + sourceOffset[0],
      y: y + sourceOffset[1],
      color: parsedColor,
      // opacity: ageScale(daysAgo),
      opacity: 1,
      // darkerColor: topicBorderColors[d.category],
    }
  }).filter(d => d)

  $: bubbles = (() => {
    let bubbles = [...claims]
    let simulation = forceSimulation(bubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.2))
      .force("y", forceY(d => d.y).strength(0.2))
      .force("collide", forceCollide(d => d.r + 0.9).strength(1))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .stop()

    range(0, 300).forEach(i => simulation.tick())

    return bubbles
  })()
  const onMouseOver = point => {
    hoveredClaim = point
  }
  const debouncedOnMouseOver = debounce(onMouseOver, 50)
</script>

<div class="c">
  <svg {width} {height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <!-- <radialGradient id="globe_highlight" cx="75%" cy="25%">
          <stop offset="5%" stop-color="#fff" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#e1e0f1" stop-opacity="0.1" />
        </radialGradient>
        <radialGradient id="globe_shading" cx="55%" cy="45%">
          <stop offset="30%" stop-color="#fff" stop-opacity="0" />
          <stop offset="100%" stop-color="#656876" stop-opacity="0.1" />
        </radialGradient> -->

        <clipPath id="earthPath">
          <path d={earthPath} />
        </clipPath>
      </defs>

      <path
        d={earthPath}
        class="earth"
        on:mouseleave={() => onMouseOver(null)}
      />

      <g clip-path="url(#earthPath)">
        <path
          d={graticulePath}
          class="graticules"
        />

        {#each countries as country}
          <path
            d={country.shape}
            class="country-path"
          >
            <title>{ country.name }</title>
          </path>
        {/each}

        {#if hoveredClaim}
          <circle
            class="hover-circle"
            r="6"
            cx={hoveredClaim.x}
            cy={hoveredClaim.y}
          />
        {/if}

        {#each bubbles as item}
          <circle
            cx={item.x}
            cy={item.y}
            r={item.r}
            fill={item.color}
            stroke={item.darkerColor}
            opacity={item.opacity}
            on:mouseenter={() => onMouseOver(item)}
          >
            <title>
              { formatDate(parseDate(item.date)) }: { item.title }
            </title>
          </circle>
        {/each}
      </g>

      <!-- <circle
        cx={width / 2}
        cy={height / 2}
        r={height / 2}
        fill="url(#globe_highlight)"
        style="mix-blend-mode: multiply"
      />
      <circle
        cx={width / 2}
        cy={height / 2}
        r={height / 2}
        fill="url(#globe_shading)"
        style="mix-blend-mode: multiply"
      /> -->


    <!-- <text transform={`translate(${ width / 2 }, 20)`} style={"font-weight: 700"}>
      Medical Consensus
    </text>
      <text transform={`translate(${xPositions[c]}, ${60})`}>
        { c }
      </text>
    {/each} -->

    <!-- <text transform={`translate(${ 0 }, ${height / 2}) rotate(-90)`} style={"font-weight: 700"}>
      Medical Consensus
    </text>
      <text transform={`translate(${60}, ${yPositions[c]})`}>
        { c }
      </text>
    {/each} -->
  </svg>

  {#if hoveredClaim}
    <ItemTooltip item={hoveredClaim} {...hoveredClaim} />
  {/if}
</div>

<style>
  .c {
    position: relative;
  }
  svg {
    max-width: 100%;
    margin: 0 0 1em 0;
    overflow: visible;
  }
  .earth {
    fill: #fff;
    stroke: #b4b7c9;
    stroke-width: 2;
  }
  .graticules {
    fill: none;
    stroke: #eaedff;
    stroke-width: 1;
  }
  .country-path {
    fill: #f8f8fb;
    stroke: #c9cde2;
    stroke-width: 1;
  }
  .boundary {
    fill: none;
    stroke: rgb(173, 178, 190);
    stroke-width: 0.5;
    stroke-dasharray: 9 5;
  }
  text {
    fill: rgb(85, 91, 107);
    text-anchor: middle;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.7em;
    font-weight: 100;
  }
  .topic-label {
    text-anchor: middle;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.8em;
    font-weight: 700;
  }
  .hidden {
    fill: none;
  }
  .hover-circle {
    fill: white;
    stroke: black;
    stroke-width: 1;
  }
</style>