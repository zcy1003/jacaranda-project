# 用 Git 部署和更新网页

本项目的部署链路为：

```text
修改 src/ → git commit → git push origin main
          → GitHub Actions 构建 dist/index.html
          → GitHub Pages 发布网站
```

Git 用来保存和推送版本；GitHub Actions 执行构建、发布；GitHub Pages 提供网页访问地址。项目无需数据库或应用服务器。

## 1. 首次开启 GitHub Pages

仓库：<https://github.com/zcy1003/jacaranda-project>

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
3. 打开 **Actions**，选择 **Deploy Jacaranda to GitHub Pages**。
4. 选择 **Run workflow → main → Run workflow**，或者向 `main` 推送一次提交。
5. 等待 `build` 和 `deploy` 都成功，访问 <https://zcy1003.github.io/jacaranda-project/>。

本仓库已经提供 `.github/workflows/pages.yml`，不需要另外选择 Jekyll 模板，也不需要配置 `gh-pages` 分支。若 Pages 已经使用 GitHub Actions，只需保留现有设置。

## 2. 日常修改

在 PowerShell 中进入项目目录，并先同步远端：

```powershell
cd D:\jacaranda-project
git pull --ff-only origin main
```

常见修改对应文件：

| 想修改的内容 | 文件 |
| --- | --- |
| 标题、英文文案、页面控件 | `src/index.template.html` |
| 配色、字号、手机布局 | `src/style.css` |
| 建筑、阳台、灯具、长椅 | `src/building.js` |
| 蓝花楹、街道、花簇 | `src/garden.js` |
| 初始镜头、材质、基础渲染参数 | `src/scene-core.js` |
| 树木位置、昼夜光照、动画、镜头切换 | `src/scene-runtime.js` |

修改完成后，构建并预览：

```powershell
python scripts/build.py
```

用浏览器打开根目录的 `index.html`，确认画面和交互正确，再提交：

```powershell
git status
git diff --stat
git add src scripts vendor index.html .nojekyll README.md docs assets .github .gitignore .gitattributes
git commit -m "Update the jacaranda scene"
git push origin main
```

每次推送都会触发部署。打开 <https://github.com/zcy1003/jacaranda-project/actions> 查看结果；工作流成功后刷新网站，必要时使用 `Ctrl+F5` 强制刷新。

说明：工作流会自动从 `src/` 构建。上面的本地构建命令用于预览，并保持仓库根目录中的离线成品与源码同步。

## 3. 在另一台电脑继续编辑

安装 Git，以及 Python 3.10 或更新版本。推送时使用有该仓库权限的 GitHub 账号完成 Git 凭据管理器的登录。

```powershell
git clone https://github.com/zcy1003/jacaranda-project.git
cd jacaranda-project
python scripts/build.py
```

随后按上一节修改、提交和推送。已在 `D:\jacaranda-project` 中完成克隆的当前电脑不必再次执行 `git clone`。

## 4. 回退一次已经推送的修改

先查看提交记录：

```powershell
git pull --ff-only origin main
git log --oneline -8
```

对选中的错误提交执行：

```powershell
git revert <需要撤销的提交ID>
git push origin main
```

将占位符替换为实际提交 ID。`git revert` 会生成一条新的撤销提交并触发重新部署。若出现冲突，先处理冲突再继续提交。

## 5. 常见问题

**推送成功，但页面没变化**

- 查看 Actions 中最新提交对应的运行是否已完成。
- 确认修改的是 `src/`；单独修改 `index.html` 会在构建时被源码覆盖。
- 确认推送到了 `main`，并刷新浏览器缓存。

**Actions 的 Pages 配置步骤失败**

- 检查 Settings → Pages 的 Source 是否为 GitHub Actions。
- 确认仓库允许运行 GitHub Actions。
- 打开失败步骤的日志，按具体错误检查权限或配置。

**网页能打开，但 3D 没有显示**

- 使用支持 WebGL 的现代浏览器。
- 检查浏览器的硬件加速是否开启；页面会在 WebGL 初始化失败时显示提示。

**`git push` 被拒绝，因为远端已有新提交**

- 先运行 `git status`，保存或提交本地改动。
- 运行 `git pull --rebase origin main`，如有冲突，解决后按 Git 提示继续。
- 然后再运行 `git push origin main`。

## 官方参考

- [为 GitHub Pages 使用自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [配置 GitHub Pages 发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
