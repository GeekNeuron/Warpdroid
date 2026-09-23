# Warpdroid

**Warpdroid** یک ابزار خط‌فرمان (CLI) بدون دردسر برای ساخت، نصب و اجرای پروژه‌های اندرویدی روی امولیتور یا دستگاه محلی است — یک دستور به‌جای ده‌ها کلیک تو Android Studio.

کافیه به هر پروژه‌ی اندرویدی اوپن‌سورسی که Gradle wrapper داره اشاره کنید؛ Warpdroid این کارها رو انجام می‌ده:

1. ساخت APK دیباگ (`gradlew assembleDebug`)
2. روشن کردن یه AVD در صورت نیاز (اختیاری، با `--avd`)
3. نصب APK روی دستگاه
4. تشخیص خودکار package name و launcher activity
5. اجرای اپ
6. استریم زنده‌ی لاگ‌کت (logcat)، فقط برای همون اپ

بدون جست‌وجوی دستی APK، بدون کندوکاو تو `AndroidManifest.xml`، بدون کلنجار رفتن با فلگ‌های `adb`.

## پیش‌نیازها

- [Node.js](https://nodejs.org) نسخه‌ی ۱۶ به بالا
- Android SDK با `adb` و `emulator` در `PATH` (هر چیزی که Android Studio نصب کنه کار می‌کنه)
- Android SDK build-tools (`aapt`/`aapt2`) برای تشخیص خودکار package/activity — در صورت نبود، به‌صورت fallback از `AndroidManifest.xml` می‌خونه
- پروژه‌ای با Gradle wrapper (`gradlew` / `gradlew.bat`) — تقریباً همه‌ی پروژه‌های اوپن‌سورس اندرویدی این رو دارن

خود Warpdroid کراس‌پلتفرمه (ویندوز، مک، لینوکس) و فقط ابزارهای استاندارد Android SDK رو صدا می‌زنه.

## نصب

```bash
git clone https://github.com/<your-username>/warpdroid.git
cd warpdroid
npm install
npm link
```

با `npm link` دستور `warpdroid` به `PATH` سیستم اضافه می‌شه. یا می‌تونید مستقیم با `node bin/warpdroid.js` اجراش کنید.

## استفاده

```bash
# ساخت + نصب + اجرا + استریم لاگ، با هر دستگاه/امولیتوری که در حال حاضر روشنه
warpdroid run path/to/android-project

# همون بالا، ولی اگه چیزی وصل نیست یه AVD مشخص رو اول روشن کن
warpdroid run path/to/android-project --avd Pixel_6_API_34

# فقط ساخت APK دیباگ
warpdroid build path/to/android-project

# لیست دستگاه‌های وصل‌شده و AVDهای موجود
warpdroid devices

# دنبال کردن لاگ یه اپ که از قبل در حال اجراست
warpdroid logs com.example.myapp

# بررسی اینکه Java/adb/emulator/aapt/gradlew درست تنظیم شدن
warpdroid doctor path/to/android-project

# پاک کردن خروجی‌های build
warpdroid clean path/to/android-project

# باز کردن یه URL یا دیپ‌لینک روی دستگاه وصل‌شده
warpdroid open "https://example.com/product/42"
```

### گزینه‌های دستور `run`

| فلگ | توضیح |
| --- | --- |
| `-a, --avd <name>` | اگه دستگاه/امولیتوری روشن نیست، این AVD رو روشن کن |
| `-q, --quiet` | خروجی خام Gradle رو نمایش نده |
| `--no-logs` | بعد از اجرا لاگ‌کت رو استریم نکن |

## فایل اجرایی و نصب‌کننده‌ی ویندوز

Warpdroid رو می‌شه به یه `warpdroid.exe` مستقل تبدیل کرد که بدون نیاز به نصب Node.js اجرا می‌شه:

```bash
npm install
npm run build:exe
```

خروجی این دستور `dist/warpdroid.exe` هست. از اونجا به بعد:

- **نصب سریع محلی (بدون ابزار اضافه):** اسکریپت `installer/install.ps1` رو در PowerShell اجرا کنید — فایل exe رو تو `%LOCALAPPDATA%\Warpdroid` کپی می‌کنه و به `PATH` کاربری اضافه می‌کنه. برای حذف هم `installer/uninstall.ps1` رو اجرا کنید.
- **نصب‌کننده‌ی واقعی ویندوز (`warpdroid-setup.exe`):** ابتدا [Inno Setup](https://jrsoftware.org/isdl.php) رو نصب کنید، بعد `npm run build:installer` (یا مستقیماً `installer/build-installer.ps1`) رو اجرا کنید. خروجی تو `installer/output/warpdroid-setup.exe` قرار می‌گیره و شامل آیتم Start Menu، ثبت در PATH، و یه uninstaller هست.

## نحوه‌ی کارکرد

Warpdroid هیچ بخشی از toolchain اندروید رو از نو پیاده‌سازی نمی‌کنه — فقط همون ابزارهایی که خود Android Studio زیر پوسته استفاده می‌کنه (`gradlew`، `emulator`، `adb`، `aapt`) رو هماهنگ می‌کنه؛ پس هر چیزی که تو Android Studio ساخته و اجرا می‌شه، اینجا هم باید کار کنه.

## الهام‌گرفته از

Warpdroid اولین ابزار CLI دور Android toolchain نیست — پروژه‌هایی مثل [`acli`](https://github.com/ErikHellman/cli-for-android)، [`ktd`](https://github.com/AcharyaML/ktroid)، [`dab`](https://github.com/cesarferreira/dab) و [`android-cli`](https://github.com/syedahkam/android-cli) حوزه‌ی مشابهی رو پوشش می‌دن و برای شکل دستورات و ایده‌ی فیچرها (بررسی سلامت محیط، امضای نسخه‌ی release، اجرای دیپ‌لینک) مرجع خوبی بودن.

## نقشه‌ی راه

- [ ] Hot-reload / نصب افزایشی بعد از تغییر فایل‌ها
- [ ] فایل کانفیگ برای تنظیمات پیش‌فرض هر پروژه (`.warpdroidrc`)
- [ ] پشتیبانی از build نسخه‌ی release و امضا، فراتر از `assembleDebug`
- [ ] نصب/اجرای موازی روی چند دستگاه
- [ ] خروجی `--json` برای CI و اسکریپت‌نویسی

## مشارکت

Issue و PR خوش‌آمدن. این یه اسکلت اولیه‌ست — مسیر اصلی build → install → launch → logs کار می‌کنه، ولی جای زیادی برای محکم‌کاری edge caseها هست (flavorها، پروژه‌های چندماژولی، رفتار دستگاه‌های فیزیکی و غیره).

## لایسنس

MIT — به فایل [LICENSE](LICENSE) نگاه کنید.
