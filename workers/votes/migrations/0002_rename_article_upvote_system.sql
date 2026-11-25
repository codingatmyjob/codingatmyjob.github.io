INSERT INTO helpful_votes (slug, voter_id)
SELECT 'how-i-built-an-article-upvote-system', voter_id
FROM helpful_votes
WHERE slug = 'cloudflare-worker-sql-article-upvotes'
ON CONFLICT (slug, voter_id) DO NOTHING;

DELETE FROM helpful_votes WHERE slug = 'cloudflare-worker-sql-article-upvotes';
