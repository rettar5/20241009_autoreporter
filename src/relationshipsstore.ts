import { mastodon } from 'masto';
import { Account } from './types';

export class RelationshipsStore {
  constructor(client: mastodon.rest.Client) {
    this._client = client;
  }

  private _client: mastodon.rest.Client;
  private _following: Map<string, boolean> = new Map();

  async isFollowing(id: Account['id']): Promise<boolean> {
    if (!this._following.has(id)) {
      const relationships = await this._client.v1.accounts.relationships.fetch({ id: [id] });
      if (relationships.length !== 1) {
        return false;
      }
      this._following.set(id, relationships[0].following);
    }
    return this._following.get(id) ?? false;
  }
}
