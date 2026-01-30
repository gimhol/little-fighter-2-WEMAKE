function close_md_modal() {
  const el_mask = document.getElementById('changelog_md_mask')
  el_mask.style.display = 'none'
  const el = document.getElementById('changelog_md_modal')
  el.style.width = '0px'
  el.style.height = '0px'
}

function show_md_modal(md) {
  const el_mask = document.getElementById('changelog_md_mask')
  el_mask.style.display = 'flex'

  const el = document.getElementById('changelog_md_modal')
  el.style.width = 'unset'
  el.style.height = 'unset'

  const el_content = document.getElementById('changelog_md_content')
  el_content.innerText = md
  el_content.focus()
}

(function () {
  const el_mask = document.getElementById('changelog_md_mask')
  
  el_mask.addEventListener('click', e => {
    if (e.target === el_mask) close_md_modal()
  })



})()

