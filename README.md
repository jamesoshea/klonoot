# Klonoot

## Motivation

The bike is a tool of liberation, and the tools and software surrounding cycling should also be tools of liberation. They should be open-source, accessible, and free where possible.

Klonoot is a webapp inspired by the core route-planning functionality of a popular outdoorsy platform. It relies on [brouter](https://github.com/abrensch/brouter) for its routing, and leans heavily on Mapbox for the map and search implementation. Authentication and persistence are managed using Supabase. This will change, as I would prefer open-source dependencies and easily self-hostable infrastructure wherever possible.

It serves purely as a route-planning tool, rather than as a navigation app, or social platform. There are already many fantastic open-source navigation apps for cycling.

![A screenshot of klonoot.org](https://klonoot.org/screenshot.png)

## Running the app locally

You will need to create a Supabase account and project, collect the following env vars, and add them to .env in the root directory:

```bash
VITE_SUPABASE_URL // this is the URL where the Supabase endpoint is exposed
VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY // this is the publicly-available key which Supabase uses to identify your instance of the project
```

You will then need to create a table in Supabase called `routes`, which will hold the metadata for user-generated routes. A row in this table contains everything brouter needs to return a consistent output. The SQL to create this table is here: `docs/db-schemas/routes.sql`

Finally, run `docker-compose build`, followed by `docker-compose up`. This will build the client, and start a local instance of the open-source brouter routing engine.

The client runs on port 5173

The brouter instance runs on port 17777

Navigate to `http://localhost:5173` and have fun.
