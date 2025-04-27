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
      displayError("The wind isn't whispering to me. There doesn't seem to be anything like what you want. Let's try again.");
      return;
    }

    const randomFour = allFilms.sort(() => 0.5 - Math.random()).slice(0, 4);
    displayFilms(randomFour);
  } catch (error) {
    console.error("Try again:", error);
    displayError("WTF is happening? I can't hear a whisper. Oh no! Am I deaf? Let's try again human. NOW!");
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
      <div class="film-description">
        ${film.overview || "Bu film hakkında bir açıklama bulunmamaktadır."}
      </div>
    `;

    div.addEventListener("click", () => {
      modalTitle.textContent = film.title;
      modalPoster.src = posterURL;
      modalOverview.textContent = film.overview || "Açıklama bulunamadı.";
      modalDate.textContent = film.release_date ? new Date(film.release_date).toLocaleDateString('tr-TR') : "Bilinmiyor";
      modalRating.textContent = film.vote_average ? `${film.vote_average}/10` : "Puan yok";

      modal.classList.remove("hidden");
      modal.classList.add("show");
      document.body.style.overflow = "hidden";
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
    displayError("What? Are you trying to fool me? Select a category human!");
    return;
  }
  fetchFilms(categories);
});

// Kategorileri aç/kapat
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

// MODAL işlemleri
const modal = document.getElementById("filmModal");
const closeModalBtn = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalPoster = document.getElementById("modalPoster");
const modalOverview = document.getElementById("modalOverview");
const modalDate = document.getElementById("modalDate");
const modalRating = document.getElementById("modalRating");

closeModalBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  }
});

// Menü butonu işlemleri
  const menuButton = document.getElementById('menuBtn');
  menuButton.addEventListener('click', () => {
  const dropdown = document.getElementById('dropdown');
  dropdown.classList.toggle('hidden');
});

// Sayfa yüklenince giriş/kayıt butonları işlemleri
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

  // Sahne, kamera, renderer oluştur
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  const modelContainer = document.getElementById("3d-model");
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);

  document.getElementById("3d-model").appendChild(renderer.domElement);
  scene.background = new THREE.Color(0xffffff); // Beyaz arkaplan


  // Işık ekle
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);


  // GLTFLoader ile model yükle
  const loader = new THREE.GLTFLoader();
  loader.load('skull_low_poly.glb', function(gltf) {
    const model = gltf.scene;
    scene.add(model);
    model.position.set(0, 0, 0);   // Ortaya al
    model.scale.set(0.3, 0.3, 0.3);





    // Modeli başlangıçta biraz döndür
    model.rotation.x = Math.PI / 2;
    model.rotation.y = Math.PI / 2;

    // Kamera pozisyonunu ayarla
    camera.position.z = 20;

    // Animasyon fonksiyonu
    function animate() {
      requestAnimationFrame(animate);
      model.rotation.y += 0.01; // Modeli döndür
      renderer.render(scene, camera);
    }
    animate();
  });

  // Pencere boyutu değişirse yeniden ayarla
  window.addEventListener('resize', () => {
    const modelContainer = document.getElementById("3d-model");
    renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
    camera.updateProjectionMatrix();
  });
  
