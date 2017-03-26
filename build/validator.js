"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isValid(object, interfaceObj) {
    if (interfaceObj.members) {
        for (let member of interfaceObj.members) {
            if (isPrimitive(member.type) && object[member.name] && member.type.kind != typeof object[member.name]) {
                console.log(`Field ${member.name} should be ${member.type.kind} but it is ${typeof object[member.name]}`);
                return false;
            }
            else if (member.type.kind === 'interface' && object[member.name]) {
                if (!isValid(object[member.name], member.type)) {
                    return false;
                }
            }
        }
    }
    return true;
}
exports.isValid = isValid;
function isPrimitive(type) {
    return type && (type.kind === "string" ||
        type.kind === "number" ||
        type.kind === "boolean");
}
