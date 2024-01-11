import axios, {AxiosInstance} from 'axios';

/**
 * Configuration for the ClientCredentials class
 */
export interface ClientCredentialsConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly tokenEndpoint: string;
  readonly scopes: string[];
  readonly httpClient?: AxiosInstance;
  readonly refreshBeforeExpiration?: number;
  readonly disableBackgroundRefresh?: boolean;
}

/**
 * ClientCredentials is a helper class for managing OAuth2 client credentials
 */
export class ClientCredentials {
  protected clientId: string;
  protected clientSecret: string;
  protected tokenEndpoint: string;
  protected scopes: string[];
  protected httpClient: AxiosInstance;
  protected refreshBeforeExpiration: number;
  protected disableBackgroundRefresh: boolean;
  protected accessToken?: string;
  protected expiration?: number;
  protected intervalId?: NodeJS.Timeout;

  /**
   * Create a new ClientCredentials instance
   *
   * @param config Configuration for the ClientCredentials instance
   */
  constructor(config: ClientCredentialsConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.tokenEndpoint = config.tokenEndpoint;
    this.scopes = config.scopes;
    this.httpClient = config.httpClient ?? axios.create();
    this.refreshBeforeExpiration = config.refreshBeforeExpiration ?? 60;
    this.disableBackgroundRefresh = config.disableBackgroundRefresh ?? false;
  }

  /**
   * Get the current access token
   */
  async getAccessToken(): Promise<string> {
    if (
      this.accessToken === undefined ||
      this.expiration === undefined ||
      this.expiration < Date.now()
    ) {
      await this.updateToken();
    }
    return this.accessToken!;
  }

  /**
   * Update the access token. This happens automatically and does not need to be called manually unless disableBackgroundRefresh is set to true.
   */
  async updateToken(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    try {
      const response = await this.httpClient.post(
        this.tokenEndpoint,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: this.scopes.join(' '),
        },
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      );
      this.accessToken = response.data.access_token;
      this.expiration =
        Date.now() +
        (response.data.expires_in - this.refreshBeforeExpiration) * 1000;
      if (!this.disableBackgroundRefresh) {
        this.intervalId = setInterval(
          () => this.updateToken(),
          this.expiration
        );
      }
    } catch (error) {
      console.error('Unable to update access token', error);
    }
  }

  /**
   * Close the ClientCredentials instance. This will stop the background refresh of the access token.
   */
  close() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.accessToken = undefined;
    this.expiration = undefined;
  }
}
