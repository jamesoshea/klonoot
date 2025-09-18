import { describe, expect, test } from "vitest";

import { setNewPoint } from "./route";
import type { Coordinate } from "../types";

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

    expect(
      setNewPoint(point as Coordinate, mockPoints as Coordinate[])
    ).toEqual(result);
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

    expect(
      setNewPoint(point as Coordinate, mockPoints as Coordinate[])
    ).toEqual(result);
  });
});
