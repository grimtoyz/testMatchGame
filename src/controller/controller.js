'use strict';


import GameView from "../view/gameView";
import * as PIXI from "pixi.js";
import BoardGenerator from "../components/boardGenerator";
import GameModel from "../model/gameModel";
import JSONLoader from "../utils/JSONLoader";
import MatchDetector from "../components/matchDetector";

export default class Controller {

    constructor(app) {
        this._app = app;

        // screen.onorientationchange = this.resize.bind(this);
        // window.onresize = this.resize.bind(this);
        // this.resize();


        this.loadAssets();
    }

    loadAssets(){
        PIXI.loader
            .add('./assets/assets.json')
            // .onError.add(this.onError)
            .load(this.init.bind(this));
    }

    init() {
        let promise = new Promise(this.loadConfig);
        promise.then(this.setup.bind(this));
        promise.then(this.startGame.bind(this));
    }

    loadConfig(resolve, reject) {
        let jsonLoader = new JSONLoader();
        jsonLoader.onLoaded(function(configObject) {
            resolve(configObject);
        });
        jsonLoader.load(GameModel.CONFIG_URL);
    }

    setup(configObject){
        this._gameModel = new GameModel(configObject);

        let boardGenerator = new BoardGenerator(this._gameModel);

        this._gameModel.boardMap = boardGenerator.generateBoardWithoutAutoMatches();
        // this._matchDetector = new MatchDetector(this._gameModel);



        // this._gameModel.tileSwappableMap = boardGenerator.generateNonSwappableMap();
    }

    startGame(){
        this._gameView = new GameView(this._app.view, this._gameModel);
        // this._gameView.swapAttempt(this.onSwapAttempt.bind(this));

        this._gameView.createTiles();
        this._app.stage.addChild(this._gameView);

        screen.onorientationchange = this.resize.bind(this);
        window.onresize = this.resize.bind(this);
        this.resize();

        // this._matchDetector = new MatchDetector(this._gameModel);

        this._gameView.prepareField();
        this._gameView.fieldReady(this.onFieldReady.bind(this));
        this._gameView.onTilesSwapStarted(this.onTilesSwapStarted.bind(this));
        this._gameView.onTilesSwapped(this.onTilesSwapped.bind(this));
        // this._gameView.dropNewTiles(this._gameModel.allTileGridPositions);
    }

    onFieldReady(){
        this.setAllTilesToSwappable();
    }

    onTilesSwapStarted(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = false;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = false;
    }

    onTilesSwapped(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];

        console.log(this._gameModel.boardMap[tileGridPosX][tileGridPosY].index, this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].index);

        this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
        // this._gameModel.boardMap[tileGridPosX][tileGridPosY].gridPositionX = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].gridPositionX;
        // this._gameModel.boardMap[tileGridPosX][tileGridPosY].gridPositionY = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].gridPositionY;

        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;
        // this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].gridPositionX = tile.gridPositionX;
        // this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].gridPositionY = tile.gridPositionY;

        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;

        console.log(this._gameModel.boardMap[tileGridPosX][tileGridPosY].index, this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].index);
    }

    // onSwapAttempt(tile, directionX, directionY){
    //     if (this.canBeSwapped(tile.gridPositionX, tile.gridPositionY)){
    //         console.log("");
    //     }
    // }
    //
    // canBeSwapped(gridPosX, gridPosY){
    //     return (this._gameModel.boardMap[gridPosX][gridPosY].isSwappable);
    // }

    setAllTilesToSwappable(){
        let c;
        let r;
        for (c=0; c < this._gameModel.boardMap.length; c++){
            for (r=0; r < this._gameModel.boardMap[c].length; r++){
                this._gameModel.boardMap[c][r].isSwappable = true;
            }
        }
    }

    resize(){
        this._app.renderer.resize(window.innerWidth, window.innerHeight);
        // var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        // var iwidth = (iOS) ? screen.width : window.innerWidth, iheight = (iOS) ? screen.height : window.innerHeight;

        let ratio = window.innerWidth / 1280;
        // if (window.innerWidth < this._gameView.safeZoneWidth)
        //     ratio = window.innerWidth / 1280;
        // ratio = window.innerWidth / 1280;
            // this._app.stage.scale.x = this._app.stage.scale.y = ratio;


        // if (window.innerWidth > 1280)
        //     ratio = window.innerWidth / 1280;
            // this._app.stage.scale.x = this._app.stage.scale.y = ratio;

        this._app.stage.scale.x = this._app.stage.scale.y = ratio;

        this._app.renderer.view.style.position = 'absolute';

        // this._app.renderer.view.style.left = 0;
        // this._app.renderer.view.style.top = 0;
        // this._app.renderer.view.style.left = ((window.innerWidth - this._app.renderer.width) >> 1) + 'px';

        // this._gameView.onResize(ratio);

        // alert(ratio);

    }

    // getAllTileVOs(){
    //     let allTileVOs = new Array();
    //     for
    // }

    get view(){
        return this._gameView;
    }
}