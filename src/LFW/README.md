# LFW

## 编写代码的注意事项

- 该目录下只可用标准的ecmascript实现。
- 该目录下不可使用`import XXX from "@/LFW/xx"`
- 该目录下不可import目录, 必须具体到文件。否则极可能遭遇难以排查的循环引用问题
- 我变得不太喜欢export default

## TODO

- 在资源加载方面总觉得过于复杂
- test相关代码移除此目录