import {CommandRequest, z} from './command';
import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import {MediaType} from './media-types';

/**
 * Schema for user information response.
 */
export const UserInfoResponse = z
  .object({
    id: z.string(),
    givenName: z.string(),
    familyName: z.string(),
    name: z.string(),
    active: z.boolean(),
    email: z.string().email(),
    orgs: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        roles: z.array(z.string()),
      })
    ),
  })
  .openapi('InviteRequest');

/**
 * Type for user information response.
 */
export type IUserInfoResponse = z.infer<typeof UserInfoResponse>;

/**
 * Command for retrieving user information.
 */
export class UserInfoCommand extends CommandRequest<void, IUserInfoResponse> {
  constructor(readonly data: void) {
    super({
      method: 'get',
      path: '/userinfo',
      requestType: MediaType.USERINFO_RESPONSE,
    });
  }

  /**
   * Register the user information command with the given OpenAPI registry.
   *
   * @param registry
   */
  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'UserInfo',
      tags: ['UserInfo'],
      method: 'get',
      path: '/userinfo',
      request: {
        headers: z.object({
          authorization: z.string(),
        }),
      },
      responses: {
        '200': {
          description: 'UserInfo retrieved successfully',
          content: {
            [MediaType.USERINFO_RESPONSE]: {
              schema: UserInfoResponse,
            },
          },
        },
        '404': {
          description: 'UserInfo not found',
        },
      },
    });
  }
}
