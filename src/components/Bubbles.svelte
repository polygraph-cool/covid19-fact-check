<script>
  import { draw, fade } from "svelte/transition"
  import { scaleOrdinal, scaleLinear, scaleSqrt } from "d3-scale"
  import { extent, range } from "d3-array"
  import { color } from "d3-color"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { getPositionFromAngle } from "./utils"
  import { dateAccessor, parseDate, sources, sourceAccessor, sourceColors } from "./data-utils"

  export let data = []

  const width = 700
  const height = 700

  $: rScale = scaleSqrt()
    .domain(extent(data.map(d => 3)))
    .range([5, 10])
  let distances = {}
  $: ["High", "Medium", "Low"].map((category, i) => {
    distances[category] = width / 2 / 4 * (i + 1)
  })

  $: topics = [...new Set(data.map(d => d.topic))]
  const topicLabels = {
    "Fringe origin theories": "Fringe origin theories",
    "Other": "Other",
    "Cures [inc. prevention]": "Cures",
    "Geography [inc. spread and travel]": "Geography",
    "Symptoms [inc. diagnosis]": "Symptoms",
    "Mortality [inc. gravity]": "Mortality",
    "Causes [inc. vectors and risk factors]": "Causes",
  }
  let typeAngles = {}
  $: topicsCountScale = scaleLinear()
    .domain(extent(topics.map(topic => (
      data.filter(d => d.topic == topic).length
    ))))
    .range([360 / topics.length, 360 / topics.length * 6])
  $: angleCounter = 0
  $: sources.forEach((type, i) => {
    const topicCount = data.filter(d => d.type == type).length
    // angleCounter += topicsCountScale(topicCount)
    angleCounter += (360 / sources.length)
    typeAngles[type] = angleCounter
  })

  const colors = ["#0fb9b1", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#58B19F", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3"]
  const darkerColors = colors.map(c => (
    color(c)
      .darker(0.6)
      .formatHex()
  ))
  let typeColors = {}
  let typeBorderColors = {}
  $: sources.forEach((type, i) => {
    typeColors[type] = colors[i % colors.length]
   typeBorderColors[type] = darkerColors[i % colors.length]
  })

  $: claims = data.map(d => {
    const mainSource = sourceAccessor(d)[0]
    const angle = typeAngles[mainSource]
    const distance = 230
    // const distance = distances[d.harm_to_health] - 360 / 8
    if (!distance) {
        return
    }

    const [x, y] = getPositionFromAngle(angle, distance)

    return {
      ...d,
      r: 3,
      x, y,
      angle, distance,
      color: typeColors[mainSource] || "lightgrey",
      darkerColor: typeBorderColors[mainSource],
    }
  }).filter(d => d)

  $: bubbles = (() => {
    let bubbles = [...claims]
    let simulation = forceSimulation(bubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.05))
      .force("y", forceY(d => d.y).strength(0.05))
      .force("collide", forceCollide(d => d.r + 2.6))
      .force("r", forceRadial(d => d.distance).strength(1))
      .stop()

    range(0, 200).forEach(i => simulation.tick())
    return bubbles
  })()

  const distanceLabels = {
    "Low": "Not very harmful",
    "Medium": "Harmful",
    "High": "Very harmful",
  }
</script>

<svg {width} {height}>
  <g transform={`translate(${width / 2}, ${height / 2})`}>
    {#each claims as { title, x, y, r, color, darkerColor }}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={color}
        stroke={darkerColor}
      >
        <title>
          { title }
        </title>
      </circle>
    {/each}
    {#each Object.keys(distances) as distance, i}
      <circle
        class="boundary"
        r={distances[distance]}
      />
      <path
        class="hidden"
        d={[
          ["M", 0, -(distances[distance] - 16)].join(" "),
          ["A", (distances[distance] - 16), (distances[distance] - 16), 0, 0, 1, 0, (distances[distance] - 16)].join(" "),
          ["A", (distances[distance] - 16), (distances[distance] - 16), 0, 0, 1, 0, -(distances[distance] - 16)].join(" "),
        ].join(" ")}
        id={`path-${i}`}
        transform={`rotate(-70)`}
      />
      <text transition:fade={{ duration: 1000 + 300 * i }}>
        <textPath
          href={`#path-${i}`}
          class="boundary-label"
          startOffset="20%"
          >
          { distanceLabels[distance] }
        </textPath>
      </text>
    {/each}
      <path
        class="hidden"
        d={[
          ["M", 0, -(width * 0.396)].join(" "),
          ["A", (width * 0.396), (width * 0.396), 0, 0, 1, 0, (width * 0.396)].join(" "),
          ["A", (width * 0.396), (width * 0.396), 0, 0, 1, 0, -(width * 0.396)].join(" "),
        ].join(" ")}
        id={`topic-label-path`}
        transform={`rotate(90)`}
      />
    {#each sources as type, i}
      <text transition:fade={{ duration: 1000 + 300 * i }}>
        <textPath
          href={`#type-label-path`}
          class="type-label"
          startOffset={`${(typeAngles[type] * 100) / 360}%`}
          style={`fill: ${typeColors[type]}`}
          >
          { topicLabels[type] || type }
        </textPath>
      </text>
    {/each}
  </g>
</svg>

<style>
  .boundary {
    fill: none;
    stroke: rgb(173, 178, 190);
    stroke-width: 0.5;
    stroke-dasharray: 9 5;
  }
  .boundary-label {
    fill: rgb(173, 178, 190);
    text-anchor: middle;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.7em;
    font-weight: 100;
  }
  .type-label {
    text-anchor: middle;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.8em;
    font-weight: 700;
  }
  .hidden {
    fill: none;
  }
</style>