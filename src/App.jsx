import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen, BarChart3, Settings, Check, Plus, Trash2,
  Sparkles, Download, Video, UsersRound, Search, RefreshCw, X
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { supabase } from "./supabaseClient";

/* ---------------------------------------------------------------------- */
/* Data dasar                                                              */
/* ---------------------------------------------------------------------- */

const SURAH = [
  ["Al-Fatihah",7],["Al-Baqarah",286],["Ali 'Imran",200],["An-Nisa",176],["Al-Ma'idah",120],
  ["Al-An'am",165],["Al-A'raf",206],["Al-Anfal",75],["At-Taubah",129],["Yunus",109],
  ["Hud",123],["Yusuf",111],["Ar-Ra'd",43],["Ibrahim",52],["Al-Hijr",99],
  ["An-Nahl",128],["Al-Isra",111],["Al-Kahf",110],["Maryam",98],["Ta-Ha",135],
  ["Al-Anbiya",112],["Al-Hajj",78],["Al-Mu'minun",118],["An-Nur",64],["Al-Furqan",77],
  ["Asy-Syu'ara",227],["An-Naml",93],["Al-Qasas",88],["Al-'Ankabut",69],["Ar-Rum",60],
  ["Luqman",34],["As-Sajdah",30],["Al-Ahzab",73],["Saba",54],["Fatir",45],
  ["Yasin",83],["As-Saffat",182],["Sad",88],["Az-Zumar",75],["Ghafir",85],
  ["Fussilat",54],["Asy-Syura",53],["Az-Zukhruf",89],["Ad-Dukhan",59],["Al-Jatsiyah",37],
  ["Al-Ahqaf",35],["Muhammad",38],["Al-Fath",29],["Al-Hujurat",18],["Qaf",45],
  ["Adz-Dzariyat",60],["At-Tur",49],["An-Najm",62],["Al-Qamar",55],["Ar-Rahman",78],
  ["Al-Waqi'ah",96],["Al-Hadid",29],["Al-Mujadalah",22],["Al-Hasyr",24],["Al-Mumtahanah",13],
  ["As-Saff",14],["Al-Jumu'ah",11],["Al-Munafiqun",11],["At-Taghabun",18],["At-Talaq",12],
  ["At-Tahrim",12],["Al-Mulk",30],["Al-Qalam",52],["Al-Haqqah",52],["Al-Ma'arij",44],
  ["Nuh",28],["Al-Jinn",28],["Al-Muzzammil",20],["Al-Muddatstsir",56],["Al-Qiyamah",40],
  ["Al-Insan",31],["Al-Mursalat",50],["An-Naba",40],["An-Nazi'at",46],["'Abasa",42],
  ["At-Takwir",29],["Al-Infitar",19],["Al-Muthaffifin",36],["Al-Insyiqaq",25],["Al-Buruj",22],
  ["At-Tariq",17],["Al-A'la",19],["Al-Ghasyiyah",26],["Al-Fajr",30],["Al-Balad",20],
  ["Asy-Syams",15],["Al-Lail",21],["Ad-Dhuha",11],["Al-Insyirah",8],["At-Tin",8],
  ["Al-'Alaq",19],["Al-Qadr",5],["Al-Bayyinah",8],["Az-Zalzalah",8],["Al-'Adiyat",11],
  ["Al-Qari'ah",11],["At-Takatsur",8],["Al-'Asr",3],["Al-Humazah",9],["Al-Fil",5],
  ["Quraisy",4],["Al-Ma'un",7],["Al-Kautsar",3],["Al-Kafirun",6],["An-Nasr",3],
  ["Al-Masad",5],["Al-Ikhlas",4],["Al-Falaq",5],["An-Nas",6],
].map(([name, ayat], i) => ({ no: i + 1, name, ayat }));

