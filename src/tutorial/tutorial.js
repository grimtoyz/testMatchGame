'use strict';


import TweenMax from "gsap/TweenMax";

export default class Tutorial extends PIXI.Container{

    constructor(width, height, gameView, gameModel, combo){
        super();

        this._width = width;
        this._height = height;

        this._cellWidth = gameView.cellWidth;
        this._cellHeight = gameView.cellHeight;

        this._gameView = gameView;
        this._gameModel = gameModel;

        this._field = gameView.fieldContainer;

        this._combo = combo;
        this.interactive = true;

        this._isCompleted = false;
    }

    show(){
        this.createOverlay();
    }

    swapComplete(){
        if (!this._isCompleted){
            this._isCompleted = true;

            this.onTaskCompleted();
        }
    }

    onTaskCompleted(callback){
        this.onTaskCompleted = callback;
    }

    createOverlay(){
        this._overlay = new PIXI.Graphics();

        this._overlay.beginFill(0x24363d);
        this._overlay.alpha = 0.7;

        this._overlay.drawRect(0, 0, this._width, this._height);
        let mask = this.createMask();
        this._overlay.addChild(mask);
        this._overlay.mask = mask;

        this.addChild(this._overlay);
    }

    createMask(){
        let mask = new PIXI.Graphics();

        mask.beginFill();

        let fieldHeight = this._gameModel.rowsTotal * this._cellHeight + this._gameView.FIELD_OFFSET_Y;

        mask.drawRect(0, 0, this._width, this._field.y + this._gameView.FIELD_PADDING);
        mask.drawRect(0, this._field.y, this._field.x + this._gameView.FIELD_PADDING, fieldHeight);
        mask.drawRect(this._field.x + this._field.width - this._gameView.FIELD_PADDING, this._field.y, this._field.x + this._gameView.FIELD_PADDING, fieldHeight);
        mask.drawRect(0, this._field.y + fieldHeight - this._gameView.FIELD_PADDING, this._width, this._height - this._field.y - fieldHeight);

        let maskRects = [];
        for (let c = 0; c < this._gameModel.columnsTotal; c++){
            for (let r = 0; r < this._gameModel.rowsTotal; r++){
                maskRects.push(this._gameModel.boardMap[c][r]);
                // if (!this._combo.includes(this._gameModel.boardMap[c][r]))
                //     mask.drawRect(this._field.x + this._gameView.FIELD_PADDING + this._gameModel.boardMap[c][r].gridPosX * this._cellWidth, this._gameView.FIELD_PADDING + this._field.y + this._gameModel.boardMap[c][r].gridPosY * this._cellHeight, this._cellWidth, this._cellHeight);
            }
        }

        maskRects.forEach(function (vo) {
            let isMasked = true;
            for(let i = 0; i < this._combo.length; i++){
                if (vo.gridPosX === this._combo[i].gridPosX && vo.gridPosY === this._combo[i].gridPosY)
                    isMasked = false;
            }

            if (isMasked)
                mask.drawRect(this._field.x + this._gameView.FIELD_PADDING + vo.gridPosX * this._cellWidth, this._gameView.FIELD_PADDING + this._field.y + vo.gridPosY * this._cellHeight, this._cellWidth, this._cellHeight);

        }.bind(this));

        mask.endFill();

        return mask;
    }

    hide(){
        TweenMax.to(
            this._overlay, 1,
            {   alpha:0,
                onComplete: this.onTweenComplete.bind(this)}
        );
    };

    onTweenComplete(){
        this.removeChild(this._overlay);
    }

    // resize(){
    //     this._overlay.width = this._appView.renderer.width;
    // }
}