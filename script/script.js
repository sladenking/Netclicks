'use strict';

window.addEventListener('DOMContentLoaded', () => {
	const DBService = class {
		async getData(url) {
			const response = await fetch(url);
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`Error ${response.status}`);
			}
		}

		async getTestData() {
			return await this.getData('test.json');
		}

		// async downloadAPIKey() {
		// 	const response = await fetch('./config/api.key');
		// 	window.API_KEY = await response.text();
		// }
	};

	//Left menu
	const leftMenu = () => {
		const leftMenu = document.querySelector('.left-menu'),
			hamburger = document.querySelector('.hamburger');

		document.addEventListener('click', event => {
			if (!event.target.closest('.left-menu')) {
				leftMenu.classList.remove('openMenu');
				hamburger.classList.remove('open');
			}
		});

		hamburger.addEventListener('click', () => {
			leftMenu.classList.toggle('openMenu');
			hamburger.classList.toggle('open');
		});

		leftMenu.addEventListener('click', event => {
			const { target } = event;
			const dropdown = target.closest('.dropdown');

			if (dropdown) {
				dropdown.classList.toggle('active');
				leftMenu.classList.add('openMenu');
				hamburger.classList.add('open');
			}
		});
	};

	leftMenu();

	//Chage cards photo
	const cards = () => {
		const tvShowList = document.querySelector('.tv-shows__list');

		const changePhoto = event => {
			const card = event.target.closest('.tv-shows__item');
			if (card) {
				const img = card.querySelector('.tv-card__img');
				if (img.dataset.backdrop) {
					[img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
				}
			}
		};

		tvShowList.addEventListener('mouseover', changePhoto);
		tvShowList.addEventListener('mouseout', changePhoto);

	};
	cards();

	//Modal
	const showList = () => {
		const tvShowList = document.querySelector('.tv-shows__list'),
			modal = document.querySelector('.modal');

		tvShowList.addEventListener('click', event => {
			event.preventDefault();
			if (event.target.closest('.tv-card')) {
				document.body.style.overflow = 'hidden';
				modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
				modal.classList.remove('hide');
			}
		});

		modal.addEventListener('click', event => {
			if (event.target.closest('.cross') || event.target.classList.contains('modal')) {
				document.body.style.overflow = '';
				modal.style.backgroundColor = '';
				modal.classList.add('hide');
			}
		});
	};

	showList();

	//Render cards
	const render = () => {

		const API_KEY = 'b2af7525953a0817d0cd27cf5080cd58',
			IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2',
			DEFAULT_IMG = 'img/no-poster.jpg',
			showsList = document.querySelector('.tv-shows__list');

		const renderCards = ({ results }) => {
			showsList.textContent = '';
			results.forEach(({
				vote_average: vote,
				poster_path: poster,
				backdrop_path: backdrop,
				name: title
			}) => {
				const posterURI = poster ? IMG_URL + poster : DEFAULT_IMG;
				const backdropURI = backdrop ? IMG_URL + backdrop : '';
				const voteEl = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

				const card = document.createElement('li');
				card.classList.add('tv-shows__item');
				card.innerHTML = `
						<a href="#" class="tv-card">
								${voteEl}
								<img class="tv-card__img"
											src="${posterURI}"
											data-backdrop="${backdropURI}"
											alt="${title}">
								<h4 class="tv-card__head">${title}</h4>
						</a>
				`;

				showsList.append(card);
			});
		};
		new DBService().getTestData().then(renderCards);


		// new DBService().downloadAPIKey().then(main);
	};

	render();

});
