'use strict';


export default class TileVO{

    constructor(tileTypeIndex) {
        this._index = tileTypeIndex;
        this._isNew = true;
        this._isSwappable = false;
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
}