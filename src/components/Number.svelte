<script>
  import { getOrdinal } from "./utils.js"
  import { format } from "d3-format"
  export let isOrdinal
  export let number = false
  export let numberFormat = ",.0f"

  const formatNumber = format(numberFormat)
</script>

<span class="number">
  {#if Number.isFinite(number)}
    { formatNumber(number) }{#if isOrdinal}
      <sup >{ getOrdinal(number) }</sup>
    {/if}
  {:else}
  -
  {/if}
</span>

<style>
  sup {
    font-size: 0.6em;
    line-height: 0;
    vertical-align: super;
  }
  .number {
    display: contents;
    font-feature-settings: "cv02", "cv03", "cv04", "zero" 1;
  }
</style>