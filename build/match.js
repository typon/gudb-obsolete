"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class AutoComplete {
    constructor(db) {
        if (db)
            this.db = db.reverse();
    }
    push(strs) {
        const tempArr = [strs];
        this.db = _.concat(_.flattenDeep(tempArr).reverse(), this.db);
    }
    search(candidate) {
        let matchIndex = 0;
        let result = {};
        this.db.forEach((target, idx) => {
            let match = _.startsWith(target, candidate);
            if (match) {
                result[matchIndex] = [target, idx];
                matchIndex = matchIndex + 1;
            }
        });
        return [result, matchIndex];
    }
}
exports.AutoComplete = AutoComplete;
