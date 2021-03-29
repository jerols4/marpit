import MarkdownIt from 'markdown-it'

type MarkdownItConstructorParams =
  | MarkdownIt.PresetName
  | MarkdownIt.Options
  | [presetName: MarkdownIt.PresetName, options: MarkdownIt.Options]

export interface MarpitOptions {
  markdown: MarkdownIt | MarkdownItConstructorParams
}

export type MarpitPlugin<
  P extends any[],
  Marpit extends MarpitBase = MarpitBase
> = (
  this: MarkdownIt & { marpit?: Marpit },
  md: MarkdownIt & { marpit?: Marpit },
  ...params: P
) => void

const defaultOptions: MarpitOptions = {
  markdown: 'commonmark',
}

abstract class MarpitBase<Options extends MarpitOptions = MarpitOptions> {
  protected _options!: Options

  get options() {
    return Object.freeze({ ...this._options })
  }

  #markdown!: MarkdownIt & { marpit?: MarpitBase<Options> }

  get markdown() {
    return this.#markdown
  }

  set markdown(md) {
    if (this.#markdown?.marpit) delete this.#markdown.marpit
    this.#markdown = md

    if (md) {
      Object.defineProperty(md, 'marpit', { configurable: true, value: this })
    }
  }

  constructor(opts: Partial<Options> = {}) {
    Object.defineProperty(this, '_options', {
      enumerable: true,
      value: Object.freeze({ ...defaultOptions, ...opts }),
    })
  }

  use<P extends any[]>(
    plugin: MarpitPlugin<P, MarpitBase<Options>>,
    ...params: P
  ): this {
    plugin.call(this.markdown, this.markdown, ...params)
    return this
  }
}
