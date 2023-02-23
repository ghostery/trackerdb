# Ghostery Tracker Database

Transparency is at the heart of Ghostery experience. This is why Ghostery not only blocks ads, trackers, and other annoyances, but also sheds light on how tracking online works by naming all the organizations that participate in data exchange over internet.

## Terminology

We believe it is important to name things accordingly to its nature. Data exchange often reveals private identifiers — we call that tracking, but that does not mean that organization that receives such data is exclusively a tracker. Organizations often have multiple behavioral patterns: some of them invade user privacy, some of them are harmless.

The structure of Ghostery Tracker Database is simple and consists of three main elements:
* **categories** - advertising, site analytics, consent management, etc.
* **organizations** - companies like Google or Facebook, but also open source software like Matomo
* **patterns** - that express various behaviors performed by organizations. For example, a pattern for Google Analytics is categorized as site analytics, but a pattern for Google Tag Manager is categorized as essential.

## Where is it used?

The Tracker Database is used in [Ghostery Browser Extension](https://www.ghostery.com/ghostery-ad-blocker) to categorize all requests we see while browsing the web. It is also used to publish [WhoTracks.me](https://whotracks.me/), the world's largest statistical report on the tracking online.

It is also used by universities, journalists, and companies that want to understand the nature of the web data exchange.

## Licensing

Ghostery Tracker Database is published under [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license which means it is free to use for non-commercial purposes. If you want to use it in your business, please contact [sales@ghostery.com](mailto:sales@ghostery.com).
