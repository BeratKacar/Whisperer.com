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
const shownFilmsMap = {}; 


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
        const shownIds = shownFilmsMap[cat] || [];

        // Daha önce gösterilmemiş filmleri filtrele
        const unseenFilms = data.results.filter(film => !shownIds.includes(film.id));

        if (unseenFilms.length === 0) {
          // Eğer hiç yeni film yoksa, gösterilenleri sıfırla ve tümünü kullan
          shownFilmsMap[cat] = [];
          unseenFilms.push(...data.results);
        }

        // Yeni 4 film seçmek için karıştır ve al
        const selected = unseenFilms.sort(() => 0.5 - Math.random()).slice(0, 4);

        // Seçilenlerin ID'lerini kaydet
        if (!shownFilmsMap[cat]) shownFilmsMap[cat] = [];
        shownFilmsMap[cat].push(...selected.map(f => f.id));

        allFilms.push(...selected);
      }
    }

    if (allFilms.length === 0) {
      displayError("The wind isn't whispering to me. There doesn't seem to be anything like what you want. Let's try again.");
      return;
    }

    displayFilms(allFilms);
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
  filmsContainer.scrollIntoView({ behavior: "smooth" });
}

function displayError(message, showInBubble = false) {
  filmsContainer.innerHTML = `<p class="error-message">${message}</p>`;
  if (showInBubble) {
    const bubble = document.getElementById("speech-bubble");
    bubble.textContent = message;
    bubble.style.display = "block";
    
    // 3 saniye sonra eski mesajlara dön
    setTimeout(() => {
      index = 0;
      startTypingSequence();
    }, 7000);
  }
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
const filmClickMessages = [
  "Good choice!",
  "Hmm, Nice catch!",
  "I like your taste!",
  "Hey hey show me a fragman too!",
];
function openFilmModal(film) {
  const randomMessage = filmClickMessages[Math.floor(Math.random() * filmClickMessages.length)];
  
  // Konuşma balonunda göster
  showTemporaryMessage(randomMessage);
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

document.addEventListener("DOMContentLoaded", function() {
  const menuButton = document.getElementById('menuBtn');
  const dropdown = document.getElementById('dropdown');
  
  // Menü butonu tıklama
  if (menuButton && dropdown) {
    menuButton.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      
      // Buton animasyonu
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });
  }

  // Dışarı tıklayınca kapat
  document.addEventListener('click', function() {
    if (dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
    }
  });

  dropdown?.addEventListener('click', function(e) {
    e.stopPropagation();
  });

});

document.addEventListener("DOMContentLoaded", function() {
  const signupBtn = document.getElementById('signupBtn');

  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      window.location.href = 'signup2.html';
    });
  }
});

