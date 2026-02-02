export interface ILinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  __keep?: never;
}
export function Link(props: ILinkProps) {
  const {
    draggable = false,
    target = '_blank',
    href,
    onClick = e => {
      if (href) e.stopPropagation()
    }
  } = props
  return (
    <a {...props}
      draggable={draggable}
      target={target}
      href={href}
      onClick={onClick} />
  )
}