'use strict';


import Point from "./point";

export default class MatchDetector{

    constructor(gameModel) {
        this._model = gameModel;
        this._board = gameModel.boardMap;
    }

    findAnyPotentialSwap(){
        for (let c = 0; c < this._model.boardMap.length - 2; c++)
        {
            for (let r = 0; r < this._model.boardMap[0].length - 2; r++)
            {
                if (this._model.boardMap[c][r].index === this._model.boardMap[c+1][r].index){
                    let combo = this.checkHorizontalLine(c, r, this._model.boardMap[c][r].index);
                    if (combo.length > 0){
                        combo.push(this._model.boardMap[c][r], this._model.boardMap[c+1][r]);
                        return combo;
                    }
                }

                if (this._model.boardMap[c][r].index === this._model.boardMap[c][r+1].index){
                    let combo = this.checkVerticalLine(c, r, this._model.boardMap[c][r].index);
                    if (combo.length > 0){
                        combo.push(this._model.boardMap[c][r], this._model.boardMap[c][r+1]);
                        return combo;
                    }
                }
            }
        }

        return [];
    }

    checkHorizontalLine(posX, posY, index)
    {
        let combo = [];

        if (posX > 0) {
            if (posY > 0) {
                if (this._model.boardMap[posX - 1][posY - 1].index === index) {
                    combo.push(this._model.boardMap[posX - 1][posY - 1]);
                    combo.push(this._model.boardMap[posX - 1][posY]);
                }
            }

            if (this._model.boardMap[posX - 1][posY + 1].index === index){
                combo.push(this._model.boardMap[posX - 1][posY + 1]);
                combo.push(this._model.boardMap[posX - 1][posY]);
            }
        }

        if (posY > 0){
            if (this._model.boardMap[posX + 2][posY - 1].index === index){
                combo.push(this._model.boardMap[posX + 2][posY - 1]);
                combo.push(this._model.boardMap[posX + 2][posY]);
            }
        }

        if (this._model.boardMap[posX + 2][posY + 1].index === index){
            combo.push(this._model.boardMap[posX + 2][posY + 1]);
            combo.push(this._model.boardMap[posX + 2][posY]);
        }

        return combo;
    }

    checkVerticalLine(posX, posY, index)
    {
        let combo = [];

        if (posY > 0) {
            if (posX > 0) {
                if (this._model.boardMap[posX - 1][posY - 1].index === index) {
                    combo.push(this._model.boardMap[posX - 1][posY - 1]);
                    combo.push(this._model.boardMap[posX][posY - 1]);
                }
            }

            if (this._model.boardMap[posX + 1][posY - 1].index === index){
                combo.push(this._model.boardMap[posX + 1][posY - 1]);
                combo.push(this._model.boardMap[posX][posY - 1]);
            }
        }

        if (posX > 0){
            if (this._model.boardMap[posX - 1][posY + 2].index === index){
                combo.push(this._model.boardMap[posX - 1][posY + 2]);
                combo.push(this._model.boardMap[posX][posY + 2]);
            }
        }

        if (this._model.boardMap[posX + 1][posY + 2].index === index){
            combo.push(this._model.boardMap[posX + 1][posY + 2]);
            combo.push(this._model.boardMap[posX][posY + 2]);
        }

        return combo;
    }

    detectMatchesAroundTile(posX, posY){
        let tilesToDestroy = [];

        let matchingTilesH = this.getMatchesH(posX, posY);
        let matchingTilesV = this.getMatchesV(posX, posY);

        let i;
        if (matchingTilesH.length + 1 >= 3){
            for (i=0; i < matchingTilesH.length; i++)
            {
                tilesToDestroy.push(matchingTilesH[i]);
            }
        }
        if (matchingTilesV.length + 1 >= 3){
            for (i=0; i < matchingTilesV.length; i++)
            {
                tilesToDestroy.push(matchingTilesV[i]);
            }
        }

        if (tilesToDestroy.length > 0)
            tilesToDestroy.push(new Point(posX, posY));

        return tilesToDestroy;
    }

    getMatchesH(posX, posY){
        let matches = [];

        let c = posX - 1;
        while (c >= 0 && this._board[c][posY].index === this._board[posX][posY].index && this._board[c][posY].isSwappable){
            let point = new Point(c, posY);
            matches.push(point);
            c--;
        }

        c = posX + 1;
        while (c < this._model.columnsTotal && this._board[c][posY].index === this._board[posX][posY].index && this._board[c][posY].isSwappable){
            let point = new Point(c, posY);
            matches.push(point);
            c++;
        }

        return (matches);
    }

    getMatchesV(posX, posY){
        let matches = [];

        let r = posY - 1;
        while (r >= 0 && this._board[posX][r].index === this._board[posX][posY].index && this._board[posX][r].isSwappable){
            let point = new Point(posX, r);
            matches.push(point);
            r--;
        }

        r = posY + 1;
        while (r < this._model.rowsTotal && this._board[posX][r].index === this._board[posX][posY].index && this._board[posX][r].isSwappable){
            let point = new Point(posX, r);
            matches.push(point);
            r++;
        }

        return (matches);
    }
}