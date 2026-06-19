import classNames from "classnames";
import { type ForwardedRef, forwardRef, Fragment, type HTMLAttributes, isValidElement, type PropsWithChildren, type ReactNode, useMemo } from "react";
import Show, { Div, type IShowProps } from "../Show";
import { Broken } from "./Broken";
import './styles.scss';

function make_space_children(node: any, item_props: HTMLAttributes<HTMLDivElement> | undefined, ret: ReactNode[]): ReactNode[] {
  if (Array.isArray(node)) {
    for (const child of node) {
      make_space_children(child, item_props, ret)
    }
    return ret;
  }
  switch (node) {
    case void 0: case null: case true: case false:
      return ret
  }
  if (isValidElement<{ show: any }>(node)) {
    if (node.type === Div && !node.props.show)
      return ret
    if (node.type === Show && !node.props.show)
      return ret
    if (node.type === Show) {
      make_space_children((node.props as IShowProps).children, item_props, ret)
      return ret;
    }
    if (node.type === Fragment) {
      make_space_children((node.props as PropsWithChildren).children, item_props, ret)
      return ret;
    }
    if (node.type === Space.Item || node.type === Space.Broken) {
      ret.push(<Fragment key={ret.length}>{node}</Fragment>);
      return ret;
    }
  } else if (typeof node === 'object' && 'containerInfo' in node) {
    ret.push(<Fragment key={ret.length}>{node}</Fragment>);
    return ret;
  }
  ret.push(
    <Space.Item {...item_props} key={ret.length}>
      {node}
    </Space.Item>
  )
  return ret;
}
export interface ISpaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  item_props?: HTMLAttributes<HTMLDivElement>;
  direction?: 'column' | 'row';
  vertical?: boolean;
  stretchs?: boolean;
}

function _Space(props: ISpaceProps, forwarded_ref: ForwardedRef<HTMLDivElement>) {
  const {
    className,
    children,
    item_props,
    vertical,
    stretchs,
    direction = vertical ? 'column' : 'row',
    ..._p
  } = props;

  const root_cls_name = useMemo(() => classNames("lf2ui_space", direction, { stretchs }, className), [className, direction, stretchs]);
  return (
    <div className={root_cls_name} {..._p} ref={forwarded_ref}>
      {make_space_children(children, item_props, [])}
    </div>
  )
}

export interface ISpaceItemProps extends ISpaceProps {
  direction?: 'column' | 'row';
  space?: boolean;
  frame?: boolean;
  hoverable_frame?: boolean;
}

function Item(props: ISpaceItemProps, forwarded_ref: ForwardedRef<HTMLDivElement>) {
  const { className, space, hoverable_frame, frame, ..._p } = props || {};
  const root_cls_name = useMemo(() => classNames("item",
    {
      frame,
      hoverable_frame,
    }, className
  ), [className, frame, hoverable_frame])
  return (
    space ?
      <Space className={root_cls_name} {..._p} ref={forwarded_ref} /> :
      <div className={root_cls_name} {..._p} ref={forwarded_ref} />
  )
}

export const Space = Object.assign(
  forwardRef<HTMLDivElement, ISpaceItemProps>(_Space),
  {
    Item: forwardRef<HTMLDivElement, ISpaceItemProps>(Item),
    Broken: Broken
  }
)

