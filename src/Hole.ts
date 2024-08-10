import Position from "./Position.ts";
import BoundingArc from "./BoundingArc.ts";

export default class Hole {

    private radius: number = 0;
    private peg: boolean = true;
    private legal: boolean = true;

    public position: Position;
    public bounding: BoundingArc;
    public selected: boolean;

    constructor(radius: number, position: Position) {
        this.radius = radius;
        this.position = position;
        this.bounding = new BoundingArc(radius, position.x, position.y);
    }

    public setRadius(radius: number): void {
        this.radius = radius;
        this.bounding.setRadius(radius);
    }

    public getRadius(): number {
        return this.radius;
    }

    public placePeg(): void {
        this.peg = true;
    }

    public removePeg(): void {
        this.peg = false;
    }

    public hasPeg(): boolean {
        return this.peg;
    }

    public illegal(): void {
        this.legal = false;
    }

    public allow(): void {
        this.legal = true;
    }

    public allowed(): boolean {
        return this.legal;
    }

    public select(position: Position): Hole | void {
        if (this.bounding.intersects(position)) {
            this.selected = true;
            return this;
        }
    }

}