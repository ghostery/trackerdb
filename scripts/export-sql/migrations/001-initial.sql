--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE categories(
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE
);
CREATE TABLE companies (
  id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  privacy_url TEXT,
  website_url TEXT,
  ghostery_id TEXT,
  country VARCHAR (2),
  privacy_contact TEXT,
  notes TEXT
);
CREATE TABLE tracker_domains (
  tracker TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  notes TEXT,
  FOREIGN KEY (tracker) REFERENCES trackers (id)
);
CREATE TABLE trackers (
  id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id INTEGER,
  website_url TEXT,
  company_id TEXT,
  ghostery_id TEXT,
  notes TEXT,
  alias TEXT REFERENCES trackers (id),
  FOREIGN KEY (category_id) REFERENCES categories (id),
  FOREIGN KEY (company_id) REFERENCES companies (id)
);
CREATE UNIQUE INDEX tracker_domain_pair ON tracker_domains (tracker, domain);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
