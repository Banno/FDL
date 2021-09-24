/* eslint-disable import/no-extraneous-dependencies */
// cspell:words mockdate

import 'regenerator-runtime/runtime';
import MockDate from 'mockdate';

process.on('unhandledRejection', error => {
    throw error;
});

MockDate.set(new Date(2019, 5, 17));

const changeDate = date => {
    MockDate.set(new Date(date));
};

const resetDate = () => MockDate.set(new Date(2019, 5, 17));

global.changeDate = changeDate;
global.resetDate = resetDate;

class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = value.toString();
    }

    removeItem(key) {
        delete this.store[key];
    }
}

global.localStorage = new LocalStorageMock();

const originalDefine = customElements.define.bind(customElements);

customElements.define = function (name, ...rest) {
    if (customElements.get(name)) {
        console.warn(`Cannot re-register custom element "${name}"`);
        return;
    }

    originalDefine(name, ...rest);
};
