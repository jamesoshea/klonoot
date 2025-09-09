# Klonoot

## Background

This is an attempt to copy the core functionality and user experience of Komoot, after its sale to private equity.

This would serve purely as a route planning tool. There are already many fantastic open-source navigation apps for cycling. I really loved Komoot's interface for planning trips, and would like to offer something similar for free/donations.

It relies on [brouter](https://github.com/abrensch/brouter) for its routing, and leans heavily on Mapbox for the map and search implementation. This may change, as I would prefer open-source dependencies where possible.

Authentication and persistence are managed using Supabase.

## Roadmap

I would like to find a way to get brouter to run serverless/ as an AWS Lambda, in order to make it more scalable, and to cut down on server costs. I have rough plans for other features I would like to implement:

##### Technical Improvements

- Automated testing and test coverage
- Documentation / site / contact / impressum etc.

##### Features

- Hideable elevation profile
- Context menu on map marker click
- GPX import
- Optimistic UI updates for point drags

## Running the app locally

You'll need a locally-running brouter instance. I have dockerized a recent version of brouter in this repo: https://github.com/jamesoshea/brouter-dockerised. It is available for use on Docker Hub: `jimoshea89/brouter:latest` and `jimoshea89/brouter:amd64`.

You'll also need to create a Supabase account / project, and add the credentials for that project to `.env`.

After that, it's just the normal:

`npm i`

`npm run dev`
