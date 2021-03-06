'use strict';


export default class GameModel {

    constructor(configObject) {
        this._columnsTotal = configObject.columnsTotal;
        this._rowsTotal = configObject.rowsTotal;

        this._tileDropHeight = configObject.tileDropHeight;
        this._tileDropDuration = configObject.tileDropDuration;
        this._tileDropDelay = configObject.tileDropDelay;

        this._swipeThresholdMin = configObject.swipeThresholdMin;
        this._swipeThresholdMax = configObject.swipeThresholdMax;

        this._swapDuration = configObject.swapDuration;
    }

    static get CONFIG_URL() {
        return 'config.json';
    }

    get columnsTotal(){
        return this._columnsTotal;
    }

    get rowsTotal(){
        return this._rowsTotal;
    }

    get tileDropHeight(){
        return this._tileDropHeight;
    }

    get tileDropDuration(){
        return this._tileDropDuration;
    }

    get tileDropDelay(){
        return this._tileDropDelay;
    }

    get newTileDropDelay(){
        return this._tileDropDelay;
    }

    get swipeThresholdMin(){
        return this._swipeThresholdMin;
    }

    get swipeThresholdMax(){
        return this._swipeThresholdMax;
    }

    get swapDuration(){
        return this._swapDuration;
    }

    get boardMap(){
        return this._boardMap;
    }

    set boardMap(boardMap){
        this._boardMap = boardMap;
    }

    get TILE_TYPES_TOTAL(){
        return 6;
    }

    get BACKGROUND_WIDTH(){
        return 1280;
    }

    get BACKGROUND_HEIGHT(){
        return 1024;
    }

    get APP_STORE_URL(){
        return 'https://itunes.apple.com/us/app/fruit-link-match-3-free-game/id1128834660?mt=8'
    }
}
