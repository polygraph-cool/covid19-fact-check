<script>
  import { draw, fade } from "svelte/transition"
  import { scaleOrdinal, scaleLinear, scaleSqrt } from "d3-scale"
  import { extent, range } from "d3-array"
  import { color } from "d3-color"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { timeParse } from "d3-time-format"
  import { timeDay } from "d3-time"
  import { getPositionFromAngle } from "./utils"

  export let data
  console.log(data.length, data[0])
  const parseDate = timeParse("%Y-%m-%d")

  const width = 900
  const height = 700

  $: topics = [...new Set(data.map(d => d.category))].filter(d => d)

  $: xScale = scaleLinear()
    .domain([-1, topics.length])
    .range([0, width])
  $: ageScale = scaleLinear()
    .domain([1, 60])
    .range([0.3, 1])
  let positions = {}
  $: topics.map((c, i) => {
    // const x = xScale(i)
    const [x, y] = [[
      100, 200
    ],[
      210, 100
    ],[
      230, 300
    ],[
      400, 50
    ],[
      450, 300
    ],[
      640, 100
    ],[
      700, 300
    ]][i]
    positions[c] = [x, y]
  })

  $: rScale = scaleSqrt()
    .domain(extent(data.map(d => d.claims.length)))
    .range([10, 20])

  $: topicsCountScale = scaleLinear()
    .domain(extent(topics.map(topic => (
      data.filter(d => d.category == topic).length
    ))))
    .range([360 / topics.length, 360 / topics.length * 6])

  const colors = ["#58B19F", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3", "#0fb9b1"]
  const darkerColors = colors.map(c => (
    color(c)
      .darker(0.6)
      .formatHex()
  ))
  let topicColors = {}
  let topicBorderColors = {}
  $: topics.forEach((topic, i) => {
    topicColors[topic] = colors[i % colors.length]
    topicBorderColors[topic] = darkerColors[i % colors.length]
  })

  $: claims = data.map(d => {
    if (!d["category"]) return
    const [x, y] = positions[d["category"]]
    if (!d.category) return
    // const daysAgo = timeDay.range(parseDate(d["best_date"]), new Date()).length
    // console.log(daysAgo, parseDate(d["best_date"]))
    const parsedColor = color(topicColors[d.category])
      // .darker(ageScale(daysAgo))
      .formatHex()

    return {
      ...d,
      r: rScale(d.claims.length),
      x, y,
      color: parsedColor,
      // opacity: ageScale(daysAgo),
      opacity: 1,
      darkerColor: topicBorderColors[d.category],
    }
  }).filter(d => d)

  $: bubbles = (() => {
    let bubbles = [...claims]
    let simulation = forceSimulation(bubbles)
      // .force("x", forceX(d => d.x).strength(1))
      .force("x", forceX(d => d.x).strength(0.2))
      .force("y", forceY(d => d.y).strength(0.2))
      .force("collide", forceCollide(d => d.r + 2.6))
      // .force("r", forceRadial(d => d.distance).strength(5))
      .stop()

    range(0, 200).forEach(i => simulation.tick())

    return bubbles
  })()
</script>

<svg {width} {height}>
  {#each claims as { title, x, y, r, color, darkerColor, opacity, category }}
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={color}
      stroke={darkerColor}
      {opacity}
    >
      <title>
        { title }, { category }
      </title>
    </circle>
  {/each}

  <!-- <text transform={`translate(${ width / 2 }, 20)`} style={"font-weight: 600"}>
    Medical Consensus
  </text>
    <text transform={`translate(${xPositions[c]}, ${60})`}>
      { c }
    </text>
  {/each} -->

  <!-- <text transform={`translate(${ 0 }, ${height / 2}) rotate(-90)`} style={"font-weight: 600"}>
    Medical Consensus
  </text>
    <text transform={`translate(${60}, ${yPositions[c]})`}>
      { c }
    </text>
  {/each} -->
</svg>

<style>
  svg {
    margin-top: 10em;
    margin-left: 3em;
    overflow: visible;
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
</style>