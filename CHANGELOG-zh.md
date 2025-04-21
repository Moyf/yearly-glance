## [2.1.5](https://github.com/Moyf/yearly-glance/compare/2.1.4...2.1.5) (2025-04-21)

### ✨ 新功能

* 测试


## [2.1.4](https://github.com/Moyf/yearly-glance/compare/2.1.3...2.1.4) (2025-04-21)


### ✨ 新功能

* 隐藏空日期时保留今天的显示 ([4a6adac](https://github.com/Moyf/yearly-glance/commit/4a6adacc757f3943390bc8d2297f03568cf5dc17))


### 🎨 样式

* 对于没有年份的生日，年龄和生肖显示成空，并将原有提示信息放在tooltip中 ([274dbc1](https://github.com/Moyf/yearly-glance/commit/274dbc14659ec88f74cd5b7555f0695aaf50d011))
* **tooltip:** eventTooltip中null值显示为- ([24e5d13](https://github.com/Moyf/yearly-glance/commit/24e5d13972cdd10d8e98ba74a609cd46c5b69498))


### 🐛 修复

* **eventmanager:** 修复搜索时事件类型未正确传递 ([7d4c6d4](https://github.com/Moyf/yearly-glance/commit/7d4c6d4bfce62186abc9927912e97c5c9c957f19))



## [2.1.3](https://github.com/Moyf/yearly-glance/compare/2.1.2...2.1.3) (2025-04-19)


### ✨ 新功能

* 生肖增加干支前缀，增加对应i18n ([229b2b6](https://github.com/Moyf/yearly-glance/commit/229b2b6c725b631af83579443899895549092f8a))


### 🐛 修复

* 农历日期计算与展示问题 [@linglilongyi](https://github.com/linglilongyi) (#30) ([d16512b](https://github.com/Moyf/yearly-glance/commit/d16512b608a589b51b83560e421cdbe34d1f2d76)), closes [#30](https://github.com/Moyf/yearly-glance/issues/30)
* 修复农历下一次生日的显示错误 ([fe2a144](https://github.com/Moyf/yearly-glance/commit/fe2a144619378ead54466bbdfa6ac40c2311dafb))

### 👨‍💻 新贡献者

* [@linglilongyi](https://github.com/linglilongyi)


## [2.1.2](https://github.com/Moyf/yearly-glance/compare/2.1.1...2.1.2) (2025-04-18)


### 🐛 修复

* 一览视图中事件的默认图标未正确显示 ([375cb38](https://github.com/Moyf/yearly-glance/commit/375cb3883ee12762ecfc556bdfb0cbfd17fce4ae))


### 📝 文档

* 增加CONTRIBUTING.md (#29) ([91509a0](https://github.com/Moyf/yearly-glance/commit/91509a0b01b8a6c850f3f5099f08d8ce500bdb0d)), closes [#29](https://github.com/Moyf/yearly-glance/issues/29)
* **readme:** 更新优化 README 文档 ([d7c1d45](https://github.com/Moyf/yearly-glance/commit/d7c1d45200bcf0214f85a79b037d6e51e2fa2df4))


### 🔧 持续集成

* 微调 Release 生成的文本格式 ([6e42481](https://github.com/Moyf/yearly-glance/commit/6e4248123905fa291be80f59423efe4514407955))



## [2.1.1](https://github.com/Moyf/yearly-glance/compare/2.1.0...2.1.1) (2025-04-18)


### 🐛 修复

* **eventform:** 修复事件隐藏在生日表单中未正确显示 ([273e0b4](https://github.com/Moyf/yearly-glance/commit/273e0b4f1b61b2018d954c40ca0e027caba0fe61))


### 📝 文档

* **CHANGELOG:** 修缮更新日志 ([4605228](https://github.com/Moyf/yearly-glance/commit/4605228a9f25e5402b0be9896ef4d371f9542008))
* **manifest:** 更新插件描述 ([57ca2d4](https://github.com/Moyf/yearly-glance/commit/57ca2d40427d42cdcab1956f3ff530a8947c8749))


### 🔧 持续集成

* **scripts:** 移除changelog:append以及部分husky残留 ([bbf76d1](https://github.com/Moyf/yearly-glance/commit/bbf76d1e8bf8ab55c12b638482b33ba24b2aa7d6))
* **workflow:** 修改变更日志的生成，增加中文的安装指南 ([b94f686](https://github.com/Moyf/yearly-glance/commit/b94f6860d70c67a337ebd47674c8122ce1729dc9))



# [2.1.0](https://github.com/Moyf/yearly-glance/compare/1.0.0...2.1.0) (2025-04-17)


## 2.1.0 改动

### ✨ 新功能：全都可以藏起来！ 🙈

* **隐藏事件:** 给所有事件类型都增加「可隐藏」属性 ([ae62f4d](https://github.com/Moyf/yearly-glance/commit/ae62f4dddcfba4e27c4afd28046c982c01b336c0)), closes [#25](https://github.com/Moyf/yearly-glance/issues/25)
* **隐藏空日期:** 增加列表视图「隐藏空日期」的按钮，可以配合高度限制以及类型筛选查看过滤后的简化视图 ([12831e5](https://github.com/Moyf/yearly-glance/commit/12831e59ed6b32f81948144ece735ee7d8be744b)), closes [#26](https://github.com/Moyf/yearly-glance/issues/26)


### 🎨 样式

* **事件管理器：** 给不同的事件页面（event-list）增加了 datatype 属性；并调整了按钮的图标 ([28a20c4](https://github.com/Moyf/yearly-glance/commit/28a20c4129e3e7cea33eef4316129e9c3512fe9c))
* **列表视图：** 修复列表模式的 hover 样式 ([1b7508e](https://github.com/Moyf/yearly-glance/commit/1b7508e7e39d6042fd3f568cd33c763a7278d152))


### 📝 文档

* **持续集成:** 尝试提交时自动添加commit进changelog ([73fbb82](https://github.com/Moyf/yearly-glance/commit/73fbb82397c0dbff6d16cf59e27a8b4fe76ecd28))
* **规范:** 修复changelog中不规范的提交 ([ebe52a5](https://github.com/Moyf/yearly-glance/commit/ebe52a5f3859baeae677d48b0a9437e209771054) [e838743](https://github.com/Moyf/yearly-glance/commit/e8387439f63d96566a83bae4eb071271fe956b4e))


## 2.0.0 超大更新

### 💥 破坏性变更：数据结构重写

* **事件ID:** 给所有事件增加了 UUID，可能会导致系统内置节日重复创建（可以去 data.json 手动删除，或者删除 data.json 文件并重置插件）

### ♻️ 重构

* **删除确认:** 将onCancel重命名为onClose以保持一致性 ([b93750e](https://github.com/Moyf/yearly-glance/commit/b93750ebc9f664a3444f3903c22d17f412af546e))
* **Event默认类型:** 更改事件类型的默认排序（自定义事件->生日->节日） ([f562d9e](https://github.com/Moyf/yearly-glance/commit/f562d9ecf95cd14cdad1ca8a616646bef1e75a95))

### ✨ 新功能

* **颜色选择:** 为事件自定义添加颜色选择器组件 ([cfbf6ca](https://github.com/Moyf/yearly-glance/commit/cfbf6ca5e76a04d544233534e3511d1c2a225576))
* **删除前确认:** 实现用于事件删除确认的ConfirmDialog组件 ([24813f4](https://github.com/Moyf/yearly-glance/commit/24813f416a21fe695f2933fa7c1e48aa2330abdd))
* **事件创建:** 增强事件创建功能，添加更多属性 ([c9b2943](https://github.com/Moyf/yearly-glance/commit/c9b2943e33e054679e85f07cb0f14c1b15fbe690))
* **事件管理器:** 实现事件搜索功能并增强工具提示操作 ([93bc380](https://github.com/Moyf/yearly-glance/commit/93bc380db806cd0d2313e2ed071258a317090cd4))
* **事件详情:** 为事件提示框添加日期显示功能 ([4d4e789](https://github.com/Moyf/yearly-glance/commit/4d4e789d6262717f5d6ce04a5e2986a65f68e9c5))
* **UUID:** 集成UUID生成功能用于事件ID，并加强事件管理 ([17446e0](https://github.com/Moyf/yearly-glance/commit/17446e083d7883dc8d92f61b8621347dd48d9624))
* **视图选项:** 添加视图预设选项及配置处理 ([ee19736](https://github.com/Moyf/yearly-glance/commit/ee19736dd352520459d6bc34a9e00ccfa7f538c1))

### 🎨 样式

* **样式调整**: 为添加事件设置指针光标样式 ([f1d3d0a](https://github.com/Moyf/yearly-glance/commit/f1d3d0a5a9b1d716909477a5075a020d75b8340e))
    * 调整 flex 值 ([46beb47](https://github.com/Moyf/yearly-glance/commit/46beb47fa81a6d4e9ceb246bc778a193a560c944))
    * 调整表单选项的样式 ([60edc3a](https://github.com/Moyf/yearly-glance/commit/60edc3ad755d8e68895ec27b2827c6296b83009d))
    * 修改边框样式 ([fc9dd72](https://github.com/Moyf/yearly-glance/commit/fc9dd726d284fbbc4d9cd03e18a75a01265e4f8e))
    * **EventTooltip:** 增大操作按钮间距以优化布局 ([08850c1](https://github.com/Moyf/yearly-glance/commit/08850c1b12c013fe55c1c755c7091bacf9b77e6a))
    * **yearlyglancelist:** 修复列表模式的 hover 样式 ([1b7508e](https://github.com/Moyf/yearly-glance/commit/1b7508e7e39d6042fd3f568cd33c763a7278d152))
* **概览视图:** 调整月份行间距以改善布局一致性 ([5de40e9](https://github.com/Moyf/yearly-glance/commit/5de40e9abca87d2552fa6a07e80ad2a873f66a06))
    *  重构CSS以提高可读性和可维护性 ([caab2e8](https://github.com/Moyf/yearly-glance/commit/caab2e8d49cb0fb6b49b99f3e6b7cc0825baa212))
    * 重构标签页组件并优化样式 ([972b091](https://github.com/Moyf/yearly-glance/commit/972b091b0950233b2bae1777cdd3db809027725b))

### 🐛 修复

* 确保文件导入中的大小写一致，并更新 TypeScript 配置 ([a1b32aa](https://github.com/Moyf/yearly-glance/commit/a1b32aa33bcb8d90033badc39acc3b018d393259))
* 优化发布工作流中提交信息解析的正则表达式模式 ([ffc792d](https://github.com/Moyf/yearly-glance/commit/ffc792ddadc5570cbef82d88e4bacdf36d563bef))
* 更新事件类型引用以保持一致 ([5efd7c0](https://github.com/Moyf/yearly-glance/commit/5efd7c0ba1b8d751c9266327ac3e59b51b62486e))
* 更新发布工作流中用于检测重大变更的正则表达式 ([7462f0e](https://github.com/Moyf/yearly-glance/commit/7462f0ed2d6093bf1203b7a406eab5ae105a4148))

### 📝 文档

* **changelog:** 增加2.0.0版本更新日志的中英文文档 ([80c28c3](https://github.com/Moyf/yearly-glance/commit/80c28c32eeba6e3b591ca91e5fcf7f0827e0704c))

### 🔧 持续集成

* 尝试提交时自动添加commit进changelog ([24b6114](https://github.com/Moyf/yearly-glance/commit/24b61144c0cda6cfb32027b9e968b2aaf937041a))
* 更改release更新日志的生成方式 ([17405bf](https://github.com/Moyf/yearly-glance/commit/17405bfd15531d52befd2c9c4c2176768881a685))
* 简化命令，changelog:unreleased 改成 changelog:u ([d413d4a](https://github.com/Moyf/yearly-glance/commit/d413d4a79a51fe2163ef5c94556b773c9bd4b85c))
* 重构changelog的生成方式 ([343c0a1](https://github.com/Moyf/yearly-glance/commit/343c0a164f50cd306c54983f94e7de095bb7b047))
* **scripts:** 更新version-bump脚本，beta版本改成修改manifest-beta.json文件 ([80b04a8](https://github.com/Moyf/yearly-glance/commit/80b04a8c901b982d9c454357f305056b2dfbeb8e))

### 🔨 杂项

* **提交流程:** 使用 conventional 和 commitizen 工具 ([829f5a8](https://github.com/Moyf/yearly-glance/commit/829f5a81c379c4bee09d4cf82b5ba78b662e8168))
* 更新工具提示中的日期标签并增强国际化支持 ([6504060](https://github.com/Moyf/yearly-glance/commit/6504060a3f0bb9b7cc01c06fb95699aca3c3052c))

### ⏪️ 回退

* ci: 尝试提交时自动添加commit进changelog ([73fbb82](https://github.com/Moyf/yearly-glance/commit/73fbb82397c0dbff6d16cf59e27a8b4fe76ecd28))


# [1.0.0](https://github.com/Moyf/yearly-glance/compare/2f988aaf5ac4f8118626d9badd8897d900737d1a...1.0.0) (2025-04-10)


### ♻️ 重构

* **release.yml:** 增强变更日志生成，支持重大变更和改进的提交类型分类 ([be2ee77](https://github.com/Moyf/yearly-glance/commit/be2ee779a6e6d8bfe25c01f50820c66ef49e09c5))


### ✨ 新功能

* **event:** 为EventFormModal引入带有选项卡界面的事件类型选择 ([ba8845e](https://github.com/Moyf/yearly-glance/commit/ba8845e8edd3fa39a52198b476b11cf52752f7ef))
* **script:** 更改图标 ([7f908a0](https://github.com/Moyf/yearly-glance/commit/7f908a0da166498a5cdbc1353fbcc6150d019188))
* **style:** 更新深色主题下的悬停颜色) ([635b834](https://github.com/Moyf/yearly-glance/commit/635b834798be9b9963bce88ffa4cd6aed582cd45))


### 🐛 修复

* **script:** 将 'manifest.json' 添加到需复制至保管库的文件列表中 ([b9c8af9](https://github.com/Moyf/yearly-glance/commit/b9c8af98014bf9c4691feba8c83ee83fe1a0b43a))


### 📝 文档

* **init:** 初始化插件信息 ([2f988aa](https://github.com/Moyf/yearly-glance/commit/2f988aaf5ac4f8118626d9badd8897d900737d1a))
* **manifest:** 为 Yearly Glance 插件添加 manifest-beta.json ([6e831f0](https://github.com/Moyf/yearly-glance/commit/6e831f0a82f08eb203d01f5c4edcf357d2d511ec))
* **README:** 为项目添加星标、下载量、许可证、问题及最近提交的徽章；在英文和中文的README文件中均包含星标历史图表 ([f07c875](https://github.com/Moyf/yearly-glance/commit/f07c8751ea6c91da2f6f65df3a1d8ecc54b50749))


### 🔨 杂项

* **.gitignore:** 将'styles.css'添加到忽略文件列表中 ([e99ec99](https://github.com/Moyf/yearly-glance/commit/e99ec99a0167c45a9125c00d83886f7c9666644c))
* **.gitignore:** 排除 Thumbs.db 以防止 Windows Explorer 跟踪视图状态 ([2f6924c](https://github.com/Moyf/yearly-glance/commit/2f6924c717a300c011ec29351259b3cd5b3cc985))
* **style:** remove tooltip CSS ([6dbca9e](https://github.com/Moyf/yearly-glance/commit/6dbca9e883fe2e29c0cf0d1e1f0d3a6959d351ab))



