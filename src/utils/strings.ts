export const convertToSafeFileName = (str: string): string => {
  return str.toLowerCase().replace(/\W+/g, "_");
};
