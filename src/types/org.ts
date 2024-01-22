import {CommandRequest, z} from './command';
import {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import {MediaType} from './media-types';

export const OrgConstraint = {
  ID_ALLOWED_CHARS: '0-9a-z-',
  ID_REGEX: /^[0-9a-z-]+$/,
  ID_MIN_LENGTH: 3,
  ID_MAX_LENGTH: 64,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 64,
  NAME_REGEX: /^[A-z0-9,.\- ]+$/,
};

export const OrgField = {
  id: z
    .string()
    .min(OrgConstraint.ID_MIN_LENGTH)
    .max(OrgConstraint.ID_MAX_LENGTH)
    .regex(OrgConstraint.ID_REGEX, {
      message:
        'may only contain lower case alphanumeric characters and hyphens',
    }),
  name: z
    .string()
    .min(OrgConstraint.NAME_MIN_LENGTH)
    .max(OrgConstraint.NAME_MAX_LENGTH)
    .regex(OrgConstraint.NAME_REGEX, {
      message:
        'may only contain alphanumeric characters, hyphens, commas, periods and spaces',
    }),
};

//-----------------------------------------------------------------------------
// Create
//-----------------------------------------------------------------------------

export const CreateOrgRequest = z
  .object({
    id: OrgField.id,
    name: OrgField.name,
  })
  .openapi('CreateOrgRequest');

export type ICreateOrgRequest = z.infer<typeof CreateOrgRequest>;
export class CreateOrgCommand extends CommandRequest<ICreateOrgRequest, void> {
  constructor(readonly data: ICreateOrgRequest) {
    super({
      method: 'post',
      path: '/orgs',
      data,
      requestType: MediaType.CREATE_ORG_REQUEST,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'Create Org',
      tags: ['Org'],
      method: 'post',
      path: '/orgs',
      request: {
        body: {
          content: {
            [MediaType.CREATE_ORG_REQUEST]: {
              schema: CreateOrgRequest,
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Org created successfully',
        },
      },
    });
  }
}

//-----------------------------------------------------------------------------
// Update
//-----------------------------------------------------------------------------

export const UpdateOrgRequest = CreateOrgRequest.extend({}).openapi(
  'UpdateOrgRequest'
);

export type IUpdateOrgRequest = z.infer<typeof UpdateOrgRequest>;

export class UpdateOrgCommand extends CommandRequest<IUpdateOrgRequest, void> {
  constructor(readonly data: IUpdateOrgRequest) {
    super({
      method: 'put',
      path: `/orgs/${data.id}`,
      data,
      requestType: MediaType.UPDATE_ORG_REQUEST,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'Update Org',
      tags: ['Org'],
      method: 'put',
      path: '/orgs/{id}',
      request: {
        params: z.object({id: OrgField.id}),
        body: {
          content: {
            [MediaType.UPDATE_ORG_REQUEST]: {
              schema: UpdateOrgRequest,
            },
          },
        },
      },
      responses: {
        '204': {
          description: 'Org updated successfully',
        },
      },
    });
  }
}

//-----------------------------------------------------------------------------
// Get
//-----------------------------------------------------------------------------

export const GetOrgRequest = z
  .object({
    id: OrgField.id,
  })
  .openapi('GetOrgRequest');

export type IGetOrgRequest = z.infer<typeof GetOrgRequest>;

export const GetOrgResponse = z
  .object({
    id: OrgField.id,
    name: OrgField.name,
  })
  .openapi('GetOrgResponse');

export type IGetOrgResponse = z.infer<typeof GetOrgResponse>;

export class GetOrgCommand extends CommandRequest<
  IGetOrgRequest,
  IGetOrgResponse
> {
  constructor(readonly data: IGetOrgRequest) {
    super({
      method: 'get',
      path: `/orgs/${data.id}`,
      data,
      responseType: MediaType.GET_ORG_RESPONSE,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'Get Org',
      tags: ['Org'],
      method: 'get',
      path: '/orgs/{id}',
      request: {
        params: z.object({id: OrgField.id}),
      },
      responses: {
        '200': {
          description: 'Org found successfully',
          content: {
            [MediaType.GET_ORG_RESPONSE]: {
              schema: GetOrgResponse,
            },
          },
        },
      },
    });
  }
}

//-----------------------------------------------------------------------------
// Find
//-----------------------------------------------------------------------------

export const FindOrgRequest = z
  .object({
    orgId: OrgField.id,
    idStartsWith: OrgField.id.optional(),
    nameStartsWith: OrgField.name.optional(),
  })
  .openapi('FindOrgRequest');

export type IFindOrgRequest = z.infer<typeof FindOrgRequest>;

export const FindOrgResponse = z
  .object({
    items: z.array(
      z.object({
        id: OrgField.id,
        name: OrgField.name,
      })
    ),
    next: z.string().optional(),
  })
  .openapi('FindOrgResponse');

export type IFindOrgResponse = z.infer<typeof FindOrgResponse>;

export class FindOrgCommand extends CommandRequest<
  IFindOrgRequest,
  IFindOrgResponse
> {
  constructor(readonly data: IFindOrgRequest) {
    super({
      method: 'get',
      path: '/orgs',
      data,
      responseType: MediaType.FIND_ORG_RESPONSE,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'Find Orgs',
      tags: ['Org'],
      method: 'get',
      path: '/orgs',
      request: {
        query: FindOrgRequest,
      },
      responses: {
        '200': {
          description: 'Orgs found successfully',
          content: {
            [MediaType.FIND_ORG_RESPONSE]: {
              schema: FindOrgResponse,
            },
          },
        },
      },
    });
  }
}

//-----------------------------------------------------------------------------
// Delete
//-----------------------------------------------------------------------------

export const DeleteOrgRequest = z
  .object({
    id: OrgField.id,
  })
  .openapi('DeleteOrgRequest');

export type IDeleteOrgRequest = z.infer<typeof DeleteOrgRequest>;

export class DeleteOrgCommand extends CommandRequest<IDeleteOrgRequest, void> {
  constructor(readonly data: IDeleteOrgRequest) {
    super({
      method: 'delete',
      path: `/orgs/${data.id}`,
      data,
    });
  }

  static register(registry: OpenAPIRegistry) {
    registry.registerPath({
      description: 'Delete Org',
      tags: ['Org'],
      method: 'delete',
      path: '/orgs/{id}',
      request: {
        params: z.object({id: OrgField.id}),
      },
      responses: {
        '204': {
          description: 'Org deleted successfully',
        },
      },
    });
  }
}
