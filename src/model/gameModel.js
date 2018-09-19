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

    // get allTileGridItems(){
    //     let gridPositions = new Array();
    //     let c;
    //     let r;
    //     for (c=0; c < this.boardMap.length; c++){
    //         for (r=0; r < this.boardMap[c].length; r++){
    //             let pos = {};
    //             pos.x = c;
    //             pos.y = r;
    //             gridPositions.push(pos);
    //         }
    //     }
    //
    //     return gridPositions;
    // }

    // get allTileGridPositions(){
    //     let gridPositions = new Array();
    //     let c;
    //     let r;
    //     for (c=0; c < this.boardMap.length; c++){
    //         for (r=0; r < this.boardMap[c].length; r++){
    //             let pos = {};
    //             pos.x = c;
    //             pos.y = r;
    //             gridPositions.push(pos);
    //         }
    //     }
    //
    //     return gridPositions;
    // }

    get TILE_TYPES_TOTAL(){
        return 6;
    }
}
