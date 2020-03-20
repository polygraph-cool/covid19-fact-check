import { max, median } from "d3-array"
import { timeDay } from "d3-time"

export const getOrdinal = d => {
  const t = d % 10;
  return Math.floor((d % 100 / 10)) === 1 ? "th" :
    t === 1 ? "st" :
    t === 2 ? "nd" :
    t === 3 ? "rd" :
    "th"
}

export const sortBy = (key, isReverse=false, secondaryKey) => (a,b) => (
  (
    a[key] > b[key] ? -1 :
    a[key] < b[key] ?  1 :
    a[secondaryKey] > b[secondaryKey] ? -1 :
    a[secondaryKey] < b[secondaryKey] ?  1 :
    0
  ) * (isReverse ? -1 : 1)
)

export const sum = arr => (
  !arr.length ? 0 :
    arr.reduce((a, b) => a + b)
)

export const flatten = arr => (
  arr.reduce((a,b) => [...a, ...b])
)

// grabbed from https://stackoverflow.com/questions/17722497/scroll-smoothly-to-specific-element-on-page
export const smoothScrollTo = (elementY, duration, element=window) => {
  var startingY = element.scrollTop;
  var diff = elementY - startingY;
  var start;

  // Bootstrap our animation - it will get called right before next frame shall be rendered.
  requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp;
    // Elapsed milliseconds since start of scrolling.
    var time = timestamp - start;
    // Get percent of completion in range [0, 1].
    var percent = Math.min(time / duration, 1);

    element.scrollTo(0, startingY + diff * percent);

    // Proceed with animation as long as we wanted it to.
    if (time < duration) {
      requestAnimationFrame(step);
    }
  })
}

export const degreesToRadians = deg => deg * Math.PI / 180
export const radiansToDegrees = rad => rad * 180 / Math.PI
export const getPositionFromAngle = (angle, distance) => [
  Math.cos(degreesToRadians(angle)) * distance,
  Math.sin(degreesToRadians(angle)) * distance,
]
export const getAngleFromArcLength = (radius=1, arcLength=10) => (
  radiansToDegrees(arcLength / radius)
)

export const parseData = (data=[]) => {
  const filteredData = data.filter(d => d.medals > 0)

  const getRankByCountry = (key, array) => {
    let map = {}
    let counter = 0
    let lastValue = null
    array.forEach(d => {
      if (lastValue !== d[key]) {
        counter++
        lastValue = d[key]
      }
      map[d.name] = counter
    })
    return map
  }

  const countriesSortedByMedals = filteredData
    .sort(sortBy("medals"))
  const medalsCount = sum(filteredData.map(d => d.medals))

  const countriesRanks = getRankByCountry("medals", countriesSortedByMedals)
  const maxGdp = max(filteredData.map(d => d.gdp))
  const countriesWeightedByGdp = filteredData
    .map(d => ({
      ...d,
      gdpScore: d.medals ? d.medals / (d.gdp / maxGdp) : 0,
    }))
    .sort(sortBy("gdpScore"))
  const countriesWeightedByGdpRanks = getRankByCountry("gdpScore", countriesWeightedByGdp)
  const totalGdpScore = sum(countriesWeightedByGdp.map(d => d.gdpScore))
  const medalsPerGdp = medalsCount / totalGdpScore

  const maxPopulation = max(filteredData.map(d => d.population))
  const countriesWeightedByPopulation = countriesWeightedByGdp
    .map(d => ({
      ...d,
      populationScore: d.medals ? d.medals / (d.population / maxPopulation) : 0,
    }))
    .sort(sortBy("populationScore"))
  const countriesWeightedByPopulationRanks = getRankByCountry("populationScore", countriesWeightedByPopulation)
  const totalPopulationScore = sum(countriesWeightedByPopulation.map(d => d.populationScore))
  const medalsPerPopulation = medalsCount / totalPopulationScore

  const parsedData = countriesWeightedByPopulation.map(country => ({
    ...country,
    rank: countriesRanks[country.name],
    gdpRank: countriesWeightedByGdpRanks[country.name],
    gdpMedals: Math.round(country.gdpScore * medalsPerGdp),
    populationRank: countriesWeightedByPopulationRanks[country.name],
    populationMedals: Math.round(country.populationScore * medalsPerPopulation),
  }))

  return parsedData
}


export const getUniformBins = (arr, accessor, values, step) => (
  [...values, values.slice(-1)[0] + step].map(value => {
    const start = value
    const stop = value + step
    let bin = arr.filter(d => (
      accessor(d) >= start
      && accessor(d) < stop
    ))
    bin.x0 = start
    bin.x1 = stop
    return bin
  })
)

export const getUniformBinsDays = (arr, accessor, values) => (
  values.map(value => {
    const start = value
    const stop = timeDay.offset(1)(value)
    let bin = arr.filter(d => (
      accessor(d) >= start
      && accessor(d) < stop
    ))
    bin.x0 = start
    bin.x1 = stop
    return bin
  })
)