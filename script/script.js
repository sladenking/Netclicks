'use strict';

window.addEventListener('DOMContentLoaded', () => {
	const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2',
		GOOGLE_SEARCH_URL = 'https://www.google.ru/search?&rls=ru&q=';

	const DBService = class {
		constructor() {
			this.API_KEY = 'b2af7525953a0817d0cd27cf5080cd58';
			this.SERVER = 'https://api.themoviedb.org/3';
		}

		async getData(url) {
			const response = await fetch(url);
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`Error ${response.status}`);
			}
		}

		async getTestData() {
			return this.getData('test.json');
		}

		async getTestCard() {
			return this.getData('card.json');
		}

		async getSearchResult(query) {
			this.temp = (this.SERVER + '/search/tv?api_key=' + this.API_KEY +
			'&language=ru-RU&query=' + query);
			return this.getData(this.temp);
		}

		async getNextPage(page) {
			return this.getData(this.temp + '&page=' + page);
		}

		async getTvShows(id) {
			return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
		}

		async getTopRated() {
			return this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);
		}

		async getPopular() {
			return this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);
		}

		async getToday() {
			return this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);
		}

		async getWeek() {
			return this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
		}
	};

	const dbService = new DBService();

	const loading = document.createElement('div');
	loading.className = 'loading';

	//Render cards
	const renderCard = (response, target) => {
		const tvShowsList = document.querySelector('.tv-shows__list'),
			tvShowsHead = document.querySelector('.tv-shows__head'),
			pagination = document.querySelector('.pagination');

		tvShowsList.textContent = '';

		if (!response.total_results) {
			loading.remove();
			tvShowsHead.textContent = 'К сожалению, по Вашему запросу ничего не найдено';
			tvShowsHead.style.cssText = 'color : red;';
			return;
		}

		tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
		tvShowsHead.style.cssText = 'color : green;';

		response.results.forEach(item => {
			const {
				backdrop_path: backdrop,
				name: title,
				poster_path: poster,
				vote_average: vote,
				id
			} = item;

			const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
			const backdropIMG = backdrop ? IMG_URL + backdrop : posterIMG;
			const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

			const card = document.createElement('li');
			card.className = 'tv-shows__item';
			card.innerHTML = `
				<a href="#" id="${id}" class="tv-card">
						${voteElem}
						<img class="tv-card__img"
								src="${posterIMG}"
								data-backdrop="${backdropIMG}"
								alt="${title}">
						<h4 class="tv-card__head">${title}</h4>
				</a>
      `;
			loading.remove();
			tvShowsList.append(card);
		});
		pagination.textContent = '';
		if (!target && response.total_pages > 1) {
			for (let i = 1; i <= response.total_pages; i++) {
				pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`;
			}
		}
	};

	//Seacrh
	const search = () => {
		const searchForm = document.querySelector('.search__form'),
			searchFormInput = document.querySelector('.search__form-input'),
			tvShows = document.querySelector('.tv-shows'),
			pagination = document.querySelector('.pagination'),
			tvShowsText = document.querySelector('.tv-shows__text');

		searchForm.addEventListener('submit', event => {
			event.preventDefault();
			const value = searchFormInput.value.trim();

			if (value) {
				tvShows.append(loading);
				dbService.getSearchResult(value).then(renderCard);
			}
			searchFormInput.value = '';
			pagination.textContent = '';
			tvShowsText.style.display = 'none';
		});

	};

	search();

	//Chage cards photo
	const cards = () => {
		const tvShowList = document.querySelector('.tv-shows__list'),
			pagination = document.querySelector('.pagination'),
			tvShows = document.querySelector('.tv-shows');

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

		pagination.addEventListener('click', event => {
			event.preventDefault();
			const target = event.target;
			if (target.classList.contains('pages')) {
				tvShows.append(loading);
				dbService.getNextPage(target.textContent).then(renderCard);
			}
		});
	};

	cards();

	//Left menu
	const leftMenu = () => {
		const leftMenu = document.querySelector('.left-menu'),
			hamburger = document.querySelector('.hamburger'),
			tvShows = document.querySelector('.tv-shows'),
			tvShowsList = document.querySelector('.tv-shows__list'),
			tvShowsHead = document.querySelector('.tv-shows__head'),
			tvShowsText = document.querySelector('.tv-shows__text'),
			dropdown = document.querySelectorAll('.dropdown');

		document.addEventListener('click', event => {
			if (!event.target.closest('.left-menu')) {
				leftMenu.classList.remove('openMenu');
				hamburger.classList.remove('open');
				dropdown.forEach(item => {
					item.classList.remove('active');
				});
			}
		});

		hamburger.addEventListener('click', () => {
			leftMenu.classList.toggle('openMenu');
			hamburger.classList.toggle('open');
		});

		leftMenu.addEventListener('click', event => {
			event.preventDefault();
			const { target } = event;
			const dropdown = target.closest('.dropdown');

			if (dropdown) {
				dropdown.classList.toggle('active');
				leftMenu.classList.add('openMenu');
				hamburger.classList.add('open');
			}
			if (target.closest('#top-rated')) {
				tvShows.append(loading);
				dbService.getTopRated().then(response => renderCard(response, target));
				tvShowsText.style.display = 'none';

			}
			if (target.closest('#popular')) {
				tvShows.append(loading);
				dbService.getPopular().then(response => renderCard(response, target));
				tvShowsText.style.display = 'none';
			}
			if (target.closest('#week')) {
				tvShows.append(loading);
				dbService.getWeek().then(response => renderCard(response, target));
			}
			if (target.closest('#today')) {
				tvShows.append(loading);
				dbService.getToday().then(response => renderCard(response, target));
				tvShowsText.style.display = 'none';
			}
			if (target.closest('#search')) {
				tvShowsList.textContent = '';
				tvShowsHead.textContent = '';
				tvShowsText.style.display = 'block';

			}
		});
	};

	leftMenu();

	//Modal
	const showList = () => {
		const tvShowList = document.querySelector('.tv-shows__list'),
			modal = document.querySelector('.modal'),
			tvCardImg = document.querySelector('.tv-card__img'),
			posterWrapper = document.querySelector('.poster__wrapper'),
			modalContent = document.querySelector('.modal__content'),
			modalTitle = document.querySelector('.modal__title'),
			genresList = document.querySelector('.genres-list'),
			rating = document.querySelector('.rating'),
			description = document.querySelector('.description'),
			modalLink = document.querySelector('.modal__link'),
			modalLinkGoogle = document.querySelector('.modal__link-s');

		tvShowList.addEventListener('click', event => {
			event.preventDefault();
			const card = event.target.closest('.tv-card');

			if (card) {
				document.body.style.overflow = 'hidden';
				modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
				modal.classList.remove('hide');
				dbService
					.getTvShows(card.id)
					.then(response => {
						if (response.poster_path) {
							tvCardImg.src = IMG_URL + response.poster_path;
							tvCardImg.alt = response.name;
							posterWrapper.style.display = '';
							modalContent.style.paddingLeft = '';
						} else {
							posterWrapper.style.display = 'none';
							modalContent.style.paddingLeft = '25px';
						}
						modalTitle.textContent = response.name;
						genresList.textContent = '';
						for (const item of response.genres) {
							genresList.innerHTML += `<li>${item.name}</li>`;
						}
						rating.textContent = response.vote_average;
						description.textContent = response.overview;
						modalLink.href = response.homepage;
						modalLinkGoogle.textContent = `${response.name} - Google Search `;
						modalLinkGoogle.href = `${GOOGLE_SEARCH_URL}+${response.name} смотреть онлайн`;
					}).then(() => {
						document.body.style.overflow = 'hidden';
						modal.classList.remove('hide');
					});
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

});
