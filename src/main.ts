import './style.css';

((): void => {

    let canvas: HTMLCanvasElement;
    let resizeTimeoutId: number = 0;

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

    function init(): void {
        console.log("Init");
        canvas = <HTMLCanvasElement> document.getElementById('canvas');
        if (!canvas) {
            console.error('No canvas element found');
            return;
        }
        resize();
    }

    init();

    window.addEventListener('resize', () => {
        resize();
        clearTimeout(resizeTimeoutId);
        resizeTimeoutId = setTimeout(resized, 500);
    });

})();