declare class Metadata {
  /** 构造元数据 */
  /** @param yaml YAML 格式的元数据 */
  constructor(yaml?: string);
  /** 获取文档标题 */
  /** @returns 文档标题 */
  public get title(): string;
  /** 获取文档类型 */
  /** @returns  文档类型 */
  public get type(): string;
  /** 合并文档元数据 */
  /** @param metadata 文档元数据 */
  /** @returns */
  merge(metadata: Partial<Metadata>): void;
}
