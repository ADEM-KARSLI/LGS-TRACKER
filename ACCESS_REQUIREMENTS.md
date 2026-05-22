# Erişim Gereksinimleri

Bu dosya gerçek şifre veya token saklamak için değildir. Secret değerleri GitHub'a
commitlenmemeli; sadece lokal terminal environment variable olarak veya Vercel /
Supabase panelinde saklanmalıdır.

## Supabase

Supabase veritabanını resetlemek, migration çalıştırmak ve parent tarafından
student hesabı oluşturmak için aşağıdaki bilgiler gerekir.

### 1. Project Ref

Mevcut proje ref:

```env
SUPABASE_PROJECT_REF=vzfjjltrvnlqcdyyvyub
```

Bu değer Supabase proje URL'inden de anlaşılır:

```text
https://vzfjjltrvnlqcdyyvyub.supabase.co
```

### 2. Database Password

Gerekli kullanım:

```powershell
$env:SUPABASE_DB_PASSWORD="PasswordKey:Supabase"
npm run db:reset
```

Nereden alınır:

Supabase Dashboard -> Project Settings -> Database -> Database password

Bu şifre sadece migration/reset scriptleri için gerekir. Vercel'e koymak zorunda
değiliz.

### 3. Service Role Key

Gerekli env adı:

```env
SUPABASE_SERVICE_ROLE_KEY=BURAYA_SERVICE_ROLE_KEY
```

Nereden alınır:

Supabase Dashboard -> Project Settings -> API -> service_role key

Nerede kullanılmalı:

- Lokal `.env.local` içinde, sadece geliştirme için
- Vercel Project Settings -> Environment Variables içinde, production için

Bu key server-only olmalı. `NEXT_PUBLIC_` prefix'i verilmemeli.

### 4. Public Supabase Env Değerleri

Bunlar projede zaten kullanılıyor:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vzfjjltrvnlqcdyyvyub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://CANLI_SITE_URL
```

Vercel production ortamında `NEXT_PUBLIC_SITE_URL` canlı domain olmalı.

## GitHub

GitHub push erişimi şu an bu makinede çalışıyor. Son başarılı push:

```text
origin -> https://github.com/ADEM-KARSLI/LGS-TRACKER.git
branch -> master
```

Eğer ileride push yetkisi düşerse gereken bilgiler:

### 1. GitHub Personal Access Token

Gerekli yetkiler:

- Repository content read/write
- Commit/push izni

Fine-grained token kullanılacaksa repository:

```text
ADEM-KARSLI/LGS-TRACKER
```

Token repo içine yazılmamalı. Git Credential Manager veya `gh auth login` ile
saklanmalı.

### 2. GitHub CLI Opsiyonel

Eğer `gh` kurulu olursa giriş için:

```powershell
gh auth login
```

Bu zorunlu değil; mevcut git remote push şimdilik yeterli.

## Vercel

Vercel deploy GitHub push sonrası otomatik tetikleniyor olmalı. Ancak production
env değişkeni eklemek veya deploy loglarını görmek için Vercel erişimi gerekir.

Gerekli bilgilerden biri yeterli olabilir:

### Seçenek A: Vercel Dashboard Erişimi

Vercel panelinden şu env eklenmeli:

```env
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://CANLI_SITE_URL
```

### Seçenek B: Vercel CLI Token

Gerekli env:

```env
VERCEL_TOKEN=BURAYA_VERCEL_TOKEN
```

Ek olarak project link gerekebilir:

```text
Vercel org/team id
Vercel project id
```

Vercel token da repo'ya yazılmamalı.

## Önerilen Sıradaki İşlem

1. Supabase `SUPABASE_DB_PASSWORD` ile:

```powershell
$env:SUPABASE_DB_PASSWORD="..."
npm run db:reset
```

2. Vercel'e `SUPABASE_SERVICE_ROLE_KEY` ekle.
3. Vercel'e `NEXT_PUBLIC_SITE_URL` canlı domain olarak ekle.
4. Yeni deploy sonrası parent hesabı oluştur, parent panelinden demo student oluştur.
