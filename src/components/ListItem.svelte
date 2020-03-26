<script>
  import { timeFormat } from "d3-time-format"
  import { parseDate, dateAccessor, organizationAccessor, organizationLogos, ratingAccessor, ratingPaths, sourceAccessor, sourceColors } from "./data-utils"
  import { getOrdinal } from "./utils"

  // import flags from "./flags/all.js"

  export let item

  const formatDate = date => [
    timeFormat("%B %-d")(date),
    getOrdinal(+timeFormat("%-d")(date)),
    ", ",
    timeFormat("%Y")(date),
  ].join("")

  $: titleParts = item.what.split("*")

  $: matchingSources = sourceAccessor(item)
  $: color = sourceColors[matchingSources[0]] || "#000"
  $: rating = ratingAccessor(item) || "?? " + item.rating
  $: date = dateAccessor(item)
  $: org = organizationAccessor(item)
  $: orgLogo = organizationLogos[org]
</script>


<div class="card-wrapper" style={`background: ${color}`}>
  <div class="card-contents">
    <a class="card-contents-inner" href={item.url} target="_blank">
      <div class="title">
        {#each titleParts as part, i}
          {#if i % 2}
            <b>
              { part }
            </b>
          {:else}
            { part }
          {/if}
        {/each}
      </div>
      <div class="date">
        { formatDate(date) }
      </div>
  <!--
      {#each matchingSources as source}
        <div class="topic" style={`color: ${typeColors[source]}`}>
          { source }
        </div>
      {/each} -->
      <!-- <div class="source">
        { item.who }
      </div> -->
      {#if matchingSources.length}
        <div class="source">
          from <b>{ matchingSources.join(", ") }</b>
        </div>
      {/if}
      <div class="rating">
        <svg class="rating-svg" width="1em" viewBox="0 0 9 9">
          {@html ratingPaths[rating] }
        </svg>
        { rating }
      </div>

      <div class="org">
        <!-- <div class="flag">
          {@html flags[langFlagMap[language_code] || language_code || ""] }
        </div> -->
        <!-- { item.country }, -->
        <div class="org-label">
          Fact checked by
        </div>
        {#if orgLogo}
          <img class="org-img" src={orgLogo} alt={`${org} logo`} />
        {:else}
          { org }
        {/if}
      </div>
      <!-- <div>
        { explanation }
      </div> -->

    </a>
  </div>
</div>


<style>
  .card-wrapper {
    height: 100%;
    width: 100%;
  }
  .card-contents {
    height: 100%;
    width: 100%;
		color: #1d1e24;
    background: white;
    border: 1px solid grey;
    /* box-shadow: -6px 6px 0 0 #000; */
    transform: translate(0.5em, -2.1em);
    transition: transform 0.2s ease-out;
  }
  .card-contents:hover {
    /* box-shadow: -9px 9px 0 0 #000; */
    transform: translate(0.7em, -2.4em);
  }
  .card-contents-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1em 1.6em;
    color: inherit;
    text-decoration: none;
  }
  .title {
    display: block;
    margin-top: 1.8em;
    font-size: 1.6em;
    line-height: 1.4em;
    font-family: Georgia, serif;
    color: inherit;
    text-decoration: none;
    margin-bottom: 0.5em;
  }
  .title b {
    background: #dfddfd;
    font-weight: 500;
  }
  .date {
    position: absolute;
    top: 1.3em;
    right: 1em;
    color: #8888a5;
    /* margin-bottom: 1em; */
  }
  .source {
    position: absolute;
    bottom: -1.7em;
    color: white;
    font-size: 0.9em;
  }
  .topic {
    margin-bottom: 0.5em;
  }
  .flag {
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.3em;
    width: 2em;
    height: 1.4em;
  }
  .flag :global(svg) {
    width: 100%;
    height: 100%;
  }
  .rating {
    display: flex;
    align-items: center;
    position: absolute;
    top: -1.3em;
    top: 1em;
    left: 1em;
    left: -0.63em;
    padding: 0.6em 1em;
    padding-left: 1.13em;
    background: #1d1e24;
    color: white;
    font-size: 0.9em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .rating-svg {
    fill: white;
    /* margin-top: 0.3em; */
    margin-right: 0.5em;
  }
  .org {
    /* display: flex; */
    margin-top: auto;
    margin-bottom: 1.2em;
    line-height: 2em;
  }
  .org-img {
    max-width: 10em;
    max-height: 2em;
    margin-top: 0.3em;
  }
  .org-label {
    padding-top: 0.3em;
    color: #8888a5;
    font-size: 0.7em;
    line-height: 1.3em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
</style>