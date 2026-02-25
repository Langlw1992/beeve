/**
 * @beeve/server - 登录页面
 *
 * 服务端渲染的登录表单页面，使用 Elysia HTML 插件的 JSX 语法。
 * 表单通过客户端 fetch 调用 Better Auth API 完成登录。
 */

// Html 命名空间由 JSX 工厂在编译时使用（tsconfig jsxFactory: "Html.createElement"）
import {Html} from '@elysiajs/html'
export {Html}

// ==================== 页面组件 ====================

/**
 * 渲染登录页面 HTML
 * @param redirect - 登录成功后的跳转地址，默认为 '/'
 */
export const SignInPage = (redirect: string) => (
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      <title>登录 - Beeve</title>
      <script src="https://cdn.tailwindcss.com" />
    </head>
    <body class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        {/* Logo / 标题 */}
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">🐝 Beeve</h1>
          <p class="mt-2 text-gray-600">登录你的账号</p>
        </div>

        {/* 登录卡片 */}
        <div class="bg-white rounded-2xl shadow-lg p-8">
          {/* 错误提示 */}
          <div
            id="error-msg"
            class="hidden mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          />

          <form
            id="sign-in-form"
            class="space-y-5"
          >
            {/* 邮箱 */}
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* 密码 */}
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="请输入密码"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              id="submit-btn"
              class="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              登录
            </button>
          </form>

          {/* 注册链接 */}
          <p class="mt-6 text-center text-sm text-gray-600">
            没有账号？{' '}
            <a
              href={`/sign-up${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              立即注册
            </a>
          </p>
        </div>
      </div>

      {/* 客户端登录逻辑 */}
      <script>{`
        (function() {
          var form = document.getElementById('sign-in-form');
          var errorMsg = document.getElementById('error-msg');
          var submitBtn = document.getElementById('submit-btn');
          var redirectUrl = ${JSON.stringify(redirect)};

          form.addEventListener('submit', async function(e) {
            e.preventDefault();
            errorMsg.classList.add('hidden');
            errorMsg.textContent = '';
            submitBtn.disabled = true;
            submitBtn.textContent = '登录中...';

            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;

            try {
              var res = await fetch('/api/auth/sign-in/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
                credentials: 'include'
              });

              if (res.ok) {
                window.location.href = redirectUrl;
              } else {
                var data = await res.json().catch(function() { return {}; });
                errorMsg.textContent = data.message || '登录失败，请检查邮箱和密码';
                errorMsg.classList.remove('hidden');
              }
            } catch (err) {
              errorMsg.textContent = '网络错误，请稍后重试';
              errorMsg.classList.remove('hidden');
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = '登录';
            }
          });
        })();
      `}</script>
    </body>
  </html>
)
