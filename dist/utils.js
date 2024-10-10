"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldReportStatus = exports.isMentionNotification = exports.isNotificationEvent = exports.isUpdateEvent = exports.getURLCount = exports.getTotalMentionCount = exports.hasMentionToMe = exports.getPlainContent = void 0;
require("dotenv/config");
const reportThreshold = {
    mentionCount: Number((_a = process.env.REPORT_THRESHOLD_MENTION_COUNT) !== null && _a !== void 0 ? _a : 0),
    urlCount: Number((_b = process.env.REPORT_THRESHOLD_URL_COUNT) !== null && _b !== void 0 ? _b : 0),
};
const getPlainContent = (status) => {
    var _a;
    return ((_a = status.content) !== null && _a !== void 0 ? _a : '').replace(/<.*?>/gm, '');
};
exports.getPlainContent = getPlainContent;
const hasMentionToMe = (me, status) => {
    const plainContent = (0, exports.getPlainContent)(status);
    return plainContent.match(new RegExp(`@${me.acct}`, 'g')) !== null;
};
exports.hasMentionToMe = hasMentionToMe;
const getTotalMentionCount = (status) => {
    var _a, _b;
    const plainContent = (0, exports.getPlainContent)(status);
    return (_b = (_a = plainContent.match(/@\w+(@[\w\.]+)?/gm)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
};
exports.getTotalMentionCount = getTotalMentionCount;
const getURLCount = (status) => {
    var _a, _b;
    const plainContent = (0, exports.getPlainContent)(status);
    return (_b = (_a = plainContent.match(/https?:\/\/\w*?\.\w*?/gm)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
};
exports.getURLCount = getURLCount;
const isUpdateEvent = (event) => {
    return event.event === 'update';
};
exports.isUpdateEvent = isUpdateEvent;
const isNotificationEvent = (event) => {
    return event.event === 'notification';
};
exports.isNotificationEvent = isNotificationEvent;
const isMentionNotification = (notification) => {
    return notification.type === 'mention';
};
exports.isMentionNotification = isMentionNotification;
const shouldReportStatus = ({ isFollowing, totalMentionCount, urlCount }) => {
    return !isFollowing && reportThreshold.mentionCount <= totalMentionCount && reportThreshold.urlCount <= urlCount;
};
exports.shouldReportStatus = shouldReportStatus;
