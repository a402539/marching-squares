

export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    mult(other) {
        if (other instanceof Vec2) {
            return new Vec2(this.x * other.x, this.y * other.y);
        } else {
            return new Vec2(this.x * other, this.y * other);
        }
    }

    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
}

export function vec2(x, y) {
    return new Vec2(x, y);
} 