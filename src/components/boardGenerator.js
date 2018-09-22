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
        let c;
        let r;

        for (c=0; c<this._gridWidth; c++){
            let column = new Array();
            board.push(column);

            for (r=0; r < this._gridHeight; r++)
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
                column.push(this.generateRandomTileVO(excludedH, excludedV));
            }
        }

        return board;
    }

    moveDestroyedTilesToTop(column){

        column.forEach(function(item, index) {
            item.movementDelta = index;
            // console.log(index);
        });

        let destroyedTiles = column.filter(tileVO => tileVO.isNew == true);
        let sinkingTiles = column.filter(tileVO => tileVO.isNew == false);
        let updatedColumn = destroyedTiles.concat(sinkingTiles);

        updatedColumn.forEach(function (item, index) {
            item.movementDelta = index - item.movementDelta
        });

        return updatedColumn;
    }

    generateRandomTileVO(excludedTypeH=-1, excludedTypeV=-1, column, row){
        let types = new Array();
        let i;
        for (i=0; i < this._tokenTypesTotal; i++)
        {
            if (i!=excludedTypeH && i!=excludedTypeV)
                types.push(i);
        }

        let index = Math.floor(Math.random()*types.length);
        let type = types[index];
        let tileVO = new TileVO(type);
        return tileVO;
    }
}