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

       this._swipeHandler = new SwipeHandler(this, gameModel.swipeThresholdMin, gameModel.swipeThresholdMax);
       this._swipeHandler.onSwiped = this.onSwiped.bind(this);

       this._activeNewTileDropTweens = 0;
    }

    allowSwipe(value){
        this._swipeHandler.allowSwipe = value;
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
        for (let row = 0; row < this._gameModel.rowsTotal; row++){
            for (let c = 0; c < this._gameModel.columnsTotal; c++){

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

        for (let c = 0; c < this._gameModel.columnsTotal; c++){
            let column = new Array();

            for (let r = 0; r < this._gameModel.rowsTotal; r++){
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

    createLink(){
        this.element = document.createElement('a');
        this.element.target = '_blank';

        this.element.href = this._gameModel.APP_STORE_URL;

        let linkText = new PIXI.Text('Tap to open Apple Store', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 25,
            fontWeight: 'bold',
            fill: ['#ffffff'],
            dropShadow: true,
            dropShadowColor: '#044335',
            dropShadowBlur: 1,
            dropShadowDistance: 1,
            strokeThickness: 4,
        }));

        linkText.anchor.x = 0.5;
        linkText.x = this._backgroundContainer.width/2;
        linkText.y = this._fieldContainer.y + 500;
        linkText.interactive = true;
        linkText.on('pointerdown', this.onLinkClick.bind(this));

        this.addChild(linkText);

    }

    onLinkClick(){
        let e = window.document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        this.element.dispatchEvent(e);

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

        if (this.isTileSwappable(tile.gridPositionX, tile.gridPositionY) && this.isTileSwappable(neighbour.gridPositionX, neighbour.gridPositionY))
            this.onTileSwapAttempted(tile.gridPositionX, tile.gridPositionY, neighbour.gridPositionX, neighbour.gridPositionY);
    }

    isMoveLegit(tile, directionX, directionY){
        let targetPosX = tile.gridPositionX + directionX;
        let targetPosY = tile.gridPositionY + directionY;

        if (targetPosX < 0 || targetPosX > this._gameModel.columnsTotal - 1)
            return false;

        if (targetPosY < 0 || targetPosY > this._gameModel.rowsTotal - 1)
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

        this.swapTilesData(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY);

        TweenMax.to(
            tile, this._gameModel.swapDuration,
            {ease:Back.easeOut, x:neighbour.x, y:neighbour.y}
        );
        TweenMax.to(
            neighbour, this._gameModel.swapDuration,
            {ease:Back.easeOut, x:tile.x, y:tile.y,
                onCompleteParams:[tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY, tilesToDestroy, tilesToDestroy], onComplete: this.onSwapAnimationFinished.bind(this)
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
        this._activeTileDestroyedTweens = 0;

        for (let i = 0; i < tilesToDestroy.length; i++)
        {
            let tileGridPosX = tilesToDestroy[i].x;
            let tileGridPosY = tilesToDestroy[i].y;

            this._activeTileDestroyedTweens ++;

            TweenMax.to(
                this._tiles[tileGridPosX][tileGridPosY], this.TILE_FADE_OUT_DURATION,
                {ease:Bounce.easeIn, alpha:0,
                onComplete: this.checkIfAllTilesDestroyed.bind(this)}
            );
        }
    }

    checkIfAllTilesDestroyed(){
        this._activeTileDestroyedTweens --;

        if (this._activeTileDestroyedTweens <= 0)
            this.onAllTilesDestroyed();
    }

    onAllTilesDestroyed(callback){
        this.onAllTilesDestroyed = callback;
    }

    sinkTiles(tilesToSink){
        this._activeTileSinkingTweens = 0;

        tilesToSink.forEach(function (tileVO) {
            this._activeTileSinkingTweens ++;

            let posDeltaY = tileVO.movementDelta;
            let tile = this._tiles[tileVO.gridPosX][tileVO.gridPosY - posDeltaY];

            if (tileVO.isNew){
                tile.alpha = 1;
                tile.updateTexture(this._gameModel.boardMap[tile.gridPositionX][tile.gridPositionY + posDeltaY].index);

                posDeltaY = this._gameModel.rowsTotal;
                tile.y = tileVO.gridPosY * this._cellHeight - posDeltaY * this._cellHeight;

                TweenMax.to(
                    tile, this._gameModel.tileDropDuration,
                    {ease:Back.easeOut, y:tile.y + posDeltaY * this._cellHeight,
                        onCompleteParams: [tile, tileVO.movementDelta],
                        onComplete: this.onTileSank.bind(this)
                    }
                );
            }
            else
                TweenMax.to(
                    tile, this._gameModel.tileDropDuration,
                    {ease:Back.easeOut, y:tile.y + posDeltaY*this._cellHeight,
                        onCompleteParams: [tile, posDeltaY],
                        onComplete: this.onTileSank.bind(this)
                    }
                );
        }.bind(this));
    }

    onTileSank(tile, posDeltaY){
        this._tiles[tile.gridPositionX][tile.gridPositionY + posDeltaY] = tile;
        this._tiles[tile.gridPositionX][tile.gridPositionY + posDeltaY].gridPositionY += posDeltaY;

        this._activeTileSinkingTweens --;

        this.onTileSinkingAnimComplete(tile.gridPositionX, tile.gridPositionY);

        if (this._activeTileSinkingTweens <= 0)
            this.onAllTilesSinkingComplete();
    }

    onTileSinkingAnimComplete(callback){
        this.onTileSinkingAnimComplete = callback;
    }

    onAllTilesSinkingComplete(callback){
        this.onAllTilesSinkingComplete = callback;
    }

    prepareField(){
        let c;
        let r;

        this._activeDropTweensAmount = 0;

        for (c=0; c < this._gameModel.columnsTotal; c++){
            for (r=0; r < this._gameModel.rowsTotal; r++){
                this._activeDropTweensAmount ++;
                TweenMax.to(
                    this._tiles[c][r], this._gameModel.tileDropDuration,
                    {ease:Bounce.easeOut, delay:(c + r)*this._gameModel.tileDropDelay, y:this._tiles[c][r].y + this._gameModel.tileDropHeight,
                        onComplete: this.onAllTweensCompleted.bind(this)}
                    );
            }
        }
    }

    swapTilesData(tileGridPosX, tileGridPosY, neighbourGridPosX, neighbourGridPosY){
        let tileTemp = this._tiles[tileGridPosX][tileGridPosY];
        this._tiles[tileGridPosX][tileGridPosY] = this._tiles[neighbourGridPosX][neighbourGridPosY];
        this._tiles[neighbourGridPosX][neighbourGridPosY] = tileTemp;

        this._tiles[tileGridPosX][tileGridPosY].gridPositionX = tileGridPosX;
        this._tiles[tileGridPosX][tileGridPosY].gridPositionY = tileGridPosY;

        this._tiles[neighbourGridPosX][neighbourGridPosY].gridPositionX = neighbourGridPosX;
        this._tiles[neighbourGridPosX][neighbourGridPosY].gridPositionY = neighbourGridPosY;
    }

    onAllTweensCompleted(){
        this._activeDropTweensAmount --;
        if (this._activeDropTweensAmount == 0)
            this.fieldReady();
    }

    fieldReady(callback){
        this.fieldReady = callback;
    }

    dropNewTile(newTileVO){
        let tile = this._tiles[newTileVO.gridPosX][newTileVO.gridPosY];
        tile.y -= this._gameModel.tileDropHeight;

        tile.updateTexture(this._gameModel.boardMap[tile.gridPositionX][tile.gridPositionY].index);

        tile.alpha = 1;

        this._activeNewTileDropTweens ++;

        TweenMax.to(
            tile, this._gameModel.tileDropDuration * 2,
            {ease:Back.easeOut.config(1), delay:this._gameModel.newTileDropDelay, y:newTileVO.gridPosY * this._cellHeight,
            onCompleteParams: [newTileVO],
            onComplete: this.onNewTileDropped.bind(this)}
        );
    }

    // checkIfAllTilesDropped(newTileVO){
    //     this.onNewTileDropped(newTileVO);
    //
    //     this._activeNewTileDropTweens --;
    //     if (this._activeNewTileDropTweens == 0)
    //         this.onAllTilesDropped();
    // }

    onNewTileDropped(callback){
        this.onNewTileDropped = callback;
    }

    onAllTilesDropped(callback){
        this.onAllTilesDropped = callback;
    }

    // onTweenCompleted(){
    //     this._activeDropTweensAmount --;
    //     if (this._activeDropTweensAmount == 0)
    //         alert("complete");
    // }

    tilesDropped(){

    }

    // createTileColumn(rowsTotal, boae){
    //     for (r=0; r < rowsTotal; r++){
    //         let index = ;
    //         let tile = new GameTile(index);
    //         this._fieldContainer.addChild(tile);
    //     }
    // }

    // onResize(ratio){
    //     // this._appView.renderer.resize(window.innerWidth, window.innerHeight);
    //     // this._backgroundContainer.width = this._appView.width;
    //     // this._backgroundContainer.height = this._appView.height;
    //     let screenWidth = this._appView.width;
    //     let screenHeight = this._appView.height;
    //
    //     var imageRatio = 1280 / 1080;
    //     var screenRatio = screenWidth / screenHeight;
    //     let scale;
    //     if(screenRatio >= imageRatio) {
    //         // scale = screenHeight / this._backgroundContainer.height;
    //         scale = screenWidth / 1280;
    //         // imageSprite.height = imageSprite.height / (imageSprite.width / containerWidth);
    //         // imageSprite.width = containerWidth;
    //         // imageSprite.position.x = 0;
    //         // imageSprite.position.y = (containerHeight - imageSprite.height) / 2;
    //     }else{
    //         // imageSprite.width = imageSprite.width / (imageSprite.height / containerHeight);
    //         // imageSprite.height = containerHeight;
    //         // imageSprite.position.y = 0;
    //         // imageSprite.position.x = (containerWidth - imageSprite.width) / 2;
    //         scale = screenHeight / 1080;
    //         // scale = screenWidth / this._backgroundContainer.width;
    //     }
    //
    //     scale = screenRatio > 1 ? this._appView.renderer.height/500 : this._appView.renderer.width/500;
    //
    //     // this._backgroundContainer.scale.x = this._backgroundContainer.scale.y = scale/ratio;
    //     this.fieldContainer.scale.x = this.fieldContainer.scale.y = scale;
    // }

    get cellWidth(){
        return this._cellWidth;
    }

    get cellHeight(){
        return this._cellHeight;
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

    get fieldContainer(){
        return this._fieldContainer;
    }
}