export const SUBJECT_TOPICS: Record<string, readonly string[]> = {
  Matematik: [
    "Tam sayılar",
    "Rasyonel sayılar",
    "Cebirsel ifadeler",
    "Denklemler",
    "Oran-orantı",
    "Yüzdeler",
    "Doğrular-açılar",
    "Veri analizi",
  ],
  "Fen Bilimleri": [
    "Uzay",
    "Hücre-bölünmeler",
    "Kuvvet-enerji",
    "Saf madde-karışımlar",
    "Işık",
    "Canlılarda üreme",
    "Elektrik",
  ],
  Türkçe: [
    "Sözcük-cümle-paragraf anlamı",
    "Fiiller",
    "Ek fiil",
    "Zarflar",
    "Yazım-noktalama",
    "Metin türleri",
  ],
  "Sosyal Bilgiler": [
    "Tarih ve kültür",
    "Yerleşme-seyahat",
    "Ekonomi-sosyal hayat",
    "Demokrasi",
    "Uluslararası ilişkiler",
  ],
  "Din Kültürü": [
    "Melek ve ahiret inancı",
    "Hac ve kurban",
    "Ahlaki davranışlar",
    "Hz. Muhammed'in örnekliği",
    "İslam düşüncesi",
  ],
  İngilizce: [
    "Appearance and personality",
    "Sports",
    "Biographies",
    "Wild animals",
    "Television",
    "Celebrations",
    "Dreams",
    "Public buildings",
    "Environment",
    "Planets",
  ],
} as const;

export const LGS_SUBJECTS = Object.keys(SUBJECT_TOPICS);

export function getTopicsForSubject(subject: string): readonly string[] {
  return SUBJECT_TOPICS[subject] ?? [];
}
