const oyuncuGrid = document.getElementById('oyuncu-grid');
const dusmanGrid = document.getElementById('dusman-grid');
const bilgiEkrani = document.getElementById('bilgi-ekrani');
const baslaBtn = document.getElementById('basla-btn');
const yeniBtn = document.getElementById('yeni-operasyon-btn');
const statIsabet = document.getElementById('oyuncu-isabet');
const statTehdit = document.getElementById('dusman-tehdit');

const HARITA_BOYUTU = 10;
let oyunBasladi = false, oyunBitti = false, siraOyuncuda = true;
let oyuncuHucreleri = [], dusmanHucreleri = [];
let oyuncuGemileri = [], dusmanGemileri = [];
let suruklenenGemi = null, aiHedefYigini = [], oncekiHedefler = [];
let oyuncuAtisSayisi = 0, oyuncuIsabetSayisi = 0;

const GEMI_TURLERI = [
    { isim: "Uçak Gemisi", boyut: 5 }, { isim: "Kruvazör", boyut: 4 },
    { isim: "Denizaltı", boyut: 3 }, { isim: "Muhrip", boyut: 3 }, { isim: "Hücumbot", boyut: 2 }
];


const SesMotoru = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),


    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    },

    isabet() {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 800;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    },


    karavana() {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    },

    batma() {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    },

    baslangic() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
};


let daktiloZamanlayici = null;
function mesajYazdir(metin, renk) {
    bilgiEkrani.style.color = renk;
    bilgiEkrani.innerText = "";
    if(daktiloZamanlayici) clearInterval(daktiloZamanlayici);
    let i = 0;
    daktiloZamanlayici = setInterval(() => {
        bilgiEkrani.innerText += metin.charAt(i);
        i++;
        if(i >= metin.length) clearInterval(daktiloZamanlayici);
    }, 30);
}

function istatistikGuncelle() {
    let yuzde = oyuncuAtisSayisi === 0 ? 0 : Math.round((oyuncuIsabetSayisi / oyuncuAtisSayisi) * 100);
    statIsabet.innerText = `%${yuzde}`;
    let kalanDusman = 5 - dusmanGemileri.filter(g => g.hasar >= g.boyut).length;
    statTehdit.innerText = `${kalanDusman} GEMİ`;
}

function koordinatlariCiz() {
    const harfler = ['A','B','C','D','E','F','G','H','I','J'];
    document.getElementById('o-ust').innerHTML = ''; document.getElementById('o-sol').innerHTML = '';
    document.getElementById('d-ust').innerHTML = ''; document.getElementById('d-sol').innerHTML = '';

    for(let i=1; i<=10; i++) {
        document.getElementById('o-ust').innerHTML += `<div>${i}</div>`;
        document.getElementById('d-ust').innerHTML += `<div>${i}</div>`;
    }
    for(let i=0; i<10; i++) {
        document.getElementById('o-sol').innerHTML += `<div>${harfler[i]}</div>`;
        document.getElementById('d-sol').innerHTML += `<div>${harfler[i]}</div>`;
    }
}

