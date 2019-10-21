

export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        if (typeof y === 'undefined' && typeof x !== 'undefined') {
            this.y = x;
        }
    }

    mult(other) {
        if (other instanceof Vec2) {
            return new Vec2(this.x * other.x, this.y * other.y);
        } else {
            return new Vec2(this.x * other, this.y * other);
        }
    }

    add(other) {
        if (other instanceof Vec2) {
            return new Vec2(this.x + other.x, this.y + other.y);
        } else {
            return new Vec2(this.x + other, this.y + other);
        }
    }
}

export function vec2(x, y) {
    return new Vec2(x, y);
} 


export class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    mult(other) {
        if (other instanceof Vec3) {
            return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z);
        } else {
            return new Vec3(this.x * other, this.y * other, this.z * other);
        }
    }

    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }
}

export function vec3(x, y, z) {
    return new Vec3(x, y, z);
} 