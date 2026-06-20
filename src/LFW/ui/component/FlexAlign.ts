export enum FlexAlign {
  Start = 'start',
  Center = 'center',
  End = 'end',
  Stretch = 'stretch'
}
export const ALL_FLEX_ALIGN = [
  FlexAlign.Start,
  FlexAlign.Center,
  FlexAlign.End,
  FlexAlign.Stretch,
].map(v => v.toString())
