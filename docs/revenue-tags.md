# `revenue::` tags

The `revenue::` tag namespace marks the **commercial function a third party performs** — the role it plays in how a website makes money. It exists to support monetization analysis of websites (e.g. on top of WhoTracks.Me data), where the question is "how does this site earn revenue: ads, sales, subscriptions, donations?".

These tags live on **pattern** files (`db/patterns/*.eno`) in the optional `tags` field, alongside any other tags, comma-separated:

```
name: Stripe
category: customer_interaction
tags: revenue::payment-processor
```

## Why tags, not a category

`category` describes the *tracking behaviour* of a third party (advertising, analytics, hosting…), is single-valued, and is consumed by the extension UI and reports. Monetization signal is a different, orthogonal axis: it is multi-valued (a vendor can play several roles), and it cuts across categories (payment processors sit in `customer_interaction` *and* `utilities`; affiliate networks sit in `advertising` *and* `site_analytics`). Tags add this axis without disturbing the category taxonomy or any of its consumers.

## Authoring rule: tag the mechanism, not the business model

Tag the **factual function** of the vendor (`payment-processor`, `ad-exchange`, `paywall`). Do **not** tag an inferred site business model (`ad-funded`, `ecommerce`). The leap from "loads an ad exchange" to "is ad-funded" is probabilistic, often multi-label, and belongs in the downstream analysis layer — not in this database. Keeping tags factual lets a vendor like Criteo be tagged `revenue::retargeting` without the DB having to decide whether the site it appears on is a shop or a publisher.

## Vocabulary

| Tag | Vendor function | Examples |
|---|---|---|
| `revenue::ad-exchange` | Programmatic ad exchange / SSP / ad server / supply marketplace | DoubleClick (GAM), PubMatic, Magnite, Index Exchange, OpenX, Xandr, Amazon APS, Sharethrough, FreeWheel, Taboola, Outbrain |
| `revenue::ad-network` | Ad network or managed publisher-monetization platform that places ads on a publisher's site | AdSense, Ezoic, Raptive (AdThrive), Mediavine, MGID, Revcontent, AdMob, InMobi |
| `revenue::header-bidding` | Header-bidding wrappers / prebid infrastructure | Prebid, Freestar (pub.network), Sortable, Yieldlove |
| `revenue::ad-verification` | Viewability, brand safety, ad fraud verification | DoubleVerify, Integral Ad Science, Moat |
| `revenue::retargeting` | Behavioural retargeting / remarketing ad spend | Criteo, AdRoll, Perfect Audience, SteelHouse |
| `revenue::affiliate-network` | Affiliate / performance-marketing networks | CJ Affiliate, AWIN, ShareASale, Rakuten Advertising, Impact, Amazon Associates |
| `revenue::payment-processor` | Checkout, payment gateways, buy-now-pay-later | Stripe, PayPal, Adyen, Braintree, Klarna, Square, Afterpay, Affirm, Mollie, Razorpay |
| `revenue::ecommerce-platform` | Hosted storefront / commerce platforms | Shopify, BigCommerce |
| `revenue::product-reviews` | Product review / commerce UGC widgets | Trustpilot, Yotpo, Bazaarvoice |
| `revenue::paywall` | Metered access / paywall front-ends | Piano (Tinypass), Poool, Zephr |
| `revenue::subscription-billing` | Recurring billing, membership platforms | Recurly, Chargebee, Paddle, Memberful, Patreon, Substack |
| `revenue::donation-platform` | Fundraising / donation widgets | Donorbox, Classy, GoFundMe, JustGiving, Givebutter |

A pattern may carry more than one `revenue::` tag when a vendor genuinely performs more than one role.

## Coverage notes

- **Ads** are richly covered by TrackerDB already; the tags add sub-type granularity the single `advertising` category cannot express. `ad-exchange` and `ad-network` both indicate publisher (supply-side) ad monetization — the split records *how* inventory is sold (programmatic marketplace vs. managed/network); demand-side-only DSPs, DMPs, and conversion pixels are intentionally left untagged.
- **Donations** and **subscription billing** had effectively zero coverage before these tags; the vendors were added specifically so those revenue models become detectable, alongside a long tail of payment processors, affiliate networks, paywalls, e-commerce/review widgets, and crowdfunding/creator-support platforms.
- **Self-funded / no third parties** is not directly observable from tracker data (data sources do not record tracker-free page loads), so there is no tag for it — it is inferred downstream from the *absence* of revenue signals.
- This vocabulary is a starting set. Extend it (more vendors, or new mechanisms) as needed; the only hard constraint is the tag-format check in `test/db/patterns.test.js`.
