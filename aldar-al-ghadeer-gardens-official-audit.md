# سجل تدقيق Al Ghadeer الرسمي

**تاريخ التقاط المصدر والاستيراد:** 3 سبتمبر 2026  
**نوع المصدر:** لقطة يدوية ثابتة من منصة World of Aldar الرسمية، وليست API حيًا أو تغذية يومية.  
**قاعدة النزاهة:** لا يُسجل سعر، توافر تشغيلي، خطة سداد، مالك، أو إحداثيات ما لم ينشره المصدر الرسمي نفسه بوضوح.

## نطاق المصادر المراجعة

| المشروع في النظام | المجموعة/المرحلة في World of Aldar | المسار الرسمي | الوحدات | أنواع الوحدات المنشورة |
|---|---|---|---:|---|
| Al Ghadeer Gardens | R2 | `https://world.aldar.com/uae/abudhabi/alghadeergardens/r2` | 437 | 165 Standard Villas و272 Plex Houses |
| Al Ghadeer Gardens | N2 | `https://world.aldar.com/uae/abudhabi/alghadeergardens/n2` | 353 | 150 Standard Villas و203 Plex Houses |
| Al Ghadeer Parks 1 | NC | `https://world.aldar.com/uae/abudhabi/alghadeerparks1/nc` | 280 | 45 Standard Villas و235 Plex Houses |
| Al Ghadeer Parks 2 | ND | `https://world.aldar.com/uae/abudhabi/alghadeerparks2/nd` | 173 | 26 Standard Villas و147 Plex Houses |
| **الإجمالي** | — | — | **1,243** | — |

يظهر مشروع **Al Ghadeer Gardens** في النظام كمشروع واحد مع مجموعتي مبانٍ/مراحل مستقلتين: `R2` و`N2`، بمجموع **790** وحدة. وتظهر **Al Ghadeer Parks 1** و**Al Ghadeer Parks 2** كمشروعين مستقلين بمفاتيح منفصلة، كي لا تختلط رموز `NC` و`ND` مع رموز Gardens أو مع بعضها.

## هوية الوحدة والرابط التفاعلي

تُحفظ هوية كل وحدة من حقل World of Aldar المنشور `unitNumber` بكاملها. لا يعتمد النظام على `displayName` أو على رقم منزل مختصر يمكن أن يتكرر. يُستخلص فقط الجزء الذي يلي البادئة الخاصة بالمشروع لتكوين الرابط التفاعلي الدقيق، مع الإبقاء على نوع الوحدة والرقم واللاحقة كما نُشرت.

| المجموعة | مثال `unitNumber` المصدر | رابط وحدة تم فتحه مباشرةً | نتيجة التحقق |
|---|---|---|---|
| Gardens R2 | `AlGhadeerGardens-R2-V-001-01` | `R2-V-001-01` | صفحة Villa رسمية فتحت؛ 4 Bedroom + Maid RM Villa، 204 م². |
| Gardens R2 | `AlGhadeerGardens-R2-TH-001-01` | `R2-TH-001-01` | صفحة TownHouse رسمية فتحت؛ 3 Bedroom + Maid RM، 158 م². |
| Gardens N2 | `AlGhadeerGardens-N2-V-001-01` | `N2-V-001-01` | صفحة Villa رسمية فتحت؛ 4 Bedroom Villa، 204 م². |
| Gardens N2 | `AlGhadeerGardens-N2-TH-001-01` | `N2-TH-001-01` | صفحة TownHouse رسمية فتحت؛ 3 Bedroom + Maid RM، 147 م². |
| Gardens N2 | `AlGhadeerGardens-N2-V-004-Test-01` | `N2-V-004-Test-01` | صفحة رسمية فتحت؛ تُحفظ كلمة `Test` كما هي ولا تُنظّف أو تُخمن. |
| Parks 1 NC | `AlGhadeerParks1-NC-V-002-01` | `NC-V-002-01` | صفحة Villa رسمية فتحت؛ 4 Bedroom Villa، 201 م². |
| Parks 1 NC | `AlGhadeerParks1-NC-TH-001-01` | `NC-TH-001-01` | صفحة TownHouse رسمية فتحت؛ 3 Bedroom TownHouse، 146 م². |
| Parks 2 ND | `AlGhadeerParks2-ND-V-001-01` | `ND-V-001-01` | صفحة Villa رسمية فتحت؛ 4 Bedroom Villa، 201 م². |
| Parks 2 ND | `AlGhadeerParks2-ND-TH-001-01` | `ND-TH-001-01` | صفحة TownHouse رسمية فتحت؛ 3 Bedroom TownHouse، 146 م². |

