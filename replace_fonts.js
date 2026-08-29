const fs = require('fs');
let code = fs.readFileSync('src/app/creator/dashboard/page.tsx', 'utf8');

let replaced = 0;
code = code.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
  const size = parseInt(p1);
  if (size >= 16) {
    const minSize = Math.max(14, size - 4 - Math.floor(size/10));
    const vw = (size / 3.75).toFixed(1);
    replaced++;
    return `fontSize: "clamp(${minSize}px, ${vw}vw, ${size}px)"`;
  }
  return match;
});

fs.writeFileSync('src/app/creator/dashboard/page.tsx', code);
console.log(`Replaced ${replaced} font sizes.`);
