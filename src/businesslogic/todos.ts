import { TodosAccess } from '../datalayer/todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { getSignedUrl } from '../utils/s3'

// TODO: Implement businessLogic

const bucketName = process.env.ATTACHMENT_S3_BUCKET

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
  console.log('Todo item: ', item)
  return !!item
}

export async function getSignedUploadUrl(todoId: string, userId: string) {
  const signedUrl = getSignedUrl(todoId)
  if (signedUrl) {
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    await todo.updateTodoAttachment(todoId, userId, attachmentUrl)
    return signedUrl
  }
}