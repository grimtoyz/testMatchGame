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
        // this._gameView.onTileDestroyedAnimationComplete(this.onTileDestroyed.bind(this));
        this._gameView.onAllTilesDestroyed(this.onAllTilesDestroyed.bind(this));
        this._gameView.onSwapCancelAnimationFinished(this.onSwapCanceled.bind(this));
        this._gameView.onTileSinkingAnimComplete(this.onTileSinkingComplete.bind(this));
        this._gameView.onNewTileDropped(this.onNewTileDropped.bind(this));
        // this._gameView.onAllTilesDropped(this.onAllNewTilesDropped.bind(this));
    }

    onFieldReady(){
        this.setAllTilesToSwappable();
    }

    onTileSwapAttempted(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        this._gameView.allowSwipe(false);

        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = false;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = false;

        let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
        this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;

        let matches = this._matchDetector.detectMatchesAroundTile(tileGridPosX, tileGridPosY);
        let matchesNeighbour = this._matchDetector.detectMatchesAroundTile(neighbourGridPosX, neighbourGridPosY);

        if (matches.length > 0 || matchesNeighbour.length > 0){
            let tilesToDestroy = matches.concat(matchesNeighbour);

            this.moveColumns(tilesToDestroy);

            // for (let i = 0; i < tilesToDestroy.length; i++){
            //     let x = tilesToDestroy[i].x;
            //     let y = tilesToDestroy[i].y;
            //     this._gameModel.boardMap[x][y] = this._boardGenerator.generateRandomTileVO();
            // }
            //
            // for (let i=0; i < this._gameModel.columnsTotal; i++){
            //     this._gameModel.boardMap[i] = this._boardGenerator.moveDestroyedTilesToTop(this._gameModel.boardMap[i]);
            // }

            this._gameView.swapStart(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY, tilesToDestroy);
        }
        else
            this._gameView.swapCancel(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY);
    }

    moveColumns(tilesToDestroy){
        for (let i = 0; i < tilesToDestroy.length; i++){
            let x = tilesToDestroy[i].x;
            let y = tilesToDestroy[i].y;
            this._gameModel.boardMap[x][y] = this._boardGenerator.generateRandomTileVO();
        }

        for (let i=0; i < this._gameModel.columnsTotal; i++){
            this._gameModel.boardMap[i] = this._boardGenerator.moveDestroyedTilesToTop(this._gameModel.boardMap[i]);
        }
    }

    onTilesSwapped(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY, tilesToDestroy){
        // this._gameView.allowSwipe(true);

        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;

        this._gameView.destroyTiles(tilesToDestroy);
    }

    // onTileDestroyed(gridPosX, gridPosY){
    //     let tilesToSink = new Array();
    //
    //         for (let r = 0; r < this._gameModel.rowsTotal; r++){
    //             let tileVO = this._gameModel.boardMap[gridPosX][r];
    //
    //             if (tileVO.movementDelta !== 0 || tileVO.isNew){
    //                 tileVO.isSwappable = false;
    //                 tileVO.gridPosX = gridPosX;
    //                 tileVO.gridPosY = r;
    //                 tilesToSink.push(tileVO);
    //             }
    //         }
    //
    //     this._gameView.sinkTiles(tilesToSink);
    // }

    onAllTilesDestroyed(){
        let tilesToSink = [];

        for (let c=0; c < this._gameModel.columnsTotal; c++){
            for (let r = 0; r < this._gameModel.rowsTotal; r++){
                let tileVO = this._gameModel.boardMap[c][r];

                if (tileVO.movementDelta !== 0 || tileVO.isNew){
                    tileVO.isSwappable = false;
                    tileVO.gridPosX = c;
                    tileVO.gridPosY = r;
                    tilesToSink.push(tileVO);
                }
            }
        }

        this._gameView.sinkTiles(tilesToSink);
    }

    onSwapCanceled(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        this._gameView.allowSwipe(true);

        let tile = this._gameModel.boardMap[tileGridPosX][tileGridPosY];
        this._gameModel.boardMap[tileGridPosX][tileGridPosY] = this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY];
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY] = tile;

        this._gameModel.boardMap[tileGridPosX][tileGridPosY].isSwappable = true;
        this._gameModel.boardMap[neighbourGridPosX][neighbourGridPosY].isSwappable = true;
    }

    onTileSinkingComplete(gridPosX, gridPosY){
        this._gameModel.boardMap[gridPosX][gridPosY].isSwappable = true;
        this._gameModel.boardMap[gridPosX][gridPosY].isNew = false;

        let matches = this._matchDetector.detectMatchesAroundTile(gridPosX, gridPosY);
        if (matches.length > 0){
            this.moveColumns(matches);
            this._gameView.destroyTiles(matches);
        }
        else
            this._gameView.allowSwipe(true);
            // if (this._gameModel.boardMap[gridPosX][gridPosY].isNew){
            //     let newTileVO = this._gameModel.boardMap[gridPosX][gridPosY];
            //     // this._gameView.dropNewTile(newTileVO);
            // }
    }

    onNewTileDropped(newTileVO){
        this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY].isSwappable = true;
        this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY].isNew = false;



        let matches = this._matchDetector.detectMatchesAroundTile(newTileVO.gridPosX, newTileVO.gridPosY);
        if (matches.length > 0){
            this.moveColumns(matches);
            this._gameView.destroyTiles(matches);
        }
        else if (this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY].isNew){
            let newTileVO = this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY];
            this._gameView.dropNewTile(newTileVO);
        }
        else if (this.isGamefieldStatic) // 2DO - check if no matches
            this._gameView.allowSwipe(true);
    }

    // onAllNewTilesDropped(){
    //     // let c;
    //     // let r;
    //     for (let c=0; c < this._gameModel.boardMap.length; c++){
    //         for (let r=0; r < this._gameModel.boardMap[c].length; r++){
    //             if (this._gameModel.boardMap[c][r].isNew)
    //             {
    //                 this._gameModel.boardMap[c][r].isSwappable = true;
    //                 this._gameModel.boardMap[c][r].isNew = false;
    //             }
    //             // this._gameModel.boardMap[c][r].isSwappable = true;
    //             // this._gameModel.boardMap[c][r].isNew = false;
    //         }
    //     }
    //
    //     newTileVOs.forEach(function (newTileVO){
    //         let matches = this._matchDetector.detectMatchesAroundTile(newTileVO.gridPosX, newTileVO.gridPosY);
    //         if (matches.length > 0){
    //             this.moveColumns(matches);
    //             this._gameView.destroyTiles(matches);
    //         }
    //         else{
    //             if (this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY].isNew){
    //                 let newTileVO = this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY];
    //                 this._gameView.dropNewTile(newTileVO);
    //             }
    //         }
    //     });
    //     // let matches = this._matchDetector.detectMatchesAroundTile(newTileVO.gridPosX, newTileVO.gridPosY);
    //     // if (matches.length > 0){
    //     //     this.moveColumns(matches);
    //     //     this._gameView.destroyTiles(matches);
    //     // }
    //     // else{
    //     //     if (this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY].isNew){
    //     //         let newTileVO = this._gameModel.boardMap[newTileVO.gridPosX][newTileVO.gridPosY];
    //     //         this._gameView.dropNewTile(newTileVO);
    //     //     }
    //     // }
    // }

    // moveColumns(tilesToDestroy){
    //     for (let i = 0; i < tilesToDestroy.length; i++){
    //         let x = tilesToDestroy[i].x;
    //         let y = tilesToDestroy[i].y;
    //         this._gameModel.boardMap[x][y] = this._boardGenerator.generateRandomTileVO();
    //     }
    //
    //     for (let i=0; i < this._gameModel.columnsTotal; i++){
    //         this._gameModel.boardMap[i] = this._boardGenerator.moveDestroyedTilesToTop(this._gameModel.boardMap[i]);
    //     }
    // }

    setAllTilesToSwappable(){
        for (let c= 0; c < this._gameModel.boardMap.length; c++){
            for (let r = 0; r < this._gameModel.boardMap[c].length; r++){
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

    get isGamefieldStatic(){
        let isFieldStatic = true;

        for (let c= 0; c < this._gameModel.boardMap.length; c++){
            for (let r = 0; r < this._gameModel.boardMap[c].length; r++){
                if (!this._gameModel.boardMap[c][r].isSwappable || this._gameModel.boardMap[c][r].isNew === true)
                    isFieldStatic = false;
            }
        }

        return isFieldStatic;
    }

    get view(){
        return this._gameView;
    }
}