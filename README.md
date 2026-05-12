# 未来对话 - AI 智能质检辅助

一个基于 Chrome Extension Manifest V3 的质检辅助插件，用于在网页对话场景中提取聊天上下文，调用兼容 OpenAI Chat Completions 格式的多模态大模型，并辅助填写质检结果。

## 功能概览

- 在目标网页注入质检工作台浮窗
- 提取顾客消息、系统规则触发消息和待质检 AI 回复
- 支持配置 API Key、接口地址和模型名称
- 支持 Prompt 存档、本地切换和编辑
- 支持单步调试，查看上下文、模型判定和测试报告
- 支持自动打标流程，包括场景、正确性、错误原因和评价填写

## 项目结构

```text
.
├── manifest.json   # Chrome 扩展声明文件
├── background.js   # 后台 service worker，负责调用大模型接口
├── content.js      # 注入页面的质检工作台和自动化逻辑
├── popup.html      # 插件配置弹窗
├── popup.js        # 配置读取和保存逻辑
└── .gitignore
```

## 安装方式

1. 打开 Chrome 或 Chromium 浏览器。
2. 访问 `chrome://extensions/`。
3. 开启右上角的「开发者模式」。
4. 点击「加载已解压的扩展程序」。
5. 选择本项目目录：

```text
/Users/edy/Downloads/AI-QC-Extension_codex
```

安装完成后，浏览器工具栏会出现插件入口。

## 配置方式

点击浏览器右上角插件图标，填写：

- `API Key`：大模型服务的访问密钥
- `API 接口地址`：兼容 Chat Completions 的接口地址
- `模型名称`：要调用的模型名称

默认配置为：

```text
API 接口地址: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
模型名称: qwen-vl-max
```

配置会保存在浏览器本地 `chrome.storage.local` 中。

## 使用方式

1. 打开需要质检的网页。
2. 页面左上角会出现「质检挂件」浮窗。
3. 点击「配置 Prompt」可以编辑或切换质检 Prompt。
4. 点击「单步调试」可以逐条查看上下文、模型判定和报告。
5. 点击「全自动打标」会按当前页面对话列表自动处理待质检回复。
6. 如需停止自动流程，点击「紧急停止」。

## 安全提示

- 不要把真实 API Key 写入代码或提交到 GitHub。
- API Key 只应通过插件弹窗配置，并保存在浏览器本地。
- `.env`、压缩包、CRX 包和私钥文件已经被 `.gitignore` 忽略。
- 当前扩展声明了 `<all_urls>` host 权限，只建议在可信环境中安装使用。

## 开发说明

本项目没有构建步骤，修改源码后在 `chrome://extensions/` 中点击扩展的刷新按钮即可重新加载。

常用 Git 流程：

```bash
git status
git add .
git commit -m "Describe your change"
git push
```

## 版本

当前版本：`1.0`
