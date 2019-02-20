const mobx = require("mobx");

class AppStore {
    constructor() {
        mobx.extendObservable(this, {
            count: 0,
            valueOne: 0,
            valueTwo: 0
        });
    }

    increment() {
        this.count++;
    }
}
exports.Store = new AppStore();
