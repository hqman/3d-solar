# 3D Solar System Simulator

这是一个使用 Three.js 构建的交互式 3D 太阳系模拟器。

## 功能

- 真实的太阳系模型，包括太阳、八大行星和月球
- 行星按照相对比例大小创建（轨道距离非真实比例）
- 行星自转和绕轨道运动
- 互动控制：拖动旋转视角，滚轮缩放
- 精美的空间背景和星星

## 技术栈

- HTML5
- CSS3
- JavaScript
- Three.js（最新版本，通过 CDN 加载）

## 运行项目

使用任意 HTTP 服务器运行项目。例如：

```bash
# 如果使用 Python
python3 -m http.server 8080

# 如果安装了 Node.js
npx serve
```

然后在浏览器中访问 `http://localhost:8080`。

## 浏览器兼容性

该项目适用于所有支持现代 JavaScript 和 WebGL 的浏览器。

## 资源

- 所有行星纹理均来自 Three.js 官方示例资源
- 行星的相对大小基于真实数据，但轨道距离为了美观性已经进行了调整 # 3d-solar
