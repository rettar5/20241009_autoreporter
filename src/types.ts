import { mastodon } from 'masto';

export type Status = mastodon.v1.Status;
export type Notification = mastodon.v1.Notification;
export type MentionNotification = mastodon.v1.MentionNotification;
export type Event = mastodon.streaming.Event;
export type NotificationEvent = mastodon.streaming.NotificationEvent;
