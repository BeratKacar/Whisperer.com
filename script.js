const filmsContainer = document.getElementById("films");
const refreshBtn = document.getElementById("refreshBtn");
const toggleBtn = document.getElementById("toggleCategories");
const categoryButtons = document.getElementById("categoryButtons");

const API_URL = "https://api.themoviedb.org/3/discover/movie";
const API_KEY = "70d782d0f4fda375704be7703dbe1753";

const GENRE_MAP = {
  action: 28,
  comedy: 35,
  drama: 18,
  horror: 27,
  animation: 16,
  romance: 10749,
  "sci-fi": 878,
  thriller: 53,
  documentary: 99,
};

function getSelectedCategories() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

async function fetchFilms(categories) {
  try {
    const allFilms = [];

    for (const cat of categories) {
      const genreId = GENRE_MAP[cat];
      const res = await fetch(`${API_URL}?api_key=${API_KEY}&with_genres=${genreId}&language=tr-TR`);
      if (res.ok) {
        const data = await res.json();
        allFilms.push(...data.results);
      }
    }

    if (allFilms.length === 0) {
      displayError("The wind isn't whispering to me. There doesn't seem to be anything like what you want. Let's try again.");
      return;
    }

    const randomFour = allFilms.sort(() => 0.5 - Math.random()).slice(0, 4);
    displayFilms(randomFour);
  } catch (error) {
    console.error("Try again:", error);
    displayError("WTF is happening? I can't hear a whisper. Oh no! Am I deaf? Let's try again human.");
  }
}

function displayFilms(films) {
  filmsContainer.innerHTML = "";
  films.forEach(film => {
    const div = document.createElement("div");
    div.className = "film";

    const posterURL = film.poster_path
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
      : 'https://via.placeholder.com/200x300?text=Poster+Yok';

    div.innerHTML = `
      <h3>${film.title}</h3>
      <img src="${posterURL}" alt="${film.title}" />
      <div class="film-description">
        ${film.overview || "Bu film hakkında bir açıklama bulunmamaktadır."}
      </div>
    `;

    div.addEventListener("click", () => openFilmModal(film));
    filmsContainer.appendChild(div);
  });
}

function displayError(message) {
  filmsContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

async function fetchTrailer(movieTitle, movieId) {
  try {
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
    const tmdbData = await tmdbRes.json();

    const trailer = tmdbData.results.find(video =>
      video.type === 'Trailer' && video.site === 'YouTube'
    );

    if (trailer) {
      return trailer.key;
    }

    const youtubeRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(movieTitle + " fragman")}&key=YOUR_YOUTUBE_API_KEY&maxResults=1`);
    const youtubeData = await youtubeRes.json();

    if (youtubeData.items && youtubeData.items.length > 0) {
      return youtubeData.items[0].id.videoId;
    }

    return null;
  } catch (error) {
    console.error("Fragman bulunamadı:", error);
    return null;
  }
}

function openFilmModal(film) {
  const posterURL = film.poster_path
    ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
    : 'https://via.placeholder.com/200x300?text=Poster+Yok';

  modalTitle.textContent = film.title;
  modalPoster.src = posterURL;
  modalOverview.textContent = film.overview || "Açıklama bulunamadı.";
  modalDate.textContent = film.release_date ? new Date(film.release_date).toLocaleDateString('tr-TR') : "Bilinmiyor";
  modalRating.textContent = film.vote_average ? `${film.vote_average}/10` : "Puan yok";

  const oldTrailerContainer = document.querySelector('.trailer-container');
  if (oldTrailerContainer) oldTrailerContainer.remove();

  const trailerHTML = `
    <div class="trailer-container">
      <button id="playTrailerBtn">Fragmanı Oynat</button>
      <div id="trailerPlayer" class="hidden">
        <iframe id="youtubeIframe" width="560" height="315" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  `;

  modalContent.insertAdjacentHTML('beforeend', trailerHTML);

  document.getElementById('playTrailerBtn').addEventListener('click', async () => {
    const trailerBtn = document.getElementById('playTrailerBtn');
    trailerBtn.textContent = "Fragman yükleniyor...";
    trailerBtn.disabled = true;

    const videoId = await fetchTrailer(film.title, film.id);

    if (videoId) {
      const trailerPlayer = document.getElementById('trailerPlayer');
      const youtubeIframe = document.getElementById('youtubeIframe');
      youtubeIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      trailerPlayer.classList.remove('hidden');
      trailerBtn.classList.add('hidden');
    } else {
      trailerBtn.textContent = "Fragman bulunamadı";
      setTimeout(() => {
        trailerBtn.textContent = "Fragmanı Oynat";
        trailerBtn.disabled = false;
      }, 2000);
    }
  });

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

const modal = document.getElementById("filmModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalPoster = document.getElementById("modalPoster");
const modalOverview = document.getElementById("modalOverview");
const modalDate = document.getElementById("modalDate");
const modalRating = document.getElementById("modalRating");
const modalContent = document.getElementById("modalContent");

closeModal.addEventListener("click", () => {
  modal.classList.remove("show");
  document.body.style.overflow = "auto";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
});

const menuButton = document.getElementById('menuBtn');
menuButton.addEventListener('click', () => {
  const dropdown = document.getElementById('dropdown');
  dropdown.classList.toggle('hidden');
});

document.addEventListener("DOMContentLoaded", function() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      window.location.href = 'signup.html';
    });
  }
});

refreshBtn.addEventListener("click", () => {
  const categories = getSelectedCategories();
  if (categories.length === 0) {
    displayError("What? Are you trying to fool me? Select a category human!");
    return;
  }
  fetchFilms(categories);
});

toggleBtn.addEventListener("click", () => {
  categoryButtons.classList.toggle("hidden");

  const labels = categoryButtons.querySelectorAll("label");
  labels.forEach((label, index) => {
    if (categoryButtons.classList.contains("hidden")) {
      label.style.animation = "none";
    } else {
      label.style.animation = `cardAppear 0.6s ${index * 0.1}s forwards`;
    }
  });
});