function sistemiBaslat() {
    oyunBasladi = false; oyunBitti = false; siraOyuncuda = true;
    oyuncuAtisSayisi = 0; oyuncuIsabetSayisi = 0;
    oyuncuGrid.innerHTML = ''; dusmanGrid.innerHTML = '';
    document.body.classList.remove('savas-modu');
    dusmanGrid.classList.remove('radar-efekti');
    aiHedefYigini = [];
    istatistikGuncelle();
    koordinatlariCiz();

    oyuncuHucreleri = Array.from({ length: 10 }, () => Array(10).fill(null));
    dusmanHucreleri = Array.from({ length: 10 }, () => Array(10).fill(null));

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            let oH = document.createElement('div'); oH.className = 'hucre';
            oH.dataset.x = x; oH.dataset.y = y;
            oH.addEventListener('mousedown', () => gemiSec(x, y));
            oH.addEventListener('dblclick', (e) => { e.preventDefault(); gemiDondur(x, y); });
            oyuncuGrid.appendChild(oH);
            oyuncuHucreleri[y][x] = { element: oH, gemiRef: null, vurulduMu: false };

            let dH = document.createElement('div'); dH.className = 'hucre';
            dH.addEventListener('click', () => oyuncuAtisi(x, y));
            dusmanGrid.appendChild(dH);
            dusmanHucreleri[y][x] = { element: dH, gemiRef: null, vurulduMu: false };
        }
    }

    oyuncuGemileri = rastgeleDiz(oyuncuHucreleri, true);
    dusmanGemileri = rastgeleDiz(dusmanHucreleri, false);

    mesajYazdir("STRATEJİ: GEMİLERİ YERLEŞTİRİN (SÜRÜKLE VEYA ÇİFT TIKLA)", "#00ffc8");
    baslaBtn.disabled = false;
}

function rastgeleDiz(harita, gorunur) {
    let gemiler = [];
    GEMI_TURLERI.forEach(tur => {
        let yerlesti = false;
        let deneme = 0;
        while(!yerlesti && deneme < 200) {
            let x = Math.floor(Math.random()*10), y = Math.floor(Math.random()*10), yatay = Math.random() < 0.5;
            if(gecerliYerdemi(harita, x, y, tur.boyut, yatay)) {
                let g = { ...tur, x, y, yatay, hasar: 0 };
                gemiler.push(g);
                gemiYerlestir(harita, g, gorunur);
                yerlesti = true;
            }
            deneme++;
        }
    });
    return gemiler;
}

function gecerliYerdemi(harita, x, y, boyut, yatay, haricGemi = null) {
    if(yatay && x + boyut > 10) return false;
    if(!yatay && y + boyut > 10) return false;
    for(let i=0; i<boyut; i++) {
        let hX = yatay ? x+i : x, hY = yatay ? y : y+i;
        if(harita[hY][hX].gemiRef && harita[hY][hX].gemiRef !== haricGemi) return false;
    }
    return true;
}

function gemiYerlestir(harita, g, isGorunur) {
    for(let i=0; i<g.boyut; i++) {
        let hX = g.yatay ? g.x+i : g.x, hY = g.yatay ? g.y : g.y+i;
        harita[hY][hX].gemiRef = g;
        if(isGorunur) harita[hY][hX].element.classList.add('gemi-aktif');
    }
}

function gemiTemizle(harita, g) {
    for(let i=0; i<g.boyut; i++) {
        let hX = g.yatay ? g.x+i : g.x, hY = g.yatay ? g.y : g.y+i;
        harita[hY][hX].gemiRef = null;
        harita[hY][hX].element.classList.remove('gemi-aktif');
    }
}

function gemiSec(x, y) {
    if(oyunBasladi) return;
    suruklenenGemi = oyuncuHucreleri[y][x].gemiRef;
    if(suruklenenGemi) {
        document.addEventListener('mousemove', fareTakip);
        document.addEventListener('mouseup', gemiyiBirak);
        gemiTemizle(oyuncuHucreleri, suruklenenGemi);
    }
}

function fareTakip(e) {
    oncekiHedefler.forEach(h => h.classList.remove('hedef-gecerli', 'hedef-gecersiz'));
    oncekiHedefler = [];
    let hedef = document.elementFromPoint(e.clientX, e.clientY);
    if(hedef && hedef.parentElement === oyuncuGrid) {
        let nX = parseInt(hedef.dataset.x), nY = parseInt(hedef.dataset.y);
        let gecerli = gecerliYerdemi(oyuncuHucreleri, nX, nY, suruklenenGemi.boyut, suruklenenGemi.yatay, suruklenenGemi);
        for(let i=0; i<suruklenenGemi.boyut; i++) {
            let hX = suruklenenGemi.yatay ? nX+i : nX, hY = suruklenenGemi.yatay ? nY : nY+i;
            if(hX < 10 && hY < 10) {
                let cell = oyuncuHucreleri[hY][hX].element;
                cell.classList.add(gecerli ? 'hedef-gecerli' : 'hedef-gecersiz');
                oncekiHedefler.push(cell);
            }
        }
    }
}

