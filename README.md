# Abie ⚖️

Abie is a framework agnostic, developers-first, A/B Testing platform. It lets the developer define an A/B test using simple HTML attributes. It uses Cloudflare Workers to compile the final HTML on the edge, thus causing no flickering or content flashes, and it manages the persistence of the test groups automatically.

## Example

```html
<p data-abie-gte="90">
  This paragraph will only show to 10% of the users, between 90 to 100.
</p>

<p data-abie-gte="85" data-abie-lte="95">
  This paragraph will only show to 10% of the users, between 85 to 95, so half
  of them will also see the paragraph above.
</p>

<!-- Abie will automatically put the visitor identifer (a number between 0 to 100) here,
     so you can report it to whatever endpoint you need -->
<script>
  console.log("%ABIE_IDENTIFIER%");
</script>
```

Check out [test.html](test.html) for more examples, and to see how to define groups and use them around the code. See the example site running [here](https://abie.bjesus.workers.dev/test.html).

## Features

- Define the test target using a 0-100 scale means you can choose the size of a test and create overlapping tests
- Abie handles setting a cookie to persist the test on future visits
- Define test groups so you don't have to repeat the test definition
- Inject the visitor identifier to your JS code so you can report it to whatever Analytics tools you want
- Clean the Abie HTML attributes, so the final HTML has no traces of an AB test even running

## How to run

### Locally

1. Run an HTTP server, like `npx http-server`
1. Emulate the worker, like `npx miniflare -u http://localhost:8080 worker.js`
1. Navigate with your browser to http://localhost:8787/test.html
1. Modify the `abie-id` cookie to get a different variant of the page

### Online

Create a Cloudflare Worker using [worker.js](worker.js) and tunnel your website through it, or replace `fetch(req)` with `fetch('https://YOUR-SITE.COM'+new URL(req.url).pathname);` if your site isn't hosted on Cloudflare.

## Why the name

In tribute to [Abie Nathan](https://en.wikipedia.org/wiki/Abie_Nathan) ☮
