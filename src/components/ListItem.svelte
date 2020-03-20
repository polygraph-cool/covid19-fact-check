<script>
  import flags from "./flags/all.js"

  export let langFlagMap
  export let categoryColors
  export let category
  export let url
  export let title
  export let primary_country
  export let language_code
</script>


<div class="card-contents">
  <div class="card-contents-inner">
    <a class="title" href={url} target="_blank">
      { title }
    </a>

    <div class="topic" style={`color: ${categoryColors[category]}`}>
      { category }
    </div>

    <div>
      <div class="flag">
        {@html flags[langFlagMap[language_code] || language_code || ""] }
      </div>
      { primary_country }, { language_code }
    </div>

  </div>
</div>


<style>
  .card-contents {
    height: 100%;
    width: 100%;
		color: #1d1e24;
    background: white;
    border: 1px solid grey;
    /* box-shadow: -6px 6px 0 0 #000; */
    transform: translate(6px, -8px);
    transition: transform 0.2s ease-out;
  }
  .card-contents:hover {
    /* box-shadow: -9px 9px 0 0 #000; */
    transform: translate(9px, -13px);
  }
  .card-contents-inner {
    padding: 1em 1.6em;
  }
  .title {
    display: block;
    font-size: 1.6em;
    line-height: 1.4em;
    font-family: Georgia, serif;
    color: inherit;
    text-decoration: none;
    margin-bottom: 0.5em;
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
</style>