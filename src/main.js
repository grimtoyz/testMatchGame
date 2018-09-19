'use strict';


import * as PIXI from 'pixi.js';
import Controller from "./controller/controller";

const app = new PIXI.Application({
    autoResize: true,
    resolution: devicePixelRatio
});

document.body.appendChild(app.view);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoDensityW = true;

let gameController = new Controller(app);

