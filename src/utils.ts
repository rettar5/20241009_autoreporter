import 'dotenv/config';
import { Account, NotificationEvent, Status, Event, UpdateEvent } from './types';

const reportThreshold = {
  mentionCount: Number(process.env.REPORT_THRESHOLD_MENTION_COUNT ?? 0),
  urlCount: Number(process.env.REPORT_THRESHOLD_URL_COUNT ?? 0),
};

export const getPlainContent: (status: Status) => string = (status) => {
  return (status.content ?? '').replace(/<.*?>/gm, '');
};

export const hasMentionToMe: (me: Account, status: Status) => boolean = (me, status) => {
  const plainContent = getPlainContent(status);
  return plainContent.match(new RegExp(`@${me.acct}`, 'g')) !== null;
};

export const getTotalMentionCount: (status: Status) => number = (status) => {
  const plainContent = getPlainContent(status);
  return plainContent.match(/@\w+(@[\w\.]+)?/gm)?.length ?? 0;
};

export const getURLCount: (status: Status) => number = (status) => {
  const plainContent = getPlainContent(status);
  return plainContent.match(/https?:\/\/\w*?\.\w*?/gm)?.length ?? 0;
};

export const isUpdateEvent: (event: Event) => event is UpdateEvent = (event) => {
  return event.event === 'update';
};

export const isNotificationEvent: (event: Event) => event is NotificationEvent = (event) => {
  return event.event === 'notification';
};

export const shouldReportStatus: (props: {
  isFollowing: boolean;
  hasMentionToMe: boolean;
  totalMentionCount: number;
  urlCount: number;
}) => boolean = ({ isFollowing, hasMentionToMe, totalMentionCount, urlCount }) => {
  return (
    !isFollowing &&
    hasMentionToMe &&
    reportThreshold.mentionCount <= totalMentionCount &&
    reportThreshold.urlCount <= urlCount
  );
};
