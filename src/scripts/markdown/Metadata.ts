import { type Sidebar } from "./Sidebar";

export type Metadata = {
  format: "html" | "revealjs" | undefined, // 格式类型
  title: string, // 标题
  author?: string | string[] | null, // 作者
  date?: string | null, // 日期
  institute?: string | string[] | null, // 机构
  content: string, // 主题内容
  sidebar?: Sidebar, // 边栏导航
  footer?: string // 页脚
  "work-source": string | null, // 工作来源
  "citations": string | null, // 引用量
  logo?: string | null
  bibliography?: string | null // 参考文献
};

