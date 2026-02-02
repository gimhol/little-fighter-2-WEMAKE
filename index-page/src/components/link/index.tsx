export interface ILinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  __keep?: never;
  emptyAsGone?: boolean;
}
export function Link(props: ILinkProps) {
  const {
    draggable = false,
    target = '_blank',
    emptyAsGone = false,
    href,
    onClick = e => {
      if (href) e.stopPropagation()
    }
  } = props
  if (emptyAsGone && !href) return <></>
  return (
    <a {...props}
      draggable={draggable}
      target={target}
      href={href}
      onClick={onClick} />
  )
}