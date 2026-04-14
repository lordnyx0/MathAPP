const rawString = "Determine de forma esperta a integral aparentemente impossível $\\int \\frac{x^3 - 1}{x - 1} dx$.";

const isComplexMath = /\$|\\\[|\\\(|\\begin\{/.test(rawString);
console.log("isComplexMath:", isComplexMath);

const parts = rawString.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
console.log("parts:", parts);

parts.forEach(part => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
        console.log("$$ MATCH:", part);
    } else if (part.startsWith('$') && part.endsWith('$')) {
        console.log("$ MATCH:", part);
    } else if (part) {
        console.log("ELSE MATCH:", part);
    }
});
