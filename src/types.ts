import { mastodon } from 'masto';

export type Account = mastodon.v1.Account;
export type Status = mastodon.v1.Status;
export type Event = mastodon.streaming.Event;
export type UpdateEvent = mastodon.streaming.UpdateEvent;
export type NotificationEvent = mastodon.streaming.NotificationEvent;
