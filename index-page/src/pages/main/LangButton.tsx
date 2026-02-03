import { IconButton } from "@/components/button/IconButton";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import csses from "./styles.module.scss";

export function LangButton(props: { whenClick?(next: 'zh' | 'en'): void }) {
  const { whenClick } = props;
  const { t, i18n } = useTranslation()
  const is_en = !i18n.language.toLowerCase().startsWith('zh')
  return (
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        const is_en = !i18n.language.toLowerCase().startsWith('zh');
        const next = is_en ? 'zh' : 'en'
        i18n.changeLanguage(next)
        whenClick?.(next);
      }}
      title={t('switch_lang')}>
      <div className={csses.lang_btn_inner}>
        <span className={classnames(csses.lang_btn_inner_span, csses.lang_btn_inner_span_f)}>
          {is_en ? '中' : 'En'}
        </span>
        <span className={classnames(csses.lang_btn_inner_span, csses.lang_btn_inner_span_b)}>
          {is_en ? 'En' : '中'}
        </span>
      </div>
    </IconButton>
  )
}