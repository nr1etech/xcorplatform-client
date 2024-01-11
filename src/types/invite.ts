import {CommandRequest, z} from './command';
import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';

/**
 * Media types for invite requests.
 */
export const InviteMediaType = {
  INVITE_REQUEST: 'application/vnd.xcorplatform.invite-req.v1+json',
}

/**
 * Schema for invite requests.
 */
export const InviteRequest = z
  .object({
    email: z.string().email(),
    orgId: z.string(),
  })
  .openapi('InviteRequest');

/**
 * Type for invite requests.
 */
export type IInviteRequest = z.infer<typeof InviteRequest>;

/**
 * Command for inviting a user to an org.
 */
export class InviteCommand extends CommandRequest<IInviteRequest, void> {
  constructor(readonly data: IInviteRequest) {
    super({
      method: 'post',
      path: '/invite',
      data,
      requestType: InviteMediaType.INVITE_REQUEST,
    });
  }

  /**
   * Register the invite command with the given OpenAPI registry.
   *
   * @param registry
   */
  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'Invite',
      tags: ['Invite'],
      method: 'post',
      path: '/invite',
      request: {
        body: {
          content: {
            [InviteMediaType.INVITE_REQUEST]: {
              schema: InviteRequest,
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Invite created successfully',
        },
        '404': {
          description: 'User or org not found',
        }
      },
    })
  }
}
