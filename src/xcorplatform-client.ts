import axios, {AxiosResponse} from 'axios';
import {ClientCredentials} from './client-credentials';
import {toError} from '@nr1e/commons/errors';
import {
  CommandRequest,
  CommandResponse,
  InviteCommand,
  UserInfoCommand,
} from './types';
import {
  OpenApiGeneratorV31,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import * as yaml from 'js-yaml';
import {CreateAppCommand, GetAppCommand} from './types/app';
import * as logging from '@nr1e/logging';

const log = await logging.initialize({
  svc: 'xcorplatform',
  name: 'xcorplatform-client',
  level: 'info',
});

declare let window: unknown;

const DEFAULT_AUTH_TOKEN_URL = 'https://secure.authsure.com/connect/token';
const DEFAULT_BASE_URL = 'https://api.xcorplatform.com';
const USER_AGENT = 'xcorplatform-client';

function checkContentType(expected: string, response: AxiosResponse): void {
  const received = response.headers['content-type'];
  if (received === undefined) {
    log.warn({expected}, 'Expected content type and received none');
  }
  if (received !== expected) {
    log.warn({expected, received}, 'Expected content type mismatch');
  }
}

interface IErrorMessage {
  message?: string;
}

function isErrorMessage(error?: IErrorMessage): error is IErrorMessage {
  return error !== undefined && error.message !== undefined;
}

/**
 * AuthConfig is used to configure the client credentials grant type.
 */
export interface AuthConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly tokenEndpoint?: string;
  readonly scopes?: string[];
}

/**
 * XcorPlatformClientConfig is used to configure the XcorPlatformClient.
 */
export interface XcorPlatformClientConfig {
  readonly baseUrl?: string;
  readonly authConfig?: AuthConfig;
}

/**
 * XcorPlatformClient is the main entry point for interacting with the Xcor Platform API.
 */
export class XcorPlatformClient {
  readonly baseUrl: string;
  protected client = axios.create();
  protected logErrorResponses = false;
  protected clientCredentials?: ClientCredentials;

  constructor(props?: XcorPlatformClientConfig) {
    this.baseUrl = props?.baseUrl ?? DEFAULT_BASE_URL;
    // Don't set the user-agent in the browser
    if (typeof window === 'undefined') {
      this.client.interceptors.request.use(
        config => {
          config.headers['user-agent'] = USER_AGENT;
          return config;
        },
        error => {
          return Promise.reject(error);
        }
      );
    }
    if (props?.authConfig) {
      this.auth(props.authConfig);
    }
  }

  /**
   * Configure the client to use the client credentials grant type.
   *
   * @param config The configuration for the client credentials grant type.
   */
  auth(config: AuthConfig): XcorPlatformClient {
    this.clientCredentials = new ClientCredentials({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      tokenEndpoint: config.tokenEndpoint ?? DEFAULT_AUTH_TOKEN_URL,
      scopes: config.scopes ?? [],
    });
    return this;
  }

  /**
   * Configures the client to log requests.
   */
  logRequests(): XcorPlatformClient {
    this.client.interceptors.request.use(
      config => {
        log.info({config}, 'Request');
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    return this;
  }

  /**
   * Configures the client to log responses.
   */
  logResponses(): XcorPlatformClient {
    this.client.interceptors.response.use(
      config => {
        log.info({config}, 'Response');
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    this.logErrorResponses = true;
    return this;
  }

  protected processError(err: unknown): [Error, number, string] {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        if (this.logErrorResponses) {
          log.error({response: err.response}, 'Error response');
        }
        const message = err.response.data.message;
        return [
          toError(err.response.status, message),
          err.response.status,
          err.response.headers['content-type'],
        ];
      }
    }
    // If not an HttpError, we re-throw the error
    if (err instanceof Error) {
      throw err;
    } else if (typeof err === 'object' && err !== null && 'toString' in err) {
      throw new Error(err.toString());
    } else {
      throw new Error('Unknown error');
    }
  }

  /**
   * Send a command to the Xcor Platform API.
   *
   * @param request The command to send.
   */
  async send<Req, Res>(
    request: CommandRequest<Req, Res>
  ): Promise<CommandResponse<Res>> {
    const headers: Record<string, string> = {};
    if (request.props.requestType) {
      headers['content-type'] = request.props.requestType;
    }
    if (request.props.responseType) {
      headers.accept = request.props.responseType;
    }
    if (this.clientCredentials) {
      headers.authorization = `Bearer ${await this.clientCredentials.getAccessToken()}`;
    }
    if (request.props.headers) {
      Object.assign(headers, request.props.headers);
    }
    if (request.props.method === 'delete' && request.props.data) {
      throw new Error('Delete requests cannot have data');
    }
    const params =
      request.props.method === 'get' ? request.props.data : undefined;
    const data =
      request.props.method !== 'get' ? request.props.data : undefined;
    try {
      const response = await this.client.request<Res>({
        method: request.props.method,
        url: `${this.baseUrl}${request.props.path}`,
        headers,
        data,
        params,
      });
      if (request.props.responseType) {
        checkContentType(request.props.responseType, response);
      }
      return {
        data: response.data,
        httpStatus: response.status,
        contentType: response.headers['content-type'],
      };
    } catch (err: unknown) {
      const [error, httpStatus, contentType] = this.processError(err);
      return {
        error,
        httpStatus,
        contentType,
      };
    }
  }

  /**
   * Generate an OpenAPI YAML document for the Xcor Platform API.
   */
  static openapiYaml(): string {
    const registry = new OpenAPIRegistry();
    InviteCommand.register(registry);
    UserInfoCommand.register(registry);
    CreateAppCommand.register(registry);
    GetAppCommand.register(registry);

    const generator = new OpenApiGeneratorV31(registry.definitions);
    const result = generator.generateDocument({
      openapi: '3.1.0',
      info: {
        version: '1.0',
        title: 'Xcor Platform API',
      },
      servers: [
        {
          url: 'https://api.xcorplatform.com',
        },
      ],
    });
    return yaml.dump(result);
  }
}
