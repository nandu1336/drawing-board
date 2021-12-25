const constructorMapper = {
    rectangle: function (originX, originY, context) {
        return new Rectangle(originX, originY, context);
    },

    square: function (originX, originY, context) {
        return new Rectangle(originX, originY, context);
    },

    circle: function (originX, originY, context) {
        return new Circle(originX, originY, context);
    },

    triangle: function (originX, originY, context) {
        return new Triangle(originX, originY, context);
    },
}
function createShape(originX, originY, context, shape) {
    console.log("shape:", shape);
    return constructorMapper[shape](originX, originY, context);
}

function ShapesOnCanvas() {
    this.shapes = [];

    this.getIndex = function (ar, newShape, attribute) {
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

    this.insert = function (ar, i, v) {

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

    this.sortedInsert = function (ar, newOb, attribute) {
        return this.insert(ar, this.getIndex(ar, newOb, attribute), newOb);
    }

    this.push = function (shape) {
        let temp = this.sortedInsert(this.shapes, shape, "area");
        this.shapes = temp;
        console.log("sorted shapesOnCanvas:", temp);
    }

    this.getShapeByIndex = function (index) {
        return this.shapes[index];
    }

    this.reset = function () {
        this.shapes = [];
    }

    this.resortShapes = function () {
        console.log("resortShapes called");
    }
}

function Rectangle(x, y, context) {
    this.x = x;
    this.y = y;
    this.context = context;

    this.width = null;
    this.height = null;
    this.path = null;
    this.prevWidth = null;
    this.prevWidth = null;

    this.calculateProperties = function () {
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;
        this.area = Math.abs(this.width * this.height);
    }

    this.draw = function (toX, toY) {
        this.context.setLineDash([]);

        this.width = toX - this.x;
        this.height = toY - this.y;

        this.context.clearRect(this.x, this.y, prevWidth, prevHeight);
        this.path = new Path2D();
        this.path.rect(this.x, this.y, this.width, this.height);

        this.context.stroke(this.path);
        this.prevWidth = null;
        this.prevHeight = null;
        this.calculateProperties();
    }

    this.drawOutline = function (toX, toY) {
        this.context.setLineDash([5, 3]);
        if (this.prevWidth || this.prevHeight) {
            if (this.prevWidth < 0) this.prevWidth -= 1;
            if (this.prevWidth >= 0) this.prevWidth += 1;

            if (this.prevHeight < 0) this.prevHeight -= 1;
            if (this.prevHeight >= 0) this.prevHeight += 1;
            this.context.clearRect(this.x, this.y, this.prevWidth, this.prevHeight);
        }

        this.width = toX - this.x;
        this.height = toY - this.y;
        this.prevWidth = this.width;
        this.prevHeight = this.height;
        this.calculateProperties();
        this.context.strokeRect(this.x, this.y, this.width, this.height);
    }

    this.isInside = function (x, y) {
        if (x >= this.x && x <= this.x2) {
            if (y >= this.y && y <= this.y2)
                return true;
            return false;
        }
        return false;
    }

    this.addPath = function (path) {
        this.path = path;
    }

    this.getPath = function () {
        return this.path;
    }

    this.fillColor = function () {
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

}

function Circle(x, y, context) {
    this.x = x;
    this.y = y;
    this.context = context
    this.radius = null;
    this.prevRadius = null;
    this.area = null;

    this.getArea = () => {
        this.area = this.radius ? 2 * Math.PI * this.radius : 0;
        return this.area;
    }

    this.getRadius = function (toX, toY) {
        return Math.sqrt(Math.pow((this.x - toX), 2) + Math.pow((this.y - toY), 2));
    }

    this.draw = function (toX, toY) {
        this.context.setLineDash([]);
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.getRadius(toX, toY), 0, 360);
        this.context.stroke();
        this.prevRadius = 0;
        this.radius = this.getRadius(toX, toY);
        this.getArea();
    }

    this.drawOutline = function (context) {
        this.context.setLineDash([5, 3]);
        if (this.prevRadius) {
            if (this.prevRadius < 0) this.prevRadius -= 1;
            if (this.prevRadius >= 0) this.prevRadius += 1;

            this.clearArc(context, this.x, this.y, this.prevRadius);

        }

        let radius = this.getRadius(toX, toY)
        this.context.beginPath()
        this.context.arc(this.x, this.y, radius, 0, 360);
        this.context.stroke();
        this.prevRadius = radius;
    }

    this.clearArc = function (context, x, y, radius) {
        this.context.save();
        this.context.globalCompositeOperation = 'destination-out';
        this.context.beginPath();
        this.context.arc(x, y, radius + 1, 0, 360, false);
        this.context.fill();
        this.context.restore();
    }

    this.isInside = function (x, y) {
        let distanceFromOrigin = this.getRadius(x, y)
        return distanceFromOrigin <= this.radius;
    }

    this.addPath = function (path) {
        this.path = path;
    }

    this.getPath = function () {
        return this.path;
    }


    this.fillColor = function () {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 360);
        this.context.fill();
    }

}

const Triangle = function (x1, y1, x2, y2) {
    this.ax = x1;
    this.ay = y1;
    this.bx = x2;
    this.by = y2;

    this.s = Math.sqrt(Math.pow((this.ax - this.bx), 2) + Math.pow((this.ay - this.by), 2))
    this.area = Math.pow(this.s, 2) * (Math.sqrt(3) / 4);
    this.height = this.s * (Math.sqrt(3) / 2);

    this.fillColor = function (context) {
        context.beginPath();
        // 
        context.fill();
    }

    this.draw = function () {

    }

}