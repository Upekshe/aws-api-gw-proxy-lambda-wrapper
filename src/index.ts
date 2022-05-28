import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"

export namespace ApiLambda {

    export function wrap<T, R>(handler: (input: T) => Promise<R>, options?: Partial<WrapOptions>)
        : (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult> {
        return async function (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
            try {

                const input: T = JSON.parse(event.body!);
                const value: R = await handler(input);
                return Response.get200(value);
            } catch (error) {
                console.error("Error while executing request", (error as Error).message, error);
                return Response.get500("unexpeced error occured");
            }
        }
    }

    export interface WrapOptions {
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