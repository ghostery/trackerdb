# Ghostery Tracker Database

Transparency is at the heart of [Ghostery](https://www.ghostery.com/) experience. This is why Ghostery not only [blocks ads, trackers, and other annoyances](https://www.ghostery.com/ghostery-ad-blocker), but also shows how online tracking works by [naming all the organizations](https://whotracks.me/trackers.html) that participate in data exchange over internet.

## Terminology

Data exchange can easily uncover personal details by private identifiers, often referred to as tracking. However, not every request from an organization involves data collection (i.e., not every request an organization makes is inherently invasive). Organizations often display a range of behavioral patterns, some of which can be intrusive to user privacy, while others are benign.

At Ghostery, we're committed to describing things exactly as they are.

The structure of Ghostery Tracker Database is simple and consists of three main elements:
* **categories** - [advertising, site analytics, consent management, etc.](docs/categories.md)
* **organizations** - companies like [Google](db/organizations/google.eno) or [Meta](db/organizations/facebook.eno), but also open source software like [Matomo](db/organizations/matomo.eno)
* **patterns** - that express various behaviors performed by organizations. For example, a pattern for [Google Analytics](db/patterns/google_analytics.eno) is categorized as [site analytics](docs/categories.md#site-analytics), but a pattern for [Google Tag Manager](db/patterns/google_tag_manager.eno) is categorized as [essential](docs/categories.md#essential).

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

Output:

```json
{
  "url": "https://analytics.tiktok.com",
  "matches": [
    {
      "pattern": {
        "key": "tiktok_analytics",
        "name": "TikTok Analytics",
        "category": "site_analytics",
        "organization": "bytedance_inc",
        "alias": null,
        "website_url": "https://analytics.tiktok.com",
        "ghostery_id": "4050",
        "domains": [
          "analytics.tiktok.com"
        ],
        "filters": [
          "||analytics.tiktok.com^$3p"
        ]
      },
      "category": {
        "key": "site_analytics",
        "name": "Site Analytics",
        "color": "#87d7ef",
        "description": "Data analytics, site usage, and performance trackers."
      },
      "organization": {
        "key": "bytedance_inc",
        "name": "ByteDance Inc",
        "description": "ByteDance, a Chinese multinational internet technology company headquartered in Beijing and legally domiciled in the Cayman Islands. Its main product is TikTok, known in China as Douyin, a video-focused social networking service.",
        "website_url": "https://www.bytedance.com/",
        "country": "KY",
        "privacy_policy_url": "https://sf16-sg.tiktokcdn.com/obj/eden-sg/upsnuhpevbn/bytedance_official/PrivacyPolicy_ByteDance.com.pdf",
        "privacy_contact": "privacy@bytedance.com",
        "ghostery_id": "5432"
      }
    }
  ]
}
```

## How can I get involved?

We encourage contributions from developers of all levels. If you come across any errors, such as typos, inaccuracies, or outdated information, please don't hesitate to open an issue, or, even better, send us a pull request. Your feedback is highly valued!

If you are new to the project or want an easy starting point, check out our [Good First Issues](https://github.com/ghostery/trackerdb/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22). These are beginner-friendly tasks to help you get acquainted with our project. If you are unsure about an issue or have questions, feel free to ask in the issue comments.

## Licensing

Ghostery Tracker Database is published under [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license which means it is free to use for non-commercial purposes. If you want to use it in your business, please contact [sales@ghostery.com](mailto:sales@ghostery.com).
