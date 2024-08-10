import Position from "./Position.ts";

export default class Hole {

    public position: Position;
    public legal: boolean = true;

    public radius: number;

    constructor(position: Position) {
        this.position = position;
    }

}