const filmsContainer = document.getElementById("films");
const refreshBtn = document.getElementById("refreshBtn");
const toggleBtn = document.getElementById("toggleCategories");
const categoryButtons = document.getElementById("categoryButtons");

const API_URL = "https://api.themoviedb.org/3/discover/movie";
const API_KEY = "70d782d0f4fda375704be7703dbe1753";

// Kategori adı -> TMDb genre ID eşleşmesi
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

// Seçili kategorileri al
function getSelectedCategories() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

// Filmleri al ve göster
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
      displayError("Seçilen kategorilere uygun film bulunamadı.");
      return;
    }

    const randomThree = allFilms.sort(() => 0.5 - Math.random()).slice(0, 3);
    displayFilms(randomThree);
  } catch (error) {
    console.error("Film alınamadı:", error);
    displayError("Filmler alınırken bir hata oluştu.");
  }
}

// Filmleri sayfada göster
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
    `;

    div.addEventListener("click", () => {
      modalTitle.textContent = film.title;
      modalPoster.src = posterURL;
      modalOverview.textContent = film.overview || "Açıklama bulunamadı.";
      modalDate.textContent = film.release_date || "Bilinmiyor";
      modalRating.textContent = film.vote_average || "Yok";

      modal.classList.remove("hidden");
    });

    filmsContainer.appendChild(div);
  });
}

// Hata mesajı göster
function displayError(message) {
  filmsContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

// Yenile butonuna tıklanınca
refreshBtn.addEventListener("click", () => {
  const categories = getSelectedCategories();
  if (categories.length === 0) {
    displayError("Lütfen en az bir kategori seçin.");
    return;
  }
  fetchFilms(categories);
});

// Kategorileri aç/kapat
toggleBtn.addEventListener("click", () => {
  categoryButtons.classList.toggle("show");
  categoryButtons.classList.toggle("hidden");

  const labels = categoryButtons.querySelectorAll("label");
  labels.forEach((label, index) => {
    label.style.animationDelay = `${index * 0.1}s`;
  });
});

// Sayfa yüklenince çalış
fetchFilms(getSelectedCategories());

// MODAL işlemleri
const modal = document.getElementById("filmModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalPoster = document.getElementById("modalPoster");
const modalOverview = document.getElementById("modalOverview");
const modalDate = document.getElementById("modalDate");
const modalRating = document.getElementById("modalRating");

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
