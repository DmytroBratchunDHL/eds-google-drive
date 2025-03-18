export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      const icon = col.querySelector('span.icon');
      if (icon && block.classList.contains('icon-bullets')) {
        col.classList.add('icon-bullet');

        const iconParent = icon.parentElement;

        if (iconParent !== col) {
          iconParent.remove();
        } else {
          icon.remove();
        }

        const contentWrapper = document.createElement('div');

        while (col.firstChild) {
          contentWrapper.appendChild(col.firstChild);
        }

        col.appendChild(icon);
        col.appendChild(contentWrapper);
      }
    });
  });
}
