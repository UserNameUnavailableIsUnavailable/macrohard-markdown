// Assume MathJax will be dynamically loaded

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MathJax: any;
  }
}
type Options = {
  type: "MathJax3" // 目前仅支持 MathJax3
  url: string,
  inline_indicator: string[][]
  block_indicator: string[][]
  processEscapes: boolean // 是否处理转义字符
}

export default class MathRenderer {
  private options_: Options = {
    type: "MathJax3",
    url: 'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/tex-chtml-full.js',
    inline_indicator: [['$', '$'], ['\\(', '\\)']],
    block_indicator: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true
  }
  private load_promise_: Promise<void>
  constructor(options: Partial<Options>) {
    // Object.assign(this.options_, options)
    this.options_ = { ...this.options_, ...options } as Options;
    this.load_promise_ = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      if (this.options_.type === "MathJax3") {
        window.MathJax = {
          startup : {
            typeset: false
          },
          tex: {
            inlineMath: this.options_.inline_indicator,
            displayMath: this.options_.block_indicator,
            processEscapes: this.options_.processEscapes
          }
        }
        script.async = true
        script.src = this.options_.url
        script.onload = () => {
          console.log("MathJax3 loaded successfully.")
          resolve()
        }
        script.onerror = (e) => {
          console.error(`Failed to load ${this.options_.type}: ${e}.`)
          reject()
        }
      } else {
        console.error(`Math render engine ${this.options_.type} is not supported!`)
        reject()
      }
      document.body.appendChild(script)
    })
  }
  public async render_all(params?: any) {

    await this.load_promise_
    .then(() => {
      document.querySelectorAll(".math.inline, .math.block").forEach((el) => {
        window.MathJax.typeset([el])
      });
    })
    .catch(e => {
      console.error(e)
    })
  }
}
