<header role="banner">
  <div class="contents">
    <a href="https://www.poynter.org">
      <img class="logo"
        src="//www.poynter.org/wp-content/uploads/2018/10/poynter-logo-black.png"
        alt="logo" />
    </a>
    <div class="links">
      <a href="https://www.poynter.org/media-news/" class="link">
        Media News
      </a>
      <a href="https://www.poynter.org/poynter-training/" class="link">
        Training & Events
      </a>
      <a href="https://www.poynter.org/support/" class="link">
        Support Us
      </a>
      <a href="https://www.poynter.org/about/" class="link">
        About
      </a>
      <!-- <div class="search">
        <a href="https://www.poynter.org/?s=chicken+pot+pie">
          [search icon]
        </a>
      </div> -->

      <div class="link">
        <a href="https://www.poynter.org/wp-login.php">
          Login
        </a>
        /
        <a href="https://www.poynter.org/register/">
          Register
        </a>
    </div>

    </div>
  </div>

</header>


<style>
  header {
    -webkit-tap-highlight-color: transparent;
    color: #292b2c;
    font-size: 14px;
    font-family: "Poynter-OS-Display", "Times New Roman", Georgia, serif;
    top: 0;
    position: relative;
    right: 0;
    left: 0;
    z-index: 1030;
    background: #ffffff;
  }
  .contents {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 10px 10px 10px;
    /* width: 100%; */
    max-width: 1600px;
  }
  .logo {
    display: inline-block;
    width: 193px;
    height: auto;
    margin-left: 10px;
  }
  .links {
    display: flex;
    align-items: center;
    margin-right: 2.8%;
  }
  .link {
    display: block;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: bold;
    line-height: 15px;
    font-family: Poynter-Gothic-Text, sans-serif;
  }
  a {
    color: #57a039;
    text-decoration: none;
  }

  @media (max-width: 1000px) {
    .links {
      display: none;
    }
  }
  @media screen and (min-width: 768px) {
    .logo {
        margin-left: 36px;
    }
  }
  @media (max-width: 600px) {
    .contents {
      padding: 0.6em 1em 0.3em;
    }
    .logo {
      width: 120px;
    }
  }
</style>