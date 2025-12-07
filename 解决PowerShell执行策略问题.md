# 🔧 解决 PowerShell 执行策略问题

## 当前问题

PowerShell 提示：`无法加载文件，因为在此系统上禁止运行脚本`

这是 Windows PowerShell 的安全策略，需要允许运行脚本。

---

## ✅ 解决方案

### 方法一：临时允许（推荐，最简单）

在 PowerShell 中执行以下命令（以管理员身份运行）：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后输入 `Y` 确认。

**之后重新执行部署命令：**
```powershell
cd F:\test4\服务器
cloudbase run:deploy --envId test-7g8oe7lq75832d7c
```

---

### 方法二：使用 CMD（不需要修改策略）

如果不想修改 PowerShell 策略，可以使用 CMD：

1. **按 `Win + R`**，输入 `cmd`，按回车
2. **切换到项目目录：**
   ```cmd
   cd /d F:\test4\服务器
   ```
3. **执行部署：**
   ```cmd
   cloudbase run:deploy --envId test-7g8oe7lq75832d7c
   ```

---

### 方法三：使用批处理文件

直接双击运行 `deploy.bat` 文件（在文件资源管理器中）：

1. 打开文件资源管理器
2. 导航到 `F:\test4\服务器`
3. 双击 `deploy.bat` 文件

---

## 🎯 推荐操作

**最简单的方法**：使用 CMD（方法二）

1. 按 `Win + R`
2. 输入 `cmd` 按回车
3. 复制粘贴以下命令：
   ```cmd
   cd /d F:\test4\服务器
   cloudbase run:deploy --envId test-7g8oe7lq75832d7c
   ```

---

## 📝 如果还有其他问题

请告诉我具体的错误信息，我会继续帮你解决！

