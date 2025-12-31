import { describe, expect, it } from 'vitest'
import { createClient, authClient, signIn, signUp, signOut, getSession } from './index'

describe('Auth Client', () => {
  describe('createClient', () => {
    it('should create a client with custom baseURL', () => {
      const client = createClient('http://localhost:4000')
      expect(client).toBeDefined()
      expect(client.signIn).toBeDefined()
      expect(client.signUp).toBeDefined()
      expect(client.signOut).toBeDefined()
      expect(client.getSession).toBeDefined()
    })
  })

  describe('authClient', () => {
    it('should export default authClient instance', () => {
      expect(authClient).toBeDefined()
    })

    it('should have signIn methods', () => {
      expect(authClient.signIn).toBeDefined()
      expect(authClient.signIn.email).toBeDefined()
      expect(authClient.signIn.social).toBeDefined()
    })

    it('should have signUp methods', () => {
      expect(authClient.signUp).toBeDefined()
      expect(authClient.signUp.email).toBeDefined()
    })

    it('should have signOut method', () => {
      expect(authClient.signOut).toBeDefined()
    })

    it('should have getSession method', () => {
      expect(authClient.getSession).toBeDefined()
    })
  })

  describe('Exported shortcuts', () => {
    it('should export signIn', () => {
      expect(signIn).toBeDefined()
      expect(signIn.email).toBeDefined()
      expect(signIn.social).toBeDefined()
    })

    it('should export signUp', () => {
      expect(signUp).toBeDefined()
    })

    it('should export signOut', () => {
      expect(signOut).toBeDefined()
    })

    it('should export getSession', () => {
      expect(getSession).toBeDefined()
    })
  })
})
