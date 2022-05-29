import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"

export namespace ApiLambda {

    export function wrap<T, U, R>(handler: (input: Input<T, U>) => Promise<R>, options?: Partial<WrapOptions<U>>)
        : (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult> {
        return async function (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
            try {
                const input: Input<T, U> = {
                    body: event.body ? JSON.parse(event.body!) : undefined,
                    headers: event.headers,
                    queryParameters: event.queryStringParameters,
                    pathParameters: event.pathParameters,
                    customParameters: options?.customParameters
                };
                const value: R = await handler(input);
                return Response.get200(value);
            } catch (error) {
                console.error("Error while executing request", (error as Error).message, error);
                return Response.get500("unexpeced error occured");
            }
        }
    }

    export interface Input<T, U> {
        body?: T, // for GET and DELETE requests there is no body
        headers?: Record<string, string | undefined>;
        queryParameters?: Record<string, string | undefined> | null;
        pathParameters?: Record<string, string | undefined> | null;
        customParameters?: U
    }

    export interface WrapOptions<T> {
        customParameters?: T
    }

    export interface DefaultWrapOptions extends WrapOptions<void> {

    }

    export namespace Response {
        export function get200(content: Record<string, any>): APIGatewayProxyResult {
            return {
                body: JSON.stringify(content),
                statusCode: 200
            }
        }
        export function get500(message: string, errorCode?: string, content?: Record<string, any>): APIGatewayProxyResult {
            return {
                body: JSON.stringify({ message, errorCode, error: content }),
                statusCode: 200
            }
        }
    }
}