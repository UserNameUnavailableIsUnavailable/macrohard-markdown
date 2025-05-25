import YAML from "js-yaml"
export default class Metadata {
  private _title: string = ""
  private _type: string = "unknown"
  constructor(yaml?: string) {
    if (!yaml) {
      return
    }
    const data = YAML.load(yaml) as Partial<Metadata>
        this._title = data.title ?? this._title
        this._type = data.title ?? this._type
  }
  public get title(): string {
    return this._title
  }
  public get type() {
    return this._type
  }
  public merge(metadata: Partial<Metadata>) {
    this._title = metadata.title ?? this._title
    this._type = metadata.type ?? this._type
  }
}
