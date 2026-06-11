import classNames from "classnames";
import { Button } from "../../Component/Buttons/Button";
import Combine, { ICombineProps } from "../../Component/Combine";
import { Plus } from '../../Component/Icons/Plus';
import { Text } from "../../Component/Text";
import styles from "./style.module.scss";

export interface IWorkspaceColumnViewProps extends Omit<ICombineProps, "title"> {
  title?: React.ReactNode;
  header?: React.ReactNode;
}
export function WorkspaceColumnView(props: IWorkspaceColumnViewProps) {
  const { title, header, className, ..._p } = props;
  return (
    <Combine
      direction='column'
      className={classNames(styles.header_main_footer_view, className)}
      hoverable={false}
      {..._p}>
      {
        header ? header :
          <Combine direction='row' hoverable={false} className={styles.head_zone}>
            <Text size='m' className={styles.title} data-flex={1}>
              {title}
            </Text>
          </Combine>
      }
      <div className={styles.content_zone_wrapper} data-flex={1}>
        <div className={styles.content_zone} data-flex={1}>
          {props.children}
        </div>
      </div>
    </Combine>
  )
}

export function TitleAndAdd(props: { title?: React.ReactNode; on_add?(e: React.MouseEvent): void }) {
  const { title, on_add } = props;
  return (
    <Combine direction='row' hoverable={false} className={styles.head_zone}>
      <Text size='m' className={styles.title} data-flex={1}>
        {title}
      </Text>
      <Button onClick={on_add}>
        <Plus />
      </Button>
    </Combine>
  )
}
WorkspaceColumnView.TitleAndAdd = TitleAndAdd