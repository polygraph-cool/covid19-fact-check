<script>
  export let organizations
</script>

<footer id="footer">
  <div class="orgs-label">
    Led by the <a class="inline-link" href="https://www.poynter.org/ifcn/" target="_blank">International Fact-Checking Network (IFCN)</a> at <a class="inline-link" href="https://www.poynter.org/" target="_blank">the Poynter Institute</a>, the <a class="inline-link" href="https://www.poynter.org/coronavirusfactsalliance/" target="_blank">CoronaVirusFacts / DatosCoronaVirus Alliance</a> unites more than 100 fact-checkers around the world in publishing, sharing and translating facts surrounding the novel coronavirus.
    <br />
    <br />
    Members of the <a class="inline-link" href="https://www.poynter.org/coronavirusfactsalliance/" target="_blank">CoronaVirusFacts / DatosCoronaVirus Alliance</a> include
  </div>
  <div class="orgs">
    {#each organizations as org}
      <div class="org">
        { org }
      </div>
    {/each}
  </div>

  <div class="item gni">
    <div class="label">
      With support from
    </div>
    <img class="logo" src="assets/newsinit_logo.png" alt="Google News Initiative logo" />
  </div>

</footer>

<style>
  footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10em 2em;
    background: #fff;
  }
  .logo {
    width: 11em;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .label {
    font-size: 1em;
    line-height: 1.6em;
    /* text-transform: uppercase;
    letter-spacing: 0.1em; */
  }
  .orgs-label {
    max-width: 50em;
    margin-top: 4em;
    line-height: 1.6em;
    text-align: center;
    font-size: 1em;
  }
  .orgs {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    padding: 1em;
    text-align: center;
  }
  .org {
    padding: 0.6em 1em;
    font-weight: 700;
    opacity: 0.6;
  }
  .inline-link {
    color: inherit;
    font-weight: 700;
  }
  .gni {
    margin-top: 2em;
    width: 100%;
    display: flex;
    text-align: right;
    justify-content: flex-end;
    align-items: flex-end;
  }
  .gni .label {
    margin-right: 0.8em;
  }
</style>