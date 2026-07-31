ALTER TABLE admin_users DROP COLUMN failed_attempts;
ALTER TABLE admin_users DROP COLUMN locked_until;

CREATE TABLE admin_login_attempts (
  ip TEXT NOT NULL,
  username TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT NULL,
  PRIMARY KEY (ip, username)
);
