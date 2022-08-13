import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getSignedUploadUrl, todoExists } from '../../businesslogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const log = createLogger(`Event: ${event}`);

    const todoId = event.pathParameters.todoId
    console.log(`- todoId 1: ${todoId}`)
    log.info(`- todoId 2: ${todoId}`)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
    console.log('a1')
    const validTodo = await todoExists(todoId, userId)

    if (!validTodo) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    console.log('a2')
    const url = await getSignedUploadUrl(todoId, userId)

    console.log('a3')
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
