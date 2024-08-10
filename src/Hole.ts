import Position from "./Position.ts";
import BoundingArc from "./BoundingArc.ts";

export default class Hole {

    public position: Position;
    public bounding: BoundingArc;
    public legal: boolean = true;

    private radius: number = 0;
    private peg: boolean = false;

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

}