function gemiyiBirak(e) {
    document.removeEventListener('mousemove', fareTakip);
    document.removeEventListener('mouseup', gemiyiBirak);
    oncekiHedefler.forEach(h => h.classList.remove('hedef-gecerli', 'hedef-gecersiz'));
    oncekiHedefler = [];
    let hedef = document.elementFromPoint(e.clientX, e.clientY);
    if(hedef && hedef.parentElement === oyuncuGrid) {
        let nX = parseInt(hedef.dataset.x), nY = parseInt(hedef.dataset.y);
        if(gecerliYerdemi(oyuncuHucreleri, nX, nY, suruklenenGemi.boyut, suruklenenGemi.yatay, suruklenenGemi)) {
            suruklenenGemi.x = nX; suruklenenGemi.y = nY;
        }
    }
    gemiYerlestir(oyuncuHucreleri, suruklenenGemi, true);
    suruklenenGemi = null;
}

function gemiDondur(x, y) {
    if(oyunBasladi) return;
    let g = oyuncuHucreleri[y][x].gemiRef;
    if(g && gecerliYerdemi(oyuncuHucreleri, g.x, g.y, g.boyut, !g.yatay, g)) {
        gemiTemizle(oyuncuHucreleri, g);
        g.yatay = !g.yatay;
        gemiYerlestir(oyuncuHucreleri, g, true);
    }
}

baslaBtn.onclick = () => {
    SesMotoru.baslangic();
    oyunBasladi = true; baslaBtn.disabled = true;
    document.body.classList.add('savas-modu');
    dusmanGrid.classList.add('radar-efekti');
    mesajYazdir("SİSTEM AKTİF! İLK ATIŞI YAPIN KOMUTAN.", "#00ffc8");
};

yeniBtn.onclick = sistemiBaslat;

function ekranTitret(siddet = 'hafif') {
    document.body.classList.remove('ekran-sarsintisi');
    void document.body.offsetWidth;
    document.body.classList.add('ekran-sarsintisi');
    setTimeout(() => document.body.classList.remove('ekran-sarsintisi'), siddet === 'agir' ? 500 : 300);
}

function oyuncuAtisi(x, y) {
    if(!oyunBasladi || oyunBitti || !siraOyuncuda) return;
    let h = dusmanHucreleri[y][x];
    if(h.vurulduMu) return;

    if (SesMotoru.ctx.state === 'suspended') SesMotoru.ctx.resume();

    h.vurulduMu = true; siraOyuncuda = false;
    oyuncuAtisSayisi++;

    if(h.gemiRef) {
        oyuncuIsabetSayisi++;
        h.element.classList.add('tam-isabet'); h.gemiRef.hasar++;

        if(h.gemiRef.hasar >= h.gemiRef.boyut) {
            SesMotoru.batma(); ekranTitret('agir');
            gemiBatti(dusmanHucreleri, h.gemiRef);
            mesajYazdir("HEDEF İMHA EDİLDİ: " + h.gemiRef.isim.toUpperCase(), "#00ffc8");
        } else {
            SesMotoru.isabet(); ekranTitret('hafif');
            mesajYazdir("TAM İSABET! YENİ ATIŞ SİZDE.", "#00ffc8");
        }
        istatistikGuncelle();
        siraOyuncuda = true; kazananiKontrolEt();
    } else {
        SesMotoru.karavana();
        h.element.classList.add('karavana');
        mesajYazdir("KARAVANA! DÜŞMAN RADARI TARIYOR...", "#ff3232");
        istatistikGuncelle();
        setTimeout(aiAtisi, 800);
    }
}

