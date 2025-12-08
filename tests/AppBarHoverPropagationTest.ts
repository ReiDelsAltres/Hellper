// Example test/demo showing expected behavior for AppBar hover-based propagation.
// This is primarily a compile-time/example file. To verify runtime behavior, run in a browser or headless environment.

const appbar = document.createElement('app-bar') as HTMLElement & { shadowRoot?: ShadowRoot };
appbar.setAttribute('type', 'mini');

// create a slotted child without a `mini` attribute
const child = document.createElement('re-button');
child.setAttribute('id', 'slot-child');

// attach child to default slot
appbar.appendChild(child);

if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(appbar);

    // At this point (no hover yet) the AppBar is not hovered — should apply `mini` to child
    setTimeout(() => {
        // eslint-disable-next-line no-console
        console.log('initial (no hover) child has mini?', child.hasAttribute('mini'));

        // simulate hover by dispatching mouseenter — now condition is hovered so mini should be removed
        appbar.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        setTimeout(() => {
            // eslint-disable-next-line no-console
            console.log('after mouseenter child has mini?', child.hasAttribute('mini'));

            // now attach no-hover attribute and ensure `mini` stays even during hover
            appbar.setAttribute('no-hover', 'true');
            setTimeout(() => {
                // eslint-disable-next-line no-console
                console.log('with no-hover=true (during hover) child has mini?', child.hasAttribute('mini'));

                // cleanup: simulate mouseleave
                appbar.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

                setTimeout(() => {
                    // when hover ends, child should have mini again
                    // eslint-disable-next-line no-console
                    console.log('after mouseleave child has mini?', child.hasAttribute('mini'));
                }, 20);
            }, 20);
        }, 20);
    }, 20);
}
