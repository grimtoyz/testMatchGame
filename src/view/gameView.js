'use strict';


import GameTile from "../components/gameTile";

import TweenMax from "gsap/TweenMax";
import SwipeHandler from "../components/swipeHandler";

export default class GameView extends PIXI.Container{

    constructor(appView, gameModel) {
        super();

        this._appView = appView;
        this._gameModel = gameModel;

        this.fillBackGround();
        this.createFieldBackground();

        let swipeHandler = new SwipeHandler(this, gameModel.swipeThresholdMin, gameModel.swipeThresholdMax);
        swipeHandler.onSwiped = this.onSwiped.bind(this);
    }

    fillBackGround() {
        this._backgroundContainer = new PIXI.Container();

        let bg = new PIXI.Sprite(
            PIXI.utils.TextureCache["background.png"]
        );
        this._backgroundContainer.addChild(bg);

        this.addChild(this._backgroundContainer);
    }

    createFieldBackground(){
        this._fieldContainer = new PIXI.Container();

        let slicedFrame = new PIXI.mesh.NineSlicePlane(PIXI.Texture.fromImage('frame.png'), 17, 17, 17, 17);
        this._fieldContainer.addChild(slicedFrame);

        let checkerContainer = new PIXI.Container();
        this.createCheckers(checkerContainer);

        slicedFrame.width = checkerContainer.width + 2*this.FIELD_PADDING;
        slicedFrame.height = checkerContainer.height + 2*this.FIELD_PADDING;

        checkerContainer.x += this.FIELD_PADDING;
        checkerContainer.y += this.FIELD_PADDING;
        this._fieldContainer.addChild(checkerContainer);

        this._fieldContainer.x = this._backgroundContainer.width/2 - this._fieldContainer.width/2;
        this._fieldContainer.y = this.FIELD_OFFSET_Y;

        this._tilesContainer = new PIXI.Container();
        this._tilesContainer.x += this.FIELD_PADDING;
        this._tilesContainer.y += this.FIELD_PADDING;
        this._fieldContainer.addChild(this._tilesContainer);

        this.addChild(this._fieldContainer);
        this._safeZoneWidth = this._fieldContainer.width;
    }

    createCheckers(container){
        let sprite;
        let c;
        let row;
        for (row=0; row < this._gameModel.rowsTotal; row++){
            for (c=0; c < this._gameModel.columnsTotal; c++){

                let shouldDraw = false;

                if (row % 2){
                    if (c % 2)
                        shouldDraw = true;
                }
                else
                {
                    if (!(c % 2))
                        shouldDraw = true;
                }

                if (shouldDraw){
                    sprite = new PIXI.Sprite(PIXI.Texture.fromImage('tileDark.png'));
                    sprite.x = c*sprite.width;
                    sprite.y = row*sprite.height;
                    container.addChild(sprite);
                }
            }
        }

        this._cellWidth = sprite.width;
        this._cellHeight = sprite.height;
    }

    createTiles(){
        this._tiles = new Array();
        let c;
        let r;
        for (c=0; c < this._gameModel.columnsTotal; c++){
            let column = new Array();
            for (r=0; r < this._gameModel.rowsTotal; r++){
                let index = this._gameModel.boardMap[c][r].index;
                let tile = new GameTile(index, c, r);

                tile.interactive = true;
                tile.on('pointerdown', this.onTileClicked.bind(this));


                tile.x = this._cellWidth * c;
                tile.y = this._cellHeight * r - this._gameModel._tileDropHeight;
                this._tilesContainer.addChild(tile);
                column.push(tile);
            }
            this._tiles.push(column);
        }
    }

    onTileClicked(event){
        this._lastTileClicked = event.currentTarget;
    }

    onSwiped(directionX, directionY){
        this.swapAttempt(this._lastTileClicked, directionX, directionY);
    }

    swapAttempt(tile, directionX, directionY){
        if (!this.isMoveLegit(tile, directionX, directionY))
            return;

        let neighbour = this.getNeighbour(tile, directionX, directionY);

        if (this.isTileSwappable(tile.gridPositionX, tile.gridPositionY) && this.isTileSwappable(neighbour.gridPositionX, neighbour.gridPositionY)){
            this.swapStart(tile, neighbour);
        }
    }

    isMoveLegit(tile, directionX, directionY){
        let targetPosX = tile.gridPositionX + directionX;
        let targetPosY = tile.gridPositionY + directionY;

        if (targetPosX < 0 || targetPosX > this._gameModel._gridWidth - 1)
            return false;

        if (targetPosY < 0 || targetPosY > this._gameModel._gridHeight - 1)
            return false;

        return true;
    }

    getNeighbour(tile, directionX, directionY){
        let gridPosX = tile.gridPositionX + directionX;
        let gridPosY = tile.gridPositionY + directionY;

        return this._tiles[gridPosX][gridPosY];
    }

    swapStart(tile, neighbour){
        let tilePosX = tile.gridPositionX;
        let tilePosY = tile.gridPositionY;
        let neighbourPosX = neighbour.gridPositionX;
        let neighbourPosY = neighbour.gridPositionY;

        let tileTemp = this._tiles[tilePosX][tilePosY];
        this._tiles[tilePosX][tilePosY] = this._tiles[neighbourPosX][neighbourPosY];
        this._tiles[neighbourPosX][neighbourPosY] = tileTemp;

        neighbour.gridPositionX = tilePosX;
        neighbour.gridPositionY = tilePosY;
        tile.gridPositionX = neighbourPosX;
        tile.gridPositionY = neighbourPosY;

        this.onTilesSwapStarted(tilePosX, tilePosY, neighbourPosX, neighbourPosY);

        TweenMax.to(
            tile, this._gameModel.swapDuration,
            {ease:Back.easeOut, x:neighbour.x, y:neighbour.y}
        );
        TweenMax.to(
            neighbour, this._gameModel.swapDuration,
            {ease:Back.easeOut, x:tile.x, y:tile.y,
                onCompleteParams: [tilePosX, tilePosY, neighbourPosX, neighbourPosY], onComplete: this.onTilesSwapped.bind(this)
            }
        );
    }

