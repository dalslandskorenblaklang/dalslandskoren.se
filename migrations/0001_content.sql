CREATE TABLE site_content (
  id TEXT PRIMARY KEY CHECK (id = 'main'),
  content TEXT NOT NULL CHECK (json_valid(content)),
  revision INTEGER NOT NULL CHECK (revision > 0),
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE content_history (
  revision INTEGER PRIMARY KEY,
  content TEXT NOT NULL CHECK (json_valid(content)),
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

-- The snapshot and publication succeed or fail together, including concurrent saves.
CREATE TRIGGER content_insert_history AFTER INSERT ON site_content BEGIN
  INSERT INTO content_history VALUES (NEW.revision, NEW.content, NEW.updated_at, NEW.updated_by);
END;
CREATE TRIGGER content_update_history AFTER UPDATE ON site_content BEGIN
  INSERT INTO content_history VALUES (NEW.revision, NEW.content, NEW.updated_at, NEW.updated_by);
  DELETE FROM content_history WHERE revision <= NEW.revision - 50;
END;
