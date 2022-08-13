// import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { CustomAuthorizerResult } from 'aws-lambda'
// import { APIGatewaySimpleAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify, decode } from 'jsonwebtoken'
// import { decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
// import { JwtPayload } from '../../auth/JwtPayload'
const authConfig = require("../../../auth_config.json");
// const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
var { expressjwt: ejwt } = require("express-jwt");
const axios = require('axios');

const logger = createLogger('auth')

if (!authConfig.domain || !authConfig.audience) {
  throw "Please make sure that auth_config.json is in place and populated";
} else {
  console.log('ok 3 tue9aug22', authConfig);
  logger.info('ok 4 tue9aug22');
}

// https://dev-tigfkctd.us.auth0.com/.well-known/jwks.json

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

// const jwtData = {
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
//   }),

//   audience: authConfig.audience,
//   issuer: `https://${authConfig.domain}/`,
//   algorithms: ["RS256"]
// };
// console.log("tessttt 2", jwtData);

console.log("aaaaaaaa abc 3")

const checkJwt = ejwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

console.log("okhehe", checkJwt);

export const handler = async (
  // event: CustomAuthorizerEvent, context, callback
  event, context, callback
  // ): Promise<CustomAuthorizerResult> => {
): Promise<CustomAuthorizerResult> => {
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaafri5trung');
  console.log('test', context)
  logger.info('Authorizing a user', event);
  // logger.info('jwtData:', jwtData);
  // let result = checkJwt(event.authorizationToken);
  // console.log("rrrrrresult:", result);
  logger.info('checkJwt:', checkJwt);

  let token = event.authorizationToken;
  console.log("token1:", token);
  console.log("headers:", event.headers)
  if (token) {
    const split = token.split(' ')
    token = split[1]
  } else {
    console.log("token2:", event.headers.authorization)
    const split = event.headers.authorization.split(' ')
    token = split[1]
  }
  console.log("token:", token);

  let decoded;
  let result;

  let jwksResponseTest = await axios.get(`https://${authConfig.domain}/.well-known/jwks.json`)
    .then(res => {
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
      console.log('Status Code:', res.status);
      console.log('Date in Response header:', headerDate);

      const data = res.data;

      console.log('typeof:', typeof data);

      console.log('data:', data);
      console.log('test 1')
      console.log('data.keys:', data['keys']);
      console.log('test 2')



      // let resourcePath = "token/jwks";

      const jwtTest = require("jsonwebtoken");
      let decodedToken = jwtTest.decode(token, { complete: true });
      console.log('decodedToken:', decodedToken)

      // let kid = decodedToken.headers.kid;
      let kid = decodedToken.header.kid;
      console.log('kid:', kid)

      // const jwksResponse = JSON.parse(data);
      // console.log('jwksResponse:', jwksResponse)

      // return new Promise(function (resolve, reject) {
      //   var jwksPromise = config.request("GET", resourcePath);

      //   jwksPromise
      //     .then(function (jwksResponse) {
      const jwktopem = require("jwk-to-pem");
      const jwt = require("jsonwebtoken");

      let keys = data['keys'];
      let myId = null;
      for (let index = 0; index < keys.length; index++) {
        console.log('iiiiii:', keys[index]);
        if (kid == keys[index].kid) {
          myId = keys[index];
          break;
        }
      }
      console.log('myId', myId)

      // const [firstKey] = data['keys'](kid);
      const firstKey = myId
      console.log('firstKey:', firstKey)
      const publicKey = jwktopem(firstKey);
      try {
        decoded = jwt.verify(token, publicKey);
        // resolve(decoded);
        console.log('success:', decoded)
        let arn = event.routeArn;
        console.log("event now:", event)
        if (!arn) {
          arn = event.methodArn;
        }
        console.log('arn:', arn)
        // callback(decoded, 222);
        result = {
          principalId: decoded.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: `${arn}`
                // Resource: "arn:aws:execute-api:us-east-1:800171782203:f6gcpy3yo7/$default/GET/",
                // Resource: '*'
              }
            ]
          }
        }
        console.log('result:', result)
        return result;
      } catch (e) {
        // reject(e);
        console.log('error:', e)
        callback(Error(e))
        // return {
        //   principalId: 'user',
        //   policyDocument: {
        //     Version: '2012-10-17',
        //     Statement: [
        //       {
        //         Action: 'execute-api:Invoke',
        //         Effect: 'Deny',
        //         Resource: '*'
        //       }
        //     ]
        //   }
        // }

      }
      //     })
      //     .catch(function (error) {
      //       reject(error);
      //     });
      // });




    })
    .catch(err => {
      console.log('Error: ', err.message);
    });

  console.log('keys:', jwksResponseTest);
  console.log('test decoded:', decoded)
  console.log('test result:', JSON.stringify(result))
  // callback(null, result)
  console.log('!!!')
  return result;
  // return {
  //   "isAuthorized": true,
  //   "context": {
  //     "exampleKey": "exampleValue"
  //   }
  // };




  // try {
  //   const jwtToken = await verifyToken(event.authorizationToken)
  //   logger.info('User was authorized', jwtToken)

  //   return {
  //     principalId: jwtToken.sub,
  //     policyDocument: {
  //       Version: '2012-10-17',
  //       Statement: [
  //         {
  //           Action: 'execute-api:Invoke',
  //           Effect: 'Allow',
  //           Resource: '*'
  //         }
  //       ]
  //     }
  //   }
  // } catch (e) {
  //   logger.error('User not authorized', { error: e.message })

  //   return {
  //     principalId: 'user',
  //     policyDocument: {
  //       Version: '2012-10-17',
  //       Statement: [
  //         {
  //           Action: 'execute-api:Invoke',
  //           Effect: 'Deny',
  //           Resource: '*'
  //         }
  //       ]
  //     }
  //   }
  // }
}

// async function verifyToken(authHeader: string): Promise<JwtPayload> {
//   console.log(authHeader);

//   // const token = getToken(authHeader)
//   // const jwt: Jwt = decode(token, { complete: true }) as Jwt

//   // TODO: Implement token verification
//   // You should implement it similarly to how it was implemented for the exercise for the lesson 5
//   // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
//   // return undefined
//   return {
//     iss: "test",
//     sub: 'test',
//     iat: 0,
//     exp: 0
//   }
// }

// function getToken(authHeader: string): string {
//   if (!authHeader) throw new Error('No authentication header')

//   if (!authHeader.toLowerCase().startsWith('bearer '))
//     throw new Error('Invalid authentication header')

//   const split = authHeader.split(' ')
//   const token = split[1]

//   return token
// }
