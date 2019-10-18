import { Vec2 } from './vector.js';

export class Vtx2 extends Vec2 {
    constructor(x, y, inside = false) {
        super(x, y);
        this.inside = inside;
    }

    mult(other) {
        const vector = super.mult(other);
        return new Vtx2(vector.x, vector.y, this.inside);
    }
    
    add(other) {
        const vector = super.add(other);
        return new Vtx2(vector.x, vector.y, this.inside);
    }

}

export function vtx2(x, y, inside) {
    return new Vtx2(x, y, inside);
}