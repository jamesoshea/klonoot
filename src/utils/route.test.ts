import { beforeEach, describe, expect, it, test, vi } from "vitest";

import { fetchRoute, setNewPoint } from "./route";
import { BROUTER_PROFILES, type Coordinate } from "../types";
import axios from "axios";

const getSpy = vi.spyOn(axios, "get");

describe("setNewPoint", () => {
  test("should add point to middle", () => {
    const mockPoints = [
      [13.325340988529064, 52.49241358681931],
      [13.467491073479977, 52.55007481624324],
      [13.470302459360397, 52.5103152000853],
      [13.496206624193093, 52.498639209578556],
    ];

    const result = [
      [13.325340988529064, 52.49241358681931],
      [13.467491073479977, 52.55007481624324],
      [13.487468910213238, 52.5342696157567],
      [13.470302459360397, 52.5103152000853],
      [13.496206624193093, 52.498639209578556],
    ];
    const point = [13.487468910213238, 52.5342696157567];

    expect(setNewPoint(point as Coordinate, mockPoints as Coordinate[])).toEqual(result);
  });

  test("should add point to end", () => {
    const mockPoints = [
      [13.325340988529064, 52.49241358681931],
      [13.467491073479977, 52.55007481624324],
      [13.470302459360397, 52.5103152000853],
    ];

    const result = [
      [13.325340988529064, 52.49241358681931],
      [13.467491073479977, 52.55007481624324],
      [13.470302459360397, 52.5103152000853],
      [13.496206624193093, 52.498639209578556],
    ];
    const point = [13.496206624193093, 52.498639209578556];

    expect(setNewPoint(point as Coordinate, mockPoints as Coordinate[])).toEqual(result);
  });
});

describe("fetchRoute", () => {
  beforeEach(() => {
    getSpy.mockReset();
  });

  it("should call brouter for a GPX when passed the GPX format", async () => {
    getSpy.mockResolvedValue({ data: {} });

    await fetchRoute(
      "gpx",
      [[0, 0, "test point name", false]],
      BROUTER_PROFILES.GRAVEL,
      "test_route",
    );

    expect(getSpy.mock.calls[0][0]).toContain(
      "brouter?lonlats=0,0,test point name&profile=gravel&alternativeidx=0&format=gpx&trackname=test_route",
    );
  });

  it("should format direct points", async () => {
    getSpy.mockResolvedValue({ data: {} });

    await fetchRoute(
      "geojson",
      [
        [0, 0, "test point name", false],
        [0, 0, "direct", true],
      ],
      BROUTER_PROFILES.GRAVEL,
      "test_route",
    );

    expect(getSpy.mock.calls[0][0]).toContain(
      "brouter?lonlats=0,0,test point name|0,0,direct&profile=gravel&alternativeidx=0&format=geojson&straight=1&trackname=test_route",
    );
  });
});
