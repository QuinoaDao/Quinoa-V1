import React from "react";

function ISwitcher(props) {
  const fill = props.fill || "currentColor";
  const secondaryfill = props.secondaryfill || fill;
  const strokewidth = props.strokewidth || 1;
  const width = props.width || "44px";
  const height = props.height || "25px";
  const css = `.nc-int-switcher{--transition-duration:0.3s}.nc-int-switcher :first-child{fill:#cccccc;transition:fill var(--transition-duration)}.nc-int-switcher :last-child{transition:transform var(--transition-duration) cubic-bezier(.77,0,.18,1)}.nc-int-switcher.nc-int-icon-state-b :first-child{fill:#29C708}.nc-int-switcher.nc-int-icon-state-b :last-child{transform:translateX(18.5px)}`;

  function handleClick(e) {
    let group = e.currentTarget.querySelector(".js-nc-int-icon");
    if (!group) return;
    group.classList.toggle("nc-int-icon-state-b");
    e.currentTarget.dispatchEvent(new Event("ncstatechanged"));
  }

  return (
    <svg
      onClick={handleClick}
      height={height}
      width={width}
      viewBox="0 0 42 23"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <g className="js-nc-int-icon nc-int-switcher">
          <rect height="23" width="42" fill="#cccccc" ry="11.5" x="0" y="0" />
          <rect height="17" width="17" fill="#fff" ry="8.5" x="3" y="3" />
        </g>
        <style>{css}</style>
      </g>
    </svg>
  );
}

export default ISwitcher;
