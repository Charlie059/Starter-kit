// ** JWT import
import jwt from 'jsonwebtoken'

// ** Mock Adapter
import mock from 'src/@fake-db/mock'

// ** Types
import { LoginParams, UserDataType } from 'src/context/types'

// AWS Amplify Auth
import Auth, { CognitoUser } from '@aws-amplify/auth'
import { string } from 'yup/lib/locale'

const users: UserDataType[] = [
  {
    id: 1,
    role: 'admin',
    password: 'admin',
    fullName: 'Xuhui',
    username: 'johndoe',
    email: 'admin@materialize.com'
  },
  {
    id: 2,
    role: 'client',
    password: 'client',
    fullName: 'Xuhui',
    username: 'janedoe',
    email: 'client@materialize.com'
  }
]

// ! These two secrets should be in .env file and not in any other file
const jwtConfig = {
  secret: process.env.NEXT_PUBLIC_JWT_SECRET,
  expirationTime: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
  refreshTokenSecret: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
}

type ResponseType = [number, { [key: string]: any }]

mock.onPost('/jwt/login').reply(request => {
  const { email, password } = JSON.parse(request.data)

  async function login(email: string, password: string): Promise<[number, any]> {
    try {
      const user = await Auth.signIn(email, password)

      // Retrieve the JWT from the user object
      const authToken = user.signInUserSession.idToken.jwtToken as string

      // Create User Data Type
      const _userData: UserDataType = {
        id: 111,
        role: 'admin',
        email: email,
        fullName: '',
        username: email,
        password: password
      }

      // Generate the response
      const response = {
        authToken,
        userData: { ..._userData, password: undefined }
      }

      return [200, response]
    } catch (error) {
      const errorResponse = {
        email: ['email or Password is Invalid']
      }

      return [400, { error: errorResponse }]
    }
  }

  return login(email, password)
})

mock.onPost('/jwt/register').reply(request => {
  if (request.data.length > 0) {
    const { email, password, username } = JSON.parse(request.data)
    const isEmailAlreadyInUse = users.find(user => user.email === email)
    const isUsernameAlreadyInUse = users.find(user => user.username === username)
    const error = {
      email: isEmailAlreadyInUse ? 'This email is already in use.' : null,
      username: isUsernameAlreadyInUse ? 'This username is already in use.' : null
    }

    if (!error.username && !error.email) {
      const { length } = users
      let lastIndex = 0
      if (length) {
        lastIndex = users[length - 1].id
      }
      const userData = {
        id: lastIndex + 1,
        email,
        password,
        username,
        avatar: null,
        fullName: '',
        role: 'admin'
      }

      users.push(userData)

      const accessToken = jwt.sign({ id: userData.id }, jwtConfig.secret as string)

      const user = { ...userData }
      delete user.password

      const response = { accessToken }

      return [200, response]
    }

    return [200, { error }]
  } else {
    return [401, { error: 'Invalid Data' }]
  }
})

mock.onGet('/auth/me').reply(config => {
  // ** Get token from header
  // @ts-ignore
  const token = config.headers.Authorization as string

  console.log(token)

  // ** Default response
  let response: ResponseType = [200, {}]

  // ** Checks if the token is valid or expired
  // jwt.verify(token, jwtConfig.secret as string, (err, decoded) => {
  //   // ** If token is expired
  //   if (err) {
  //     // ** If onTokenExpiration === 'logout' then send 401 error
  //     if (defaultAuthConfig.onTokenExpiration === 'logout') {
  //       // ** 401 response will logout user from AuthContext file
  //       response = [401, { error: { error: 'Invalid User' } }]
  //     } else {
  //       // ** If onTokenExpiration === 'refreshToken' then generate the new token
  //       const oldTokenDecoded = jwt.decode(token, { complete: true })

  //       // ** Get user id from old token
  //       // @ts-ignore
  //       const { id: userId } = oldTokenDecoded.payload

  //       // ** Get user that matches id in token
  //       const user = users.find(u => u.id === userId)

  //       // ** Sign a new token
  //       const accessToken = jwt.sign({ id: userId }, jwtConfig.secret as string, {
  //         expiresIn: jwtConfig.expirationTime
  //       })

  //       // ** Set new token in localStorage
  //       window.localStorage.setItem(defaultAuthConfig.storageTokenKeyName, accessToken)

  //       const obj = { userData: { ...user, password: undefined } }

  //       // ** return 200 with user data
  //       response = [200, obj]
  //     }
  //   } else {
  //     // ** If token is valid do nothing
  //     // @ts-ignore
  //     const userId = decoded.id

  //     // ** Get user that matches id in token
  //     const userData = JSON.parse(JSON.stringify(users.find((u: UserDataType) => u.id === userId)))

  //     delete userData.password

  //     // ** return 200 with user data
  //     response = [200, { userData }]
  //   }
  // })

  const _userData: UserDataType = {
    id: 111,
    role: 'admin',
    email: 'xg73@duke.edu',
    fullName: '',
    username: 'xg73@duke.edu',
    password: 'Testing1234'
  }

  response = [200, { _userData }]

  return response
})
