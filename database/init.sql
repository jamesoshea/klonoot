CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pgjwt;

CREATE SCHEMA api;

-- Create the schema
create schema if not exists auth;

-- Create user table
create table auth.users (
    id uuid primary key NOT NULL DEFAULT gen_random_uuid(),
    -- Unique identifier for each user
    email text not null unique check (email ~* '^.+@.+\..+$'),
    -- Email with format constraint
    password text not null check (
        length(password) > 6
        and length(password) < 512
    ),
    -- Password with length constraint
    createdAt timestamptz default current_timestamp not null,
    -- Timestamp for creation
    updatedAt timestamptz default current_timestamp not null -- Timestamp for last update
);

-- Function to encrypt passwords
create function auth.encrypt_pass()
returns trigger as $$
begin
    if tg_op = 'INSERT' or new.pass <> old.pass then
        new.pass = crypt(new.pass, gen_salt('bf', 12));
        -- Consider using a stronger cost factor if needed
    end if;

    return new;
end
$$ language plpgsql;

-- Trigger to handle password encryption
create trigger encrypt_pass
before insert or update on auth.users
for each row
execute procedure auth.encrypt_pass();

CREATE TABLE api.pois (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    createdAt timestamp with time zone NOT NULL DEFAULT now(),
    name character varying,
    routeId uuid NOT NULL DEFAULT gen_random_uuid(),
    coordinates json NOT NULL,
    category character varying NOT NULL,
    userId uuid DEFAULT NULL,
    CONSTRAINT pois_pkey PRIMARY KEY (id),
    CONSTRAINT pois_userId_fkey FOREIGN KEY (userId) REFERENCES auth.users(id)
);

-- Create Login Function
create function auth.login(
    email text,
    pass text,
    out token text
) as $$
declare
    _role name;
begin
    -- Check email and password
    select auth.user_role(email, pass)
    into _role;

    if _role is null then
        raise invalid_password
            using message = 'Invalid user or password';
    end if;

    select sign(
        row_to_json(r),
        current_setting('app.jwt_secret')
    ) as token
    from (
        select
            login.email as email,
            extract(epoch from now())::integer + 60*60 as exp
    ) r
    into token;
end;
$$ language plpgsql security definer;

--Grant execution permissions on login function
GRANT usage ON SCHEMA auth TO web_anon, basic_user

CREATE TABLE api.routes (
    id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    createdAt timestamp with time zone NOT NULL DEFAULT now(),
    userId uuid DEFAULT NULL,
    brouterProfile character varying NOT NULL DEFAULT 'trekking' :: character varying,
    points jsonb DEFAULT '[]' :: jsonb,
    name text NOT NULL DEFAULT '' :: text CHECK (length(name) <= 100),
    CONSTRAINT routes_pkey PRIMARY KEY (id),
    CONSTRAINT routes_userId_fkey FOREIGN KEY (userId) REFERENCES auth.users(id)
);

CREATE ROLE web_anon nologin;

GRANT usage ON SCHEMA api TO web_anon;

GRANT
SELECT
    ON api.routes TO web_anon;

GRANT
SELECT
    ON api.pois TO web_anon;