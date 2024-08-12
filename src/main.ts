import './assets/font/dosis.css';
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
    const valid: Array<Hole> = []; // Valid moves based on selected peg.
    let hasSelectedPeg: boolean = false;
    let hasSelectedHole: boolean = false;
    let selectedPeg: Hole | null = null;
    let selectedHole: Hole | null = null
    let pegToRemove: Hole | null = null;

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
            ctx.fillStyle = (selectedPeg === hole) ? Color.BLUE : Color.BLACK;
            ctx.fill();
            ctx.closePath();
            ctx.restore();

        });

        // Draw valid holes while selected
        valid.forEach((hole: Hole) => {
            ctx.save();
            ctx.translate(hole.bounding.position.x, hole.bounding.position.y);
            ctx.beginPath();
            ctx.arc(0,0, hole.getRadius() * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = Color.BLUE;
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

            const selected = board.find((hole: Hole) => hole.select(mouse.position)) ?? null;

            if (selected && selected.hasPeg()) {
                hasSelectedPeg = true;
                hasSelectedHole = false;
                selectedPeg = selected;
                selectedHole = null;

                // Find valid holes
                moves();

            }

            if (selected && !selected.hasPeg() && hasSelectedPeg && selectedPeg) {
                hasSelectedHole = true;
                selectedHole = selected;
            }

        });

    }

    // Finds valid moves based on selected peg.
    function moves(): void {

        // Reset valid moves.
        valid.splice(0, valid.length);

        if (!selectedPeg) {
            return;
        }

        const selectedPegPos: Position = selectedPeg.position;

        // Adjacent pegs
        const adjacentPegs: Array<Hole> = board.filter((hole: Hole) => {

            if (!hole.allowed() || !hole.hasPeg()) {
                return;
            }

            const pos: Position = hole.position;

            if (
                (selectedPegPos.x === pos.x && selectedPegPos.y - 1 === pos.y) || // Top
                (selectedPegPos.x + 1 === pos.x && selectedPegPos.y === pos.y) || // Right
                (selectedPegPos.x === pos.x && selectedPegPos.y + 1 === pos.y) || // Bottom
                (selectedPegPos.x - 1 === pos.x && selectedPegPos.y === pos.y)  // Left
            ) {
                return hole;
            }

        });

        // Hole beyond the adjacent pegs?
        const adjacentHoles = board.filter((hole: Hole) => {

            if (!hole.allowed() || hole.hasPeg()) {
                return;
            }

            const pos: Position = hole.position;

            if (
                (selectedPegPos.x === pos.x && selectedPegPos.y - 2 === pos.y) || // Top
                (selectedPegPos.x + 2 === pos.x && selectedPegPos.y === pos.y) || // Right
                (selectedPegPos.x === pos.x && selectedPegPos.y + 2 === pos.y) || // Bottom
                (selectedPegPos.x - 2 === pos.x && selectedPegPos.y === pos.y)  // Left
            ) {
                return hole;
            }

        });

        adjacentHoles.forEach((hole: Hole) => {
           adjacentPegs.forEach((peg: Hole) => {
                if ((peg.position.x === hole.position.x && peg.position.y - 1 === hole.position.y) || // Top
                    (peg.position.x + 1 === hole.position.x && peg.position.y === hole.position.y) || // Right
                    (peg.position.x === hole.position.x && peg.position.y + 1 === hole.position.y) || // Bottom
                    (peg.position.x - 1 === hole.position.x && peg.position.y === hole.position.y)
                ) {
                    valid.push(hole);
                }
           });
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
        update();
        draw();
        if (animationFrameId) {
            window.requestAnimationFrame(loop);
        }
    }

    // During resizing of the screen.
    function resize(): void {
        console.log("Is resizing");

        // Get the styles of the document.

        // Stop game-loop.
        stop();

        // Resize canvas.
        const aspect = 1;

        const parent: HTMLElement = <HTMLElement> canvas.parentElement;
        const styles = window.getComputedStyle(parent);
        const padding: number = parseFloat(styles.padding) * 2;

        // Removes padding from the canvas.
        const maxWidth: number = parent.offsetWidth - padding;
        const maxHeight: number = parent.offsetHeight - padding;

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

    function update(): void {
        if (selectedHole && selectedPeg && valid.length) {
            console.log("Move");

            board.forEach((hole: Hole) => {

                if (!hole.allowed() || !hole.hasPeg() || !selectedPeg?.position || !selectedHole?.position) {
                    return;
                }

                if (
                    (selectedPeg.position.x + 1 === hole.position.x &&
                    selectedHole.position.x - 1 === hole.position.x &&
                    selectedPeg.position.y === hole.position.y &&
                    selectedHole.position.y === hole.position.y) || // Right

                    (selectedPeg.position.x - 1 === hole.position.x &&
                    selectedHole.position.x + 1 === hole.position.x &&
                    selectedPeg.position.y === hole.position.y &&
                    selectedHole.position.y === hole.position.y) || // Left

                    (selectedPeg.position.x === hole.position.x &&
                    selectedHole.position.x === hole.position.x &&
                    selectedPeg.position.y - 1 === hole.position.y &&
                    selectedHole.position.y + 1 === hole.position.y) || // Up

                    (selectedPeg.position.x === hole.position.x &&
                    selectedHole.position.x === hole.position.x &&
                    selectedPeg.position.y + 1 === hole.position.y &&
                    selectedHole.position.y - 1 === hole.position.y) // Down

                ) {
                    pegToRemove = hole;
                }

            });

            if (!pegToRemove) {
                return;
            }

            let isValid = valid.find((hole: Hole) => (hole === selectedHole));

            if (!isValid) {
                return;
            }

            pegToRemove.removePeg();
            selectedPeg.removePeg();
            selectedHole.setPeg();

            selectedPeg = null;
            selectedHole = null;
            valid.splice(0, valid.length);
        }
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