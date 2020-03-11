<script>
  import { range } from "d3-array"
  import { getAngleFromArcLength, getOrdinal, getPositionFromAngle } from "./utils"
	import Number from "./Number.svelte"

  export let rank
  export let medals

  const medalsPerColumn = 8
  const angleRange = 120
  const radiusIncreasePerColumn = 20
  let columnIndex = 0
  let numberOfMedalsInColumn = 0
  const medalPositions = range(150).map(i => {
    const r = 60 + columnIndex * radiusIncreasePerColumn

    const arcLength = getAngleFromArcLength(r, 20)
    const angle = numberOfMedalsInColumn * arcLength
      - 180
      - angleRange / 2
      - (columnIndex % 2 ? arcLength / 2 : 0)

    const maxNumberOfMedalsInColumn = angleRange / arcLength
    numberOfMedalsInColumn++
    if (numberOfMedalsInColumn >= maxNumberOfMedalsInColumn) {
      columnIndex++
      numberOfMedalsInColumn = 0
    }

    const position = getPositionFromAngle(angle, r)
    return position
  })
</script>

<div class="group">
  <div class="award">
    <div class="rank">
      <Number number={ rank } />
      <div class="ordinal">
        { getOrdinal(rank) }
      </div>
    </div>
    <div class="label">
      best
    </div>
  </div>
  <div class="medals">
    {#each range(medals + 1) as i}
      <div class="medal" style={`transform: translate(${medalPositions[i][0]}px, ${medalPositions[i][1]}px)`}></div>
    {/each}
  </div>
</div>

<style>
  .group {
    position: relative;
    display: inline-block;
  }
  .award {
    width: 3.9em;
    height: 3.9em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      to top left,
      #efa22e,
      #fbcb5e
    ), #fbcb5e;
    color: #e27111;
    border: 6px solid #efa22e;
    /* border: 6px solid #d35400; */
    border-radius: 100%;
  }
  .rank {
    display: inline-block;
    position: relative;
    font-size: 2em;
    line-height: 1em;
    font-feature-settings: "cv02", "cv03", "cv04", "zero" 1;
    font-weight: 900;
    mix-blend-mode: multiply;
  }
  .ordinal {
    position: absolute;
    top: -0.4em;
    right: 0;
    font-size: 0.4em;
    font-weight: 400;
    transform: translateX(100%);
  }
  .label {
    margin-bottom: -0.5em;
    text-align: center;
    font-size: 0.6em;
    line-height: 1.3em;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .medals {
    position: absolute;
    top: 50%;
    left: 50%;
  }
  .medal {
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    width: 1em;
    height: 1em;
    margin: 0.1em;
    border-radius: 100%;
    background: #eaeaee;
  }
</style>