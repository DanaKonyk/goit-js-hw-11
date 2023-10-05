import axios from 'axios';
import Notiflix from "notiflix";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '39848189-0324458e2c4d1f52aa76f9617';

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    Notiflix.Notify.failure('Ooops, smth happened. Please try again later.');
    return Promise.reject(error);
  },
);

async function fetchImages(query, page, perPage) {
  const response = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
  );
  return response.data;
}


const refs = {
    form: document.querySelector(".search-form"),
    list: document.querySelector(".gallery"),
}


let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

refs.form.addEventListener('submit', onSearchForm);
window.addEventListener('scroll', onMorePageLoadShow);

function onMarkupCreate(images) {


  const markup = images
    .map(image => {
      const { id, largeImageURL, webformatURL, tags, likes, views, comments, downloads } = image;
      return `
        <a class="gallery-link" href="${largeImageURL}">
          <div class="gallery-box" id="${id}">
            <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="comment-box">
              <p class="img-comment"><b>Likes</b>${likes}</p>
              <p class="img-comment"><b>Views</b>${views}</p>
              <p class="img-comment"><b>Comments</b>${comments}</p>
              <p class="img-comment"><b>Downloads</b>${downloads}</p>
            </div>
          </div>
        </a>
      `;
    })
    .join('');

  refs.list.insertAdjacentHTML('beforeend', markup);

  
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  refs.list.innerHTML = '';

  if (query === '') {
    Notiflix.Notify.failure(
      'The search field cannot be empty. Please enter something.',
    );
    return;
  }

  fetchImages(query, page, perPage)
    .then(data => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
        );
      } else {
        onMarkupCreate(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Wow! We found ${data.totalHits} results.`);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      refs.form.reset();
    });
}

function onloadMore() {
  page += 1;
  simpleLightBox.destroy();

  fetchImages(query, page, perPage)
    .then(data => {
      onMarkupCreate(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        Notiflix.Notify.failure(
          "Unfortunately, that's all results.",
        );
      }
    })
    .catch(error => console.log(error));
}

function onEndPageCheck() {
  return (
    window.innerHeight + window.pageYOffset >=
    document.documentElement.scrollHeight
  );
}

function onMorePageLoadShow() {
  if (onEndPageCheck()) {
    onloadMore();
  }
}

infiniteScroll.onclick = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.addEventListener('scroll', function () {
  infiniteScroll.hidden = scrollY < document.documentElement.clientHeight;
});



    
