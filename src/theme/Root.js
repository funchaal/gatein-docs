import React, { useEffect } from 'react';

function SlidingIndicators() {
  useEffect(() => {
    const updateIndicators = () => {
      // TOC Indicator
      const tocContainer = document.querySelector('.table-of-contents');
      const tocActive = document.querySelector('.table-of-contents__link--active');
      if (tocContainer) {
        let tocInd = document.getElementById('gatein-toc-indicator');
        if (!tocInd) {
          tocInd = document.createElement('div');
          tocInd.id = 'gatein-toc-indicator';
          tocContainer.appendChild(tocInd);
        }
        if (tocActive) {
          tocInd.style.opacity = '1';
          tocInd.style.top = tocActive.offsetTop + 'px';
          tocInd.style.height = tocActive.offsetHeight + 'px';
        } else {
          tocInd.style.opacity = '0';
        }
      }
    };

    // Run on mount and allow time for Docusaurus classes to apply
    updateIndicators();
    setTimeout(updateIndicators, 100);
    
    // Watch for class changes (active items)
    const observer = new MutationObserver(updateIndicators);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return null;
}

export default function Root({ children }) {
  return (
    <>
      <SlidingIndicators />
      {children}
    </>
  );
}
