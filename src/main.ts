import './style.css';
import Color from "./Color.ts";
import BoardType from "./BoardType.ts";
import Position from "./Position.ts";
import Hole from "./Hole.ts";
import Mouse from "./Mouse.ts";

// Game
((): void => {

    // Globals
    const BOARD_GRID_SIZE: number = 7;

    // Canvas / Screen
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let resizeTimeoutId: number = 0;

    // Renderer
    let animationFrameId: number = 0;

    // Board
    const board: Array<Hole> = [];
    let selectedBoardType: BoardType = BoardType.ENGLISH;

    // Input
    const mouse: Mouse = new Mouse(new Position(-1,-1));
    let selectedPeg: Hole | null;
    let selectedHole: Hole | null;

    function draw(): void {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = Color.WHITE;
        ctx.fill();
        ctx.closePath();

        // Board
        board.forEach((hole: Hole) => {

            // Do not draw illegal holes
            if (!hole.allowed()) {
                return;
            }

            ctx.beginPath();
            ctx.arc(
                hole.bounding.position.x,
                hole.bounding.position.y,
                hole.getRadius(),
                0,
                Math.PI * 2
            );
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw peg
            if (!hole.hasPeg()) {
                return;
            }

            ctx.save();
            ctx.translate(hole.bounding.position.x, hole.bounding.position.y);
            ctx.beginPath();
            ctx.arc(0,0, hole.getRadius() * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = Color.BLACK;
            ctx.fill();
            ctx.closePath();
            ctx.restore();

        });

    }

    // Constructor of the game.
    function init(): void {
        console.log("Init");
        canvas = <HTMLCanvasElement> document.getElementById('canvas');
        if (!canvas) {
            console.error('No canvas element found');
            return;
        }

        ctx = <CanvasRenderingContext2D> canvas.getContext('2d');

        resize();
        initBoard();

        // Events

        canvas.addEventListener('mousemove', (ev: MouseEvent) => {
            ev.preventDefault();
            mouse.position.set(ev.offsetX, ev.offsetY);
        });

        canvas.addEventListener('click', (ev: MouseEvent) => {
           ev.preventDefault();
           mouse.position.set(ev.offsetX, ev.offsetY);

           // Selects a peg.
           selectedPeg = <Hole> board.find((hole: Hole) => (hole.hasPeg() && hole.bounding.intersects(mouse.position)));
           selectedHole = <Hole> board.find((hole: Hole) => (!hole.hasPeg() && hole.bounding.intersects(mouse.position)));

        });

    }

    function initBoard(): void {

        // Clear board
        board.splice(0, board.length);

        // Init holes
        for (let x: number = 0; x < BOARD_GRID_SIZE; x++) {
            for (let y: number = 0; y < BOARD_GRID_SIZE; y++) {

                // Declaration
                const position = new Position(x,y);
                const radius: number = (canvas.width / BOARD_GRID_SIZE) / 2;
                const hole = new Hole(radius, position);
                board.push(hole);

                // Remove the peg in the center.
                if (x === 3 && y === 3) {
                    hole.removePeg();
                }

                // Theme
                switch (selectedBoardType) {
                    case BoardType.EUROPEAN:
                        if (((x < 2 || x > 4) && (y < 1 || y > 5)) || (x < 1 || x > 5) && (y < 2 || y > 4)) {
                            hole.illegal();
                        }
                        break;
                    case BoardType.ENGLISH:
                    default:
                        if ((x < 2 || x > 4) && (y < 2 || y > 4)) {
                            hole.illegal();
                        }
                        break;
                }

            }
        }

    }

    // Game loop
    function loop(): void {
        draw();
        if (animationFrameId) {
            window.requestAnimationFrame(loop);
        }
    }

    // During resizing of the screen.
    function resize(): void {
        console.log("Is resizing");

        // Stop game-loop.
        stop();

        // Resize canvas.
        const aspect = 1;
        const maxWidth: number = window.innerWidth;
        const maxHeight: number = window.innerHeight;
        let width: number = maxWidth;
        let height: number = maxWidth / aspect;
        if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight * aspect;
        }
        canvas.width = width;
        canvas.height = height;
    }

    // After screen has been resized.
    function resized(): void {
        console.log("Done resizing");
        // Start game-loop again.

        // Update the board.
        board.forEach((hole: Hole) => {
            hole.setRadius((canvas.width / BOARD_GRID_SIZE) / 2);
        });

        start();
    }

    function start(): void {
        console.log("Start");
        animationFrameId = window.requestAnimationFrame(loop);
    }

    function stop(): void {
        console.log("Stop");
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
    }

    // Init game
    init();

    // Starts loop.
    start();

    // Global events

    window.addEventListener('resize', () => {
        resize();
        clearTimeout(resizeTimeoutId);
        resizeTimeoutId = setTimeout(resized, 500);
    });

})();