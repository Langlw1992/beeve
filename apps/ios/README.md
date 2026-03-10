# Beeve iOS

这是 Beeve 的原生 iOS 应用脚手架，采用 **SwiftUI + SwiftData + UserNotifications**。

## 当前实现
- 4 个一级 Tab：首页、产品、提醒、我的
- 产品展示与详情浏览
- 产品搜索、精选与分类筛选
- 收藏能力（SwiftData）
- 提醒创建 / 完成 / 本地通知调度
- 个人资料与通知偏好初始化入口

## 工程结构
本目录直接提交原生 **Xcode 工程文件**，默认使用 `.xcodeproj + xcodebuild` 工作流，不依赖额外工程生成工具。

```bash
cd apps/ios
pnpm check:env
pnpm build
pnpm typecheck
pnpm open
pnpm preview:open
```

`pnpm preview:open` 会直接用 Xcode 打开 `BeeveIOS.xcodeproj`，并定位到已带 `#Preview` 的 `RootTabView.swift`。由于 Xcode 没有公开的命令行接口来直接切换 Canvas，打开后请使用 **Editor > Canvas**，或按 **⌥⌘↩** 查看原生 SwiftUI Preview。

## 目录结构
```text
apps/ios/
├─ BeeveIOS.xcodeproj/
├─ BeeveIOS/
│  ├─ App/
│  ├─ Features/
│  ├─ Models/
│  ├─ Services/
│  └─ Shared/
├─ package.json
└─ README.md
```

## 说明
- 当前仓库已经切换为原生 `.xcodeproj` 结构，不再默认依赖 XcodeGen。
- `pnpm build` / `pnpm typecheck` 会通过 `xcodebuild` 对 iOS Simulator 执行原生构建校验，并关闭签名要求，便于本地快速验证。
- 关键页面已补齐原生 `#Preview`，可直接在 Xcode Canvas 中查看应用总览、首页、产品列表、产品详情、提醒列表、提醒编辑与个人页。
- 由于 iOS 原生构建依赖 macOS 与 Xcode，这些脚本在非 macOS 环境下会明确输出跳过提示，避免误报失败。
- 当前代码已按 SwiftUI / SwiftData / UserNotifications 的原生用法整理，可继续在 Xcode 中围绕页面、数据流与测试迭代。
