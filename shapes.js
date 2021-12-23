function Rectangle(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.path = null;
    this.x2 = this.x + this.width;
    this.y2 = this.y + this.height;

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
}

function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    console.log("circle created");

    this.isInside = function (x, y) {
        let distanceFromOrigin = Math.sqrt(Math.pow((this.x - x), 2) + Math.pow((this.y - y), 2));
        return distanceFromOrigin <= this.radius;
    }

    this.addPath = function (path) {
        this.path = path;
    }

    this.getPath = function () {
        return this.path;
    }

}