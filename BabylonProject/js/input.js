App.getCanvasMousePosition = function (event) {
    const canvas = App.engine ? App.engine.getRenderingCanvas() : document.getElementById("renderCanvas");
    if (!canvas) {
        return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
};

App.updateCrosshairPosition = function () {
    const crosshair = document.getElementById("crosshair");
    if (!crosshair) {
        return;
    }

    crosshair.style.left = App.mouse.x + "px";
    crosshair.style.top = App.mouse.y + "px";
};

App.bindKeyboardInput = function () {
    window.addEventListener("keydown", function (event) {
        App.keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", function (event) {
        App.keys[event.key.toLowerCase()] = false;
    });
};

App.bindMouseInput = function () {
    const canvas = document.getElementById("renderCanvas");
    if (!canvas) {
        return;
    }

    const setMousePosition = function (event) {
        const pos = App.getCanvasMousePosition(event);
        App.mouse.x = pos.x;
        App.mouse.y = pos.y;
        App.updateCrosshairPosition();
    };

    canvas.addEventListener("mousemove", function (event) {
        setMousePosition(event);
    });

    canvas.addEventListener("mousedown", function (event) {
        if (event.button !== 0) {
            return;
        }

        setMousePosition(event);
        App.mouse.down = true;
        App.mouse.justPressed = true;
    });

    window.addEventListener("mouseup", function (event) {
        if (event.button !== 0) {
            return;
        }

        App.mouse.down = false;
    });

    canvas.addEventListener("mouseleave", function () {
        App.mouse.down = false;
    });

    canvas.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });

    const centerX = canvas.clientWidth * 0.5;
    const centerY = canvas.clientHeight * 0.5;
    App.mouse.x = centerX;
    App.mouse.y = centerY;
    if (typeof App.mouse.justPressed !== "boolean") {
        App.mouse.justPressed = false;
    }
    App.updateCrosshairPosition();
};

window.addEventListener("DOMContentLoaded", function () {
    App.bindKeyboardInput();
    App.bindMouseInput();
});
