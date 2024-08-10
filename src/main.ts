import './style.css';
import Color from "./Color.ts";
import BoardType from "./BoardType.ts";
import Position from "./Position.ts";
import Hole from "./Hole.ts";

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
            if (!hole.legal) {
                return;
            }

            ctx.beginPath();
            ctx.arc(
                hole.radius + (hole.radius * 2 * hole.position.x),
                hole.radius + (hole.radius * 2 * hole.position.y),
                hole.radius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.closePath();

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
    }

    function initBoard(): void {

        // Clear board
        board.splice(0, board.length);

        // Init holes
        for (let x: number = 0; x < BOARD_GRID_SIZE; x++) {
            for (let y: number = 0; y < BOARD_GRID_SIZE; y++) {

                // Declaration
                const position = new Position(x,y);
                const hole = new Hole(position);
                hole.radius = (canvas.width / BOARD_GRID_SIZE) / 2;
                board.push(hole);

                // Theme
                switch (selectedBoardType) {
                    case BoardType.EUROPEAN:
                        if (((x < 2 || x > 4) && (y < 1 || y > 5)) || (x < 1 || x > 5) && (y < 2 || y > 4)) {
                            hole.legal = false;
                        }
                        break;
                    case BoardType.ENGLISH:
                    default:
                        if ((x < 2 || x > 4) && (y < 2 || y > 4)) {
                            hole.legal = false;
                        }
                        break;
                }

            }
        }

    }

    // Game loop
    function loop(timestamp: number): void {
        console.log(timestamp);
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
            hole.radius = (canvas.width / BOARD_GRID_SIZE) / 2;
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

    // Events

    window.addEventListener('resize', () => {
        resize();
        clearTimeout(resizeTimeoutId);
        resizeTimeoutId = setTimeout(resized, 500);
    });

})();