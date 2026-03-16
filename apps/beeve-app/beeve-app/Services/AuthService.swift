import AuthenticationServices
import Foundation

@MainActor
@Observable
final class AuthService {
    var isAuthenticated = false
    var currentUser: AuthUser?
    var isLoading = false
    var error: String?

    private let keychainService = "com.beeve.auth"

    // MARK: - Sign in with Apple

    func signInWithApple(credential: ASAuthorizationAppleIDCredential) async {
        isLoading = true
        error = nil

        guard let identityToken = credential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8) else {
            error = "无法获取 Apple 身份令牌"
            isLoading = false
            return
        }

        // Store user info from first sign-in (Apple only sends name on first auth)
        let fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
            .compactMap { $0 }
            .joined(separator: " ")

        do {
            // Exchange Apple token with backend
            let authResponse = try await APIClient.shared.signInWithApple(
                idToken: tokenString,
                name: fullName.isEmpty ? nil : fullName
            )

            // Save tokens
            saveToken(authResponse.token, forKey: "access_token")
            if let refresh = authResponse.refreshToken {
                saveToken(refresh, forKey: "refresh_token")
            }

            currentUser = authResponse.user
            isAuthenticated = true
        } catch {
            self.error = "登录失败：\(error.localizedDescription)"
        }

        isLoading = false
    }

    // MARK: - Session Restore

    func restoreSession() async {
        guard let token = loadToken(forKey: "access_token") else {
            isAuthenticated = false
            return
        }

        isLoading = true
        do {
            let user = try await APIClient.shared.getMe(token: token)
            currentUser = user
            isAuthenticated = true
        } catch {
            // Token expired, try refresh
            if let refreshToken = loadToken(forKey: "refresh_token") {
                await refreshSession(with: refreshToken)
            } else {
                signOut()
            }
        }
        isLoading = false
    }

    // MARK: - Sign Out

    func signOut() {
        deleteToken(forKey: "access_token")
        deleteToken(forKey: "refresh_token")
        currentUser = nil
        isAuthenticated = false
    }

    // MARK: - Keychain

    private func saveToken(_ token: String, forKey key: String) {
        let data = Data(token.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    private func loadToken(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func deleteToken(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }

    private func refreshSession(with refreshToken: String) async {
        do {
            let response = try await APIClient.shared.refreshToken(refreshToken)
            saveToken(response.token, forKey: "access_token")
            if let newRefresh = response.refreshToken {
                saveToken(newRefresh, forKey: "refresh_token")
            }
            currentUser = response.user
            isAuthenticated = true
        } catch {
            signOut()
        }
    }
}

// MARK: - Types

struct AuthUser: Codable, Equatable {
    let id: String
    let name: String?
    let email: String?
    let image: String?
}

struct AuthResponse: Codable {
    let token: String
    let refreshToken: String?
    let user: AuthUser
}
