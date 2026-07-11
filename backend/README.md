Postgres setup and migration

Prerequisites
- Postgres running (local or remote)
- `psql` CLI or `npx sequelize-cli` available if you use sequelize migrations

Environment
- Copy `.env.example` to `.env` and set `DATABASE_URL` or the individual PG_ env vars.

Apply migrations (option A: psql)
1. Connect to your database with `psql`:

   psql "postgres://USER:PASS@HOST:PORT/DBNAME"

2. Run the SQL commands below to add unique constraints if needed:

   ALTER TABLE users ADD CONSTRAINT unique_users_email UNIQUE (email);
   ALTER TABLE users ADD CONSTRAINT unique_users_phone UNIQUE (phone);

Apply migrations (option B: sequelize-cli)
1. Install the CLI locally: `npm install --save-dev sequelize-cli`
2. Configure `config/config.json` or `config` for your environment.
3. Run: `npx sequelize-cli db:migrate --migrations-path src/migrations`

Notes
- The app currently requires a working database for signup and login. If the DB is unavailable, the API will return 503 for those endpoints.
- Adding the unique constraint on `phone` allows NULL values; multiple NULLs are permitted by Postgres.
