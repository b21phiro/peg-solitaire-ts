import './style.css';

// Game
((): void => {

    // Canvas / Screen
    let canvas: HTMLCanvasElement;
    let resizeTimeoutId: number = 0;

    // Renderer
    let animationFrameId: number = 0;

    // Constructor of the game.
    function init(): void {
        console.log("Init");
        canvas = <HTMLCanvasElement> document.getElementById('canvas');
        if (!canvas) {
            console.error('No canvas element found');
            return;
        }
        resize();
    }

    // Game loop
    function loop(timestamp: number): void {
        console.log(timestamp);
        if (animationFrameId) {
            window.requestAnimationFrame(loop);
        }
    }

    // During resizing of the screen.
    function resize(): void {
        console.log("Is resizing");
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
    }

    function start(): void {
        console.log("Start");
        animationFrameId = window.requestAnimationFrame(loop);
    }

    function stop(): void {
        console.log("Stop");
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