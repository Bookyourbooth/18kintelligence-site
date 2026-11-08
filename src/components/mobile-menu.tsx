"use client";

/**
 * Phones: the header's section links in a popover, so the 1:1 call is one tap away from anywhere on
 * the page. The popover closes itself on Esc or a tap outside; a link closes it too.
 */
export function MobileMenu({ links }: { links: { label: string; href: string }[] }) {
  return (
    <>
      <button className="menu-btn" type="button" popoverTarget="menu">
        Menu
      </button>
      <nav
        id="menu"
        popover="auto"
        className="menu"
        aria-label="Sections"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) e.currentTarget.hidePopover();
        }}
      >
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}
