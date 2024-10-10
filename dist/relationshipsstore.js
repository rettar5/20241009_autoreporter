"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipsStore = void 0;
class RelationshipsStore {
    constructor(client) {
        this._following = new Map();
        this._client = client;
    }
    isFollowing(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this._following.has(id)) {
                const relationships = yield this._client.v1.accounts.relationships.fetch({ id: [id] });
                if (relationships.length !== 1) {
                    return false;
                }
                this._following.set(id, relationships[0].following);
            }
            return (_a = this._following.get(id)) !== null && _a !== void 0 ? _a : false;
        });
    }
}
exports.RelationshipsStore = RelationshipsStore;
