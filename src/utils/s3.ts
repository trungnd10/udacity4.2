import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration: number = 300

export function getSignedUrl(todoId: string) {
    console.log('bucket name:', bucketName)
    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    })
    return signedUrl
}  