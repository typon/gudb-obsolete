import * as _ from "lodash";

export class AutoComplete {
    db: string[];
    constructor(db?: string[]){
        if(db) this.db = db.reverse();
    }
    push(strs: string|string[]) {

        const tempArr: any[] = [strs]
        this.db = _.concat(_.flattenDeep(tempArr).reverse(), this.db)
        //this.db = _.concat(this.db, new)
    }
    // Accepts a search string and returns the strings that startWith 
    // the str in db.
    // It returns the strings as dictionary of 
    //  index in search results: [string, index in db].
    search(candidate: string): [any, number] {
        let matchIndex = 0;
        let result = {};
        this.db.forEach( (target, idx) => {
            let match = _.startsWith(target, candidate)
            if (match) {
                result[matchIndex] = [target, idx];
                matchIndex = matchIndex + 1;
            }
        });
        return [result, matchIndex];
    }
}
