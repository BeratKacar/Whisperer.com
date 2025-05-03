
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
directionalLight.position.set(10, 10, 10);
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
loader.load('4.glb', function(gltf) {
  model = gltf.scene;
  scene.add(model);
  model.position.set(0, -4, 0);
  model.scale.set(25, 25, 25); 

  camera.position.z = 13;

  let targetRotationX = 0;
let targetRotationY = 0;

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // Mouse konumuna göre hedef rotasyonu ayarla
    targetRotationY = mouseX * 0.4; 
    targetRotationX = mouseY * 0.5;

    // Şu anki rotasyonu hedefe doğru yumuşakça ilerlet
    model.rotation.y = lerp(model.rotation.y, targetRotationY, 0.09); 
    model.rotation.x = lerp(model.rotation.x, targetRotationX, 0.09);
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

const messages = [
    "Hey! Do i know you?",
    "Yeah, yeah. I feel like I've seen you before.",
    "Hmm... Wait... are you a flying skull too?",
    "You let that no-good rascal on the main page know I’m still waitin’ on my three Roman gold pieces!"
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

// Kullanıcı verilerini yerel depolama (localStorage) kontrol etmek
function getUserData() {
  return JSON.parse(localStorage.getItem('userData')) || null;
}

// Kayıt işlemi için ayrı bir form dinleyicisi ekleyin
document.querySelector('.signup-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Formun sayfayı yenilemesini engelle
  let name = event.target.querySelector('input[name="name"]').value;
  let email = event.target.querySelector('input[name="email"]').value;
  let password = event.target.querySelector('input[name="password"]').value;

  console.log(name, email, password);
  if (name && email && password) {
    // Veriyi localStorage'a kaydet
    const userData = {
      name: name,
      email: email,
      password: password
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    alert('Kayıt başarılı!');
    window.location.href = "signup2.html"; // Ana sayfanızın giriş sayfası olmalı
  } else {
    alert('Lütfen tüm alanları doldurun!');
  }
});

// Giriş işlemi için ayrı bir form dinleyicisi ekleyin
document.querySelector('.login-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Formun sayfayı yenilemesini engelle
  let email = event.target.querySelector('input[name="email"]').value;
  let password = event.target.querySelector('input[name="password"]').value;
  const userData = getUserData();

  if (userData && userData.email === email && userData.password === password) {
    alert('Giriş başarılı! Hoş geldiniz, ' + userData.name + '!');
    window.location.href = "index.html"; // Ana sayfanızın adı burada olmalı
  } else {
    alert('Email veya şifre yanlış!');
  }
});


  const checkbox = document.getElementById('themeSwitch');

  // Varsayılan olarak dark mode başlat
  window.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'dark') {
      checkbox.checked = true;
      document.documentElement.classList.add('dark');
    } else {
      checkbox.checked = false;
      document.documentElement.classList.remove('dark');
    }
  });

  // Değişiklik olduğunda kaydet
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  });





