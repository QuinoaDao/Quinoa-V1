import React from 'react';

function ISwitcher(props) {
	const title = props.title || "i switcher";
	const css = `.nc-int-switcher{--transition-duration:0.3s}.nc-int-switcher :first-child{fill:#cccccc;transition:fill var(--transition-duration)}.nc-int-switcher :last-child{transition:transform var(--transition-duration) cubic-bezier(.77,0,.18,1)}.nc-int-switcher.nc-int-icon-state-b :first-child{fill:#78d478}.nc-int-switcher.nc-int-icon-state-b :last-child{transform:translateX(18px)}`;

	function handleClick(e) {
		let group = e.currentTarget.querySelector('.js-nc-int-icon');
		if(!group) return;
		group.classList.toggle('nc-int-icon-state-b');
		e.currentTarget.dispatchEvent(new Event('ncstatechanged'));
	}

	return (
		<svg onClick={handleClick} height="48" width="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
	<title>{title}</title>
	<g>
		<g className="js-nc-int-icon nc-int-switcher">
			<rect height="26" width="44" fill="#cccccc" rx="13" ry="13" x="2" y="11"/>
			<circle cx="15" cy="24" fill="#fff" r="11"/>
		</g>
		<style>{css}</style>
	</g>
</svg>
	);
};

export default ISwitcher;