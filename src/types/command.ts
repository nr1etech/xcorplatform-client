import {z} from 'zod';
import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export {z};

/**
 * Properties required to make a command request.
 *
 * @template T The type of request data.
 */
export interface CommandRequestProps<T> {
  readonly method: string;
  readonly path: string;
  readonly data?: T;
  readonly requestType?: string;
  readonly responseType?: string;
  readonly headers?: Record<string, string>;
}

/**
 * Represents a command request with request and response types.
 *
 * @template Req - The type of the request object.
 * @template Res - The type of the response object.
 */
export abstract class CommandRequest<Req, Res> {
  props: CommandRequestProps<Req>;
  constructor(props: CommandRequestProps<Req>) {
    this.props = props;
  }
}

/**
 * Represents a command response.
 *
 * @template Res - The type of the response data.
 */
export interface CommandResponse<Res> {
  readonly data?: Res;
  readonly error?: Error;
  readonly httpStatus: number;
  readonly contentType?: string;
}
