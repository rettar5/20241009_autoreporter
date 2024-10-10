import 'dotenv/config';
import { createRestAPIClient, createStreamingAPIClient } from 'masto';
import { getTotalMentionCount, getURLCount, shouldReportStatus, isNotificationEvent, isMentionNotification } from './utils';
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
  using events = streamingAPI.user.notification.subscribe();
  for await (const event of events) {
    try {
      if (isNotificationEvent(event) && isMentionNotification(event.payload)) {
        const status = event.payload.status;
        const isFollowing = await relationshipsStore.isFollowing(status.account.id);
        const totalMentionCount = getTotalMentionCount(status);
        const urlCount = getURLCount(status);
        const shouldReport = shouldReportStatus({
          isFollowing,
          totalMentionCount,
          urlCount
        });

        if (shouldReport) {
          // TODO: loggerを導入する
          console.debug(`follow: ${isFollowing}, mentionCount: ${totalMentionCount}, urlCount: ${urlCount}`);
          try {
            await restApi.v1.reports.create({
              accountId: status.account.id,
              statusIds: [status.id],
              // TODO: 環境変数でコメントを任意に選択できるようにする
              comment: 'スパム疑い(自動通報)',
              forward: false,
              category: 'spam'
            });
            console.info(`スパム疑いのある投稿を通報しました\n${status.url}`);
          } catch(e) {
            console.error(`通報処理中にエラーが発生しました\n${status.url}`, e);
          }
        }
      }
    } catch(e) {
      console.error(`メッセージ処理中にエラーが発生しました`, e);
    }
  }
})();
