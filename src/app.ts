import 'dotenv/config';
import { createRestAPIClient, createStreamingAPIClient } from 'masto';
import { hasMentionToMe, isUpdateEvent, getTotalMentionCount, getURLCount, shouldReportStatus } from './utils';
import { RelationshipsStore } from './relationshipsstore';

const restApi = createRestAPIClient({
  url: process.env.URL as string,
  accessToken: process.env.TOKEN,
});

const streamingAPI = createStreamingAPIClient({
  streamingApiUrl: process.env.URL as string,
  accessToken: process.env.TOKEN
});

const relationshipsStore = new RelationshipsStore(restApi);

(async () => {
  const me = await restApi.v1.accounts.verifyCredentials();

  // TODO: user.notificationからMentionNotificationを取得するように変える
  using events = streamingAPI.public.subscribe();
  for await (const event of events) {
    try {
      if (isUpdateEvent(event)) {
        const status = event.payload;
        const isFollowing = await relationshipsStore.isFollowing(status.account.id);
        const hasMention = hasMentionToMe(me, status);
        const totalMentionCount = getTotalMentionCount(status);
        const urlCount = getURLCount(status);
        const shouldReport = shouldReportStatus({
          isFollowing,
          hasMentionToMe: hasMention,
          totalMentionCount,
          urlCount
        });
  
        if (shouldReport) {
          // TODO: loggerを導入する
          console.debug(`follow: ${isFollowing}, mention: ${hasMention}, mentionCount: ${totalMentionCount}, urlCount: ${urlCount}`);
          console.info(`スパム疑いのある投稿を検知しました`);
          console.debug(status.url);
          try {
            await restApi.v1.reports.create({
              accountId: status.account.id,
              statusIds: [status.id],
              // TODO: 環境変数でコメントを任意に選択できるようにする
              comment: 'スパム疑い(自動通報)',
              forward: false,
              category: 'spam'
            });
          } catch(e) {
            console.error(`通報処理中にエラーが発生しました`, e);
          }
        }
      }
    } catch(e) {
      console.error(`メッセージ処理中にエラーが発生しました`, e);
    }
  }
})();
