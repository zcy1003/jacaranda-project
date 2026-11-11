# The Jacaranda Edit · 悉尼蓝花楹街角

一个可交互的 3D 微缩街角：奶油白三层小楼、连续弧形铁艺阳台、四棵各具姿态的蓝花楹，以及紫色长椅和暖灯。采用英文生活方式杂志排版。

**网页地址：<https://zcy1003.github.io/jacaranda-project/>**

**源码仓库：<https://github.com/zcy1003/jacaranda-project>**

![场景预览](assets/preview.png)

## 直接打开

用现代浏览器打开项目根目录的 `index.html` 即可。渲染库、字体和页面样式均已内嵌，可以离线使用。

- 鼠标拖动 / 单指拖动：旋转场景。
- 滚轮 / 双指缩放 / `+`、`−` 按钮：缩放。
- `Day`、`Dusk`、`Night`：平滑切换光照。
- 暂停按钮：暂停或恢复飘落花瓣。
- 底部三条小故事：切换建筑、花冠和长椅视角。
- `Keep this moment`：导出当前视角的 PNG 明信片。
- 画布获得焦点后：方向键旋转，`+` / `−` 缩放，`R` 复位，`1` / `2` / `3` 切换光照。

## 本地编辑和构建

需要 **Python 3.10 或更新版本**，仅使用标准库，不需要安装 Python 包或 Node.js 依赖。

```powershell
cd D:\jacaranda-project
python scripts/build.py
```

该命令从 `src/` 与 `vendor/` 重新生成根目录的 `index.html`。构建不依赖网络，执行目录不影响源文件定位。

如需通过本地服务器预览构建结果：

```powershell
python scripts/build.py --output-dir dist
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

然后打开 <http://127.0.0.1:8000/>，结束预览时在终端按 `Ctrl+C`。

## 用 Git 更新并部署

项目通过 GitHub Actions 构建，再部署到 GitHub Pages。**推送到 `main` 就会触发部署。** 工作流也支持在 Actions 页面手动运行。

```powershell
cd D:\jacaranda-project
git pull --ff-only origin main

# 修改 src/ 中的文件后，更新本地可直接打开的网页
python scripts/build.py

# 检查改动，提交并推送
git status
git diff --stat
git add src scripts vendor index.html .nojekyll README.md docs assets .github .gitignore .gitattributes
git commit -m "Update the jacaranda scene"
git push origin main
```

在仓库的 **Actions → Deploy Jacaranda to GitHub Pages** 中查看本次部署；`build`、`deploy` 都成功后，刷新网页即可。构建与发布耗时取决于 GitHub 的队列和运行环境。

**可编辑源文件以 `src/` 为准。** 不要只修改生成的 `index.html`：在线部署会从源码重新构建，直接修改生成文件的内容会被覆盖。

首次配置、新电脑克隆、出错检查和回退步骤见 **[中文部署指南](docs/DEPLOYMENT.md)**。

## 文件结构

```text
jacaranda-project/
├─ index.html                 # 可直接打开的单文件成品
├─ .nojekyll
├─ src/
│  ├─ index.template.html     # 英文杂志页面和控件
│  ├─ style.css               # 排版与响应式样式
│  ├─ scene-core.js           # 渲染器、基础几何和材质
│  ├─ building.js             # 建筑、阳台、长椅和灯具
│  ├─ garden.js               # 街道、树木、花簇和铺地花瓣
│  └─ scene-runtime.js        # 场景组装、动画、镜头和交互
├─ vendor/                    # 固定版本的渲染库、字体及许可证
├─ scripts/build.py           # 离线单文件构建脚本
├─ assets/preview.png
├─ docs/
│  ├─ DESIGN.md
│  └─ DEPLOYMENT.md
└─ .github/workflows/pages.yml
```

`dist/` 是临时构建产物，由 `.gitignore` 排除；在线只发布该目录中的 `index.html` 和 `.nojekyll`。调试截图、开发会话记录及凭据不属于网页项目。

## 第三方组件

Three.js / OrbitControls 使用 MIT License；Cormorant Garamond、DM Sans 字体使用 SIL Open Font License 1.1。详细归属及许可证位置见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。网页内也保留了相应许可证文本。
