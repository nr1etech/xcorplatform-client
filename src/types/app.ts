import {CommandRequest, z} from './command';
import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import {MediaType} from './media-types';

export const AppConstraint = {
  ID_REGEX: /^[0-9a-z-]+$/,
  ID_MIN_LENGTH: 3,
  ID_MAX_LENGTH: 64,
  NAME_REGEX: /^[0-9a-zA-Z- ]+$/,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 64,
  AUTHOR_REGEX: /^[0-9a-zA-Z- ,.]+$/,
  AUTHOR_MIN_LENGTH: 3,
  AUTHOR_MAX_LENGTH: 64,
};

export const AppField = {
  id: z
    .string()
    .min(AppConstraint.ID_MIN_LENGTH)
    .max(AppConstraint.ID_MAX_LENGTH)
    .regex(AppConstraint.ID_REGEX, {
      message:
        'may only contain lower case alphanumeric characters and hyphens',
    }),
  name: z
    .string()
    .min(AppConstraint.NAME_MIN_LENGTH)
    .max(AppConstraint.NAME_MAX_LENGTH)
    .regex(AppConstraint.NAME_REGEX, {
      message: 'may only contain alphanumeric characters, hyphens and spaces',
    }),
  author: z
    .string()
    .min(AppConstraint.AUTHOR_MIN_LENGTH)
    .max(AppConstraint.AUTHOR_MAX_LENGTH)
    .regex(AppConstraint.AUTHOR_REGEX, {
      message:
        'may only contain alphanumeric characters, hyphens, commas, periods and spaces',
    }),
  createdAt: z.number(),
  updatedAt: z.number(),
};

//-----------------------------------------------------------------------------
// Create
//-----------------------------------------------------------------------------

export const CreateAppRequest = z
  .object({
    id: AppField.id,
    name: AppField.name,
    author: z.string(),
  })
  .openapi('CreateAppRequest');

export type ICreateAppRequest = z.infer<typeof CreateAppRequest>;

export class CreateAppCommand extends CommandRequest<ICreateAppRequest, void> {
  constructor(readonly data: ICreateAppRequest) {
    super({
      method: 'post',
      path: '/apps',
      data,
      requestType: MediaType.CREATE_APP_REQUEST,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'CreateApp',
      tags: ['CreateApp'],
      method: 'post',
      path: '/apps',
      request: {
        body: {
          content: {
            [MediaType.CREATE_APP_REQUEST]: {
              schema: CreateAppRequest,
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'App created successfully',
        },
      },
    });
  }
}

//-----------------------------------------------------------------------------
// Get
//-----------------------------------------------------------------------------

export const GetAppRequest = z
  .object({
    id: AppField.id,
  })
  .openapi('GetAppRequest');

export type IGetAppRequest = z.infer<typeof GetAppRequest>;

export const GetAppResponse = z
  .object({
    id: AppField.id,
    name: AppField.name,
    author: AppField.author,
    createdAt: AppField.createdAt,
    updatedAt: AppField.updatedAt,
  })
  .openapi('GetAppResponse');

export type IGetAppResponse = z.infer<typeof GetAppResponse>;

export class GetAppCommand extends CommandRequest<IGetAppRequest, void> {
  constructor(readonly data: IGetAppRequest) {
    super({
      method: 'get',
      path: `/apps/${data.id}`,
      responseType: MediaType.GET_APP_RESPONSE,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'GetApp',
      tags: ['GetApp'],
      method: 'get',
      path: '/apps/{id}',
      request: {
        params: z.object({id: AppField.id}),
      },
      responses: {
        '200': {
          description: 'App retrieved successfully',
          content: {
            [MediaType.GET_APP_RESPONSE]: {
              schema: GetAppResponse,
            },
          },
        },
      },
    });
  }
}

//-----------------------------------------------------------------------------
// Head
//-----------------------------------------------------------------------------

export const AppExistsRequest = z
  .object({
    id: AppField.id,
  })
  .openapi('AppExitsRequest');

export type IAppExistsRequest = z.infer<typeof AppExistsRequest>;

export class AppExistsCommand extends CommandRequest<IAppExistsRequest, void> {
  constructor(readonly data: IAppExistsRequest) {
    super({
      method: 'head',
      path: `/apps/${data.id}`,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'HeadApp',
      tags: ['HeadApp'],
      method: 'head',
      path: '/apps/{id}',
      request: {
        params: z.object({id: AppField.id}),
      },
      responses: {
        '200': {
          description: 'App exists',
        },
        '404': {
          description: 'App does not exist',
        },
      },
    });
  }
}
