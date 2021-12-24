// scalar version
// const getIndex = function (ar, v) {
//     if (!ar.length) {
//         return 0;
//     }

//     for (let i = 0; i < ar.length; i++) {
//         if (v < ar[0]) {
//             return 0;
//         }

//         if (ar[i] < v && ar[i + 1] >= v) {
//             return i + 1;
//         }
//     }

//     return ar.length;
// }

// const insert = function (ar, i, v) {

//     if (!ar.length) {
//         ar[i] = v;
//     }

//     else if (i == 0) {
//         ar.unshift(v);
//     }

//     else if (i == ar.length) {
//         ar.push(v);
//     }

//     else if (i <= (ar.length - 1)) {
//         ar = ar.slice(0, i).concat([v]).concat(ar.slice(i));
//     }

//     return ar;
// }

// for objects

const getIndex = function (ar, newShape, attribute) {
    if (!ar.length) {
        return 0;
    }

    for (let i = 0; i < ar.length; i++) {
        if (newShape[attribute] < ar[0][attribute]) {
            return 0;
        }

        if (ar[i + 1]) {
            if (ar[i][attribute] < newShape[attribute] && ar[i + 1][attribute] >= newShape[attribute]) {
                return i + 1;
            }
        }
    }

    return ar.length;
}

const insert = function (ar, i, v) {

    if (!ar.length) {
        ar[i] = v;
    }

    else if (i == 0) {
        ar.unshift(v);
    }

    else if (i == ar.length) {
        ar.push(v);
    }

    else if (i <= (ar.length - 1)) {
        ar = ar.slice(0, i).concat([v]).concat(ar.slice(i));
    }

    return ar;
}


function sortedInsert(shapesOnCanvas, newShape, area) {
    return insert(shapesOnCanvas, getIndex(shapesOnCanvas, newShape, area), newShape);
}


shapes = [
    { x: 21, y: 21, area: 21 },
    { x: 21, y: 21, area: 5 },
    { x: 21, y: 21, area: 12 },
    { x: 21, y: 21, area: 3 },
    { x: 21, y: 21, area: 200 },

]

shapesOnCanvas = [];

for (let shape of shapes) {
    console.log("shape in for:", shape);
    console.log(sortedInsert(shapesOnCanvas, shape, "area"));
}
