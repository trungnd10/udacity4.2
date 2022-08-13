import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  let authorization = event.headers.authorization
  if (!authorization) {
    authorization = event.headers.Authorization;
  }
  console.log("1", event.headers.Authorization)
  console.log("2", event.headers.authorization)
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}