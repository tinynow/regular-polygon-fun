/*
TODO:
- update the default top point on page resize
- find formula for getting symmettry point
- find formula for spinning sides to align
- create get point by side function
*/

// HELPERS
let uid = 0;
const getId = () => {
    uid++;
    return `uid_${uid}`;
}
const updateStats = (stats, el = document.querySelector('#stats')) => {
    el.innerHTML = '';
    const els = []
    Object.entries(stats).forEach(entry => {
        const stat = document.createElement('p');
        const text = document.createTextNode(entry[0] + ':' + entry[1].toString());
        stat.appendChild(text);
        el.appendChild(stat);
    })
}

// DOM
const
    svg = document.querySelector('#canvas'),
    spinControl = document.querySelector('#spin'),
    getCanvasSize = el => [el.clientWidth, el.clientHeight],
    createPathEl = () => {
        let el = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        el.id = getId();
        return el;
    },
    createTextEl = () => document.createElementNS("http://www.w3.org/2000/svg", 'text'),
    setD = (path, d, svg) => {
        const el = d;
        el.setAttribute('d', path);
        svg.appendChild(el);
    }
    ;
// MATH!!!
const
    precision = 7,
    round = (number) => Number(number.toFixed(precision)),
    // Really firstHighestNumber
    highestNumber = numbers => {
        const val = numbers.reduce((acc, curr) => acc > curr ? acc : curr);
        return numbers.indexOf(val);
    },
    // Really firstLowestNumber
    lowestNumber = numbers => {
        const val = numbers.reduce((acc, curr) => acc < curr ? acc : curr);
        return numbers.indexOf(val);
    };

// MATH WITH ANGLES
const
    toRadians = degrees => round(degrees * (Math.PI / 180)),
    toDegrees = radians => radians * (180 / Math.PI),
    getInteriorAngle = numOfSides => (numOfSides - 2) * 180 / numOfSides,
    getTopPoint = (width, offset = 0) => [width / 2, offset],
    makePath = pathArray => pathArray.join(' '),
    makeLine = ([dx, dy]) => ['L', dx, dy],
    opposite = (angle, hyp) => Math.sin(toRadians(angle)).toFixed(precision) * hyp,
    adjacent = (angle, hyp) => Math.cos(toRadians(angle)).toFixed(precision) * hyp,
    adjacentAngle = (hyp, adjacent) => toDegrees(Math.acos(adjacent / hyp)),
    oppositeAngle = (hyp, opposite) => toDegrees(Math.acos(opposite / hyp)),
    getComplement = angle => 90 - angle,
    getNextAngle = (prev, int) => 180 - int + prev,
    getStartAngle = (sides, orientation = 0) => orientation + 90 - getInteriorAngle(sides) / 2;

// MATH WITH COORDINATES!
const
    getXYDeltas = (angle, length) => [Number(adjacent(angle, length).toFixed(precision)), Number(opposite(angle, length).toFixed(precision))],
    getDistance = ([[x1, y1], [x2, y2]] = line) => {
        const side1 = x2-x1;
        const side2 = y2-y1;
        return Math.sqrt((side1 ** 2) + (side2 ** 2));
    }
;
// Find the farthest point of a polygon in a particular direction
// TODO: handle ties with a perpendicular tie breaker
const farthest = (points, direction, tiebreaker) => {
    let axis;
    let isNegative;
    let farthestPoint;
    switch (direction) {
        case 'left':
            axis = 'x';
            negative = true;
            break;
        case 'down':
            axis = 'y';
            negative = false;
            break;
        case 'up':
            axis = 'y';
            negative = true;
            break;
        default:
            /* right */
            axis = 'x';
            negative = false;
    };
    const index = axis === 'x' ? 0 : 1;
    const vals = points.map(point => point[index]);
    if (negative) {
        return points[lowestNumber(vals)]
    } else {
        return points[highestNumber(vals)]
    }
},
move = (el, [dx, dy]) => {
    el.style.transform = `translate(${dx}px, ${dy}px)`
},
spinAtPoint = (el, [x, y], deg) => {
        el.style.transformOrigin = `${x}px, ${y}px`;
        el.style.transform = `${el.style.transform} rotateZ(${deg}deg`;
},
getCoordinates = (start, delta) => [start[0] + delta[0], start[1] + delta[1]],
    commandsFromPoints = points => points.map(([x, y], index) => {
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    }).join(' ');

let
    sideLength = Math.random() * 50,
    sides = 8,
    width = getCanvasSize(svg)[0],
    spin = 0
    ;


const mapPoints = (start = [0, 0], sideNum, size, spin = 0) => {
    const vertices = [start];
    const interior = getInteriorAngle(sideNum);
    const first = getStartAngle(sideNum, spin);
    const next = prev => getNextAngle(prev, interior);
    const shape = [{ point: [start[0], start[1]], angleTo: next(), angleFrom: first }];

    const walkSides = (angle, index = 0) => {
        if (index < sides) {
            let delta = getXYDeltas(angle, size);
            let vertex = getCoordinates(vertices[index], delta);
            vertices.push(vertex);
            shape.push({ point: vertex, angleTo: angle, angleFrom: next(angle) })
            index++;
            walkSides(next(angle), index);
        }
    }
    walkSides(first);
    return vertices;
}

const polygonFromLine = (line, sides) => {
    const vertices = [...line];
    const interior = getInteriorAngle(sides);
    const first = getAngle
}

const createShape = (start = [250, 150], { sides = 8, sideLength = 30, spin = 0 } = {}) => {
    const points = mapPoints(start, sides, sideLength, spin)
    const d = commandsFromPoints(points);
    setD(d, createPathEl(), svg);
    return points;
}

const drawWreath = () => {

    const a = createShape()
    const b = createShape(farthest(a), { sideLength: sideLength, spin: spin - 36 })
    const c = createShape(farthest(b), {})
    const d = createShape(farthest(c, 'down'), { spin: spin + 36 })
    const e = createShape(farthest(d, 'left'), {})
    const f = createShape(farthest(e, 'left'), { spin: 36 })
    const g = createShape(farthest(a, 'left'), { spin: 36 })
    const h = createShape(farthest(g, 'left'))
    const i = createShape(farthest(h, 'down'), { spin: 36 })
    const j = createShape(farthest(i, 'right'))

}

spinControl.addEventListener('input', event => {
    spin = event.target.value;
    drawWreath();

});

let penState = {
    isDown: false,
    x: 0,
    y: 0,
    lineStart: '',
    angle1: 0,
    angle2: 0
}
const createLine = (line) => {
    const path = `M ${line[0][0]} ${line[0][1]} L ${line[1][0]} ${line[1][1]}`;
    setD(path, createPathEl(), svg);
}
const draw = () => {
    let {
        lineStart,
        x,
        y,
        isDown,
    } = penState;
    if (isDown) {
        penState.lineStart = [x, y];
    } else {
        createLine([lineStart, [x, y]]);
    }

    const hyp = getDistance([lineStart, [x, y]]).toFixed(5);
    const opp = x - lineStart[0];
    const adj = y - lineStart[1];
    penState.angle1 = oppositeAngle(hyp, opp);
    penState.angle1 = adjacentAngle(hyp, adj);

}


svg.addEventListener('mousedown', () => {
    penState.isDown = !penState.isDown;
    penState.x = event.x,
        penState.y = event.y
    updateStats(penState);
    draw();
})
