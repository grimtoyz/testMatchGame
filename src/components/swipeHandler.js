'use strict';


export default class SwipeHandler{

    constructor(container, thresholdMin, thresholdMax) {
        container.interactive = true;
        container.interactiveChildren = true;
        container.on('pointerdown', this.onSwipeStarted.bind(this));
        container.on('pointerup', this.onSwipeEnded.bind(this));
        container.on('pointermove', this.onSwipe.bind(this));

        this._thresholdMin = thresholdMin;
        this._thresholdMax = thresholdMax;

        this._isSwapActive = false;
        this._thresholdPassed = false;
        this._swipeAllowed = true;
    }

    onSwipeStarted(event){
        if (this._isSwapActive)
            return;

        this._thresholdPassed = false;

        this._startingPoint = {};
        this._startingPoint.x = event.data.global.x;
        this._startingPoint.y = event.data.global.y;
        this._isSwapActive = true;
    }

    onSwipeEnded(){
        this._isSwapActive = false;
    }

    onSwipe(event){
        if (!this._isSwapActive || this._thresholdPassed || !this._swipeAllowed)
            return;

        this._deltaX = event.data.global.x - this._startingPoint.x;
        this._deltaY = event.data.global.y - this._startingPoint.y;

        let absDeltaX = Math.abs(this._deltaX);
        let absDeltaY = Math.abs(this._deltaY);
        if (absDeltaX > this._thresholdMax && absDeltaY < this._thresholdMin ){
            let directionX = this._deltaX >= 0 ? 1 : -1;
            this._thresholdPassed = true;
            this.onSwiped(directionX, 0);
        }

        if (absDeltaY > this._thresholdMax && absDeltaX < this._thresholdMin){
            let directionY = this._deltaY >= 0 ? 1 : -1;
            this._thresholdPassed = true;
            this.onSwiped(0, directionY);
        }
    }

    onSwiped(callback){
        this.onSwiped = callback;
    }

    set allowSwipe(value){
        this._swipeAllowed = value;
    }
}