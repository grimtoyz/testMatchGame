'use strict';


export default class TileVO{

    constructor(tileTypeIndex) {
        this._index = tileTypeIndex;
        this._isNew = true;
        this._isSwappable = false;
        this._movementDelta = 0;
    }

    get index(){
        return this._index;
    }

    get isSwappable(){
        return this._isSwappable;
    }

    set isSwappable(value){
        this._isSwappable = value;
    }

    get isNew(){
        return this._isNew;
    }

    set isNew(value){
        this._isNew = value;
    }

    set movementDelta(value){
        this._movementDelta = value;
    }

    get movementDelta(){
        return this._movementDelta;
    }

    set gridPosX(value){
        this._gridPosX = value;
    }

    get gridPosX(){
        return this._gridPosX;
    }

    set gridPosY(value){
        this._gridPosY = value;
    }

    get gridPosY(){
        return this._gridPosY;
    }
}