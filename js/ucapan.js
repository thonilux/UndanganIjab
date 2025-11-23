/* ============================
   U C A P A N   U N D A N G A N
   - Backend: Google Apps Script (Google Sheets)
   - Sheet: ucapan-jawa / tab "comentar"
   - Token: tokekbelang123
   ============================ */

/** KONFIGURASI **/
const UC_ENDPOINT =
  window.UC_ENDPOINT ||
  "https://script.google.com/macros/s/AKfycby-u7bjcgI7cZ87e-NeGJxRiMoQ8VLlQuYXfFrGrgzX4X0KekJCteAuj1AFNzOHUD8C/exec";
const UC_TOKEN = window.UC_TOKEN || "tokekbelang123";
const UC_LIMIT_AWAL = 25; // banyak ucapan saat load awal
const UC_LIMIT_TAMBAH = 25; // banyak ucapan tiap klik "muat lebih"

/** UTIL **/
const byId = (id) => document.getElementById(id);
const sel = (q, r = document) => r.querySelector(q);
const selAll = (q, r = document) => Array.from(r.querySelectorAll(q));
const escapeHTML = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );

/** BACA NAMA TAMU DARI URL (robust, dengan alias) **/
function ambilNamaTamuDariURL() {
  let raw = window.location.search.slice(1) || "";
  raw = raw.replace(/\+/g, " "); // ubah + menjadi spasi
  const qs = new URLSearchParams(raw);
  const KEYS = ["kepada", "to", "untuk", "nama", "guest"];
  let nama = "";
  for (const k of KEYS) {
    const v = qs.get(k);
    if (v) {
      nama = v;
      break;
    }
  }
  // normalisasi spasi & trim
  nama = (nama || "").replace(/\s+/g, " ").trim();
  return nama;
}

/** SET NAMA TAMU KE UI (elemen .nama_tamu dan input form) **/
function setNamaTamuKeUI(nama) {
  if (!nama) return;
  const target = sel(".nama_tamu");
  if (target) target.textContent = nama;
  const inputNama = sel("[name='form_ucapan_nama']");
  if (inputNama) inputNama.value = nama;
}

