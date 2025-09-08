# Klonoot

This is an attempt to copy the core functionality and user experience of Komoot, after its sale to private equity.

This would serve purely as a route planning tool. There are already many fantastic open-source navigation apps for cycling. I really loved Komoot's interface for planning trips, and would like to offer something similar for free/donations.

It relies on brouter for its routing, and leans heavily on Mapbox for the map and search implementation.

I would like to find a way to get brouter to run serverless/ as an AWS Lambda, in order to make it more scalable, and to cut down on server costs. I have rough plans for other features I would like to implement:

- clear map on sign-out
- improve elevation marker line behaviour
- hideable elevation profile
- named waypoints / via points
- ~~Auth~~
- ~~persistence~~
- ~~proper elevation profile~~
- ~~surfaces~~
- context menu on map click
- gpx import
- ~~brouter profile selection~~
- ~~docker-compose setup~~
- optimistic UI updates for point drags
- ~~integrate react-query~~
- write unit tests
- documentation / site / contact / impressum etc.

# Running the app locally

You'll need a locally-running brouter instance. I have dockerized a recent version of that instance in this repo: https://github.com/jamesoshea/brouter-dockerised

After that, it's just the normal

`npm i`

`npm run dev`