function aiAtisi() {
    if(oyunBitti) return;

    let x, y;
    let zorluk = document.getElementById('zorluk-secimi').value;
    let gecerliHedefBulundu = false;
    let denemeLimit = 0;

    while (!gecerliHedefBulundu) {
        if (aiHedefYigini.length > 0) {
            let f = aiHedefYigini.pop();
            x = f.x; y = f.y;
            if (x >= 0 && x < 10 && y >= 0 && y < 10 && !oyuncuHucreleri[y][x].vurulduMu) {
                gecerliHedefBulundu = true;
            }
        } else {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);

            if (!oyuncuHucreleri[y][x].vurulduMu) {
                denemeLimit++;
                if (zorluk === 'zor' && denemeLimit < 50) {
                    if ((x + y) % 2 === 0) gecerliHedefBulundu = true;
                } else {
                    gecerliHedefBulundu = true;
                }
            }
        }
    }

    let h = oyuncuHucreleri[y][x];
    h.vurulduMu = true;

    if(h.gemiRef) {
        h.element.classList.add('tam-isabet'); h.gemiRef.hasar++;

        if(zorluk !== 'kolay') {
            hedefEkle(x + 1, y); hedefEkle(x - 1, y);
            hedefEkle(x, y + 1); hedefEkle(x, y - 1);
        }

        if(h.gemiRef.hasar >= h.gemiRef.boyut) {
            SesMotoru.batma(); ekranTitret('agir');
            gemiBatti(oyuncuHucreleri, h.gemiRef);
            aiHedefYigini = [];
            mesajYazdir("KRİTİK HASAR! " + h.gemiRef.isim.toUpperCase() + " BATIRILDI!", "#ff3232");
        } else {
            SesMotoru.isabet(); ekranTitret('hafif');
            mesajYazdir("SİSTEM VURULDU! DÜŞMAN YENİDEN HEDEFLİYOR...", "#ff3232");
        }

        kazananiKontrolEt();
        if(!oyunBitti) setTimeout(aiAtisi, 800);
    } else {
        SesMotoru.karavana();
        h.element.classList.add('karavana');
        mesajYazdir("DÜŞMAN KARAVANA ATTI. SIRA SİZDE!", "#00ffc8");
        siraOyuncuda = true;
    }
}

function hedefEkle(x, y) {
    if(x >= 0 && x < 10 && y >= 0 && y < 10 && !oyuncuHucreleri[y][x].vurulduMu) {
        aiHedefYigini.push({x, y});
    }
}

function gemiBatti(harita, g) {
    for(let i=0; i<g.boyut; i++) {
        let hX = g.yatay ? g.x+i : g.x, hY = g.yatay ? g.y : g.y+i;
        harita[hY][hX].element.classList.add('batti-kan-kirmizi');
    }
}

function kazananiKontrolEt() {
    let oB = oyuncuGemileri.filter(g => g.hasar >= g.boyut).length;
    let dB = dusmanGemileri.filter(g => g.hasar >= g.boyut).length;

    if(oB === 5 || dB === 5) {
        oyunBitti = true;
        setTimeout(() => {
            let o = document.createElement('div'); o.className = 'rapor-overlay';
            let renk = dB === 5 ? '#00ffc8' : '#ff3232';
            let baslik = dB === 5 ? "SİSTEM GÜVENDE - ZAFER" : "SİSTEM ÇÖKTÜ - MAĞLUBİYET";
            let skorMetni = `İsabet Oranınız: %${Math.round((oyuncuIsabetSayisi / oyuncuAtisSayisi) * 100)}`;

            o.innerHTML = `<div class="rapor-kutu"><h1 style="color:${renk}; text-shadow: 0 0 20px ${renk};">${baslik}</h1>
                           <p style="color:white; margin-bottom:20px; font-size: 1.2em;">${skorMetni}</p>
                           <button class="ozel-buton" onclick="location.reload()">SİSTEMİ YENİDEN BAŞLAT</button></div>`;
            document.body.appendChild(o);
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', sistemiBaslat);