CREATE DATABASE changeme CHARACTER SET utf8;
use changeme;

CREATE TABLE sitesettings (
    sitename TEXT,
    sitedesc TEXT,
    sitecolor TEXT
);

CREATE TABLE users (
    id TEXT,
    email TEXT,
    password TEXT
);

CREATE TABLE staff (
    userid TEXT
);

ALTER DATABASE changeme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE sitesettings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
ALTER TABLE staff CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;

INSERT INTO sitesettings (sitename, sitedesc, sitecolor) VALUES ('Change Me', 'A description placeholder...', '#006fed');