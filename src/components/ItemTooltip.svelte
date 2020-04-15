<script>
  import { dateAccessor, parseDate, sourceAccessor, sourceColors, ratingAccessor, titleAccessor } from "./data-utils"
  import ListItem from "./ListItem.svelte"

  export let x
  export let y
  export let item
  export let isFlipped

  $: sources = sourceAccessor(item)
  $: rating = ratingAccessor(item)
  $: color = sourceColors[sources[0]]

</script>

<div class="wrapper" class:flipped={isFlipped} style={isFlipped ? `transform: translate(${x}px, calc(100% + ${y}px))` : `transform: translate(${x}px, ${y}px)`}>
  <div class="contents">
    <ListItem
      {item}
    />

    <!-- <div class="title">
      { titleAccessor(item) }
    </div>
    <div class="from" style={`color: ${color}`}>
      from { sources.join(" & ") }
    </div>
    <div class="rating">
      { rating }
    </div>
    <div class="country">
      { item["country"] }
    </div> -->
  </div>
</div>

<style>
  .wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    transition: all 0.1s ease-out;
    pointer-events: none;
    z-index: 50;
  }
  .wrapper.flipped .contents {
    margin-top: 1.5em;
  }
  .contents {
    /* background: #fff; */
    /* padding: 1em; */
    width: 30em;
    max-width: 35em;
    margin-top: -0.5em;
    font-size: 0.7em;
    /* border: 1px solid; */
    /* box-shadow: -6px 6px 0 0 #000; */
    text-align: left;
    transform: translate(-50%, -100%);
    pointer-events: none;
    transition: all 0.3s ease-out;
  }
</style>