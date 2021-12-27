
const letterValue = { a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 };
let baseValue = 16;
let color = [];
let r = 0;
hex = "#ffbbaa";
hex.split('').map((el) => {
    console.log("el:", el)
    console.log("baseValue in map:", baseValue);
    console.log("color in map:", color);
    console.log("r in map:", r);
}, baseValue, color, r)