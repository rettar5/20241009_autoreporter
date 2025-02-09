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
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pino_1 = require("pino");
const masto_1 = require("masto");
const utils_1 = require("./utils");
const relationshipsstore_1 = require("./relationshipsstore");
const logger = (0, pino_1.pino)({
    level: (_a = process.env.LOG_LEVEL) !== null && _a !== void 0 ? _a : 'warn'
});
/** スパム対策を行うユーザのREST API Client */
const restApi = (0, masto_1.createRestAPIClient)({
    url: process.env.URL,
    accessToken: process.env.USER_TOKEN,
});
/** スパム対策を行うユーザのStreaming API Client */
const streamingAPI = (0, masto_1.createStreamingAPIClient)({
    streamingApiUrl: process.env.URL,
    accessToken: process.env.USER_TOKEN,
});
/** スパム報告を行うREST API Client */
const spamReportRestApi = (0, masto_1.createRestAPIClient)({
    url: process.env.URL,
    accessToken: (_b = process.env.SPAM_REPORTER_TOKEN) !== null && _b !== void 0 ? _b : process.env.USER_TOKEN,
});
const relationshipsStore = new relationshipsstore_1.RelationshipsStore(restApi);
const shouldBlockAccount = !!process.env.SHOULD_BLOCK_SPAM_ACCOUNT;
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
        const events = __addDisposableResource(env_1, streamingAPI.user.notification.subscribe(), false);
        try {
            for (var _d = true, events_1 = __asyncValues(events), events_1_1; events_1_1 = yield events_1.next(), _a = events_1_1.done, !_a; _d = true) {
                _c = events_1_1.value;
                _d = false;
                const event = _c;
                try {
                    if ((0, utils_1.isNotificationEvent)(event) && (0, utils_1.isMentionNotification)(event.payload)) {
                        const status = event.payload.status;
                        const isFollowing = yield relationshipsStore.isFollowing(status.account.id);
                        const totalMentionCount = (0, utils_1.getTotalMentionCount)(status);
                        const urlCount = (0, utils_1.getURLCount)(status);
                        const shouldReport = (0, utils_1.shouldReportStatus)({
                            isFollowing,
                            totalMentionCount,
                            urlCount
                        });
                        if (shouldReport) {
                            logger.debug(`follow: ${isFollowing}, mentionCount: ${totalMentionCount}, urlCount: ${urlCount}`);
                            try {
                                // report spam status
                                yield spamReportRestApi.v1.reports.create({
                                    accountId: status.account.id,
                                    statusIds: [status.id],
                                    comment: process.env.REPORT_COMMENT,
                                    forward: false,
                                    category: 'spam'
                                });
                                logger.info(`Reported a post suspected of being spam.\n${status.url}`);
                                // block spam account
                                if (shouldBlockAccount) {
                                    try {
                                        yield restApi.v1.accounts.$select(status.account.id).block();
                                        logger.info(`Blocked an account suspected of being spam.\n${status.account.url}`);
                                    }
                                    catch (e) {
                                        logger.error(`An exception occurred while processing the account block.\n`, e);
                                    }
                                }
                            }
                            catch (e) {
                                logger.error(`An exception occurred while processing the report.\n${status.url}`, e);
                            }
                        }
                    }
                }
                catch (e) {
                    logger.error(`An exception occurred while processing the message.`, e);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = events_1.return)) yield _b.call(events_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (e_2) {
        env_1.error = e_2;
        env_1.hasError = true;
    }
    finally {
        __disposeResources(env_1);
    }
}))();
