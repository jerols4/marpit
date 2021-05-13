/** @module */
import postcssPlugin from '../../helpers/postcss_plugin'
import postcssImportParse from './parse'

/**
 * Marpit PostCSS import replace plugin.
 *
 * Replace parsed `@import` / `@import-theme` rules.
 *
 * Please see {@link module:postcss/import/parse} about the specification of
 * each syntax.
 *
 * @alias module:postcss/import/replace
 * @param {ThemeSet} themeSet ThemeSet instance.
 */
const plugin = (themeSet, importedThemes = []) =>
  postcssPlugin('marpit-postcss-import-replace', () => ({
    plugins: [
      postcssImportParse(),
      postcssPlugin(
        'marpit-postcss-import-replace-processor',
        () =>
          (css, { postcss }) => {
            const prepends = []

            css.walk((node) => {
              const name = node.marpitImportParse

              if (name) {
                const theme = themeSet.get(name)

                if (theme) {
                  if (importedThemes.includes(name))
                    throw new Error(
                      `Circular "${name}" theme import is detected.`
                    )

                  const processed = postcss([
                    plugin(themeSet, [...importedThemes, name]),
                  ]).process(theme.css)

                  if (node.name === 'import') {
                    node.replaceWith(processed.root)
                  } else {
                    node.remove()
                    prepends.unshift(processed.root)
                  }
                }
              }
            })

            for (const root of prepends) css.first.before(root)
          }
      )(),
    ],
  }))

export default plugin
