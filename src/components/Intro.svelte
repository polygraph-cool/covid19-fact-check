<script>
  import ListItem from "./ListItem.svelte"
  import { dateAccessor, titleAccessor, organizations } from "./data-utils"

  export let data

  $: lastFactChecks = [...data]
    .sort((a,b) => dateAccessor(b) - dateAccessor(a))
    .slice(0, 6)
</script>

<div class="c">

  <div class="text">
    <h1>
      Misinformation + Covid 2019
    </h1>
    <!-- <h2>
      Understand what false claims are spreading; what you may have unknowingly read.
    </h2> -->
    <p>
      We compiled fact-checks from over 100 organizations around the world to combat misinformation about Covid-19.
    </p>

    <p>
      Explore to find what false claims are being made about Covid-19 and where they're being spread. For example, <b>{ titleAccessor(lastFactChecks[0]) }</b>
    </p>
    <!-- <div class="orgs">
      {#each organizations as organization}
        <div class="org">
          { organization }
        </div>
      {/each}
    </div> -->
  </div>

  <div class="grid">
    {#each lastFactChecks as item}
      <div class="grid-item">
        <ListItem
          {item}
        />
      </div>
    {/each}
  </div>

</div>

<style>
  .c {
    display: flex;
    align-items: center;
    position: relative;
  }
  h1 {
		/* font-size: 3em;
		line-height: 1.6em; */
		font-weight: 300;
		/* max-width: 90%; */
		margin-bottom: 0;
		/* font-weight: 900; */
		font-size: 4em;
		line-height: 1.1em;
	}
	h2 {
		font-weight: 300;
		font-size: 2.3em;
		line-height: 1.3em;
		color: #888ca1;
		max-width: 30em;
	}
	h3 {
		font-size: 2.3em;
		line-height: 1.1em;
		font-weight: 500;
		max-width: 90%;
		margin-bottom: 1.2em;
	}

	p {
		max-width: 60em;
		margin: 1em auto;
		font-size: 1.3em;
		line-height: 1.6em;
	}

	.orgs {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		max-width: 80em;
		margin-bottom: 2em;
	}
	.org {
		margin: 0.5em 1em;
		font-size: 0.7em;
		line-height: 1.1em;
		opacity: 0.4;
	}
  .grid {
    position: relative;
    flex: 1;
    height: 15em;
    /* position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0; */
    /* overflow: hidden; */
    /* display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 3em;
    grid-column-gap: 1em; */
  }
  .grid-item {
    font-size: 0.6em;
    width: 27em;
    position: absolute;
  }
  .grid-item:nth-child(1) {}
  .grid-item:nth-child(2) {
    transform: translate(18em, 6em);
    z-index: 2;
  }
  .grid-item:nth-child(3) {
    transform: translate(36em, 12em);
    z-index: 3;
  }
  .grid-item:nth-child(4) {
    top: 20em;
    /* transform: translate(15em, 8em); */
    z-index: 4;
  }
  .grid-item:nth-child(5) {
    top: 20em;
    transform: translate(18em, 6em);
    z-index: 5;
  }
  .grid-item:nth-child(6) {
    top: 20em;
    transform: translate(36em, 12em);
    z-index: 6;
  }
  .text {
    /* padding: 0 20em; */
    text-align: left;
    padding: 1em 3em;
    flex: 1;
  }
</style>