    onTilesSwapStarted(callback){
        this.onTilesSwapStarted = callback;
    }

    onTilesSwapped(callback){
        this.onTilesSwapped = callback;
    }

    swapCancel(){

    }

    isTileSwappable(gridPosX, gridPosY){
        return (this._gameModel.boardMap[gridPosX][gridPosY].isSwappable);
    }

    prepareField(){
        let c;
        let r;

        this._activeDropTweensAmount = 0;
        // this._droppedTileVOs = new Array();

        for (c=0; c < this._gameModel.columnsTotal; c++){
            for (r=0; r < this._gameModel.rowsTotal; r++){
                // this._droppedTileVOs.push(this._gameModel.boardMap[c][r]);
                this._activeDropTweensAmount ++;
                TweenMax.to(
                    this._tiles[c][r], this._gameModel.tileDropDuration,
                    {ease:Bounce.easeOut, delay:(c + r)*this._gameModel.tileDropDelay, y:this._tiles[c][r].y + this._gameModel.tileDropHeight,
                        onComplete: this.onAllTweensCompleted.bind(this)}
                    );
            }
        }
    }

    onAllTweensCompleted(){
        this._activeDropTweensAmount --;
        if (this._activeDropTweensAmount == 0)
            this.fieldReady();
    }

    fieldReady(callback){
        this.fieldReady = callback;
    }

    dropNewTiles(tileToDropPositions){
        let c;
        let r;

        this._activeDropTweensAmount = 0;
        this._droppedTileVOs = new Array();

        // for (c=0; c < this._gameModel.columnsTotal; c++){
        //     for (r=0; r < this._gameModel.rowsTotal; r++){
        //         if (this._gameModel.boardMap[c][r].isNew){
        //             this._droppedTileVOs.push(this._gameModel.boardMap[c][r]);
        //             this._activeDropTweensAmount ++;
        //             TweenMax.to(
        //                 this._tiles[c][r], this._gameModel.tileDropDuration,
        //                 {ease:Bounce.easeOut, delay:(c + r)*this._gameModel.tileDropDelay, y:this._tiles[c][r].y + this._gameModel.tileDropHeight,
        //                     onComplete: this.onTweenCompleted.bind(this)}
        //                 );
        //         }
        //     }
        // }

        let i;
        for (i=0; i < tileToDropPositions.length; i++){
            let position = tileToDropPositions[i];
            this._droppedTileVOs.push(position);

            this._activeDropTweensAmount ++;
            TweenMax.to(
                this._tiles[position.x][position.y], this._gameModel.tileDropDuration,
                {ease:Bounce.easeOut, delay:i*this._gameModel.tileDropDelay, y:this._tiles[vo.gridPositionX][vo.gridPositionY].y + this._gameModel.tileDropHeight,
                    onComplete: this.onTweenCompleted.bind(this)}
            );
        }
    }

    onTweenCompleted(){
        this._activeDropTweensAmount --;
        if (this._activeDropTweensAmount == 0)
            alert("complete");
    }

    tilesDropped(){

    }

    // createTileColumn(rowsTotal, boae){
    //     for (r=0; r < rowsTotal; r++){
    //         let index = ;
    //         let tile = new GameTile(index);
    //         this._fieldContainer.addChild(tile);
    //     }
    // }

    onResize(ratio){
        // this._appView.renderer.resize(window.innerWidth, window.innerHeight);
        // this._backgroundContainer.width = this._appView.width;
        // this._backgroundContainer.height = this._appView.height;
        let screenWidth = this._appView.width;
        let screenHeight = this._appView.height;

        var imageRatio = 1280 / 1080;
        var screenRatio = screenWidth / screenHeight;
        let scale;
        if(screenRatio >= imageRatio) {
            // scale = screenHeight / this._backgroundContainer.height;
            scale = screenWidth / 1280;
            // imageSprite.height = imageSprite.height / (imageSprite.width / containerWidth);
            // imageSprite.width = containerWidth;
            // imageSprite.position.x = 0;
            // imageSprite.position.y = (containerHeight - imageSprite.height) / 2;
        }else{
            // imageSprite.width = imageSprite.width / (imageSprite.height / containerHeight);
            // imageSprite.height = containerHeight;
            // imageSprite.position.y = 0;
            // imageSprite.position.x = (containerWidth - imageSprite.width) / 2;
            scale = screenHeight / 1080;
            // scale = screenWidth / this._backgroundContainer.width;
        }

        scale = screenRatio > 1 ? this._appView.renderer.height/500 : this._appView.renderer.width/500;

        // this._backgroundContainer.scale.x = this._backgroundContainer.scale.y = scale/ratio;
        this.fieldContainer.scale.x = this.fieldContainer.scale.y = scale;
    }

    get FIELD_PADDING(){
        return 10;
    }

    get FIELD_OFFSET_Y(){
        return 20;
    }

    get safeZoneWidth(){
        return this._safeZoneWidth;
    }
}