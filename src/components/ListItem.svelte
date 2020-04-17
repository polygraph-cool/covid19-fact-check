<script>
  import { timeFormat } from "d3-time-format"
  import { parseDate, dateAccessor, countriesAccessor, countryAccessor, categoryAccessor, categoryColors, organizationAccessor, organizationLogos, ratingAccessor, ratingPaths, sourceAccessor, sourceColors, titleAccessor, urlAccessor, tagColors, tagsAccessor } from "./data-utils"
  import { getOrdinal } from "./utils"

  // import flags from "./flags/all.js"

  export let item
  // export let searchString

  let isModal = false

  const formatDate = date => [
    timeFormat("%B %-d")(date),
    getOrdinal(+timeFormat("%-d")(date)),
    ", ",
    timeFormat("%Y")(date),
  ].join("")

  const getTitlePartsWithSearchString = (title, str) => {
    const index = title.toLowerCase().indexOf(str.toLowerCase())
    return index != -1 ? [
      title.slice(0, index),
      title.slice(index, index + str.length),
      title.slice(index + str.length),
    ] : title
  }

  // $: titleParts = searchString
  //   ? getTitlePartsWithSearchString(titleAccessor(item), searchString)
  //   : titleAccessor(item, true).split("*")
  $: titleParts = titleAccessor(item, true).split("*")

  $: category = categoryAccessor(item)
  $: tags = tagsAccessor(item)
  // $: color = tagColors[tags[0]] || "#000"
  $: color = "#000"
  // $: color = categoryColors[category] || "#000"
  $: matchingSources = sourceAccessor(item)
  $: rating = ratingAccessor(item) || "?? " + item.rating
  $: date = dateAccessor(item)
  $: org = organizationAccessor(item)
  $: orgLogo = organizationLogos[org]
  $: countries = countriesAccessor(item)
  $: url = urlAccessor(item)

</script>


<div class="card-wrapper" class:modal={isModal} style={`background: ${color}`}>
  <div class="card-contents">
    <div class="card-contents-inner">
      <a href={url} target="_blank" class="title">
        {#each titleParts as part, i}
          {#if i % 2}
            <b>
              { part }
            </b>
          {:else}
            { part }
          {/if}
        {/each}
      </a>
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
        <!-- <svg class="rating-svg" width="1em" viewBox="0 0 9 9">
          {@html ratingPaths[rating] }
        </svg> -->
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
          { tags.join(" & ") }
        </div>

        <div class="country">
          { countries.join(" & ") }
          <svg class="country-svg" width="1.2em" height="1.2em" viewBox="0 0 21 25" fill="currentColor">
            <path d="M9.75586 24.7598L9.74707 24.7529L9.72363 24.7373L9.64062 24.6807L9.33887 24.4668C9.08203 24.2812 8.71777 24.0098 8.28223 23.6631C7.70215 23.2012 6.99121 22.6016 6.23633 21.8887C5.86035 21.5332 5.47363 21.1494 5.08594 20.7402C2.7959 18.3232 0.311523 14.8301 0.311523 10.9277C0.311523 8.27539 1.36523 5.73242 3.24023 3.85645C5.11621 1.98145 7.65918 0.927734 10.3115 0.927734C12.9639 0.927734 15.5068 1.98145 17.3828 3.85645C19.2578 5.73242 20.3115 8.27539 20.3115 10.9277C20.3115 14.8301 17.8271 18.3232 15.5371 20.7402C14.8584 21.458 14.1797 22.0967 13.5596 22.6416C13.1162 23.0322 12.7031 23.374 12.3408 23.6631L11.9473 23.9707C11.6836 24.1738 11.459 24.3398 11.2842 24.4668L10.9824 24.6807L10.8994 24.7373L10.876 24.7529L10.8691 24.7578L10.8438 24.7227L10.8662 24.7598C10.5303 24.9834 10.0918 24.9834 9.75586 24.7598ZM10.3125 14.9277C12.5215 14.9277 14.3115 13.1377 14.3115 10.9287C14.3115 8.71973 12.5215 6.92871 10.3125 6.92871C8.10352 6.92871 6.3125 8.71973 6.3125 10.9287C6.3125 13.1377 8.10352 14.9277 10.3125 14.9277Z" />
          </svg>
        </div>
      </div>

      {#if isModal}
        <p>
          { item.Explanation }
        </p>
      {/if}

    </div>
  </div>
</div>


<style>
  .card-wrapper {
    height: 100%;
    width: 100%;
    max-width: 90vw;
    transition: all 0.3s ease-out;
  }
  .card-wrapper.modal {
    position: fixed;
    width: 750px;
    height: auto;

    z-index: 100;
    /* position: fixed;
    top: 10em;
    bottom: 10em;
    left: 50%;
    transform: translate(-50%, 0); */
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
    position: relative;
    display: block;
    margin-top: 2em;
    font-size: 1.4em;
    line-height: 1.4em;
    /* font-family: Georgia, serif; */
    /* font-weight: 700; */
    color: inherit;
    text-decoration: none;
    margin-bottom: 0.5em;
    /* padding-bottom: 0.3em; */
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 0.5em;

    -webkit-line-clamp: var(--max-lines);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;

    --lh: 1.4em;
    max-height: calc(var(--lh) * var(--max-lines));
  }
  @supports not (-webkit-line-clamp: 4) {
    .title {
      --lh: 1.4em;
      max-height: calc(var(--lh) * var(--max-lines));
    }
    .title:before {
      /* content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 0.6em;
      background: linear-gradient(
        to top,
        white 0%,
        transparent 100%
      );
      z-index: 5; */

      position: absolute;
      content: "...";
      bottom: 0;
      right: 0.5em;
      z-index: 5;
    }
    .title:after {
      content: "";
      position: absolute;
      /*
      inset-inline-end: 0;
      */
      right: 0.5em;
      /* bottom: -0.5em; */
      /* missing bottom on purpose*/
      width: 1em;
      height: 1.5em;
      background: white;
      z-index: 10;
    }
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
    padding-left: 2.4em;
    background: #1d1e24;
    color: white;
    font-size: 0.9em;
    font-weight: 700;
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
    margin-top: 1em;
    margin-bottom: 0;
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
    /* align-items: center; */
    align-items: baseline;
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
  .country-svg {
    vertical-align: -10%;
    opacity: 0.6;
    mix-blend-mode: multiply;
  }
  .category {
    font-weight: 700;
  }

  @media (max-width: 700px) {
    .card-wrapper {
      font-size: 0.8em;
    }
  }
</style>