import {z} from './command';
export const ErrorResponse = z
  .object({
    message: z.string(),
  })
  .openapi('ErrorResponse');

export type IErrorResponse = z.infer<typeof ErrorResponse>;
