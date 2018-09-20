'use strict';


import Point from "./point";

export default class MatchDetector{

    constructor(gameModel) {
        this._model = gameModel;
        this._board = gameModel.boardMap;
    }

    detectMatchesAroundTile(posX, posY){
        let tilesToDestroy = new Array();

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
        let matches = new Array();

        let c=posX-1;
        while (c >= 0 && this._board[c][posY].index == this._board[posX][posY].index && this._board[c][posY].isSwappable){
            let point = new Point(c, posY);
            matches.push(point);
            c--;
        }
        c=posX+1;
        while (c < this._model.columnsTotal && this._board[c][posY].index == this._board[posX][posY].index && this._board[c][posY].isSwappable){
            let point = new Point(c, posY);
            matches.push(point);
            c++;
        }

        return (matches);
    }

    getMatchesV(posX, posY){
        let matches = new Array();

        let r=posY-1;
        while (r >= 0 && this._board[posX][r].index == this._board[posX][posY].index && this._board[posX][r].isSwappable){
            let point = new Point(posX, r);
            matches.push(point);
            r--;
        }
        r=posY+1;
        while (r < this._model.rowsTotal && this._board[posX][r].index == this._board[posX][posY].index && this._board[posX][r].isSwappable){
            let point = new Point(posX, r);
            matches.push(point);
            r++;
        }

        return (matches);
    }
}