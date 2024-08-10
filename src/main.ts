import './style.css';
import Color from "./Color.ts";

// Game
((): void => {

    // Canvas / Screen
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let resizeTimeoutId: number = 0;

    // Renderer
    let animationFrameId: number = 0;

    function draw(): void {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = Color.WHITE;
        ctx.fill();
        ctx.closePath();

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