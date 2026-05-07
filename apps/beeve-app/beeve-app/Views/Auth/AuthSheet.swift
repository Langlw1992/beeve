import SwiftUI

struct AuthSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authSession: BeeveAuthSession
    @State private var mode: AuthMode = .signIn
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @FocusState private var focusedField: AuthField?

    private var canSubmit: Bool {
        let hasCredentials =
            email.trimmingCharacters(in: .whitespacesAndNewlines).contains("@") &&
            password.count >= 8

        if mode == .signUp {
            return hasCredentials && !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }

        return hasCredentials
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    form
                    modeSwitch
                }
                .padding(BeeveDesign.contentPadding)
            }
            .background { BeeveSceneBackground() }
            .navigationTitle(mode.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("关闭") { dismiss() }
                }
            }
            .safeAreaInset(edge: .bottom) {
                submitButton
            }
            .onAppear {
                focusedField = .email
            }
            .onChange(of: authSession.isSignedIn) { _, isSignedIn in
                if isSignedIn {
                    dismiss()
                }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(mode.headline)
                .font(.title2.weight(.semibold))
                .foregroundStyle(BeeveDesign.primaryText)

            Text(mode.subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var modeSwitch: some View {
        HStack(spacing: 4) {
            Text(mode.switchPrompt)
                .font(.footnote)
                .foregroundStyle(.secondary)

            Button {
                withAnimation(.easeOut(duration: 0.18)) {
                    authSession.errorMessage = nil
                    mode = mode == .signIn ? .signUp : .signIn
                    focusedField = mode == .signUp ? .name : .email
                }
                BeeveHaptics.selection()
            } label: {
                Text(mode.switchAction)
                    .font(.footnote.weight(.semibold))
            }
            .tint(BeeveDesign.accent)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 4)
    }

    private var form: some View {
        VStack(spacing: 12) {
            if mode == .signUp {
                TextField("称呼", text: $name)
                    .textContentType(.name)
                    .focused($focusedField, equals: .name)
                    .beeveInputSurface()
            }

            TextField("邮箱", text: $email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($focusedField, equals: .email)
                .beeveInputSurface()

            SecureField("密码", text: $password)
                .textContentType(mode == .signUp ? .newPassword : .password)
                .focused($focusedField, equals: .password)
                .beeveInputSurface()

            if let errorMessage = authSession.errorMessage {
                Label(errorMessage, systemImage: "exclamationmark.circle")
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 4)
            }
        }
    }

    private var submitButton: some View {
        Button {
            Task {
                BeeveHaptics.lightImpact()
                let didSucceed: Bool

                switch mode {
                case .signIn:
                    didSucceed = await authSession.signIn(email: email, password: password)
                case .signUp:
                    didSucceed = await authSession.signUp(name: name, email: email, password: password)
                }

                if didSucceed {
                    BeeveHaptics.success()
                }
            }
        } label: {
            if authSession.isLoading {
                ProgressView()
                    .tint(.white)
            } else {
                Text(mode.actionTitle)
            }
        }
        .buttonStyle(BeevePrimaryButtonStyle())
        .disabled(!canSubmit || authSession.isLoading)
        .opacity(canSubmit ? 1 : 0.5)
        .padding(.horizontal, BeeveDesign.contentPadding)
        .padding(.top, 8)
        .padding(.bottom, 8)
        .background(.regularMaterial)
    }
}

private enum AuthMode: String, CaseIterable, Identifiable {
    case signIn
    case signUp

    var id: String { rawValue }

    var title: String {
        switch self {
        case .signIn: "登录"
        case .signUp: "注册"
        }
    }

    var headline: String {
        switch self {
        case .signIn: "欢迎回来"
        case .signUp: "创建 Beeve 账号"
        }
    }

    var subtitle: String {
        switch self {
        case .signIn: "登录后继续使用你的账号。"
        case .signUp: "用邮箱创建账号，之后可以在这台设备上保持登录。"
        }
    }

    var actionTitle: String {
        switch self {
        case .signIn: "登录"
        case .signUp: "创建账号"
        }
    }

    var switchPrompt: String {
        switch self {
        case .signIn: "还没有账号？"
        case .signUp: "已经有账号？"
        }
    }

    var switchAction: String {
        switch self {
        case .signIn: "创建账号"
        case .signUp: "去登录"
        }
    }
}

private enum AuthField {
    case name
    case email
    case password
}

#Preview {
    AuthSheet()
        .environmentObject(BeeveAuthSession())
}