const HARI = ["Ahad","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

const APRESIASI_HADIR = [
  "Masya Allah, tabarakallah! Semoga tiap huruf yang kamu ulang jadi cahaya di hatimu.",
  "Barakallahu fiik! Konsistensi kecil ini yang membuat hafalan melekat kuat.",
  "Semoga Allah mudahkan setiap ayat yang kamu jaga hari ini.",
  "Luar biasa! Sebaik-baik kalian adalah yang belajar & mengajarkan Al-Qur'an.",
  "Setiap huruf yang dibaca bernilai satu kebaikan dan dilipatgandakan sepuluh. Teruskan!",
  "Alhamdulillah, satu setoran lagi tersimpan. Istiqomah itu yang paling dicintai Allah.",
  "Masya Allah tabarakallah, hatimu sedang disirami cahaya Al-Qur'an hari ini.",
];

const APRESIASI_TIDAK_HADIR = [
  "Semoga Allah memudahkan segala urusan ukhti.",
  "Tidak apa-apa, semoga Allah mudahkan urusanmu dan menggantinya dengan pahala kesabaran.",
  "Semoga kondisinya lekas membaik, dan pekan depan bisa kembali menyimak Al-Qur'an ya.",
  "Semoga Allah memberi kemudahan dan kelapangan untuk urusan yang sedang dihadapi.",
];

const BADGES = [
  { min: 4, label: "Konsisten", emoji: "\uD83C\uDF31" },
  { min: 12, label: "Istiqomah", emoji: "\uD83C\uDF19" },
  { min: 26, label: "Mujahid Qur'an", emoji: "\u2B50" },
  { min: 52, label: "Hafizh Sejati", emoji: "\uD83D\uDC51" },
];

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "1234";

/* ---------------------------------------------------------------------- */
/* Util tanggal & jadwal                                                   */
/* ---------------------------------------------------------------------- */

function toDate(s) { return new Date(s + "T00:00:00"); }
function dayName(dateStr) { if (!dateStr) return ""; return HARI[toDate(dateStr).getDay()]; }
function fmtDate(dateStr) {
  if (!dateStr) return "";
  return toDate(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}
function weekIndexOf(dateStr, refDateStr) {
  const diffDays = Math.floor((toDate(dateStr) - toDate(refDateStr)) / 86400000);
  return Math.floor(diffDays / 7);
}
function isoWeekKey(dateStr, refDateStr) {
  const wi = weekIndexOf(dateStr, refDateStr);
  const start = new Date(toDate(refDateStr)); start.setDate(start.getDate() + wi * 7);
  return start.toISOString().slice(0, 10);
}
function getActivityMode(besar, tanggal, config) {
  const wi = weekIndexOf(tanggal, config.refDate);
  const parity = ((wi % 2) + 2) % 2 === 0;
  let mandiriBesar = parity ? "A" : "B";
  if (config.invert) mandiriBesar = mandiriBesar === "A" ? "B" : "A";
  return besar === mandiriBesar ? "mandiri" : "jamai";
}

/* ---------------------------------------------------------------------- */
/* Lapisan data: Supabase                                                   */
/* ---------------------------------------------------------------------- */

const DEFAULT_CONFIG = { refDate: "2026-06-29", invert: false };

async function fetchGroups() {
  const { data, error } = await supabase.from("groups").select("*").order("besar").order("urutan");
  if (error) { console.error(error); return []; }
  return data.map((g) => ({ id: g.id, nama: g.nama, besar: g.besar, urutan: g.urutan, names: g.names || [] }));
}
async function insertGroupRow(nama, besar, urutan) {
  const { data, error } = await supabase.from("groups").insert([{ nama, besar, urutan, names: [] }]).select();
  if (error) { console.error(error); return null; }
  const g = data[0];
  return { id: g.id, nama: g.nama, besar: g.besar, urutan: g.urutan, names: g.names || [] };
}
async function updateGroupRow(id, patch) {
  const { error } = await supabase.from("groups").update(patch).eq("id", id);
  if (error) console.error(error);
}
async function deleteGroupRow(id) {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) console.error(error);
}

async function fetchEntries() {
  const { data, error } = await supabase.from("entries").select("*").order("tanggal", { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map((r) => ({
    id: r.id, nama: r.nama, kelompokId: r.kelompok_id, kelompokNama: r.kelompok_nama, kelompokBesar: r.kelompok_besar,
    tanggal: r.tanggal, hari: r.hari, mode: r.mode, aktivitas: r.aktivitas || [], hadir: r.hadir, metode: r.metode,
    setoran: r.setoran || [], keterangan: r.keterangan || "", createdAt: r.created_at,
  }));
}
async function insertEntry(entry) {
  const { data, error } = await supabase.from("entries").insert([{
    nama: entry.nama, kelompok_id: entry.kelompokId, kelompok_nama: entry.kelompokNama, kelompok_besar: entry.kelompokBesar,
    tanggal: entry.tanggal, hari: entry.hari, mode: entry.mode, aktivitas: entry.aktivitas, hadir: entry.hadir,
    metode: entry.metode, setoran: entry.setoran, keterangan: entry.keterangan,
  }]).select();
  if (error) { console.error(error); return null; }
  const r = data[0];
  return { id: r.id, nama: r.nama, kelompokId: r.kelompok_id, kelompokNama: r.kelompok_nama, kelompokBesar: r.kelompok_besar,
    tanggal: r.tanggal, hari: r.hari, mode: r.mode, aktivitas: r.aktivitas || [], hadir: r.hadir, metode: r.metode,
    setoran: r.setoran || [], keterangan: r.keterangan || "", createdAt: r.created_at };
}
async function deleteEntryRow(id) {
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) console.error(error);
  return !error;
}
async function deleteEntryRows(ids) {
  const { error } = await supabase.from("entries").delete().in("id", ids);
  if (error) console.error(error);
  return !error;
}

async function fetchConfig() {
  const { data, error } = await supabase.from("config").select("*").eq("id", 1).single();
  if (error) { console.error(error); return DEFAULT_CONFIG; }
  return { refDate: data.ref_date, invert: data.invert };
}
async function updateConfigRow(next) {
  const { error } = await supabase.from("config").update({ ref_date: next.refDate, invert: next.invert }).eq("id", 1);
  if (error) console.error(error);
}

function loadProfile() {
  try { return JSON.parse(localStorage.getItem("tahfidz-profil") || "null"); } catch { return null; }
}
function saveProfile(p) { try { localStorage.setItem("tahfidz-profil", JSON.stringify(p)); } catch {} }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* ---------------------------------------------------------------------- */
/* Komponen kecil                                                          */
/* ---------------------------------------------------------------------- */

function ArchCard({ children, className = "" }) {
  return (
    <div className={"bg-white border border-[#DCD3B8] shadow-sm " + className} style={{ borderRadius: "999px 999px 20px 20px" }}>
      {children}
    </div>
  );
}
function StarDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-6 select-none" aria-hidden="true">
      <span className="h-px flex-1 bg-[#DCD3B8]" />
      <svg width="18" height="18" viewBox="0 0 24 24" className="text-[#B8902E]">
        <path fill="currentColor" d="M12 0l2.6 7.9L22 8l-6.2 4.6L18 20l-6-4.4L6 20l2.2-7.4L2 8l7.4-.1z" />
      </svg>
      <span className="h-px flex-1 bg-[#DCD3B8]" />
    </div>
  );
}
function Field({ label, children, hint }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-[#1B3A36] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[#6B7D77] mt-1">{hint}</span>}
    </label>
  );
}
const inputCls = "w-full rounded-xl border border-[#DCD3B8] bg-[#FBFAF6] px-3.5 py-2.5 text-[#1B3A36] focus:outline-none focus:ring-2 focus:ring-[#12534A]/40 focus:border-[#12534A]";

