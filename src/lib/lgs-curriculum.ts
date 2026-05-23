export const DEFAULT_GRADE = "8";

export const GRADE_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const grade = String(index + 1);
  return {
    value: grade,
    label: `${grade}. Sınıf`,
  };
});

export const SUBJECT_LABELS: Record<string, string> = {
  Turkce: "Türkçe",
  Matematik: "Matematik",
  Fen_Bilimleri: "Fen Bilimleri",
  Sosyal_Bilgiler: "Sosyal Bilgiler",
  Inkilap_Tarihi: "İnkılap Tarihi",
  Ingilizce: "İngilizce",
  Din_Kulturu: "Din Kültürü",
};

const COMMON_SUBJECTS = [
  "Turkce",
  "Matematik",
  "Fen_Bilimleri",
  "Sosyal_Bilgiler",
  "Inkilap_Tarihi",
  "Ingilizce",
  "Din_Kulturu",
] as const;

const CURRICULUM_BY_GRADE: Record<string, Partial<Record<string, readonly string[]>>> = {
  "7": {
    Turkce: [
      "Sözcükte Anlam",
      "Cümlede Anlam",
      "Deyimler ve Atasözleri",
      "Söz Sanatları ve Metin Türleri",
      "Paragrafta Anlam",
      "Fiiller (Anlam, Kip, Kişi)",
      "Ek Fiil ve Zarflar",
      "Yazım Kuralları",
      "Noktalama İşaretleri",
      "Anlatım Bozuklukları",
      "Sözel Mantık ve Görsel Yorumlama",
    ],
    Matematik: [
      "Tam Sayılar",
      "Rasyonel Sayılar",
      "Cebirsel İfadeler",
      "Eşitlik ve Denklem",
      "Oran ve Orantı",
      "Yüzdeler",
      "Doğrular ve Açılar",
      "Çokgenler",
      "Çember ve Daire",
      "Veri Analizi",
      "Cisimlerin Farklı Yönlerden Görünümleri",
    ],
    Fen_Bilimleri: [
      "Güneş Sistemi ve Ötesi (Uzay Araştırmaları)",
      "Hücre ve Bölünmeler (Mitoz - Mayoz)",
      "Kuvvet ve Enerji (Kinetik - Potansiyel)",
      "Saf Madde ve Karışımlar",
      "Işığın Soğurulması, Aynalar ve Mercekler",
      "Canlılarda Üreme, Büyüme ve Gelişme",
      "Elektrik Devreleri (Ampullerin Bağlanması)",
    ],
    Sosyal_Bilgiler: [
      "Birey ve Toplum (İletişim İlişkileri)",
      "Kültür ve Miras (Osmanlı Tarihi)",
      "İnsanlar, Yerler ve Çevreler (Türkiye Nüfusu ve Göç)",
      "Bilim, Teknoloji ve Toplum",
      "Üretim, Dağıtım ve Tüketim (Ekonomi ve Meslekler)",
      "Etkin Vatandaşlık (Demokrasi Yönetimi)",
      "Küresel Bağlantılar",
    ],
    Ingilizce: [
      "Unit 1: Appearance and Personality",
      "Unit 2: Sports",
      "Unit 3: Biographies",
      "Unit 4: Wild Animals",
      "Unit 5: Television",
      "Unit 6: Celebrations",
      "Unit 7: Dreams",
      "Unit 8: Public Buildings",
      "Unit 9: Environment",
      "Unit 10: Planets",
    ],
    Din_Kulturu: [
      "Melekler ve Ahiret İnancı",
      "Hac ve Kurban İbadeti",
      "Ahlaki Davranışlar",
      "Allah'ın Kulu ve Elçisi: Hz. Muhammed",
      "İslam Düşüncesinde Tasavvufi Yorumlar",
    ],
  },
  "8": {
    Matematik: [
      "Çarpanlar ve Katlar",
      "Üslü İfadeler",
      "Kareköklü İfadeler",
      "Veri Analizi",
      "Basit Olayların Olma Olasılığı",
      "Cebirsel İfadeler ve Özdeşlikler",
      "Doğrusal Denklemler",
      "Eşitsizlikler",
      "Üçgenler",
      "Eşlik ve Benzerlik",
      "Dönüşüm Geometrisi",
      "Geometrik Cisimler",
    ],
    Turkce: [
      "Sözcükte Anlam",
      "Cümlede Anlam",
      "Paragrafta Anlam",
      "Fiilimsiler (Eylemsiler)",
      "Cümlenin Ögeleri",
      "Fiilde Çatı",
      "Cümle Türleri",
      "Yazım Kuralları",
      "Noktalama İşaretleri",
      "Anlatım Bozuklukları",
      "Söz Sanatları",
      "Metin Türleri",
      "Görsel Okuma ve Sözel Muhakeme",
    ],
    Fen_Bilimleri: [
      "Mevsimler ve İklim",
      "DNA ve Genetik Kod",
      "Basınç",
      "Madde ve Endüstri",
      "Basit Makineler",
      "Enerji Dönüşümleri ve Çevre Bilimi",
      "Elektrik Yükleri ve Elektrik Enerjisi",
    ],
    Inkilap_Tarihi: [
      "Bir Kahraman Doğuyor",
      "Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar",
      "Milli Bir Destan: Ya İstiklal Ya Ölüm!",
      "Atatürkçülük ve Çağdaşlaşan Türkiye",
      "Demokratikleşme Çabaları",
      "Atatürk Dönemi Türk Dış Politikası",
      "Atatürk'ün Ölümü ve Sonrası",
    ],
    Ingilizce: [
      "Friendship",
      "Teen Life",
      "In the Kitchen",
      "On the Phone",
      "The Internet",
      "Adventures",
      "Tourism",
      "Chores",
      "Science",
      "Natural Forces",
    ],
    Din_Kulturu: [
      "Kader İnancı",
      "Zekat ve Sadaka",
      "Din ve Hayat",
      "Hz. Muhammed'in Örnekliği",
      "Kur'an-ı Kerim ve Özellikleri",
    ],
  },
};

export function normalizeGradeValue(value: string | null | undefined): string {
  const raw = String(value ?? "").trim();
  const match = raw.match(/\d+/);
  const parsed = Number(match?.[0] ?? "");
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 12) {
    return String(parsed);
  }
  return DEFAULT_GRADE;
}

export function formatGradeLabel(value: string | null | undefined): string {
  return `${normalizeGradeValue(value)}. Sınıf`;
}

export function getSubjectsForGrade(grade: string): readonly string[] {
  const normalizedGrade = normalizeGradeValue(grade);
  const curriculum = CURRICULUM_BY_GRADE[normalizedGrade];
  if (!curriculum) {
    return COMMON_SUBJECTS;
  }

  return COMMON_SUBJECTS.filter((subject) => curriculum[subject]?.length);
}

export function getTopicsForSubject(
  grade: string,
  subject: string
): readonly string[] {
  const normalizedGrade = normalizeGradeValue(grade);
  return CURRICULUM_BY_GRADE[normalizedGrade]?.[subject] ?? [];
}
