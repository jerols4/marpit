/** @module */
import cssesc from 'cssesc'
import postcss from 'postcss'
import wrapArray from '../../helpers/wrap_array'

const buildSelector = (elms) =>
  elms
    .map((e) => {
      const classes = new Set((e.class || '').split(/\s+/).filter((c) => c))

      let element = [e.tag, ...classes]
        .map((c) => cssesc(c, { isIdentifier: true }))
        .join('.')

      if (e.id) element += `#${cssesc(e.id, { isIdentifier: true })}`

      return element
    })
    .join(' > ')

/**
 * Marpit PostCSS pseudo selector replace plugin.
 *
 * Replace `:marpit-container` and `:marpit-slide` pseudo selector into
 * container element(s).
 *
 * @alias module:postcss/pseudo_selector/replace
 * @param {Element|Element[]} [elements] Container elements
 * @param {Element|Element[]} [slideElements={ tag: 'section' }] Slide elements
 */
const plugin = postcss.plugin(
  'marpit-postcss-pseudo-selector-replace',
  (elements, slideElements = { tag: 'section' }) => {
    const container = buildSelector([...wrapArray(elements)])
    const section = buildSelector([...wrapArray(slideElements)])

    return (css) =>
      css.walkRules((rule) => {
        rule.selectors = rule.selectors.map((selector) =>
          selector
            .replace(/:marpit-container(?![\w-])/g, container)
            .replace(/:marpit-slide(?![\w-])/g, section)
            .replace(/^\s*>\s*/, '')
        )
      })
  }
)

export default plugin