/* Logo sederhana: bulan sabit + buku terbuka, tanpa perlu file gambar */
function AppLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Logo Setoran Tahfidz">
      <circle cx="24" cy="24" r="24" fill="#B8902E" />
      <path d="M18 30c2-8-1-14-6-16 7-2 13 2 15 8-1 3-3 6-9 8z" fill="#FBFAF6" opacity="0.95" />
      <path d="M15 33c3-1 6-3 8-6" stroke="#1B3A36" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M16 15c3.5-3.5 9-4 12.5-1" stroke="#FBFAF6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function ConfettiPiece({ i }) {
  const colors = ["#12534A", "#B8902E", "#A8434B", "#6B9B8F"];
  const left = (i * 37) % 100;
  const delay = (i % 10) * 0.12;
  const dur = 2.2 + (i % 5) * 0.3;
  return (
    <span style={{
      position: "absolute", top: -20, left: left + "%", width: 8, height: 8,
      background: colors[i % colors.length], borderRadius: i % 2 ? "50%" : "2px",
      animation: "fall " + dur + "s " + delay + "s ease-in forwards",
    }} />
  );
}
function AppreciationModal({ hadir, streak, badge, onClose }) {
  const pool = hadir ? APRESIASI_HADIR : APRESIASI_TIDAK_HADIR;
  const msg = useMemo(() => pool[Math.floor(Math.random() * pool.length)], [pool]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F1C]/60 p-4">
      <style>{"@keyframes fall{to{transform:translateY(70vh) rotate(300deg);opacity:0}} @keyframes popIn{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}"}</style>
      {hadir && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 26 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
        </div>
      )}
      <div className="relative bg-[#FBFAF6] max-w-sm w-full p-7 text-center border border-[#DCD3B8] shadow-xl"
        style={{ borderRadius: "999px 999px 24px 24px", animation: "popIn .35s ease-out" }}>
        <div className={"w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 " + (hadir ? "bg-[#12534A]" : "bg-[#6B9B8F]")}>
          <Check size={30} className="text-white" strokeWidth={3} />
        </div>
        <h3 className="text-xl text-[#1B3A36] mb-2" style={{ fontFamily: "'Amiri', serif" }}>
          {hadir ? "Laporan tersimpan" : "Laporan tercatat"}
        </h3>
        <p className="text-sm text-[#3E524D] leading-relaxed mb-4">{msg}</p>
        {hadir && streak > 1 && (
          <div className="rounded-2xl bg-[#12534A]/8 px-4 py-3 mb-4">
            <p className="text-sm text-[#12534A] font-semibold">{"\uD83D\uDD25 " + streak + " pekan berturut-turut hadir"}</p>
            {badge && <p className="text-xs text-[#B8902E] mt-1">{badge.emoji + " Lencana \"" + badge.label + "\" terbuka!"}</p>}
          </div>
        )}
        <button onClick={onClose} className="mt-1 w-full rounded-full bg-[#1B3A36] text-white py-2.5 font-medium hover:bg-[#12534A] transition-colors">
          Alhamdulillah
        </button>
      </div>
    </div>
  );
}

