# 去掉工作 GIF 汗滴的方法

这次处理的是 `assets/自嘲熊work.gif`，目标是在保留原有动画、表情、电脑和手部动作的基础上，把脸上和身体上的汗滴去掉。

## 使用的工具

- `ffmpeg`：拆分 GIF 帧、重新合成 GIF
- Node.js
- `sharp`：逐帧绘制遮盖区域

## 处理流程

1. 用 `ffmpeg` 把原始 GIF 拆成 PNG 序列帧。
2. 检查 GIF 的帧数、尺寸和动画速度。
3. 在每一帧固定汗滴位置画白色小椭圆，覆盖汗滴。
4. 用处理后的 PNG 序列重新合成 GIF。
5. 替换原来的 `assets/自嘲熊work.gif`。
6. 运行测试确认代码和资源引用没有被破坏。

## 核心思路

这个方法不是 AI 重新生成图片，而是逐帧遮盖汗滴区域。因为汗滴的位置比较固定，而且都在白色身体区域上，所以用白色椭圆覆盖可以保持整体动画不变。

优点：

- 原动画节奏不变
- 角色线条和动作基本保留
- 不依赖云端 AI 或图片生成服务

限制：

- 如果汗滴和黑色线条、五官、手部重叠，需要手工调整遮盖坐标
- 如果 GIF 帧数很多，坐标检查会更费时间
- 遮盖颜色适合白色身体区域，不适合复杂背景

## 关键命令

拆分 GIF：

```bash
ffmpeg -hide_banner -loglevel error -i assets/自嘲熊work.gif /tmp/bear-work-frames/frame_%03d.png
```

重新合成 GIF：

```bash
ffmpeg -hide_banner -loglevel error \
  -framerate 100/3 \
  -i /tmp/bear-work-clean/frame_%03d.png \
  -filter_complex "[0:v]split[a][b];[a]palettegen=reserve_transparent=on[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 \
  /tmp/自嘲熊work-nosweat.gif
```

验证：

```bash
npm test
```

## 这次的结果

最终替换了：

```text
assets/自嘲熊work.gif
```

并提交为：

```text
13ce728 Remove sweat from work skin gif
```
