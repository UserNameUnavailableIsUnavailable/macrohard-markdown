import type { Token } from "markdown-it/index.js";

const PATTERN = /^\{.+?\}$/

// 容器格式：
/// ::: { }
/// :::
///
/// 大括号内允许定义各种 HTML 属性，如： `{ #Foo .Bar width="114" }`，
/// 指定此容器 `id` 为 `Foo`，`class` 为 `Bar`，`width` 为 `114`。
/// 输出为 `<div id="Foo" class="Bar" width="114"></div>`
///
/// 容器允许多层嵌套，嵌套时，外层的 `:` 数量需要大于内层（至少 3 个），例如：
/// :::: { .columns }
///
/// ::: { .column }
//  第一栏
/// :::
///
/// ::: { .column }
/// 第二栏
/// :::
///
/// ::::

export const validate = (params: string) => {
  const token = params.trim()
  if (token.match(PATTERN)) {
    return true
  }
  return false
}

export const render = (tokens: Token[], index: number) => {
  const token = tokens[index]
  const m = token.attrs || []
  const attrList: string[] = []
  m.forEach(e => {
    attrList.push(`${e[0]}="${e[1]}"`)
  });
  if (tokens[index].nesting === 1) {
    return `<div ${attrList.join(' ')} >\n`
  } else {
    return "</div>\n"
  }
}
