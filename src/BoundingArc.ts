import Position from "./Position.ts";

export default class BoundingArc {

    private x: number;
    private y: number;

    public radius: number;
    public position: Position;

    public constructor(radius: number, x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.position = new Position(
            radius + (radius * 2 * x),
            radius + (radius * 2 * y)
        );
    }

    public setRadius(radius: number): void {
        this.radius = radius;
        this.position.x = radius + (radius * 2 * this.x);
        this.position.y = radius + (radius * 2 * this.y);
    }

    public intersects(position: Position): boolean {
        return (position.x - this.position.x) * (position.x - this.position.x) +
               (position.y - this.position.y) * (position.y - this.position.y) <= this.radius * this.radius;
    }

}