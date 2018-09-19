'use strict';

export default class JSONLoader {
    constructor() {
    }

    load(filename) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function(){
            if (request.readyState === 4 && request.status === 200){
                let jsonObj = JSON.parse(request.responseText);
                this.onLoaded(jsonObj);
            }
        }.bind(this);
        request.open('GET', filename, true);
        request.send();
    }

    onLoaded(callback) {
        this.onLoaded = callback;
    }
}
