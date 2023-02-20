# Ghostery Tracker Database

Transparency is at the heart of Ghostery experience. This is why, Ghostery not only blocks trackers, ads and other annoyances but also shed light on how tracking online works by naming all the organizations that participate in data exchange over internet.

## Terminology

We believe it is important to name things accordingly to its nature. Data exchange can involve leakage of private identifiers - we call that tracking, but that does not mean that organization that receives such data is exclusively a tracker. In fact organizations often have multiple different behavioral patterns that we observe, some of them are invading users privacy, some of them are harmless.

The structure of Ghostery Tracker Database is simple and consists of tree main elements:
* **categories** - like advertising, site analytics, consent
* **organizations** - which can be companies like Google or Facebook, but also Open Source Software like Matomo
* **patterns** - that express various behaviors performed by organizations, so for example pattern for Google Analytics is categorized as site analytics, but pattern for Google Tag Manager is categorized as essential.

## Where is it used?

Tracker Database is used in [Ghostery Browser Extension](https://www.ghostery.com/) to categorize all requests we see while browsing the web. It is also used to publish [WhoTrack.me](https://whotracks.me/) - worlds largest statistical report on the tracking online.

It is also used by universities, journalists and companies that want to understand the nature of the web data exchange.

## Licensing

Ghostery Tracker Database is published under [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license which means it is free to use for non-commercial purposes. If you want to use it in your business please contact [sales@ghostery.com](mailto:sales@ghostery.com).
