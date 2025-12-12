import { render } from "vitest-browser-react";
import { expect, test, vi } from "vitest";
import { DisplayRoutePOI } from "./RoutePOI";
import type { RoutePOI } from "../types";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../queries/queryClient";

const mutateAsyncSpy = vi.fn();

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(() => <div />),
  faCircleQuestion: vi.fn(() => <div />),
}));

vi.mock("../queries/pois/useDeletePOI", () => ({
  useDeletePOI: () => ({
    mutateAsync: mutateAsyncSpy,
  }),
}));

const MOCK_ROUTE_POI = {
  id: "a4c8d913-4090-469b-89ef-f483093f8ac3",
  coordinates: [49.72443, 12.69045] as RoutePOI["coordinates"],
  name: "Mock POI",
  routeId: "f2447ca4-b7df-4633-a70f-dc9aa65edd4f",
  userId: "64ad8573-cd6d-48c6-87b2-7d8609d54402",
};

test("RoutePOI renders name and coordinates correctly", async () => {
  const mockOnClose = vi.fn();
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <DisplayRoutePOI routePOI={MOCK_ROUTE_POI} onClose={mockOnClose} />
    </QueryClientProvider>,
  );

  expect(screen.getByTestId("route-poi-name")).toHaveTextContent(MOCK_ROUTE_POI.name);
  expect(screen.getByTestId("display-coordinates")).toHaveTextContent(
    MOCK_ROUTE_POI.coordinates
      .reverse()
      .map((coord) => coord.toFixed(3))
      .join(", "),
  );
});

test("RoutePOI reacts to onclose button user click", async () => {
  const mockOnClose = vi.fn();
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <DisplayRoutePOI routePOI={MOCK_ROUTE_POI} onClose={mockOnClose} />
    </QueryClientProvider>,
  );

  await screen.getByTestId("close-button").click();

  // Test close funtionality
  expect(mockOnClose).toHaveBeenCalled();
});

test("RoutePOI reacts to useDeletePOI button click", async () => {
  const mockOnClose = vi.fn();
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <DisplayRoutePOI routePOI={MOCK_ROUTE_POI} onClose={mockOnClose} />
    </QueryClientProvider>,
  );

  await screen.getByTestId("delete-route-poi").click();

  // Assert that API call is made
  expect(mutateAsyncSpy).toHaveBeenCalled();
  // Test close funtionality
  expect(mockOnClose).toHaveBeenCalled();
});
