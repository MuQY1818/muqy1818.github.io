CREATE TABLE totals (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_uv INTEGER NOT NULL DEFAULT 0 CHECK (site_uv >= 0),
    site_pv INTEGER NOT NULL DEFAULT 0 CHECK (site_pv >= site_uv),
    started_at INTEGER NOT NULL
);

INSERT INTO totals (id, started_at) VALUES (1, unixepoch());

CREATE TABLE visitors (
    visitor_hash TEXT PRIMARY KEY,
    first_seen_at INTEGER NOT NULL
) WITHOUT ROWID;

CREATE TABLE visit_events (
    event_id TEXT PRIMARY KEY,
    visitor_hash TEXT,
    received_at INTEGER NOT NULL
) WITHOUT ROWID;

CREATE INDEX visit_events_received_at ON visit_events (received_at);

-- The event insert and both increments run in the same SQLite transaction.
CREATE TRIGGER count_page_view AFTER INSERT ON visit_events
BEGIN
    UPDATE totals SET site_pv = site_pv + 1 WHERE id = 1;
    INSERT OR IGNORE INTO visitors (visitor_hash, first_seen_at)
        SELECT NEW.visitor_hash, NEW.received_at
        WHERE NEW.visitor_hash IS NOT NULL;
END;

CREATE TRIGGER count_new_visitor AFTER INSERT ON visitors
BEGIN
    UPDATE totals SET site_uv = site_uv + 1 WHERE id = 1;
END;
