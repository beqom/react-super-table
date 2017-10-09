
export const trace = (x, ...msg) => (console.log(...[...msg, x]), x);

export const numToAlpha = n => {
  const alphabet = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z"
  ];
  const len = alphabet.length;
  if (n < len) return alphabet[n];
  return numToAlpha(Math.floor(n / len) - 1) + numToAlpha(n % len);
};