أعاد الرابط غير الملتقط `NC-V-001-01` صفحة World of Aldar 404، بينما الرمز المصدر الفعلي يبدأ في هذه العينة بـ`NC-V-002-01`. لذلك لا يجوز استنتاج تسلسل رقمي أو إضافة رابط بديل عند غياب رمز مصدر كامل. صيغة الروابط التي استوردت هي:

> `https://world.aldar.com/uae/abudhabi/{official-project-path}/property/{exact-short-code}/0?scheme=S1&unitstate=floorplan&furnished=true`

## الحقول المحفوظة والحقول المستبعدة

تتضمن كل بطاقة مستوردة المفتاح الرسمي، النوع، التصنيف، الغرف، مساحات القطعة/المساحة القابلة للبيع/المساحة الإجمالية حيث ينشرها الصف، حالة التأثيث، الرابط الدقيق، مسار المصدر، وتاريخ الالتقاط. يُحفظ `unitStatus` الذي ظهر في مستكشف Aldar في حقل **Official captured unit state** للشفافية فقط؛ ولا يتحول إلى حالة عرض للبيع أو إلى وضع NAS.

| الحقل | المعالجة |
|---|---|
| السعر الأصلي/سعر البيع | فارغ؛ لم يُنشر سعر وحدة قابل للاستيراد في اللقطة المراجعة. |
| التوافر التشغيلي أو NAS Available | فارغ؛ لا يعتمد على `unitStatus` الخام. |
| خطة الدفع، الحجز، والرسوم | فارغة؛ لا تُستنتج من مصدر آخر. |
| المالك وبيانات الاتصال | غير موجودة ولا تُنشأ. |
| الإحداثيات أو نقاط خريطة Saadiyat | غير موجودة ولا تُنشأ؛ لا تُضاف نقاط Ghadeer للخريطة الحالية. |

## التنفيذ والتدقيق التشغيلي

تمت أرشفة ملفات مصدر الوحدات الأربعة وسجل تحقق الروابط داخل OneDrive Business تحت جذر التشغيل المعتمد، دون إنشاء رابط مشاركة عام. ولّد `scripts/generate_alghadeer_snapshot.mjs` لقطة `server/data/aldar_other.json` بصورة قابلة لإعادة التشغيل، واستُبدل سجل Gardens الأقدم ذي **437** وحدة بمفتاح الوحدة الرسمي الكامل، ثم أضيفت N2 وParks 1 وParks 2.

نفذت المزامنة اليدوية المسجلة **900002** بعد التحقق من المفتاح المركب `dataset + project + unit`. سجلت **806** وحدات جديدة تشغيليًا؛ أما وحدات R2 الـ437 السابقة فحُفظت ضمن هويتها الممددة باللاحقة الرسمية `-01` حتى لا تضيع أحداثها التاريخية. لم تُسجل المزامنة أي تغيير حالة أو سعر ناتج من حقول غير منشورة. كما صدر ملف Excel باسم `Al-Ghadeer-Official-Unit-Register-2026-09-03.xlsx` يضم **1,243** صفًا؛ أعمدة السعر والتوافر التشغيلي فيه فارغة عمدًا، وهو تصدير أحادي الاتجاه ولا يعيد أي تعديل من Excel إلى الموقع.

## المراجع الرسمية

1. [World of Aldar — Al Ghadeer Gardens R2](https://world.aldar.com/uae/abudhabi/alghadeergardens/r2)
2. [World of Aldar — Al Ghadeer Gardens N2](https://world.aldar.com/uae/abudhabi/alghadeergardens/n2)
3. [World of Aldar — Al Ghadeer Parks 1 NC](https://world.aldar.com/uae/abudhabi/alghadeerparks1/nc)
4. [World of Aldar — Al Ghadeer Parks 2 ND](https://world.aldar.com/uae/abudhabi/alghadeerparks2/nd)
