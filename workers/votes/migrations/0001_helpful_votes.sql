CREATE TABLE helpful_votes (
  slug TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  PRIMARY KEY (slug, voter_id)
) WITHOUT ROWID;
