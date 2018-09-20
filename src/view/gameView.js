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
            // this.swapStart(tile, neighbour);
            this.onTileSwapAttempted(tile.gridPositionX, tile.gridPositionY, neighbour.gridPositionX, neighbour.gridPositionY);
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

    swapCancel(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        let tile = this._tiles[tileGridPosX][tileGridPosY];
        let neighbour = this._tiles[neighbourGridPosX][neighbourGridPosY];

        TweenMax.to(
            tile, this._gameModel.swapDuration/2,
            {ease:Back.easeOut, x:neighbour.x, y:neighbour.y}
        );
        TweenMax.to(
            neighbour, this._gameModel.swapDuration/2,
            {ease:Back.easeOut, x:tile.x, y:tile.y,
                onCompleteParams: [tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY], onComplete: this.onSwapCancelForwardAnimationFinished.bind(this)
            }
        );
    }

    onSwapCancelForwardAnimationFinished(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        let tile = this._tiles[tileGridPosX][tileGridPosY];
        let neighbour = this._tiles[neighbourGridPosX][neighbourGridPosY];

        TweenMax.to(
            tile, this._gameModel.swapDuration/2,
            {ease:Back.easeOut, x:neighbour.x, y:neighbour.y}
        );
        TweenMax.to(
            neighbour, this._gameModel.swapDuration/2,
            {ease:Back.easeOut, x:tile.x, y:tile.y,
                onCompleteParams: [tile.gridPositionX, tile.gridPositionY, neighbour.gridPositionX, neighbour.gridPositionY], onComplete: this.onSwapCancelAnimationFinished.bind(this)
            }
        );
    }

    onSwapCancelAnimationFinished(callback){
        this.onSwapCancelAnimationFinished = callback;
    }

    swapStart(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY, tilesToDestroy){
        let tile = this._tiles[tileGridPosX][tileGridPosY];
        let neighbour = this._tiles[neighbourGridPosX][neighbourGridPosY];

        let tileTemp = this._tiles[tileGridPosX][tileGridPosY];
        this._tiles[tileGridPosX][tileGridPosY] = this._tiles[neighbourGridPosX][neighbourGridPosY];
        this._tiles[neighbourGridPosX][neighbourGridPosY] = tileTemp;

        // this._tiles[neighbourGridPosX][neighbourGridPosY].gridPositionX = tileGridPosX;
        // this._tiles[neighbourGridPosX][neighbourGridPosY].gridPositionY = tileGridPosY;
        // this._tiles[tileGridPosX][tileGridPosY].gridPositionX = neighbourGridPosX;
        // this._tiles[tileGridPosX][tileGridPosY].gridPositionY = neighbourGridPosY;

        TweenMax.to(
            tile, this._gameModel.swapDuration,
            {ease:Back.easeOut, x:neighbour.x, y:neighbour.y}
        );
        TweenMax.to(
            neighbour, this._gameModel.swapDuration,
            {ease:Back.easeOut, x:tile.x, y:tile.y,
                onCompleteParams:[tilesToDestroy], onComplete: this.onSwapAnimationFinished.bind(this)
            }
        );
    }

    onSwapAnimationFinished(callback){
        this.onSwapAnimationFinished = callback;
    }

    onTileSwapAttempted(callback){
        this.onTileSwapAttempted = callback;
    }

    isTileSwappable(gridPosX, gridPosY){
        return (this._gameModel.boardMap[gridPosX][gridPosY].isSwappable);
    }

    destroyTiles(tilesToDestroy){
        let i;

        this._activeDestroyTweens = 0;
        for (i=0; i<tilesToDestroy.length; i++)
        {
            let tileGridPosX = tilesToDestroy[i].x;
            let tileGridPosY = tilesToDestroy[i].y;

            let topTiles = new Array();
            let offsetY = this._cellHeight;
            let r = tileGridPosY - 1;
            while (r>=0){
                let topTile = this._tiles[tileGridPosX][r];
                if (!this._gameModel.boardMap[tileGridPosX][r].isNew)
                    topTiles.push(topTile);
                else
                    break;

                r--;
            }

            r = tileGridPosY + 1;
            while (r < this._gameModel.rowsTotal){
                if (this._gameModel.boardMap[tileGridPosX][r].isNew)
                    offsetY += this._cellHeight;

                r++;
            }

            this._activeDestroyTweens ++;
            TweenMax.to(
                this._tiles[tileGridPosX][tileGridPosY], this.TILE_FADE_OUT_DURATION,
                {ease:Bounce.easeIn, alpha:0,
                onCompleteParams:[tilesToDestroy, topTiles, offsetY], onComplete: this.onTilesDestroyed.bind(this)}
            );
        }
    }

    onTilesDestroyed(tilesToDestroy, topTiles, offsetY){
        this._activeDestroyTweens --;

        let i;
        for (i=0; i < topTiles.length; i++){
            TweenMax.to(
                topTiles[i], this._gameModel.swapDuration/2,
                {ease:Back.easeOut, y:topTiles[i].y + offsetY,
                    // onCompleteParams: [tile.gridPositionX, tile.gridPositionY, neighbour.gridPositionX, neighbour.gridPositionY],
                    onComplete: this.onTopTilesMovedDown.bind(this)
                }
            );
        }

        if (this._activeDestroyTweens == 0)
            this.tilesDestructionAnimationFinished(tilesToDestroy);
    }

    onTopTilesMovedDown(){

    }

    tilesDestructionAnimationFinished(callback){
        this.tilesDestructionAnimationFinished=callback;
    }

    sinkTile(){

    }

    sinkTiles(){

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
        // let c;
        // let r;
        // let i;
        // for (i=0; i<tileToDropPositions.length; i++){
        //
        // }
        // this._activeDropTweensAmount = 0;
        // this._droppedTileVOs = new Array();

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
            // let position = tileToDropPositions[i];
            // this._droppedTileVOs.push(position);
            let c = tileToDropPositions[i].x;
            let r = tileToDropPositions[i].y;

            this._tiles[c][r].updateTexture(this._gameModel.boardMap[c][r].index);

            // this._activeDropTweensAmount ++;
            // TweenMax.to(
            //     this._tiles[position.x][position.y], this._gameModel.tileDropDuration,
            //     {ease:Bounce.easeOut, delay:i*this._gameModel.tileDropDelay, y:this._tiles[vo.gridPositionX][vo.gridPositionY].y + this._gameModel.tileDropHeight,
            //         onComplete: this.onTweenCompleted.bind(this)}
            // );
            this._tiles[c][r].y -= this._gameModel.tileDropHeight;
            this._tiles[c][r].alpha = 1;

            TweenMax.to(
                this._tiles[c][r], this._gameModel.tileDropDuration,
                {ease:Bounce.easeOut, delay:i*this._gameModel.tileDropDelay, y:this._tiles[c][r].y + this._gameModel.tileDropHeight}//,
                    // onComplete: this.onAllTweensCompleted.bind(this)}
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

    get TILE_FADE_OUT_DURATION(){
        return 0.3;
    }
}