# discit-api-refresh

## Setup

-   Install [bun](https://bun.sh).
-   Install package dependencies: `bun i`
-   Clone, set up, and start running the [discit-api](https://github.com/cdleveille/discit-api) project locally.
-   Create and populate a `.env` file based on the `.env.example` file in the root directory.
    -   The `API_BASE_URL` value must match the URL of the discit-api project (http://localhost:5000 by default if running locally).
    -   The `API_KEY` value can be any string value, but must match the API_KEY in the discit-api project.
    -   The `REFRESH_DISCS_START` value can be set to `true` to run the disc refresh process when the app starts.
    -   The `REFRESH_DISCS_CRON` value can be set to `true` to automatically run the disc refresh process every night at midnight.
-   Start the refresh process: `bun start`