/** FETCH: AMBIL UCAPAN TERBARU **/
async function ambilUcapan(limit = UC_LIMIT_AWAL) {
  const url = `${UC_ENDPOINT}?limit=${encodeURIComponent(
    limit
  )}&token=${encodeURIComponent(UC_TOKEN)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 200)
    throw new Error(json.message || "Gagal mengambil ucapan");
  // Format data: [{id,name,status,message,date,color}, ...] terbaru → terlama
  return json.comentar || [];
}

/** FETCH: KIRIM UCAPAN BARU **/
async function kirimUcapan(nama, pesan, kehadiran = 1, warna = "") {
  const body = new URLSearchParams({
    token: UC_TOKEN,
    name: nama,
    message: pesan,
    status: String(kehadiran ?? 1),
    color: warna || "",
  });
  const res = await fetch(UC_ENDPOINT, { method: "POST", body });
  const json = await res.json();
  if (json.status !== 200)
    throw new Error(json.message || "Gagal menyimpan ucapan");
  return json; // {status, message, id}
}

/** RENDER SATU ITEM UCAPAN **/
function renderItemUcapan(item) {
  const nama = escapeHTML(item.name || "-");
  const isi = escapeHTML(item.message || "");
  const ketHadir =
    item.status === 1 || item.status === "1"
      ? "✅"
      : item.status === 2 || item.status === "2"
      ? "🕒"
      : "❌";

  return `
  <div class="ucapan-item" style="margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.1);">
    <div class="ucapan-head">
      <strong>${nama}</strong>
      <span class="ucapan-meta">${escapeHTML(ketHadir)}</span>
    </div>
    <div class="ucapan-body">${isi}</div>
  </div>
`;
}

/** STATE PAGINASI SEDERHANA (client only) **/
let _ucapanSemua = []; // cache hasil GET
let _ucapanTampil = 0; // berapa item yang sedang ditampilkan

function renderBatchUcapan(batch = UC_LIMIT_AWAL) {
  const box = byId("wishes-box");
  if (!box) return;
  const nextTampil = Math.min(_ucapanTampil + batch, _ucapanSemua.length);
  const frag = document.createDocumentFragment();
  for (let i = _ucapanTampil; i < nextTampil; i++) {
    const div = document.createElement("div");
    div.innerHTML = renderItemUcapan(_ucapanSemua[i]);
    // ambil anak pertama (wrapper)
    frag.appendChild(div.firstElementChild);
  }
  box.appendChild(frag);
  _ucapanTampil = nextTampil;

  const btnMore = byId("wishes-more");
  if (btnMore) {
    btnMore.disabled = _ucapanTampil >= _ucapanSemua.length;
    btnMore.style.display = _ucapanTampil >= _ucapanSemua.length ? "none" : "";
  }
}

/** MUAT ULANG SEMUA UCAPAN (ambil terbaru, reset tampilan) **/
async function refreshUcapan() {
  const box = byId("wishes-box");
  if (box) box.innerHTML = ""; // reset
  _ucapanSemua = await ambilUcapan(200); // ambil max 200; sesuaikan bila perlu
  _ucapanTampil = 0;
  renderBatchUcapan(UC_LIMIT_AWAL);
}

/** INISIALISASI FORM **/
function initFormUcapan() {
  const form = byId("form_ucapan");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const elNama = sel("[name='form_ucapan_nama']", form);
    const elIsi = sel("[name='form_ucapan_ucapan']", form);
    const elKeh = sel("[name='form_ucapan_kehadiran']:checked", form);

    const nama = (elNama?.value || "").replace(/\s+/g, " ").trim();
    const isi = (elIsi?.value || "").trim();
    const ke = Number(elKeh?.value ?? 1);

    if (!nama || !isi) {
      alert("Nama & ucapan wajib diisi.");
      return;
    }
    if (isi.length > 500) {
      alert("Ucapan maksimal 500 karakter.");
      return;
    }

    // Tampilkan loader sederhana (opsional): tambah class "loading" pada body
    document.body.classList.add("loading");
    try {
      await kirimUcapan(nama, isi, ke, "");
      // reset form
      form.reset();
      console.log(nama, isi, ke);
      if (ke == 1) {
        Swal.fire({
          imageUrl:
            "https://cdn.jsdelivr.net/gh/ihzaa/undangan-biru@07d3e4c789e2651b342f276c1dcadffaa259049b/public/images/valentines-day.gif",
          title: "Terima kasih ucapannya!",
          text: "Kami tunggu kehadiranmu ya " + nama,
        });
      } else {
        Swal.fire({
          imageUrl:
            "https://cdn.jsdelivr.net/gh/ihzaa/undangan-biru@07d3e4c789e2651b342f276c1dcadffaa259049b/public/images/pray.gif",
          title: "Terima kasih ucapannya!",
          text: `Semoga kita dapat bertemu di lain kesempatan`,
        });
      }
      // tampilkan ucapan baru di atas (opsi: reload penuh)
      await refreshUcapan();
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim ucapan. Coba lagi ya.");
    } finally {
      document.body.classList.remove("loading");
    }
  });
}

/** INISIALISASI TOMBOL "MUAT LEBIH" (opsional) **/
function initMuatLebih() {
  const btn = byId("wishes-more");
  if (!btn) return;
  btn.addEventListener("click", () => renderBatchUcapan(UC_LIMIT_TAMBAH));
}

/** BOOTSTRAP **/
document.addEventListener("DOMContentLoaded", () => {
  // 1) set nama tamu otomatis dari URL
  const namaURL = ambilNamaTamuDariURL();
  if (namaURL) setNamaTamuKeUI(namaURL);

  // 2) inisialisasi form & tombol "muat lebih"
  initFormUcapan();
  initMuatLebih();

  // 3) muat ucapan awal
  refreshUcapan().catch((err) => {
    console.error(err);
    const box = byId("wishes-box");
    if (box)
      box.innerHTML =
        "<p style='opacity:.7'>Gagal memuat ucapan. Coba refresh halaman.</p>";
  });
});
