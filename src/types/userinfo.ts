import {CommandRequest, z} from './command';
import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';

export const UserInfoMediaType = {
  USERINFO_RESPONSE: 'application/vnd.xcorplatform.userinfo-res.v1+json',
}

export const UserInfoResponse = z
  .object({
    id: z.string(),
    givenName: z.string(),
    familyName: z.string(),
    name: z.string(),
    active: z.boolean(),
    email: z.string().email(),
    orgs: z.array(z.object({
      id: z.string(),
      name: z.string(),
      roles: z.array(z.string())
    })),
  })
  .openapi('InviteRequest');

export type IUserInfoResponse = z.infer<typeof UserInfoResponse>;

export class UserInfoCommand extends CommandRequest<void, IUserInfoResponse> {
  constructor(readonly data: void) {
    super({
      method: 'get',
      path: '/userinfo',
      requestType: UserInfoMediaType.USERINFO_RESPONSE,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'UserInfo',
      tags: ['UserInfo'],
      method: 'get',
      path: '/userinfo',
      request: {
        headers: z.object({
          authorization: z.string(),
        })
      },
      responses: {
        '200': {
          description: 'UserInfo retrieved successfully',
          content: {
            [UserInfoMediaType.USERINFO_RESPONSE]: {
              schema: UserInfoResponse,
            },
          },
        },
        '404': {
          description: 'UserInfo not found',
        }
      },
    })
  }

}
