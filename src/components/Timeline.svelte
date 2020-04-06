<script>
  import { draw, fade } from "svelte/transition"
  import { scaleLinear, scaleSqrt, scaleTime } from "d3-scale"
  import { extent, range } from "d3-array"
  import { color } from "d3-color"
  import { timeFormat, timeParse } from "d3-time-format"
  import { timeDay } from "d3-time"
  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from "d3-force"
  import { getPositionFromAngle, getUniformBinsDays } from "./utils"
  import { dateAccessor, parseDate, categories, categoryAccessor, categoryColors } from "./data-utils"

  export let data = []

  const width = 1200
  const height = 200
  // const parseDate = timeParse("%Y-%m-%d")
  const formatDate = timeFormat("%-m/%-d/%Y")
  const tickFormat = timeFormat("%b %-d")
  // const tickFormat = d => timeDay.range(d, new Date).length + 1 + " days ago"

  // $: consenses = [...new Set(data.map(d => d["medical_consensus"]))]
  $: consenses = ["Not relevant", "Mixed", "Clear"]
  $: harms = ["Unknown", "Low", "Medium", "High"]

  $: xExtent = extent(data.map(dateAccessor))
  $: xValues = timeDay.range(...xExtent).map(formatDate)
  $: xScale = scaleTime()
    .domain(xExtent)
    .range([0, width])
  let xPositions = {}
  $: consenses.map((c, i) => {
    xPositions[c] = xScale(i)
  })

  $: yScale = scaleLinear()
    .domain([-1, harms.length])
    .range([height, 0])

  let yPositions = {}
  $: harms.map((c, i) => {
    yPositions[c] = yScale(i)
  })

  $: rScale = scaleSqrt()
    .domain(extent(data.map(d => d.num_claims)))
    .range([5, 10])

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
  let topicAngles = {}
  $: topicsCountScale = scaleLinear()
    .domain(extent(topics.map(topic => (
      data.filter(d => d.topic == topic).length
    ))))
    .range([360 / topics.length, 360 / topics.length * 6])

  // const colors = ["#0fb9b1", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#58B19F", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3"]
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

  $: ageScale = scaleTime()
    .domain(xExtent)
    .range(["#FDA7DF", "#778beb"])

  $: bins = xValues.map(date => ({
    data: data
      // .filter(d => d.topic)
      .filter(d => d["date"] == date)
      // .sort((a,b) => b.topic > a.topic ? 1 : -1)
      .sort((a,b) => (
        categories.indexOf(categoryAccessor(b)[0])
        - categories.indexOf(categoryAccessor(a)[0])
      ))
      .map((d, i) => ({
        ...d,
        y: height + i * -5,
        // color: ageScale(dateAccessor(d)),
        color: categoryColors[categoryAccessor(d)[0]] || "#adb2be",
      })),
    date,
    x: xScale(parseDate(date)),
  }))
  $: xTicks = xScale.ticks(3)
    .map(value => ([
      tickFormat(value),
      xScale(value),
    ]))

  // $: claims = data.map(d => {
  //   const x = xPositions[d["medical_consensus"]]
  //   const y = yPositions[d["harm_to_health"]]
  //   if (!d.topic) return

  //   return {
  //     ...d,
  //     r: rScale(d.num_claims),
  //     x, y,
  //     color: topicColors[d.topic],
  //     darkerColor: topicBorderColors[d.topic],
  //   }
  // }).filter(d => d)

  // $: bubbles = (() => {
  //   let bubbles = [...claims]
  //   let simulation = forceSimulation(bubbles)
  //     // .force("x", forceX(d => d.x).strength(1))
  //     .force("x", forceX(d => d.x).strength(0.05))
  //     .force("y", forceY(d => d.y).strength(0.05))
  //     .force("collide", forceCollide(d => d.r + 2.6))
  //     // .force("r", forceRadial(d => d.distance).strength(5))
  //     .stop()

  //   range(0, 200).forEach(i => simulation.tick())

  //   return bubbles
  // })()

  // const distanceLabels = {
  //   "Low": "Not very harmful",
  //   "Medium": "Harmful",
  //   "High": "Very harmful",
  // }
</script>

<svg {width} {height}>
  {#each bins as { data, x, date }}
    {#each data as { title, y, color, darkerColor, topic }}
      <line
        x1={x - 2.5}
        x2={x + 2.5}
        y1={y}
        y2={y}
        stroke={color}
        stroke-width="4"
        stroke-linecap="round"
      >
        <title>
          { topic }, { date }: { title }
        </title>
      </line>
      <!-- <circle
        cx={x}
        cy={y}
        r="5"
        fill={color}
      >
        <title>
          { topic }, { date }: { title }
        </title>
      </circle> -->
    {/each}
  {/each}

  <!-- <text transform={`translate(${ width / 2 }, 20)`} style={"font-weight: 700"}>
    Medical Consensus
  </text>
  {#each consenses as c}
    <text transform={`translate(${xPositions[c]}, ${60})`}>
      { c }
    </text>
  {/each}

  <text transform={`translate(${ 0 }, ${height / 2}) rotate(-90)`} style={"font-weight: 700"}>
    Medical Consensus
  </text>
  {#each harms as c}
    <text transform={`translate(${60}, ${yPositions[c]})`}>
      { c }
    </text>
  {/each} -->
  {#each xTicks as [label, offset]}
    <text transform={`translate(${offset}, ${height + 21})`}>
      { label }
    </text>
  {/each}
</svg>

<style>
  svg {
    max-width: 100%;
    margin: 1em 0 10em;
    overflow: visible;
  }
  .boundary {
    fill: none;
    stroke: #adb2be;
    stroke-width: 0.5;
    stroke-dasharray: 9 5;
  }
  text {
    fill: #555b6b;
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