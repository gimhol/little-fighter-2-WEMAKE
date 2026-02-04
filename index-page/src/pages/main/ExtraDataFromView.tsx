import { Collapse } from "@/components/collapse/Collapse";
import { EditorView } from "@/components/markdown/editor/EditorView";
import { ctrl_a_bounding } from "@/components/mask/ctrl_a_bounding";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import csses from "./ExtraDataFromView.module.scss"

export function ExtraDataFromView() {
  const { t } = useTranslation();
  const [tab, set_tab] = useState<'base_info' | 'changelog' | 'description'>('base_info');
  return (
    <div className={csses.extra_data_from_view}>
      <h2 className={csses.title}>
        {t('edit_your_extra_data_info')}
      </h2>
      <div className={csses.main}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button className={'base_info' == tab ? csses.btn_actived : csses.btn_normal} onClick={() => set_tab('base_info')}>
            {t("base_info")}
          </button>
          <button className={'description' == tab ? csses.btn_actived : csses.btn_normal} onClick={() => set_tab('description')}>
            {t("description")}
          </button>
          <button className={'changelog' == tab ? csses.btn_actived : csses.btn_normal} onClick={() => set_tab('changelog')}>
            {t("changelog")}
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <Collapse
            open={'base_info' == tab}
            className={csses.collapse}
            classNames={{ inner: csses.base_info }}>
            <div className={csses.form_row}>
              <span>{t('data_zip_title')}:</span>
              <input type="text" placeholder={t("edit_title_here")} maxLength={50} />
            </div>
            <div className={csses.form_row}>
              <span>{t('author')}:</span>
              <input type="text" placeholder={t("edit_author_here")} maxLength={50} />
            </div>
            <div className={csses.form_row}>
              <span>{t('author_url')}:</span>
              <input type="text" placeholder={t("edit_author_url_here")} maxLength={50} />
            </div>
            <div className={csses.form_row}>
              <span>{t('cover_img')}:</span>
              <input type="file" accept=".png;.jpg;.webp" />
            </div>
            <div className={csses.form_row}>
              <span>{t('data_zip')}:</span>
              <input type="file" accept=".zip" />
            </div>
          </Collapse>
          <Collapse
            open={'description' == tab}
            className={csses.collapse}
            classNames={{ inner: csses.md_editor }}
            onKeyDown={e => ctrl_a_bounding(e)}>
            <EditorView placeholder={t("edit_description_here")} />
          </Collapse>
          <Collapse
            open={'changelog' == tab}
            className={csses.collapse}
            classNames={{ inner: csses.md_editor }}
            onKeyDown={e => ctrl_a_bounding(e)}>
            <EditorView placeholder={t("edit_changelog_here")} />
          </Collapse>
        </div>
      </div>

    </div>
  );
}
