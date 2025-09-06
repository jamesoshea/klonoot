import { scale } from "./canvas";

export const CSSColorToRGBA255Color = (
  string: string,
  opacity: number = 255
) => {
  const ctx = new OffscreenCanvas(1, 1).getContext("2d");

  if (!ctx) {
    return "";
  }

  ctx.fillStyle = string;
  ctx.fillRect(0, 0, 1, 1);

  const data = Array.from(ctx.getImageData(0, 0, 1, 1).data);
  data[3] = scale(opacity, 0, 255, 0, 1);

  return data.join(",");
};

export const getThemeFont = () =>
  window.getComputedStyle(document.body).getPropertyValue("font-family");

export const getThemeColor = (themeColor: string, opacity: number = 255) => {
  const primaryColorContentOKLCH = window
    .getComputedStyle(document.body)
    .getPropertyValue(themeColor);

  const primaryColorContentRGBA = CSSColorToRGBA255Color(
    primaryColorContentOKLCH,
    opacity
  ).toString();

  return `rgba(${primaryColorContentRGBA})`;
};