refreshBtn.addEventListener("click", () => {
  const categories = getSelectedCategories();
  if (categories.length === 0) {
    const errorMsg = "What? Are you trying to fool me? Select a category human!";
    displayError(errorMsg, true); // İkinci parametre true yaparak balonda göster
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
const messages = [
  "Tell us human, what are you searching for today?",
  "Yeah yeah. I'm a flying skull, what a miracle! If you're done being surprised, it's time to choose.",
  "Hey Human! Do you see my cheekbones? I can't find anywhere.",
  "I can hear the wind whispering. It says you want to watch a movieee.",
  "Tell me, human, did I.Valentinian kick the bucket? That sickly bastard might’ve even tricked death itself.",
  "I' m 538 years old, but I still don't know what a movie is. Can you tell me?",
  "Hey,hey. Tell me human? What's year is it?",
  "Dead not dead end. Look at me, I'm a flying skull!",
  "Did you read the 'Eyes'. 10/10 would ‘read’ again… if I had eyes. Or a attention span. Or a brain.",
  "All that whispers. Hey. Let me tell you the meaning of life. The whole points is- OH NO! I forgot it again!",
  "Everyone' s here. Dostoyevsky, Tolstoy, Ataturk, M. Jordan, Napolion. Even Hit-. Oh! I think I'd better shut up.",
  "Yeah yeah. Life is boring. Bla bla. Look at me, human. I'm flaying all day long. Up and down. Up and down."
];

const bubble = document.getElementById("speech-bubble");
let index = 0;
let charIndex = 0;
let currentAnimation = null;
let currentTimeout = null;

// Tüm animasyonları ve zamanlayıcıları temizle
function clearAllAnimations() {
  clearInterval(currentAnimation);
  clearTimeout(currentTimeout);
  currentAnimation = null;
  currentTimeout = null;
}

// Güncellenmiş typeText fonksiyonu
function typeText(text, callback) {
  clearAllAnimations();
  bubble.innerHTML = "";
  charIndex = 0;
  
  currentAnimation = setInterval(() => {
    if (charIndex < text.length) {
      bubble.innerHTML += text.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(currentAnimation);
      currentAnimation = null;
      if (callback) {
        currentTimeout = setTimeout(callback, 10000);
      }
    }
  }, 50);
}

// Geçici mesaj gösterimi (ERROR mesajları için)
function showTemporaryMessage(message, duration = 3000) {
  clearAllAnimations();
  bubble.innerHTML = message; // Anında göster (animasyonsuz)
  
  currentTimeout = setTimeout(() => {
    index = 0;
    startTypingSequence();
  }, duration);
}

// Orijinal animasyon döngüsü
function startTypingSequence() {
  clearAllAnimations();
  
  if (index < messages.length) {
    typeText(messages[index], () => {
      index++;
      startTypingSequence();
    });
  } else {
    index = 0;
    startTypingSequence();
  }
}

// Başlangıç animasyonunu başlat
startTypingSequence();

// Error mesajı gösteren fonksiyon
function displayError(message, showInBubble = false) {
  filmsContainer.innerHTML = "";
  
  if (showInBubble) {
    showTemporaryMessage(message);
  }
}

// Sahne, kamera, renderer oluştur
const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
const modelContainer = document.getElementById("t-d");
renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
document.getElementById("t-d").appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 0);

// Işık ekle
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Modeli ve mouse pozisyonunu takip eden değişkenler
let model = null;
let mouseX = 0;
let mouseY = 0;

// Mouse hareketlerini dinle
document.addEventListener('mousemove', (event) => {
  const halfWidth = window.innerWidth / 2;
  const halfHeight = window.innerHeight / 2;
  mouseX = (event.clientX - halfWidth) / halfWidth;
  mouseY = (event.clientY - halfHeight) / halfHeight;
});
function lerp(start, end, t) {
  return start + (end - start) * t;
}


// GLTFLoader ile model yükle
const loader = new THREE.GLTFLoader();
loader.load('2.glb', function(gltf) {
  model = gltf.scene;
  scene.add(model);
  model.position.set(0, -7, 0);
  model.scale.set(35, 35, 35); 

  camera.position.z = 25;

  let targetRotationX = 0;
  let targetRotationY = 0;

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // Mouse konumuna göre hedef rotasyonu ayarla
    targetRotationY = mouseX * 0.5; 
    targetRotationX = mouseY * 0.5;

    // Şu anki rotasyonu hedefe doğru yumuşakça ilerlet
    model.rotation.y = lerp(model.rotation.y, targetRotationY, 0.1); 
    model.rotation.x = lerp(model.rotation.x, targetRotationX, 0.1);
  }

  renderer.render(scene, camera);
}


  animate();
});

// Pencere boyutu değişirse yeniden ayarla
window.addEventListener('resize', () => {
  const modelContainer = document.getElementById("t-d");
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
  camera.updateProjectionMatrix();
});
const searchBtn   = document.getElementById("searchBtn");
const searchPanel = document.getElementById("searchPanel");
const doSearchBtn = document.getElementById("doSearchBtn");
const searchInput = document.getElementById("searchInput");

// Paneli aç/kapa ve focus’u input’a ver
searchBtn.addEventListener("click", () => {
  searchPanel.classList.toggle("active");
  if (searchPanel.classList.contains("active")) {
    searchInput.focus();
  }
});

// Enter tuşu ile de aramayı tetikle
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") doSearch();
});
doSearchBtn.addEventListener("click", doSearch);

async function doSearch() {
  const query = searchInput.value.trim();
  filmsContainer.innerHTML = "";  // önceki sonuçları sil

  if (!query) {
    displayError("Focus human. I am not a mind reader. Please type something.", true);
    return;
  }

  try {
    const res  = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}` +
      `&query=${encodeURIComponent(query)}&language=tr-TR`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      displayError("I can't find anything like that.", true);
      return;
    }

    displayFilms(data.results);
  } catch (err) {
    console.error(err);
    displayError("Something wrong. Do it again.", true);
  }
  filmsContainer.scrollIntoView({ behavior: "smooth" });
}
