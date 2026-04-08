window.addEventListener("keydown", event => {
    App.keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", event => {
    App.keys[event.key.toLowerCase()] = false;
});

App.canvas.addEventListener("mousemove", event => {
    const rect = App.canvas.getBoundingClientRect();
    App.mouse.x = event.clientX - rect.left;
    App.mouse.y = event.clientY - rect.top;
});

App.canvas.addEventListener("mousedown", event => {
    if (event.button === 0) {
        App.mouse.down = true;
    }
});

window.addEventListener("mouseup", event => {
    if (event.button === 0) {
        App.mouse.down = false;
    }
});

App.canvas.addEventListener("mouseleave", () => {
    App.mouse.down = false;
});

App.canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
});
