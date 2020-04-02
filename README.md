# Alternative Olympics Medal Table

Based on Russel's awesome [svelte-hmr-sapper repo](https://github.com/russellgoldenberg/svelte-hmr-sapper)

## Development

To get running locally:

```bash
npm install // install the npm dependencies
npm run dev // start the server!
```

Modify content in `src` and `static`.


## Google App Engine deploy

To build and deploy to google app engine, you need to...

### To setup

1. Get access to the Google Cloud project
2. download the SDK so you can use the `gcloud` command in your terminal. [Instructions here](https://cloud.google.com/sdk/docs#mac).
3. run `gcloud auth login` to log into your account
4. `cd` into the `google-app-engine/` folder
5. run `npm install` or `yarn install` to install the dependencies

### To deploy

1. run `npm run build-static` to populate the `google-app-engine/export` folder with our static files
2. `cd` into the `google-app-engine/` folder
3. run `gcloud app deploy` to update the site