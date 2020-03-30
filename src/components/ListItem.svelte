<script>
  import { timeFormat } from "d3-time-format"
  import { parseDate, dateAccessor, countriesAccessor, categoryAccessor, categoryColors, organizationAccessor, organizationLogos, ratingAccessor, ratingPaths, sourceAccessor, sourceColors, titleAccessor, urlAccessor } from "./data-utils"
  import { getOrdinal } from "./utils"

  // import flags from "./flags/all.js"

  export let item

  const formatDate = date => [
    timeFormat("%B %-d")(date),
    getOrdinal(+timeFormat("%-d")(date)),
    ", ",
    timeFormat("%Y")(date),
  ].join("")

  $: titleParts = titleAccessor(item, true).split("*")

  $: category = categoryAccessor(item)
  $: color = categoryColors[category] || "#000"
  $: matchingSources = sourceAccessor(item)
  $: rating = ratingAccessor(item) || "?? " + item.rating
  $: date = dateAccessor(item)
  $: org = organizationAccessor(item)
  $: orgLogo = organizationLogos[org]
  $: countries = countriesAccessor(item)
  $: url = urlAccessor(item)

</script>


<div class="card-wrapper" style={`background: ${color}`}>
  <div class="card-contents">
    <a class="card-contents-inner" href={url} target="_blank">
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
      <div class="rating">
        <svg class="rating-svg" width="1em" viewBox="0 0 9 9">
          {@html ratingPaths[rating] }
        </svg>
        { rating }
      </div>

      <div class="row">
        <div class="column">
          <div class="label">
            Fact checked by
          </div>
          {#if orgLogo}
            <img class="org-img" src={orgLogo} alt={`${org} logo`} />
          {:else}
            { org }
          {/if}
        </div>
        {#if matchingSources.length}
          <div class="column">
            <div class="label">
              From
            </div>
            <div class="source">
              {#each matchingSources as source, i}
                {#if i}, {/if}
                <b style={`color: ${sourceColors[source]}`}>
                  { source }
                </b>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="bottom-bar">
        <!-- <div>
          { explanation }
        </div> -->

        <div class="category">
          { category }
        </div>

        <div class="country">
          { countries.join(" & ") }
        </div>
      </div>

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
    font-size: 1.4em;
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
    overflow: visible;
  }
  .row {
    display: flex;
    /* align-items: center; */
    justify-content: space-between;
    margin-top: auto;
    margin-bottom: 1.2em;
  }
  .column {
    /* display: flex; */
    /* margin-top: auto; */
    line-height: 2em;
  }
  .column:nth-of-type(2) {
    text-align: right;
  }
  .org-img {
    max-width: 10em;
    max-height: 2em;
    margin-top: 0.3em;
  }
  .label {
    padding-top: 0.3em;
    color: #8888a5;
    font-size: 0.7em;
    line-height: 1.3em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    bottom: -1.7em;
    left: 0;
    left: 1.8em;
    right: 2.5em;
    color: white;
    font-size: 0.9em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .country {
    text-overflow: ellipsis;
    padding-left: 1em;
    overflow: hidden;
    text-align: right;
  }
  .category {
    font-weight: 700;
  }
</style>