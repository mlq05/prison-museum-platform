# AR Marker 自定义标识生成指南

## 一、生成自定义 Marker

### 方法一：使用 AR.js 在线生成器（推荐）

1. **访问生成器**
   - 打开：https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
   - 或使用新版：https://ar-js-org.github.io/AR.js-Docs/marker-training/

2. **上传自定义图片**
   - 点击 "UPLOAD" 按钮
   - 选择一张图片（建议：黑白图片，对比度高，图案清晰）
   - 推荐尺寸：512x512 像素或更大

3. **调整参数**
   - **Pattern Ratio**：调整图案比例（默认 0.50，建议范围 0.40-0.60）
   - **Image Size**：调整图片尺寸（默认 512px，建议 512px 或 1024px）
   - **Border Color**：边框颜色（建议使用黑色或深色）

4. **预览效果**
   - 在页面中央查看生成的 marker 预览
   - 确保图案清晰、对比度足够

5. **下载文件**
   - **DOWNLOAD MARKER**：下载 `.patt` 文件（这是 AR 识别需要的文件）
   - **DOWNLOAD IMAGE**：下载 `.png` 图片（用于打印或显示）
   - **PDF 选项**：如果需要打印，可以选择 PDF 格式（一页一个、一页两个、一页六个）

### 方法二：使用命令行工具

```bash
# 安装 marker 训练工具
npm install -g arjs-marker-training

# 生成 marker（从图片）
arjs-marker-training -i your-image.png -o custom-marker.patt -s 512
```

## 二、集成到项目中

### 1. 准备文件

生成后，您会得到两个文件：
- `custom-marker.patt` - AR 识别文件（必需）
- `custom-marker.png` - 图片文件（用于显示/打印）

### 2. 上传到静态网站托管

1. 登录 [云开发控制台](https://console.cloud.tencent.com/tcb)
2. 进入 **静态网站托管** → **文件管理**
3. 进入 `ar-pages/libs/` 目录
4. 上传 `custom-marker.patt` 文件

**目录结构应该是：**
```
ar-pages/
├── marker-ar-simple.html
└── libs/
    ├── hiro.patt          (默认 marker)
    ├── custom-marker.patt (您的新 marker)
    ├── aframe-ar.js
    └── ...
```

### 3. 更新 HTML 代码

修改 `miniprogram/ar-pages/marker-ar-simple.html`：

找到这一行（约第 114 行）：
```html
<a-marker 
    type="pattern" 
    url="./libs/hiro.patt"  <!-- 替换这里 -->
    preset="hiro"
>
```

改为：
```html
<a-marker 
    type="pattern" 
    url="./libs/custom-marker.patt"  <!-- 使用您的自定义 marker -->
    preset="hiro"  <!-- 可选：如果自定义marker失败，会回退到hiro -->
>
```

### 4. 更新小程序代码（如果需要）

如果您在小程序中使用 xr-frame，需要修改 `miniprogram/pages/ar-xr/ar-xr.wxml`：

找到（约第 21-22 行）：
```xml
<xr-asset-load 
    type="pattern" 
    asset-id="hiro-marker" 
    src="/miniprogram/ar-pages/libs/hiro.patt"  <!-- 替换这里 -->
/>
```

改为：
```xml
<xr-asset-load 
    type="pattern" 
    asset-id="custom-marker" 
    src="/miniprogram/ar-pages/libs/custom-marker.patt"  <!-- 使用您的自定义 marker -->
/>
```

同时更新引用（约第 57 行）：
```xml
<xr-ar-tracker 
    mode="Marker" 
    src="custom-marker"  <!-- 改为新的 asset-id -->
    bind:found="onMarkerFound"
    bind:lost="onMarkerLost"
>
```

## 三、测试验证

### 1. 在浏览器中测试

1. 部署更新后的文件到静态网站托管
2. 在浏览器中打开 AR 页面：
   ```
   https://cloud1-6glt083780b46f82-1390050511.tcloudbaseapp.com/ar-pages/marker-ar-simple.html?hallId=1
   ```
3. 打印或显示您下载的 `custom-marker.png` 图片
4. 将摄像头对准 marker 图案
5. 应该能看到 AR 内容显示

### 2. 在小程序中测试

1. 重新编译小程序
2. 进入 AR 体验页面
3. 将摄像头对准打印的 marker 图片
4. 验证 AR 内容是否正确显示

## 四、最佳实践

### 图片选择建议

✅ **推荐：**
- 黑白图片，对比度高
- 图案清晰，边缘锐利
- 无重复图案
- 正方形图片（1:1 比例）
- 建议尺寸：512x512 或 1024x1024 像素

❌ **避免：**
- 彩色图片（会被转换为灰度）
- 模糊或低分辨率图片
- 重复纹理（如条纹、格子）
- 过于简单或过于复杂的图案

### 参数调整建议

- **Pattern Ratio 0.40-0.50**：适合简单图案
- **Pattern Ratio 0.50-0.60**：适合复杂图案
- **Image Size 512px**：适合大多数场景
- **Image Size 1024px**：更高精度，但文件更大

### 多 Marker 支持

如果需要多个不同的 marker：

1. 为每个 marker 生成独立的 `.patt` 文件
2. 在 HTML 中使用多个 `<a-marker>` 标签：

```html
<!-- Marker 1 -->
<a-marker 
    type="pattern" 
    url="./libs/marker1.patt"
>
    <!-- AR 内容 1 -->
</a-marker>

<!-- Marker 2 -->
<a-marker 
    type="pattern" 
    url="./libs/marker2.patt"
>
    <!-- AR 内容 2 -->
</a-marker>
```

## 五、常见问题

### Q: Marker 识别不准确怎么办？

A: 
1. 增加 Pattern Ratio（尝试 0.55-0.60）
2. 使用更高分辨率的图片（1024px）
3. 确保打印的 marker 平整，无反光
4. 确保光线充足

### Q: 可以同时使用多个 marker 吗？

A: 可以。在 HTML 中添加多个 `<a-marker>` 标签即可。

### Q: Marker 图片可以是有颜色的吗？

A: 可以，但建议使用黑白图片。彩色图片会被转换为灰度，可能影响识别效果。

### Q: 如何替换默认的 hiro marker？

A: 直接修改代码中的 `url` 路径即可。建议保留 `preset="hiro"` 作为备用。

## 六、资源链接

- **Marker 生成器**：https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
- **AR.js 文档**：https://ar-js-org.github.io/AR.js-Docs/
- **Hiro Marker 参考**：https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg

