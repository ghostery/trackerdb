# Ghostery Tracker Database

Transparency is at the heart of [Ghostery](https://www.ghostery.com/) experience. This is why Ghostery not only [blocks ads, trackers, and other annoyances](https://www.ghostery.com/ghostery-ad-blocker), but also shows how online tracking works by [naming all the organizations](https://whotracks.me/trackers.html) that participate in data exchange over internet.

## Terminology

Data exchange can easily uncover personal details by private identifiers, often referred to as tracking. However, not every request from an organization involves data collection (i.e., not every request an organization makes is inherently invasive). Organizations often display a range of behavioral patterns, some of which can be intrusive to user privacy, while others are benign.

At Ghostery, we're committed to describing things exactly as they are.

The structure of Ghostery Tracker Database is simple and consists of three main elements:
* **categories** - advertising, site analytics, consent management, etc.
* **organizations** - companies like Google or Facebook, but also open source software like Matomo
* **patterns** - that express various behaviors performed by organizations. For example, a pattern for Google Analytics is categorized as site analytics, but a pattern for Google Tag Manager is categorized as essential.

## Where is it used?

The Tracker Database is used in [Ghostery Browser Extension](https://www.ghostery.com/ghostery-ad-blocker) to categorize all requests we see while browsing the web. It is also used to publish [WhoTracks.me](https://whotracks.me/), the world's largest statistical report on the tracking online.

It is also used by universities, journalists, and companies that want to understand the nature of the web data exchange.

## SDK

The Ghostery Tracker Database comes with a JavaScript SDK. Sample usage:

```js
import { readFileSync } from 'node:fs';
import loadTrackerDB from '@ghostery/trackerdb';

const engine = readFileSync('./node_modules/@ghostery/trackerdb/dist/trackerdb.engine');
const trackerDB = await loadTrackerDB(engine);

const domainMatches = await trackerDB.matchDomain('google.com');

const urlMatches = await trackerDB.matchUrl({
    url: 'https://google.com/gen_204',
    type: 'xhr',
    sourceUrl: 'https://google.com/'
}, {
    getDomainMetadata: true,
});
```

## CLI

Ghostery Tracker Database can also be used in a command line, for example with:

```sh
npx @ghostery/trackerdb "https://analytics.tiktok.com"
```

## Licensing

Ghostery Tracker Database is published under [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license which means it is free to use for non-commercial purposes. If you want to use it in your business, please contact [sales@ghostery.com](mailto:sales@ghostery.com).
