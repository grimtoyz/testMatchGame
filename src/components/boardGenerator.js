'use strict';


import TileVO from "../vo/tileVO";

export default class BoardGenerator{

    constructor(gameModel) {
        this._gridWidth = gameModel.columnsTotal;
        this._gridHeight = gameModel.rowsTotal;
        this._tokenTypesTotal = gameModel.TILE_TYPES_TOTAL;
    }

    generateBoardWithoutAutoMatches(){
        let board = new Array();

        console.log("new board");

        for (let c = 0; c < this._gridWidth; c++){
            let column = new Array();
            board.push(column);

            for (let r = 0; r < this._gridHeight; r++)
            {
                let excludedV = -1;
                if (r > 1){
                    if (column[r-2].index == column[r-1].index)
                        excludedV = column[r-1].index;
                }

                let excludedH = -1;
                if (c > 1){
                    if ( board[c-2][r].index == board[c-1][r].index)
                        excludedH = board[c-1][r].index;
                }

                let tileVO = this.generateRandomTileVO(excludedH, excludedV);
                tileVO.gridPosX = c;
                tileVO.gridPosY = r;
                column.push(tileVO);

                console.log("x:", c, "y:", r, "index:", tileVO.index);
            }
        }

        return board;
    }

    generateDebugBoardWithMatches(){
        let board = [];

        board.push([this.generateTileVO(0), this.generateTileVO(0), this.generateTileVO(4), this.generateTileVO(1), this.generateTileVO(2)]);
        board.push([this.generateTileVO(2), this.generateTileVO(0), this.generateTileVO(3), this.generateTileVO(4), this.generateTileVO(4)]);
        board.push([this.generateTileVO(5), this.generateTileVO(3), this.generateTileVO(4), this.generateTileVO(3), this.generateTileVO(4)]);
        board.push([this.generateTileVO(2), this.generateTileVO(0), this.generateTileVO(2), this.generateTileVO(1), this.generateTileVO(3)]);

        board.push([this.generateTileVO(1), this.generateTileVO(1), this.generateTileVO(4), this.generateTileVO(3), this.generateTileVO(1)]);
        board.push([this.generateTileVO(2), this.generateTileVO(1), this.generateTileVO(2), this.generateTileVO(1), this.generateTileVO(0)]);
        board.push([this.generateTileVO(0), this.generateTileVO(5), this.generateTileVO(5), this.generateTileVO(1), this.generateTileVO(2)]);
        board.push([this.generateTileVO(1), this.generateTileVO(2), this.generateTileVO(4), this.generateTileVO(2), this.generateTileVO(1)]);

        for (let c = 0; c < this._gridWidth; c++){
            for (let r = 0; r < this._gridHeight; r++){
                board[c][r].gridPosX = c;
                board[c][r].gridPosY = r;
            }
        }

        return board;
    }

    generateDebugBoardWithoutMatches(){
        let board = [];

        board.push([this.generateTileVO(0), this.generateTileVO(1), this.generateTileVO(4), this.generateTileVO(1), this.generateTileVO(2)]);
        board.push([this.generateTileVO(2), this.generateTileVO(0), this.generateTileVO(3), this.generateTileVO(2), this.generateTileVO(4)]);
        board.push([this.generateTileVO(5), this.generateTileVO(3), this.generateTileVO(4), this.generateTileVO(0), this.generateTileVO(4)]);
        board.push([this.generateTileVO(2), this.generateTileVO(0), this.generateTileVO(2), this.generateTileVO(1), this.generateTileVO(5)]);

        board.push([this.generateTileVO(1), this.generateTileVO(1), this.generateTileVO(4), this.generateTileVO(3), this.generateTileVO(2)]);
        board.push([this.generateTileVO(2), this.generateTileVO(1), this.generateTileVO(2), this.generateTileVO(1), this.generateTileVO(0)]);
        board.push([this.generateTileVO(0), this.generateTileVO(5), this.generateTileVO(5), this.generateTileVO(4), this.generateTileVO(2)]);
        board.push([this.generateTileVO(1), this.generateTileVO(2), this.generateTileVO(4), this.generateTileVO(2), this.generateTileVO(1)]);

        for (let c = 0; c < this._gridWidth; c++){
            for (let r = 0; r < this._gridHeight; r++){
                board[c][r].gridPosX = c;
                board[c][r].gridPosY = r;
            }
        }

        return board;
    }

    moveDestroyedTilesToTop(column){
        column.forEach(function(item, index) {
            item.movementDelta = index;
        });

        let destroyedTiles = column.filter(tileVO => tileVO.isNew === true);
        let sinkingTiles = column.filter(tileVO => tileVO.isNew === false);
        let updatedColumn = destroyedTiles.concat(sinkingTiles);

        updatedColumn.forEach(function (item, index) {
            // if (item.isNew)
            //     item.movementDelta = -1;
            // else
                item.movementDelta = index - item.movementDelta;
        });

        return updatedColumn;
    }

    generateTileVO(type){
        let tileVO = new TileVO(type);
        return tileVO;
    }

    generateRandomTileVO(excludedTypeH=-1, excludedTypeV=-1){
        let types = [];
        let i;
        for (i=0; i < this._tokenTypesTotal; i++)
        {
            if (i !== excludedTypeH && i !== excludedTypeV)
                types.push(i);
        }

        let index = Math.floor(Math.random()*types.length);
        let type = types[index];
        let tileVO = new TileVO(type);
        return tileVO;
    }
}