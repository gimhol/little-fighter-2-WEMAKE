import { I18N } from "./I18N"

test(`I18N loop-pointing 1`, () => {
  const i18n = new I18N()
  try {
    i18n.add({ zh: 'zh' })
    expect('loop-pointing miss!').toBeUndefined()
  } catch (e) {
    console.log(e);
    expect('' + e).toContain('loop-pointing')
  }
})
test(`I18N loop-pointing 2`, () => {
  const i18n = new I18N()
  try {
    i18n.add({ zh: 'en', en: 'ru', ru: 'zh' })
    expect('loop-pointing miss!').toBeUndefined()
  } catch (e) {
    console.log(e);
    expect('' + e).toContain('loop-pointing')
  }
})

test(`I18N target not found 1`, () => {
  const i18n = new I18N()
  try {
    i18n.add({ zh: 'en' })
    expect('"target not found" miss!').toBeUndefined()
  } catch (e) {
    console.log(e);
    expect('' + e).toContain('target not found')
  }
})
test(`I18N target not found 2`, () => {
  const i18n = new I18N()
  try {
    i18n.add({ zh: 'en', en: [] } as any)
    expect('"target not found" miss!').toBeUndefined()
  } catch (e) {
    console.log(e);
    expect('' + e).toContain('target not found')
  }
})
