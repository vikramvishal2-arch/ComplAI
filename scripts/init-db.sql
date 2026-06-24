-- Run once as the postgres superuser (pgAdmin or psql):
--   psql -U postgres -f scripts/init-db.sql

CREATE USER grc WITH PASSWORD 'grc_dev_password';
CREATE DATABASE grc_platform OWNER grc;
GRANT ALL PRIVILEGES ON DATABASE grc_platform TO grc;