function SetoranRow({ row, onChange, onRemove, jenisOptions }) {
  return (
    <div className="flex flex-wrap gap-2 items-center bg-[#F3F1E7]/60 rounded-xl p-2.5 mb-2">
      {jenisOptions.length > 1 && (
        <select value={row.jenis} onChange={(e) => onChange({ ...row, jenis: e.target.value })}
          className="rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm bg-white">
          {jenisOptions.map((j) => <option key={j.value} value={j.value}>{j.label}</option>)}
        </select>
      )}
      <select value={row.surat} onChange={(e) => onChange({ ...row, surat: e.target.value })}
        className="rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm bg-white flex-1 min-w-[140px]">
        {SURAH.map((s) => <option key={s.no} value={s.name}>{s.no}. {s.name}</option>)}
      </select>
      <input type="number" min="1" placeholder="Ayat dari" value={row.ayatDari}
        onChange={(e) => onChange({ ...row, ayatDari: e.target.value })}
        className="w-24 rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm bg-white" />
      <span className="text-[#6B7D77] text-sm">-</span>
      <input type="number" min="1" placeholder="Ayat s/d" value={row.ayatSampai}
        onChange={(e) => onChange({ ...row, ayatSampai: e.target.value })}
        className="w-24 rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm bg-white" />
      <button onClick={onRemove} className="ml-auto text-[#A8434B] hover:bg-[#A8434B]/10 rounded-lg p-1.5" aria-label="Hapus baris">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Tab: Lapor Kehadiran                                                    */
/* ---------------------------------------------------------------------- */

function LaporTab({ config, groups, entries, onSubmitted }) {
  const [nama, setNama] = useState("");
  const [kelompokId, setKelompokId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [hadir, setHadir] = useState(null);
  const [aktivitasPilih, setAktivitasPilih] = useState([]);
  const [metode, setMetode] = useState("");
  const [rows, setRows] = useState([]);
  const [keterangan, setKeterangan] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [lastStreak, setLastStreak] = useState(0);
  const [lastBadge, setLastBadge] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (p && groups.some((g) => g.id === p.kelompokId)) setKelompokId(p.kelompokId);
    else if (groups.length) setKelompokId(groups[0].id);
    if (p) setNama(p.nama || "");
  }, [groups]);

  const selectedGroup = groups.find((g) => g.id === kelompokId) || null;
  const mode = selectedGroup ? getActivityMode(selectedGroup.besar, tanggal, config) : "mandiri";
  const jenisOptions = mode === "mandiri"
    ? [{ value: "ziyadah", label: "Ziyadah" }, { value: "murajaah", label: "Murajaah" }]
    : [{ value: "murajaah_jamai", label: "Murajaah Jama'i" }];

  useEffect(() => {
    setAktivitasPilih(mode === "jamai" ? ["murajaah_jamai"] : []);
    setRows([]);
  }, [mode, kelompokId, tanggal]);

  const namaOpsi = selectedGroup ? selectedGroup.names : [];

  function toggleAktivitas(v) {
    setAktivitasPilih((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);
  }
  function addRow(jenis) {
    setRows((r) => [...r, { id: uid(), jenis: jenis || aktivitasPilih[0] || jenisOptions[0].value, surat: SURAH[0].name, ayatDari: "", ayatSampai: "" }]);
  }
  function updateRow(id, updated) { setRows((r) => r.map((x) => (x.id === id ? updated : x))); }
  function removeRow(id) { setRows((r) => r.filter((x) => x.id !== id)); }

  function computeStreak(namaVal, newEntry) {
    const mine = [...entries.filter((e) => e.nama.trim().toLowerCase() === namaVal.trim().toLowerCase()), newEntry];
    const byWeek = new Map();
    mine.forEach((e) => {
      const wk = isoWeekKey(e.tanggal, config.refDate);
      byWeek.set(wk, (byWeek.get(wk) || false) || e.hadir);
    });
    const weeksSorted = Array.from(byWeek.keys()).sort().reverse();
    let streak = 0;
    for (const wk of weeksSorted) { if (byWeek.get(wk)) streak++; else break; }
    return streak;
  }

  const canSubmit = nama.trim() && selectedGroup && tanggal && hadir !== null &&
    (hadir === false || (aktivitasPilih.length > 0 && metode && rows.length > 0 &&
      rows.every((r) => r.ayatDari && r.ayatSampai)));

  async function handleSubmit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    const draft = {
      nama: nama.trim(), kelompokId: selectedGroup.id, kelompokNama: selectedGroup.nama, kelompokBesar: selectedGroup.besar,
      tanggal, hari: dayName(tanggal), mode, aktivitas: hadir ? aktivitasPilih : [], hadir, metode: hadir ? metode : null,
      setoran: hadir ? rows.map(({ id, ...rest }) => rest) : [],
      keterangan: keterangan.trim(),
    };
    const saved = await insertEntry(draft);
    if (saved) {
      const updated = [saved, ...entries];
      const streak = hadir ? computeStreak(nama, saved) : 0;
      const badge = BADGES.slice().reverse().find((b) => streak === b.min) || null;
      saveProfile({ nama: nama.trim(), kelompokId: selectedGroup.id });
      setLastStreak(streak); setLastBadge(badge);
      onSubmitted(updated);
      setShowModal(true);
      setHadir(null); setMetode(""); setRows([]); setKeterangan("");
    } else {
      alert("Gagal menyimpan laporan. Periksa koneksi internet atau pengaturan Supabase, lalu coba lagi.");
    }
    setSaving(false);
  }

  if (!groups.length) {
    return (
      <div className="max-w-xl mx-auto pb-24 text-center pt-10">
        <p className="text-[#6B7D77]">Belum ada kelompok yang dibuat. Minta admin menambahkan kelompok dulu di tab Pengaturan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-24">
      <ArchCard className="p-6 mb-6 text-center">
        <p className="text-xs uppercase tracking-wide text-[#B8902E] font-semibold mb-1">Jadwal pekan ini</p>
        <p className="text-lg text-[#1B3A36]" style={{ fontFamily: "'Amiri', serif" }}>
          {(selectedGroup ? selectedGroup.nama : "-") + " (Grup " + (selectedGroup ? selectedGroup.besar : "-") + ") \u00b7 " +
            (mode === "mandiri" ? "Ziyadah / Murajaah Mandiri ke Ustadzah" : "Murajaah Jama'i (5 halaman/anggota)")}
        </p>
        <p className="text-sm text-[#6B7D77] mt-1">{dayName(tanggal) + ", " + fmtDate(tanggal)}</p>
      </ArchCard>

      <Field label="Kelompok">
        <select value={kelompokId} onChange={(e) => setKelompokId(e.target.value)} className={inputCls}>
          {groups.map((g) => <option key={g.id} value={g.id}>{g.nama + " (Grup " + g.besar + ")"}</option>)}
        </select>
      </Field>

      <Field label="Nama">
        <input list="roster-list" value={nama} onChange={(e) => setNama(e.target.value)}
          placeholder="Ketik atau pilih nama" className={inputCls} />
        <datalist id="roster-list">
          {namaOpsi.map((n) => <option key={n} value={n} />)}
        </datalist>
      </Field>

      <Field label="Tanggal">
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputCls} />
      </Field>

      <Field label="Kehadiran">
        <div className="flex gap-3">
          <button onClick={() => setHadir(true)}
            className={"flex-1 rounded-xl py-2.5 font-medium border transition-colors " + (hadir === true ? "bg-[#12534A] text-white border-[#12534A]" : "border-[#DCD3B8] text-[#1B3A36] hover:bg-[#12534A]/5")}>
            Hadir
          </button>
          <button onClick={() => setHadir(false)}
            className={"flex-1 rounded-xl py-2.5 font-medium border transition-colors " + (hadir === false ? "bg-[#A8434B] text-white border-[#A8434B]" : "border-[#DCD3B8] text-[#1B3A36] hover:bg-[#A8434B]/5")}>
            Tidak Hadir
          </button>
        </div>
      </Field>

      {hadir === true && (
        <>
          {mode === "mandiri" && (
            <Field label="Aktivitas yang diikuti" hint="Bisa pilih keduanya jika menyetorkan ziyadah dan murajaah">
              <div className="flex gap-3">
                {jenisOptions.map((opt) => (
                  <button key={opt.value} onClick={() => toggleAktivitas(opt.value)}
                    className={"flex-1 rounded-xl py-2 border text-sm font-medium transition-colors " + (aktivitasPilih.includes(opt.value) ? "bg-[#B8902E] text-white border-[#B8902E]" : "border-[#DCD3B8] text-[#1B3A36]")}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Field label="Metode kehadiran">
            <div className="flex gap-3">
              <button onClick={() => setMetode("tatap_muka")}
                className={"flex-1 rounded-xl py-2 border text-sm font-medium flex items-center justify-center gap-2 " + (metode === "tatap_muka" ? "bg-[#1B3A36] text-white border-[#1B3A36]" : "border-[#DCD3B8]")}>
                <UsersRound size={16} /> Tatap Muka
              </button>
              <button onClick={() => setMetode("video_call")}
                className={"flex-1 rounded-xl py-2 border text-sm font-medium flex items-center justify-center gap-2 " + (metode === "video_call" ? "bg-[#1B3A36] text-white border-[#1B3A36]" : "border-[#DCD3B8]")}>
                <Video size={16} /> Video Call
              </button>
            </div>
          </Field>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[#1B3A36]">Ayat yang disetorkan</span>
          </div>
          {rows.map((row) => (
            <SetoranRow key={row.id} row={row}
              jenisOptions={jenisOptions.filter((j) => aktivitasPilih.includes(j.value) || mode === "jamai")}
              onChange={(u) => updateRow(row.id, u)} onRemove={() => removeRow(row.id)} />
          ))}
          <button disabled={mode === "mandiri" && aktivitasPilih.length === 0} onClick={() => addRow()}
            className="w-full rounded-xl border border-dashed border-[#B8902E] text-[#B8902E] py-2 text-sm font-medium flex items-center justify-center gap-1.5 mb-4 disabled:opacity-40">
            <Plus size={16} /> Tambah surat/ayat
          </button>
        </>
      )}

      {hadir === false && (
        <Field label="Keterangan (opsional)">
          <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={2}
            placeholder="Alasan tidak hadir, mis. sakit / udzur" className={inputCls} />
        </Field>
      )}

      <button disabled={!canSubmit || saving} onClick={handleSubmit}
        className="w-full rounded-full bg-[#12534A] disabled:bg-[#9CB2AC] text-white py-3 font-semibold mt-2 hover:bg-[#0D3F38] transition-colors flex items-center justify-center gap-2">
        <Sparkles size={18} /> {saving ? "Menyimpan..." : "Kirim Laporan"}
      </button>

      {showModal && <AppreciationModal hadir={!!hadir} streak={lastStreak} badge={lastBadge} onClose={() => setShowModal(false)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Tab: Dashboard Laporan                                                  */
/* ---------------------------------------------------------------------- */

function csvEscape(v) { const s = String(v ?? ""); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }

function ConfirmModal({ title, desc, confirmText, requireTyped, onConfirm, onCancel }) {
  const [typed, setTyped] = useState("");
  const canConfirm = !requireTyped || typed.trim().toUpperCase() === requireTyped;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F1C]/60 p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl p-6 border border-[#DCD3B8]">
        <h3 className="text-lg font-semibold text-[#1B3A36] mb-2">{title}</h3>
        <p className="text-sm text-[#3E524D] mb-4">{desc}</p>
        {requireTyped && (
          <input value={typed} onChange={(e) => setTyped(e.target.value)}
            placeholder={"Ketik " + requireTyped + " untuk konfirmasi"} className={inputCls + " mb-4"} />
        )}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-[#DCD3B8] py-2 text-sm font-medium">Batal</button>
          <button disabled={!canConfirm} onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#A8434B] disabled:bg-[#D9A9AD] text-white py-2 text-sm font-semibold">Hapus</button>
        </div>
      </div>
    </div>
  );
}

function DashboardTab({ entries, groups, config, onRefresh, refreshing, onEntriesChanged, adminUnlocked }) {
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [kelFilter, setKelFilter] = useState("semua");
  const [hadirFilter, setHadirFilter] = useState("semua");
  const [cari, setCari] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const kelompokOpsi = useMemo(() => {
    const set = new Map();
    groups.forEach((g) => set.set(g.nama, true));
    entries.forEach((e) => set.set(e.kelompokNama, true));
    return Array.from(set.keys());
  }, [groups, entries]);

  const filtered = useMemo(() => entries.filter((e) => {
    if (dari && e.tanggal < dari) return false;
    if (sampai && e.tanggal > sampai) return false;
    if (kelFilter !== "semua" && e.kelompokNama !== kelFilter) return false;
    if (hadirFilter !== "semua" && String(e.hadir) !== hadirFilter) return false;
    if (cari && !e.nama.toLowerCase().includes(cari.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1)), [entries, dari, sampai, kelFilter, hadirFilter, cari]);

  const totalLapor = filtered.length;
  const totalHadir = filtered.filter((e) => e.hadir).length;
  const tingkatHadir = totalLapor ? Math.round((totalHadir / totalLapor) * 100) : 0;
  const anggotaAktif = new Set(filtered.map((e) => e.nama.toLowerCase())).size;

  const trend = useMemo(() => {
    const map = new Map();
    filtered.forEach((e) => {
      const wk = isoWeekKey(e.tanggal, config.refDate);
      const cur = map.get(wk) || { pekan: wk, hadir: 0, total: 0 };
      cur.total += 1; if (e.hadir) cur.hadir += 1;
      map.set(wk, cur);
    });
    return Array.from(map.values()).sort((a, b) => (a.pekan > b.pekan ? 1 : -1))
      .map((x) => ({ ...x, rate: x.total ? Math.round((x.hadir / x.total) * 100) : 0 }));
  }, [filtered, config.refDate]);

  const perKelompok = useMemo(() => {
    const names = kelompokOpsi.length ? kelompokOpsi : [];
    return names.map((nm) => {
      const es = filtered.filter((e) => e.kelompokNama === nm);
      const hadir = es.filter((e) => e.hadir).length;
      return { kelompok: nm, hadir, tidak: es.length - hadir };
    }).filter((x) => x.hadir + x.tidak > 0);
  }, [filtered, kelompokOpsi]);

  function exportCsv() {
    const header = ["Nama","Kelompok","Grup","Hari","Tanggal","Hadir","Aktivitas","Metode","Setoran","Keterangan"];
    const lines = [header.join(",")];
    filtered.forEach((e) => {
      const setoranStr = e.setoran.map((s) => s.jenis + ":" + s.surat + " " + s.ayatDari + "-" + s.ayatSampai).join(" | ");
      lines.push([e.nama, e.kelompokNama, e.kelompokBesar, e.hari, e.tanggal, e.hadir ? "Hadir" : "Tidak Hadir",
        (e.aktivitas || []).join("/"), e.metode || "", setoranStr, e.keterangan || ""].map(csvEscape).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "laporan-tahfidz.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function doDeleteOne(id) {
    const ok = await deleteEntryRow(id);
    if (ok) onEntriesChanged(entries.filter((e) => e.id !== id));
    setConfirmDeleteId(null);
  }
  async function doDeleteBulk() {
    const ids = filtered.map((e) => e.id);
    const ok = await deleteEntryRows(ids);
    if (ok) onEntriesChanged(entries.filter((e) => !ids.includes(e.id)));
    setConfirmBulk(false);
  }

  return (
    <div className="pb-24">
      <div className="flex justify-end mb-3">
        <button onClick={onRefresh} className="flex items-center gap-1.5 text-sm text-[#12534A] hover:underline">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Muat ulang data
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <ArchCard className="p-4 text-center">
          <p className="text-2xl font-bold text-[#1B3A36]">{totalLapor}</p>
          <p className="text-xs text-[#6B7D77]">Total Laporan</p>
        </ArchCard>
        <ArchCard className="p-4 text-center">
          <p className="text-2xl font-bold text-[#12534A]">{tingkatHadir}%</p>
          <p className="text-xs text-[#6B7D77]">Tingkat Hadir</p>
        </ArchCard>
        <ArchCard className="p-4 text-center">
          <p className="text-2xl font-bold text-[#B8902E]">{anggotaAktif}</p>
          <p className="text-xs text-[#6B7D77]">Anggota Lapor</p>
        </ArchCard>
      </div>

      <div className="bg-white border border-[#DCD3B8] rounded-2xl p-4 mb-5">
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-xs text-[#6B7D77]">Dari</label>
            <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="block rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-[#6B7D77]">Sampai</label>
            <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="block rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-[#6B7D77]">Kelompok</label>
            <select value={kelFilter} onChange={(e) => setKelFilter(e.target.value)} className="block rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm">
              <option value="semua">Semua</option>
              {kelompokOpsi.map((nm) => <option key={nm} value={nm}>{nm}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6B7D77]">Kehadiran</label>
            <select value={hadirFilter} onChange={(e) => setHadirFilter(e.target.value)} className="block rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm">
              <option value="semua">Semua</option>
              <option value="true">Hadir</option>
              <option value="false">Tidak Hadir</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-[#6B7D77]">Cari nama</label>
            <div className="flex items-center rounded-lg border border-[#DCD3B8] px-2">
              <Search size={14} className="text-[#6B7D77]" />
              <input value={cari} onChange={(e) => setCari(e.target.value)} className="w-full px-1.5 py-1.5 text-sm outline-none" placeholder="Nama..." />
            </div>
          </div>
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg bg-[#1B3A36] text-white text-sm px-3 py-2 hover:bg-[#12534A]">
            <Download size={14} /> Ekspor CSV
          </button>
          {adminUnlocked && filtered.length > 0 && (
            <button onClick={() => setConfirmBulk(true)} className="flex items-center gap-1.5 rounded-lg bg-[#A8434B] text-white text-sm px-3 py-2 hover:bg-[#8E3A41]">
              <Trash2 size={14} /> Hapus {filtered.length} data ini
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-[#DCD3B8] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#1B3A36] mb-2">Tren kehadiran per pekan (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEAD9" />
              <XAxis dataKey="pekan" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#12534A" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#DCD3B8] rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#1B3A36] mb-2">Kehadiran per kelompok</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perKelompok}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEAD9" />
              <XAxis dataKey="kelompok" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="hadir" stackId="a" fill="#12534A" name="Hadir" />
              <Bar dataKey="tidak" stackId="a" fill="#A8434B" name="Tidak Hadir" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-[#DCD3B8] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F3F1E7] text-[#1B3A36]">
              <tr>
                {["Nama","Kelompok","Hari/Tanggal","Aktivitas","Hadir","Metode","Setoran","Ket.", adminUnlocked ? "" : null].filter((h) => h !== null).map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((e) => (
                <tr key={e.id} className="border-t border-[#EFEAD9]">
                  <td className="px-3 py-2 whitespace-nowrap">{e.nama}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.kelompokNama + " (" + e.kelompokBesar + ")"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.hari + ", " + fmtDate(e.tanggal)}</td>
                  <td className="px-3 py-2">{(e.aktivitas || []).join(", ") || "-"}</td>
                  <td className="px-3 py-2">
                    <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (e.hadir ? "bg-[#12534A]/10 text-[#12534A]" : "bg-[#A8434B]/10 text-[#A8434B]")}>
                      {e.hadir ? "Hadir" : "Tidak"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.metode === "tatap_muka" ? "Tatap Muka" : e.metode === "video_call" ? "Video Call" : "-"}</td>
                  <td className="px-3 py-2 min-w-[180px]">
                    {e.setoran.map((s, i) => <div key={i} className="text-xs">{s.surat + " " + s.ayatDari + "-" + s.ayatSampai}</div>)}
                  </td>
                  <td className="px-3 py-2 text-xs text-[#6B7D77]">{e.keterangan || "-"}</td>
                  {adminUnlocked && (
                    <td className="px-3 py-2">
                      <button onClick={() => setConfirmDeleteId(e.id)} className="text-[#A8434B] hover:bg-[#A8434B]/10 rounded-lg p-1.5">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-8 text-center text-[#6B7D77]">Belum ada laporan sesuai filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && <p className="text-xs text-[#6B7D77] p-2">Menampilkan 200 dari {filtered.length} baris. Persempit filter atau ekspor CSV untuk data lengkap.</p>}
      </div>

      {confirmDeleteId && (
        <ConfirmModal title="Hapus laporan ini?" desc="Data yang dihapus tidak bisa dikembalikan."
          onConfirm={() => doDeleteOne(confirmDeleteId)} onCancel={() => setConfirmDeleteId(null)} />
      )}
      {confirmBulk && (
        <ConfirmModal title={"Hapus " + filtered.length + " data terfilter?"}
          desc="Ini akan menghapus semua data yang sedang tampil sesuai filter di atas, permanen dan tidak bisa dikembalikan."
          confirmText="HAPUS" requireTyped="HAPUS"
          onConfirm={doDeleteBulk} onCancel={() => setConfirmBulk(false)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Gerbang PIN Admin                                                        */
/* ---------------------------------------------------------------------- */

function AdminGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [salah, setSalah] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      try { sessionStorage.setItem("tahfidz-admin-unlocked", "1"); } catch {}
      onUnlock();
    } else {
      setSalah(true);
      setPin("");
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-10 pb-24">
      <ArchCard className="p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#1B3A36] flex items-center justify-center mb-3">
          <Settings size={22} className="text-white" />
        </div>
        <h3 className="text-lg text-[#1B3A36] mb-1" style={{ fontFamily: "'Amiri', serif" }}>
          Halaman Pengaturan
        </h3>
        <p className="text-sm text-[#6B7D77] mb-5">Masukkan PIN admin untuk melanjutkan</p>
        <form onSubmit={submit}>
          <input
            type="password" inputMode="numeric" autoFocus value={pin}
            onChange={(e) => { setPin(e.target.value); setSalah(false); }}
            placeholder="PIN" className={inputCls + " text-center tracking-widest text-lg"}
          />
          {salah && <p className="text-sm text-[#A8434B] mt-2">PIN salah, coba lagi.</p>}
          <button type="submit" className="w-full rounded-full bg-[#12534A] text-white py-2.5 font-semibold mt-4 hover:bg-[#0D3F38] transition-colors">
            Buka
          </button>
        </form>
      </ArchCard>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Tab: Pengaturan                                                          */
/* ---------------------------------------------------------------------- */

function PengaturanTab({ config, setConfig, groups, setGroups }) {
  const [kelAktif, setKelAktif] = useState(groups[0]?.id || null);
  const [namaBaru, setNamaBaru] = useState("");
  const [groupBaruNama, setGroupBaruNama] = useState("");
  const [groupBaruBesar, setGroupBaruBesar] = useState("A");
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null);

  useEffect(() => { if (!kelAktif && groups.length) setKelAktif(groups[0].id); }, [groups]);

  async function updateConfig(patch) {
    const next = { ...config, ...patch };
    setConfig(next); await updateConfigRow(next);
  }

  async function tambahGroup() {
    if (!groupBaruNama.trim()) return;
    const urutan = groups.length ? Math.max(...groups.map((g) => g.urutan || 0)) + 1 : 1;
    const g = await insertGroupRow(groupBaruNama.trim(), groupBaruBesar, urutan);
    if (g) { setGroups([...groups, g]); setGroupBaruNama(""); setKelAktif(g.id); }
  }
  async function renameGroup(id, nama) {
    setGroups(groups.map((g) => (g.id === id ? { ...g, nama } : g)));
    await updateGroupRow(id, { nama });
  }
  async function ubahBesarGroup(id, besar) {
    setGroups(groups.map((g) => (g.id === id ? { ...g, besar } : g)));
    await updateGroupRow(id, { besar });
  }
  async function hapusGroup(id) {
    await deleteGroupRow(id);
    const sisa = groups.filter((g) => g.id !== id);
    setGroups(sisa);
    if (kelAktif === id) setKelAktif(sisa[0]?.id || null);
    setConfirmDeleteGroup(null);
  }

  async function addName() {
    if (!namaBaru.trim() || !kelAktif) return;
    const g = groups.find((x) => x.id === kelAktif);
    const list = [...(g.names || []), namaBaru.trim()];
    setGroups(groups.map((x) => (x.id === kelAktif ? { ...x, names: list } : x)));
    await updateGroupRow(kelAktif, { names: list });
    setNamaBaru("");
  }
  async function removeName(nm) {
    const g = groups.find((x) => x.id === kelAktif);
    const list = (g.names || []).filter((n) => n !== nm);
    setGroups(groups.map((x) => (x.id === kelAktif ? { ...x, names: list } : x)));
    await updateGroupRow(kelAktif, { names: list });
  }

  const preview = [0, 1, 2, 3].map((offset) => {
    const d = toDate(config.refDate); d.setDate(d.getDate() + offset * 7);
    const dateStr = d.toISOString().slice(0, 10);
    return { dateStr, modeA: getActivityMode("A", dateStr, config), modeB: getActivityMode("B", dateStr, config) };
  });

  const kelAktifObj = groups.find((g) => g.id === kelAktif) || null;

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <ArchCard className="p-6 mb-6">
        <h3 className="text-lg text-[#1B3A36] mb-4" style={{ fontFamily: "'Amiri', serif" }}>Jadwal Rotasi Mingguan</h3>
        <Field label="Tanggal referensi (Senin awal siklus)">
          <input type="date" value={config.refDate} onChange={(e) => updateConfig({ refDate: e.target.value })} className={inputCls} />
        </Field>
        <label className="flex items-center gap-2 mb-4 text-sm text-[#1B3A36]">
          <input type="checkbox" checked={config.invert} onChange={(e) => updateConfig({ invert: e.target.checked })} />
          Tukar urutan (mulai dengan Grup B = mandiri)
        </label>
        <StarDivider />
        <p className="text-sm font-medium text-[#1B3A36] mb-2">Pratinjau 4 pekan ke depan</p>
        <div className="space-y-2">
          {preview.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm bg-[#F3F1E7]/60 rounded-lg px-3 py-2">
              <span className="text-[#6B7D77]">{fmtDate(p.dateStr)}</span>
              <span>Grup A: <b className="text-[#12534A]">{p.modeA === "mandiri" ? "Mandiri" : "Jama'i"}</b></span>
              <span>Grup B: <b className="text-[#B8902E]">{p.modeB === "mandiri" ? "Mandiri" : "Jama'i"}</b></span>
            </div>
          ))}
        </div>
      </ArchCard>

      <ArchCard className="p-6 mb-6">
        <h3 className="text-lg text-[#1B3A36] mb-4" style={{ fontFamily: "'Amiri', serif" }}>Kelola Kelompok</h3>
        <div className="space-y-2 mb-4">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center gap-2 bg-[#F3F1E7]/60 rounded-xl p-2">
              <input value={g.nama} onChange={(e) => renameGroup(g.id, e.target.value)}
                className="flex-1 rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm bg-white" />
              <select value={g.besar} onChange={(e) => ubahBesarGroup(g.id, e.target.value)}
                className="rounded-lg border border-[#DCD3B8] px-2 py-1.5 text-sm bg-white">
                <option value="A">Grup A</option>
                <option value="B">Grup B</option>
              </select>
              <button onClick={() => setConfirmDeleteGroup(g.id)} className="text-[#A8434B] hover:bg-[#A8434B]/10 rounded-lg p-1.5">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {groups.length === 0 && <p className="text-sm text-[#6B7D77]">Belum ada kelompok. Tambahkan dulu di bawah ini.</p>}
        </div>
        <div className="flex gap-2">
          <input value={groupBaruNama} onChange={(e) => setGroupBaruNama(e.target.value)} placeholder="Nama kelompok baru"
            className={inputCls} onKeyDown={(e) => e.key === "Enter" && tambahGroup()} />
          <select value={groupBaruBesar} onChange={(e) => setGroupBaruBesar(e.target.value)}
            className="rounded-xl border border-[#DCD3B8] px-3 bg-[#FBFAF6]">
            <option value="A">Grup A</option>
            <option value="B">Grup B</option>
          </select>
          <button onClick={tambahGroup} className="rounded-xl bg-[#1B3A36] text-white px-4 hover:bg-[#12534A]"><Plus size={18} /></button>
        </div>
      </ArchCard>

      <ArchCard className="p-6">
        <h3 className="text-lg text-[#1B3A36] mb-4" style={{ fontFamily: "'Amiri', serif" }}>Daftar Anggota per Kelompok</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {groups.map((g) => (
            <button key={g.id} onClick={() => setKelAktif(g.id)}
              className={"px-3 py-1.5 rounded-full text-sm border " + (kelAktif === g.id ? "bg-[#12534A] text-white border-[#12534A]" : "border-[#DCD3B8] text-[#1B3A36]")}>
              {g.nama}
            </button>
          ))}
        </div>
        {kelAktifObj && (
          <>
            <div className="flex gap-2 mb-3">
              <input value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} placeholder="Nama anggota baru"
                className={inputCls} onKeyDown={(e) => e.key === "Enter" && addName()} />
              <button onClick={addName} className="rounded-xl bg-[#1B3A36] text-white px-4 hover:bg-[#12534A]"><Plus size={18} /></button>
            </div>
            <ul className="divide-y divide-[#EFEAD9]">
              {(kelAktifObj.names || []).map((n) => (
                <li key={n} className="flex items-center justify-between py-2 text-sm text-[#1B3A36]">
                  {n}
                  <button onClick={() => removeName(n)} className="text-[#A8434B] hover:bg-[#A8434B]/10 rounded-lg p-1"><Trash2 size={14} /></button>
                </li>
              ))}
              {(kelAktifObj.names || []).length === 0 && <li className="py-3 text-sm text-[#6B7D77]">Belum ada anggota di kelompok ini.</li>}
            </ul>
          </>
        )}
      </ArchCard>

      {confirmDeleteGroup && (
        <ConfirmModal title="Hapus kelompok ini?"
          desc="Anggota di dalamnya akan ikut terhapus dari daftar. Data laporan lama tetap tersimpan dengan nama kelompok saat itu."
          onConfirm={() => hapusGroup(confirmDeleteGroup)} onCancel={() => setConfirmDeleteGroup(null)} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App utama                                                               */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [tab, setTab] = useState("lapor");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [groups, setGroups] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem("tahfidz-admin-unlocked") === "1") setAdminUnlocked(true); } catch {}
  }, []);

  async function loadAll() {
    try {
      const [c, g, e] = await Promise.all([fetchConfig(), fetchGroups(), fetchEntries()]);
      setConfig(c); setGroups(g); setEntries(e); setLoadError(false);
    } catch (err) {
      console.error(err); setLoadError(true);
    }
  }

  useEffect(() => { (async () => { await loadAll(); setLoading(false); })(); }, []);

  async function handleRefresh() {
    setRefreshing(true);
    const e = await fetchEntries();
    setEntries(e);
    setRefreshing(false);
  }

  const tabs = [
    { id: "lapor", label: "Lapor", icon: BookOpen },
    { id: "dashboard", label: "Laporan", icon: BarChart3 },
    { id: "pengaturan", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#EFF3F0]">
      <header className="bg-[#1B3A36] text-white">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 text-center">
          <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
            <AppLogo size={40} />
          </div>
          <h1 className="text-2xl" style={{ fontFamily: "'Amiri', serif" }}>Setoran Tahfidz</h1>
          <p className="text-xs text-[#BFD6CF] mt-1">Murajaah & Ziyadah</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 -mt-4">
        {loadError && (
          <div className="bg-[#A8434B]/10 border border-[#A8434B]/30 text-[#A8434B] text-sm rounded-xl p-3 mb-4">
            Gagal terhubung ke database. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diatur dengan benar di Environment Variables.
          </div>
        )}
        {loading ? (
          <p className="text-center text-[#6B7D77] py-16">Memuat data...</p>
        ) : tab === "lapor" ? (
          <LaporTab config={config} groups={groups} entries={entries} onSubmitted={setEntries} />
        ) : tab === "dashboard" ? (
          <DashboardTab entries={entries} groups={groups} config={config} onRefresh={handleRefresh}
            refreshing={refreshing} onEntriesChanged={setEntries} adminUnlocked={adminUnlocked} />
        ) : tab === "pengaturan" ? (
          adminUnlocked ? (
            <PengaturanTab config={config} setConfig={setConfig} groups={groups} setGroups={setGroups} />
          ) : (
            <AdminGate onUnlock={() => setAdminUnlocked(true)} />
          )
        ) : null}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-[#DCD3B8] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="max-w-3xl mx-auto grid grid-cols-3">
          {tabs.map((t) => {
            const Icon = t.icon; const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={"flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors " + (active ? "text-[#12534A]" : "text-[#9CAFA9]")}>
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
