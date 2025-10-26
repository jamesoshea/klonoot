import { render } from "vitest-browser-react";
import { expect, test, vi } from "vitest";
import { IconButton } from "./IconButton";
import { ICON_BUTTON_SIZES } from "../../consts";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(() => <div />),
  faCircleQuestion: vi.fn(() => <div />),
}));

test("IconButton reacts to user click", async () => {
  const mockOnClick = vi.fn();
  const screen = await render(
    <IconButton
      dataTestId="mock-button"
      icon={faCircleQuestion}
      size={ICON_BUTTON_SIZES.SMALL}
      onClick={mockOnClick}
    />,
  );

  await screen.getByTestId("mock-button").click();

  // Test loading state
  expect(mockOnClick).toHaveBeenCalled();
});

test("Small IconButton should render with size 16px", async () => {
  const mockOnClick = vi.fn();
  const screen = await render(
    <IconButton
      dataTestId="mock-button"
      icon={faCircleQuestion}
      size={ICON_BUTTON_SIZES.SMALL}
      onClick={mockOnClick}
    />,
  );

  expect(screen.getByTestId("mock-button")).toHaveAttribute("style");
  expect(screen.getByTestId("mock-button")).toHaveStyle({ height: "16px", width: "16px" });
});

test("Medium IconButton should render with size 20px", async () => {
  const mockOnClick = vi.fn();
  const screen = await render(
    <IconButton
      dataTestId="mock-button"
      icon={faCircleQuestion}
      size={ICON_BUTTON_SIZES.MEDIUM}
      onClick={mockOnClick}
    />,
  );

  expect(screen.getByTestId("mock-button")).toHaveAttribute("style");
  expect(screen.getByTestId("mock-button")).toHaveStyle({ height: "20px", width: "20px" });
});

test("Large IconButton should render with size 25.6px", async () => {
  const mockOnClick = vi.fn();
  const screen = await render(
    <IconButton
      dataTestId="mock-button"
      icon={faCircleQuestion}
      size={ICON_BUTTON_SIZES.LARGE}
      onClick={mockOnClick}
    />,
  );

  expect(screen.getByTestId("mock-button")).toHaveAttribute("style");
  expect(screen.getByTestId("mock-button")).toHaveStyle({ height: "25.6px", width: "25.6px" });
});
