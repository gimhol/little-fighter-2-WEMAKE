import type { IStyle } from "../defines";

export class Style implements IStyle {
  private _version = 0;
  private _data: IStyle = {};

  get version(): number { return this._version; }

  /** 批量设置属性并自动递增版本 */
  assign(props: Partial<IStyle>): void {
    Object.assign(this._data, props);
    this._version++;
  }

  /** 手动递增版本号 */
  touch(): void { this._version++; }

  // ========== IStyle getters/setters ==========

  get padding_t(): number | undefined { return this._data.padding_t; }
  set padding_t(v: number | undefined) { this._version++; this._data.padding_t = v; }

  get padding_b(): number | undefined { return this._data.padding_b; }
  set padding_b(v: number | undefined) { this._version++; this._data.padding_b = v; }

  get padding_l(): number | undefined { return this._data.padding_l; }
  set padding_l(v: number | undefined) { this._version++; this._data.padding_l = v; }

  get padding_r(): number | undefined { return this._data.padding_r; }
  set padding_r(v: number | undefined) { this._version++; this._data.padding_r = v; }

  get line_width(): number | undefined { return this._data.line_width; }
  set line_width(v: number | undefined) { this._version++; this._data.line_width = v; }

  get fill_style(): IStyle['fill_style'] { return this._data.fill_style; }
  set fill_style(v: IStyle['fill_style']) { this._version++; this._data.fill_style = v; }

  get stroke_style(): IStyle['stroke_style'] { return this._data.stroke_style; }
  set stroke_style(v: IStyle['stroke_style']) { this._version++; this._data.stroke_style = v; }

  get font(): string | undefined { return this._data.font; }
  set font(v: string | undefined) { this._version++; this._data.font = v; }

  get text_align(): IStyle['text_align'] { return this._data.text_align; }
  set text_align(v: IStyle['text_align']) { this._version++; this._data.text_align = v; }

  get scale(): number | undefined { return this._data.scale; }
  set scale(v: number | undefined) { this._version++; this._data.scale = v; }

  get shadow_color(): IStyle['shadow_color'] { return this._data.shadow_color; }
  set shadow_color(v: IStyle['shadow_color']) { this._version++; this._data.shadow_color = v; }

  get shadow_blur(): number | undefined { return this._data.shadow_blur; }
  set shadow_blur(v: number | undefined) { this._version++; this._data.shadow_blur = v; }

  get shadow_offset_x(): number | undefined { return this._data.shadow_offset_x; }
  set shadow_offset_x(v: number | undefined) { this._version++; this._data.shadow_offset_x = v; }

  get shadow_offset_y(): number | undefined { return this._data.shadow_offset_y; }
  set shadow_offset_y(v: number | undefined) { this._version++; this._data.shadow_offset_y = v; }

  get smoothing(): IStyle['smoothing'] { return this._data.smoothing; }
  set smoothing(v: IStyle['smoothing']) { this._version++; this._data.smoothing = v; }

  get underline_color(): IStyle['underline_color'] { return this._data.underline_color; }
  set underline_color(v: IStyle['underline_color']) { this._version++; this._data.underline_color = v; }

  get underline_width(): IStyle['underline_width'] { return this._data.underline_width; }
  set underline_width(v: IStyle['underline_width']) { this._version++; this._data.underline_width = v; }

  get disposable(): IStyle['disposable'] { return this._data.disposable; }
  set disposable(v: IStyle['disposable']) { this._version++; this._data.disposable = v; }

  // ========== 不常用属性 ==========

  get line_cap(): IStyle['line_cap'] { return this._data.line_cap; }
  set line_cap(v: IStyle['line_cap']) { this._version++; this._data.line_cap = v; }

  get line_dash_offset(): IStyle['line_dash_offset'] { return this._data.line_dash_offset; }
  set line_dash_offset(v: IStyle['line_dash_offset']) { this._version++; this._data.line_dash_offset = v; }

  get line_join(): IStyle['line_join'] { return this._data.line_join; }
  set line_join(v: IStyle['line_join']) { this._version++; this._data.line_join = v; }

  get miter_limit(): IStyle['miter_limit'] { return this._data.miter_limit; }
  set miter_limit(v: IStyle['miter_limit']) { this._version++; this._data.miter_limit = v; }

  get direction(): IStyle['direction'] { return this._data.direction; }
  set direction(v: IStyle['direction']) { this._version++; this._data.direction = v; }

  get font_kerning(): IStyle['font_kerning'] { return this._data.font_kerning; }
  set font_kerning(v: IStyle['font_kerning']) { this._version++; this._data.font_kerning = v; }

  get font_stretch(): IStyle['font_stretch'] { return this._data.font_stretch; }
  set font_stretch(v: IStyle['font_stretch']) { this._version++; this._data.font_stretch = v; }

  get font_variant_caps(): IStyle['font_variant_caps'] { return this._data.font_variant_caps; }
  set font_variant_caps(v: IStyle['font_variant_caps']) { this._version++; this._data.font_variant_caps = v; }

  get letter_spacing(): IStyle['letter_spacing'] { return this._data.letter_spacing; }
  set letter_spacing(v: IStyle['letter_spacing']) { this._version++; this._data.letter_spacing = v; }

  get text_baseline(): IStyle['text_baseline'] { return this._data.text_baseline; }
  set text_baseline(v: IStyle['text_baseline']) { this._version++; this._data.text_baseline = v; }

  get text_rendering(): IStyle['text_rendering'] { return this._data.text_rendering; }
  set text_rendering(v: IStyle['text_rendering']) { this._version++; this._data.text_rendering = v; }

  get word_spacing(): IStyle['word_spacing'] { return this._data.word_spacing; }
  set word_spacing(v: IStyle['word_spacing']) { this._version++; this._data.word_spacing = v; }
}
