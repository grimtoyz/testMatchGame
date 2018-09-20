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
        this.loadAssets();
    }

    loadAssets(){
        PIXI.loader
            .add('./assets/assets.json')
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

        this._boardGenerator = new BoardGenerator(this._gameModel);
        this._gameModel.boardMap = this._boardGenerator.generateBoardWithoutAutoMatches();
        this._matchDetector = new MatchDetector(this._gameModel);
    }

    startGame(){
        this._gameView = new GameView(this._app.view, this._gameModel);

        this._gameView.createTiles();
        this._app.stage.addChild(this._gameView);

        screen.onorientationchange = this.resize.bind(this);
        window.onresize = this.resize.bind(this);
        this.resize();

        this._gameView.prepareField();
        this._gameView.fieldReady(this.onFieldReady.bind(this));
        this._gameView.onTileSwapAttempted(this.onTileSwapAttempted.bind(this));
        this._gameView.onSwapAnimationFinished(this.onTilesSwapped.bind(this));
        this._gameView.onSwapCancelAnimationFinished(this.onSwapCanceled.bind(this));
        this._gameView.onTileSinkingAnimComplete(this.onTilesSinkingComplete.bind(this));
    }

    onFieldReady(){
        this.setAllTilesToSwappable();
    }

    onTileSwapAttempted(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        this._gameView.enableSwipe(false);

        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = false;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = false;

        // let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
        // this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
        // this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;

        let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
        this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;

        let matches = this._matchDetector.detectMatchesAroundTile(tileGridPosX, tileGridPosY);
        let matchesNeighbour = this._matchDetector.detectMatchesAroundTile(neighbourGridPosX, neighbourGridPosY);

        if (matches.length > 0 || matchesNeighbour.length > 0){
            let tilesToDestroy = new Array();
            let i;
            for (i=0; i<matches.length; i++)
            {
                tilesToDestroy.push(matches[i]);
            }
            for (i=0; i<matchesNeighbour.length; i++)
            {
                tilesToDestroy.push(matchesNeighbour[i]);
            }

            for(i=0; i<tilesToDestroy.length; i++){
                let x = tilesToDestroy[i].x;
                let y = tilesToDestroy[i].y;
                this._gameModel.boardMap[x][y] = this._boardGenerator.generateRandomTileVO();
            }

            // this.destroyTiles();
            this._gameView.swapStart(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY, tilesToDestroy);
        }
        else
            this._gameView.swapCancel(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY);
    }

    onTilesSwapped(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY, tilesToDestroy){
        this._gameView.enableSwipe(true);

        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isNew = false;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isNew = false;

        // let i;
        // for (i=0; i<tilesToDestroy; i++)
        // {
        //     this._gameModel.boardMap[tilesToDestroy.gridPositionX][tilesToDestroy._gridPositionY].isSwappable = false;
        // }

        this._gameView.destroyTiles(tilesToDestroy);
    }

    // onTilesSwapped(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
    //     // let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
    //     // this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
    //     // this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;
    //     //
    //     // this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
    //     // this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;
    //
    //     let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
    //     this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
    //     this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;
    //
    //     this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
    //     this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;
    //
    //     let matches = this._matchDetector.detectMatchesAroundTile(tileGridPosX, tileGridPosY);
    //     let matchesNeighbour = this._matchDetector.detectMatchesAroundTile(neighbourGridPosX, neighbourGridPosY);
    //
    //     if (matches.length > 0 || matchesNeighbour.length > 0){
    //         this._gameView.swapStart(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY);
    //         this._gameView.destroyTiles(matches);
    //
    //         // let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
    //         // this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
    //         // this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;
    //         //
    //         // this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
    //         // this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;
    //     }
    //     else
    //         this._gameView.swapCancel();
    //
    //     console.log(this._gameModel.boardMap[tileGridPosX][tileGridPosY].index, this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].index);
    // }

    onSwapCanceled(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
        this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;

        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;
    }

    // destroyTiles(tilesToDestroy){
    //     let i;
    //     for(i=0; i<tilesToDestroy.length; i++){
    //         // tilesToDestroy[i]
    //         let x = tilesToDestroy[i].x;
    //         let y = tilesToDestroy[i].y;
    //         // this._gameModel.boardMap[x][y].isSwappable = false;
    //         // this._gameModel.boardMap[x][y].isNew = true;
    //         this._gameModel.boardMap[x][y] = this._boardGenerator.generateRandomTileVO();
    //         // console.log();
    //         // this._gameModel.boardMap[x][y].isSwappable = false;
    //         // console.log();
    //     }
    // }

    // onTilesDestroyed(tilesToDestroy){
    //     // let i;
    //     // for(i=0; i<tilesToDestroy.length; i++){
    //     //     // tilesToDestroy[i]
    //     //     let x = tilesToDestroy[i].x;
    //     //     let y = tilesToDestroy[i].y;
    //     //     this._gameModel.boardMap[x][y].isSwappable = false;
    //     //     this._gameModel.boardMap[x][y].isSwappable = false;
    //     //     this._gameModel.boardMap[x][y] = this._boardGenerator.generateRandomTileVO();
    //     //     console.log();
    //     //     // this._gameModel.boardMap[x][y].isSwappable = false;
    //     //     // console.log();
    //     // }
    //
    //     this._gameView.sinkTiles();
    //
    //     // this._gameView.dropNewTiles(tilesToDestroy);
    // }

    onTilesSinkingComplete(gridPosX, gridPosY, offsetY){
        // this._gameModel.boardMap[gridPosX][gridPosY] = this._gameModel.boardMap[gridPosX][gridPosY];
        this._gameModel.boardMap[gridPosX][gridPosY].isSwappable = true;
        this._gameModel.boardMap[gridPosX][gridPosY].isNew = false;

        this._gameModel.boardMap[gridPosX][gridPosY + offsetY] = this._gameModel.boardMap[gridPosX][gridPosY];
        // this._gameModel.boardMap[gridPosX][gridPosY + offsetY].isSwappable = true;
        // this._gameModel.boardMap[gridPosX][gridPosY + offsetY].isNew = false;
    }

    // getTilesToSink(destroyedTiles){
    //     // let c;
    //     let i;
    //     let r;
    //     let tilesToSink = new Array();
    //     for (i=0; i<destroyedTiles.length; i++){
    //         let x=destroyedTiles[i].x;
    //         let y=destroyedTiles[i].y;
    //
    //         for (r=destroyedTiles[i].y; r>=0; r--){
    //             if(!this._gameModel.boardMap[x][r].isNew){
    //                 this._gameModel.boardMap[x][r].isSwappable = false;
    //                 this._gameView.sinkTile(x, r, y);
    //             }
    //                 tilesToSink.push(this._gameModel.boardMap[x][r]);
    //         }
    //     }
    //     // for (c=0; c < this._gameModel.columnsTotal; c++){
    //     //     for (r=0; r < this._gameModel.rowsTotal; r++){
    //     //         this._gameModel.boardMap[c][r];
    //     //     }
    //     // }
    // }

    setAllTilesToSwappable(){
        let c;
        let r;
        for (c=0; c < this._gameModel.boardMap.length; c++){
            for (r=0; r < this._gameModel.boardMap[c].length; r++){
                this._gameModel.boardMap[c][r].isSwappable = true;
                this._gameModel.boardMap[c][r].isNew = false;
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