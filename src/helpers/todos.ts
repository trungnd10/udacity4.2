import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

// TODO: Implement businessLogic
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration: number = 300

const todo = new TodosAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return await todo.getAllTodos(userId)
}

export async function createTodo(
  userId: string,
  payload: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const data = {
    todoId,
    userId,
    ...payload
  }

  return await todo.createTodo(data as TodoItem)
}


export async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest): Promise<void> {
  return await todo.updateTodo(todoId, userId, payload)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  await todo.deleteTodo(todoId, userId)
}

export async function todoExists(todoId: string, userId: string) {
  const item = await todo.getTodo(todoId, userId)

  console.log('Get todo: ', item)
  return !!item
}

export async function getSignedUploadUrl(todoId: string, userId: string) {
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })

  if (signedUrl) {
    await addAttachmentUrl(bucketName, todoId, userId)
    return signedUrl
  }
}

async function addAttachmentUrl(bucketName, todoId, userId) {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  await todo.updateTodoAttachment(todoId, userId, attachmentUrl)
}