import { render } from "vitest-browser-react";
import { expect, test, vi } from "vitest";
import { CopyCoordinates } from "./CopyCoordinates";

const writeTextSpy = vi.fn();
const navigatorMock = {
  clipboard: {
    writeText: writeTextSpy,
  },
};

vi.stubGlobal("navigator", navigatorMock);

test("CopyCoordinates renders coordinates correctly", async () => {
  //   const mockOnClick = vi.fn();
  const screen = await render(<CopyCoordinates coordinates={[12.69045, 49.72443]} />);

  // Test loading state
  expect(screen.getByTestId("display-coordinates")).toHaveTextContent("49.724, 12.690");
});

test("CopyCoordinates copies coordinates to clipboard", async () => {
  const screen = await render(<CopyCoordinates coordinates={[12.69045, 49.72443]} />);
  await screen.getByTestId("display-coordinates").click();

  // Test write to clipboard
  expect(writeTextSpy).toHaveBeenCalledWith("49.72443,12.69045");
});
