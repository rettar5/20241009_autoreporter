import 'dotenv/config';
import { NotificationEvent, Status, Event, Notification, MentionNotification } from './types';

const reportThreshold = {
  mentionCount: Number(process.env.REPORT_THRESHOLD_MENTION_COUNT ?? 0),
  urlCount: Number(process.env.REPORT_THRESHOLD_URL_COUNT ?? 0),
};

export const getPlainContent: (status: Status) => string = (status) => {
  return (status.content ?? '').replace(/<.*?>/gm, '');
};

export const getTotalMentionCount: (status: Status) => number = (status) => {
  const plainContent = getPlainContent(status);
  return plainContent.match(/@\w+(@[\w\.]+)?/gm)?.length ?? 0;
};

export const getURLCount: (status: Status) => number = (status) => {
  const plainContent = getPlainContent(status);
  return plainContent.match(/https?:\/\/\w*?\.\w*?/gm)?.length ?? 0;
};

export const isNotificationEvent: (event: Event) => event is NotificationEvent = (event) => {
  return event.event === 'notification';
};

export const isMentionNotification: (notification: Notification) => notification is MentionNotification = (
  notification
) => {
  return notification.type === 'mention';
};

export const shouldReportStatus: (props: {
  isFollowing: boolean;
  totalMentionCount: number;
  urlCount: number;
}) => boolean = ({ isFollowing, totalMentionCount, urlCount }) => {
  return !isFollowing && reportThreshold.mentionCount <= totalMentionCount && reportThreshold.urlCount <= urlCount;
};
