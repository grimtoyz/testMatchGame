'use strict';


export default class GameTile extends PIXI.Container{

    constructor(index, gridPositionX, gridPositionY) {
        super();

        this._gridPositionX = gridPositionX;
        this._gridPositionY = gridPositionY;

        this.init(index);
    }

    init(index){
        this._sprite = new PIXI.Sprite(PIXI.Texture.fromImage(`symbol0${index}.png`));
        this.addChild(this._sprite);
    }

    updateTexture(index){
        this._sprite.texture = PIXI.Texture.fromImage(`symbol0${index}.png`);
    }

    get gridPositionX(){
        return this._gridPositionX;
    };

    set gridPositionX(value){
        this._gridPositionX = value;
    }

    get gridPositionY(){
        return this._gridPositionY;
    };

    set gridPositionY(value){
        this._gridPositionY = value;
    }
}