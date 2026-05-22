export const SUBJECT_TOPICS: Record<string, readonly string[]> = {
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
    "Cümlenin Öğeleri",
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
    "Hz. Muhammed’in Örnekliği",
    "Kur’an-ı Kerim ve Özellikleri",
  ],
} as const;

export const LGS_SUBJECTS = Object.keys(SUBJECT_TOPICS);

export const SUBJECT_LABELS: Record<string, string> = {
  Matematik: "Matematik",
  Turkce: "Türkçe",
  Fen_Bilimleri: "Fen Bilimleri",
  Inkilap_Tarihi: "İnkılap Tarihi",
  Ingilizce: "İngilizce",
  Din_Kulturu: "Din Kültürü",
};

export function getTopicsForSubject(subject: string): readonly string[] {
  return SUBJECT_TOPICS[subject] ?? [];
}
