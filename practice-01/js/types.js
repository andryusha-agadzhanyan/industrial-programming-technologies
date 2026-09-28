"use strict";

const value1 = "8" + 2;
console.log('1. "8" + 2 =', value1, '| тип:', typeof value1);

const value2 = "8" - 2;
console.log('2. "8" - 2 =', value2, '| тип:', typeof value2);

const value3 = Number("8") + 2;
console.log('3. Number("8") + 2 =', value3, '| тип:', typeof value3);

const value4 = "12" > "3";
console.log('4. "12" > "3" =', value4, '| тип:', typeof value4);

const value5 = 12 === "12";
console.log('5. 12 === "12" =', value5, '| тип:', typeof value5);

const value6 = Number("");
console.log('6. Number("") =', value6, '| тип:', typeof value6);

const value7 = Number("text");
console.log('7. Number("text") =', value7, '| тип:', typeof value7);

const value8 = Boolean("false");
console.log('8. Boolean("false") =', value8, '| тип:', typeof value8);

const value9 = typeof null;
console.log('9. typeof null =', value9, '| тип результата:', typeof value9);

const value10 = typeof NaN;
console.log('10. typeof NaN =', value10, '| тип результата:', typeof value10);
