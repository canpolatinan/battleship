# 🚢 Battleship 


A modern, web-based Battleship simulation designed with a retro-cyberpunk tactical terminal UI. It features a multi-tiered AI opponent utilizing data structures (Stacks) and parity algorithms for optimized hunting.

## 🧠 AI & Algorithmic Features
The game implements three difficulty levels, showcasing different algorithmic approaches:
* **Stack-Based Target Acquisition (Target Mode):** When the AI scores a hit, it pushes the adjacent coordinates (Up, Down, Left, Right) into a Stack data structure (`aiHedefYigini`). In subsequent turns, it pops these coordinates to systematically hunt down and sink the rest of the ship.
* **Checkerboard Parity Algorithm:** On 'Medium' and 'Hard' difficulties, the AI optimizes its search phase by firing in a checkerboard pattern `(x + y) % 2 == 0`. This mathematical approach effectively halves the required search area for finding ships.
* **Dynamic Decision Making:** The AI seamlessly switches between random parity searching and stack-based localized hunting depending on the state of the board.

## ✨ Key Features
* **Procedural Audio Engine:** Sound effects (sonar, explosions, misses) are generated dynamically using the browser's native Web Audio API (`AudioContext`), utilizing oscillators and noise buffers instead of external sound files.
* **Retro Cyberpunk UI:** Custom CRT scanline effects, glowing neon elements, and screen-shake animations for immersive feedback.
* **Drag & Drop Placement:** Intuitive ship positioning system with real-time collision, bounds checking, and rotation mechanics.

---

# 🚢 Amiral Battı 

Retro-siberpunk taktiksel terminal arayüzü ile tasarlanmış modern, web tabanlı bir Amiral Battı simülasyonu. Optimize edilmiş hedef bulma için Veri Yapılarını (Yığıt/Stack) ve Satranç Tahtası (Parity) algoritmalarını kullanan çok seviyeli bir yapay zeka rakibe sahiptir.

## 🧠 Yapay Zeka ve Algoritmik Özellikler
Oyun, farklı algoritmik yaklaşımları sergileyen üç zorluk seviyesi içerir:
* **Yığıt (Stack) Tabanlı Hedef Takibi:** Yapay zeka bir isabet kaydettiğinde, bitişik koordinatları (Yukarı, Aşağı, Sol, Sağ) bir Yığıt (`aiHedefYigini`) veri yapısına ekler (push). Sonraki turlarda, geminin geri kalanını sistematik olarak avlamak ve batırmak için bu koordinatları sırayla çeker (pop).
* **Satranç Tahtası (Parity) Algoritması:** 'Orta' ve 'Zor' zorluklarda yapay zeka, dama tahtası deseninde `(x + y) % 2 == 0` ateş ederek arama aşamasını optimize eder. Bu matematiksel yaklaşım, gemileri bulmak için gereken arama alanını yarı yarıya düşürür.
* **Dinamik Karar Mekanizması:** Yapay zeka, tahtanın durumuna bağlı olarak rastgele satranç tahtası araması ile yığıt tabanlı bölgesel avlanma arasında kusursuz bir geçiş yapar.

## ✨ Temel Özellikler
* **Prosedürel Ses Motoru:** Ses efektleri (sonar, patlamalar, karavana), harici ses dosyaları yerine osilatörler ve gürültü tamponları (noise buffer) kullanılarak tarayıcının yerleşik Web Audio API'si ile dinamik olarak üretilir.
* **Retro Siberpunk Arayüz:** Sürükleyici bir deneyim için özel CRT tarama çizgisi efektleri, parlayan neon öğeler ve ekran titreme animasyonları.
* **Sürükle ve Bırak:** Gerçek zamanlı çarpışma kontrolü, sınır denetimi ve döndürme mekaniklerine sahip sezgisel gemi konumlandırma sistemi.
