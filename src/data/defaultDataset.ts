/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Companion, Relationship, BattleInfo } from '../types';

export const DEFAULT_BATTLES: BattleInfo[] = [
  {
    id: 'badr',
    nameAr: 'غزوة بدر الكبرى',
    nameEn: 'Battle of Badr',
    yearAH: 2,
    locationAr: 'بدر (قرب المدينة المنورة)',
    locationEn: 'Badr (near Medina)',
    summaryAr: 'المعركة الحاسمة الأولى في التاريخ الإسلامي، حيث انتصر المسلمون برغم قلة عددهم على جيش قريش.',
    summaryEn: 'The first decisive battles in Islamic history, where Muslims achieved victory over the Quraish army despite being outnumbered.'
  },
  {
    id: 'uhud',
    nameAr: 'غزوة أحد',
    nameEn: 'Battle of Uhud',
    yearAH: 3,
    locationAr: 'جبل أحد (المدينة المنورة)',
    locationEn: 'Mount Uhud (Medina)',
    summaryAr: 'معركة امتحن فيها المسلمون نتيجة مخالفة الرماة لأوامر النبي ﷺ، واستشهد فيها حمزة بن عبد المطلب رضي الله عنه.',
    summaryEn: 'A battle testing the Muslims after archers disobeyed the Prophet\'s orders, leading to crucial lessons and the martyrdom of Hamza.'
  },
  {
    id: 'khandaq',
    nameAr: 'غزوة الخندق (الأحزاب)',
    nameEn: 'Battle of the Trench (Al-Ahzab)',
    yearAH: 5,
    locationAr: 'شمال المدينة المنورة',
    locationEn: 'North of Medina',
    summaryAr: 'حصار المدينة المنورة من قبائل الأحزاب، حيث حفر المسلمون خندقاً بتوجيه من سلمان الفارسي رضي الله عنه لحماية المدينة.',
    summaryEn: 'The siege of Medina by confederate tribes, where Muslims dug a defensive trench suggested by Salman al-Farsi to protect the city.'
  },
  {
    id: 'khaybar',
    nameAr: 'غزوة خيبر',
    nameEn: 'Battle of Khaybar',
    yearAH: 7,
    locationAr: 'واحة خيبر (شمال المدينة المنورة)',
    locationEn: 'Khaybar Oasis (North of Medina)',
    summaryAr: 'وقع الحصار على حصون خيبر لإنهاء المؤامرات، وحمل الراية علي بن أبي طالب رضي الله عنه لفتح الحصون المنيعة.',
    summaryEn: 'The siege of the fortresses of Khaybar, where Ali ibn Abi Talib was handed the banner to successfully breach the defensive strongholds.'
  },
  {
    id: 'mutah',
    nameAr: 'غزوة مؤتة',
    nameEn: 'Battle of Mu\'tah',
    yearAH: 8,
    locationAr: 'الأردن',
    locationEn: 'Mutah (Jordan)',
    summaryAr: 'معركة بطولية خاضها ٣ آلاف مسلم ضد جيش الروم وحلفائهم، واستشهد فيها القادة الثلاثة: جعفر بن أبي طالب، وزيد بن حارثة، وعبد الله بن رواحة، حتى تولى خالد بن الوليد القيادة وحقق انسحاباً عبقرياً.',
    summaryEn: 'An epic confrontation of 3,000 Muslims against a vast Byzantine host. Key commanders fell before Khalid ibn al-Walid assumed command, engineering an ingenious extraction.'
  },
  {
    id: 'hunayn',
    nameAr: 'غزوة حنين',
    nameEn: 'Battle of Hunayn',
    yearAH: 8,
    locationAr: 'وادي حنين (قرب الطائف)',
    locationEn: 'Hunayn Valley (near Taif)',
    summaryAr: 'وقعت بعد فتح مكة ضد قبيلتي هوازن وثقيف، تراجع المسلمون في البداية ثم ثبت النبي ﷺ وثبت الصحب الكرام وحسموا النصر.',
    summaryEn: 'Occurred post-Mecca conquest against Hawazin. After an initial ambush, the Prophet\'s steadfastness rallied the companions to a stunning victory.'
  },
  {
    id: 'tabuk',
    nameAr: 'غزوة تبوك (العسرة)',
    nameEn: 'Battle of Tabuk (Al-Usrah)',
    yearAH: 9,
    locationAr: 'تبوك',
    locationEn: 'Tabuk',
    summaryAr: 'آخر غزوة قادها النبي ﷺ بنفسه لمواجهة حشود الروم بجيش قدر بثلاثين ألف مقاتل، جهزه عثمان بن عفان وأبو بكر بنصيب كبير.',
    summaryEn: 'The final military expedition led by the Prophet ﷺ to face Byzantine border incursions. Formed via immense sacrifices from Uthman, Abu Bakr, and others.'
  }
];

export const DEFAULT_COMPANIONS: Companion[] = [
  {
    id: 'abu_bakr',
    nameAr: 'أبو بكر الصديق',
    nameEn: 'Abu Bakr al-Siddiq',
    kunyaAr: 'أبو بكر',
    kunyaEn: 'Abu Bakr',
    lineageAr: 'عبد الله بن عثمان بن عامر بن عمرو التيمي القرشي',
    lineageEn: 'Abdullah ibn Uthman ibn Aamir al-Taymi al-Qurashi',
    titlesAr: ['الصديق', 'العتيق', 'ثاني اثنين'],
    titlesEn: ['Al-Siddiq (The Truthful)', 'Al-Atiq (Saved)', 'Thani al-Thnayn (Second of the Two)'],
    tribeAr: 'بنو تيم (قريش)',
    tribeEn: 'Banu Taym (Quraish)',
    birthYearAH: -50, // 50 BH
    deathYearAH: 13,
    ageAtDeath: 63,
    category: 'Khulafa_Rashidun',
    cityAr: 'مكة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 142,
    shortBioAr: 'الخليفة الأول للمسلمين، وصاحب النبي ﷺ في الهجرة، وأول من آمن من الرجال بغير تردد.',
    shortBioEn: 'The first Caliph of Islam, the intimate companion of the Prophet ﷺ during the Hijra migration, and the first adult male to accept Islam without hesitation.',
    longBioAr: `هو عبد الله بن أبي قحافة (عثمان) التيمي القرشي، ولد في مكة بعد عام الفيل بسنتين ونصف تقريباً. كان سيداً من سادات قريش، تاجراً موسراً، عالماً بطلب الأنساب، ومحبوباً في مجتمعه.

عندما نزل الوحي على رسول الله ﷺ، سارع أبو بكر الصديق بالإيمان دون أي تردد أو شك، ولم يخفِ إيمانه بل دعا المقربين إليه، فأسلم على يديه كبار الصحابة مثل عثمان بن عفان، وعبد الرحمن بن عوف، وسعد بن أبي وقاص، والزبير بن العوام.

عرف بشجاعته وإنفاقه الهائل لماله في سبيل الله وإعتاق العبيد الضعفاء من تعذيب قريش كبلال بن رباح وعامر بن فهيرة.

**صاحب الهجر:**
رافَقَ النبي ﷺ في الهجرة التاريخية من مكة للمدينة، واختبأ معه في غار ثور لثلاث ليال، وجسد مثالاً لا مثيل له في التضحية والفداء والولاء.

**الخلافة:**
بعد وفاة النبي ﷺ، اختير خليفة للمسلمين ببيعة السقيفة والبيعة العامة. واجه فتنة الردة بحزم وقاد حروب الردة المظفرة، ووجه الفتوحات الإسلامية نحو الشام والعراق، وبدأ بجمع القرآن الكريم في مصحف واحد بإيعاز من عمر وبيد زيد بن ثابت رضي الله عنهم.`,
    longBioEn: `He is Abdullah ibn Abi Quhafah (Uthman) al-Taymi al-Qurashi, born in Mecca approximately two and a half years after the Year of the Elephant. He was an esteemed Quraishi nobleman, a wealthy merchant, an expert in Arab genealogy, and universally loved.

Upon receiving the divine message, Abu Bakr responded immediately without a trace of skepticism. He actively promoted Islam, leading major figures like Uthman ibn Affan, Abd al-Rahman ibn Awf, and Saad ibn Abi Waqqas to accept Islam.

He is widely celebrated for his incredible financial sacrifices, expending his vast wealth to purchase and free persecuted slaves, including Bilal ibn Rabah.

**Companionship during Hijra:**
He accompanied the Prophet ﷺ on the historic hegira from Mecca to Medina, sheltered with him in the Cave of Thawr for three nights, demonstrating sublime devotion.

**The Caliphate:**
Following the Prophet\'s passing, he was elected the first Caliph at Saqifah. He firmly suppressed open uprisings during the Ridda (Apostasy) wars, directed the early defense and expansion campaigns to Iraq and Syria, and commissioned the compilation of the Quran into a singular volume.`,
    conversionAr: 'دعي إلى الإسلام فقبله على الفور دون أدنى تردد أو شك، وصار أول رجل يجهر بصلاته وإيمانه.',
    conversionEn: 'Upon being invited to Islam, he embraced it instantly without the slightest pause, becoming the first freeman to publicly declare his faith.',
    achievementsAr: [
      'أول من آمن من الرجال بغير تردد',
      'صاحب النبي ﷺ في الغار والهجرة الشريفة',
      'إعتاق عدد كبير من الصحابة المستضعفين المعذبين لتوحيد الله',
      'الخليفة الأول للمسلمين بعد رسول الله ﷺ',
      'حماية الكيان الإسلامي وتوطيده بإخماد فتنة المرتدين وحفظ كيان الدولة',
      'بدء العمل لجمع القرآن الكريم لأول مرة في تاريخ الأمة'
    ],
    achievementsEn: [
      'First adult male to accept Islam instantly',
      'Sole companion of the Prophet ﷺ in the cave of Thawr',
      'Freed numerous weak and tortured slaves, including Bilal',
      'Elected the First Caliph of the Islamic state',
      'Preserved the state by subduing the widespread Ridda rebellions',
      'Ordered the initial compilation of the Holy Quran'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'hunayn', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['عمر بن الخطاب', 'عائشة بنت أبي بكر', 'عثمان بن عفان', 'علي بن أبي طالب', 'ابن عباس'],
    famousHadiths: [
      {
        quoteAr: 'يا رسولَ اللهِ، علِّمْني دعاءً أدعو به في صلاتي.. قال: «قل: اللَّهُمَّ إنِّي ظَلَمْتُ نَفْسِي ظُلْماً كَثِيراً، ولَا يَغْفِرُ الذُّنُوبَ إلَّا أنْتَ، فَاغْفِرْ لي مَغْفِرَةً مِن عِنْدِكَ، وارْحَمْنِي، إنَّكَ أنْتَ الغَفُورُ الرَّحِيمُ»',
        quoteEn: 'I offered: "O Messenger of Allah, teach me a supplication..." He said, "Say: O Allah, indeed I have wronged myself greatly, and none forgives sins except You, so forgive me with a forgiveness from You and have mercy on me. Indeed, You are the Forgiving, the Merciful."',
        reference: 'Sahih al-Bukhari 834'
      }
    ],
    sources: ['صحيح البخاري', 'ابن الأثير - أسد الغابة', 'ابن سعد - الطبقات الكبرى', 'ابن كثير - البداية والنهاية'],
    library: ['حياة الصديق للدكتور علي الصلابي', 'موسوعة سيرة أبي بكر الصديق - الهيئة العالمية للإعجاز'],
    historicalSignificanceAr: 'حمى الأمة والدولة الإسلامية من الانهيار والذوبان غداة وفاة المصطفى ﷺ، ورتّب أولى المكتسبات التي قامت عليها قواعد الحضارة الإسلامية.',
    historicalSignificanceEn: 'Shielded the young Muslim nation of Medina from collapse in the immediate aftermath of the Prophet\'s passing, establishing the baseline structures of Islamic civilization.',
    confidenceLevel: 'High'
  },
  {
    id: 'umar_bin_al_khattab',
    nameAr: 'عمر بن الخطاب',
    nameEn: 'Umar ibn al-Khattab',
    kunyaAr: 'أبو حفص',
    kunyaEn: 'Abu Hafs',
    lineageAr: 'عمر بن الخطاب بن نفيل بن عبد العزى العدوي القرشي',
    lineageEn: 'Umar ibn al-Khattab ibn Nufayl al-Adawi al-Qurashi',
    titlesAr: ['الفاروق', 'أمير المؤمنين'],
    titlesEn: ['Al-Farooq (The Distinguisher between truth and falsehood)', 'Amir al-Mu\'minin (Commander of the Faithful)'],
    tribeAr: 'بنو عدي (قريش)',
    tribeEn: 'Banu Adi (Quraish)',
    birthYearAH: -40, // 40 BH
    deathYearAH: 23,
    ageAtDeath: 63,
    category: 'Khulafa_Rashidun',
    cityAr: 'مكة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 539,
    shortBioAr: 'الخليفة الثاني للمسلمين، والقائد العبقري والملهم الذي نشر العدل وفتح الفتوحات وأسس الدواوين.',
    shortBioEn: 'The second Caliph of Islam, an extraordinary leader and genius statesman famed for his justice, expansive governance dockets, and structural expansions.',
    longBioAr: `هو عمر بن الخطاب رضي الله عنه. ولد في مكة بعد عام الفيل بثلاث عشرة سنة. كان قوياً، حليماً، مهاب الجانب، يقرأ ويكتب وهو أمر نادر في قريش آنذاك.

**قصة إسلامه:**
كان من ألد أعداء الإسلام في البداية، ولكنه تأثر بسماع آيات من سورة طه في بيت أخته فاطمة وزوجها سعيد بن زيد رضي الله عنهما، فدخل قلبه الإيمان وهُرع للنبي ﷺ ليعلن إسلامه علناً بقوة ورباطة جأش؛ وبإسلامه جهر المسلمون بصلاتهم في المسجد الحرام لأول مرة بأمره.

**الهجرة الشجاعة:**
بينما هاجر المسلمون سراً خوفاً من قريش، تقلد عمر سيفه وذهب للكعبة وطاف بالبيت مهدداً زعماء قريش، مهاجراً جهاراً، ولم يجرؤ أحد على منعه.

**الخلافة:**
تولى عمر الخلافة بناء على عهد من أبي بكر وتوافق المسلمين. في عهده بلغت الفتوحات مداها، فسقطت عروش كسرى إمبراطور فارس وقياصرة الروم، وفُتِحت بلاد المشرق، والشام، ومصر، والقدس حيث استلم مفاتيحها بنفسه ضامناً سلام وعهدة أهل إيليا البابوية ومقسطاً بينهم بالعدل المطلق.

**التأسيس المدني:**
أسّس عمر التاريخ والتقويم الهجري، ونظام الدواوين (الوزارات والرواتب الحكومية وطبقات العسس والشرطة)، ونظام البريد، وقسّم الدولة ولايات إدارية لضبط شؤونها الشاسعة.`,
    longBioEn: `He is Umar ibn al-Khattab, born in Mecca 13 years after the Year of the Elephant. Famed for his towering strength, eloquence, iron will, and rare literary skills for pre-Islamic Mecca.

**Conversion to Islam:**
An ardent opponent of Islam initially, he was thoroughly moved upon hearing verses from Surah Ta-ha in the house of his sister Fatima. He immediately went to the Prophet ﷺ and declared his faith openly. His conversion empowered Muslims to pray publicly at the Kaaba.

**The Bold Hijra:**
While companions mostly made the journey to Medina in complete secrecy, Umar famously buckled his sword, advanced to the Kaaba, challenged the Quraishi chiefs, and migrated in broad daylight.

**The Caliphate:**
Appointed via succession arrangement by Abu Bakr. His decade long tenure witnessed incredible scale, overrunning the ancient Sassanid empire and capturing Roman Levant, Syria, Egypt, and Jerusalem, where he personally delivered the core security pact of "Al-Uhda al-Umariyya" granting absolute non-discrimination to non-Muslim religious rights.

**Civil Administration:**
He established the Hijri Calendrical era, introduced structural government offices (Diwans) to manage registries and treasuries, created state patrol guards (Asas), and instituted provincial structures.`,
    conversionAr: 'تأثّر بآيات من القرآن في بيت أخته فاطمة، واهتدى فأعلن إسلامه في دار الأرقم بجرأة غيّرت مجرى الدعوة.',
    conversionEn: 'Profoundly impacted by Quranic verses of Surah Ta-ha in his sister Fatima\'s house; he proclaimed his faith in Dar al-Arqam with immense boldness that shifted the balance of power.',
    achievementsAr: [
      'إعلان الدعوة جهراً في المسجد الحرام غداة إسلامه',
      'تلقيب النبي ﷺ له بالفاروق',
      'تأسيس نظام الدواوين وبيت المال وتوزيع الخراج والرواتب',
      'تأسيس التاريخ والتقويم الهجري',
      'فتح بلاد الشام ومصر وفارس ودخول القدس ووضع عهدة الأمان لأهلها',
      'تأسيس العسس والحراسة الليلية لضمان أمن الرعية'
    ],
    achievementsEn: [
      'Brought Islamic prayer to the public space of Meccan Kaaba',
      'Honored with the title "Al-Farooq" by the Prophet ﷺ',
      'Instituted standard civil ministries (Diwans) and public treasuries',
      'Established the global Hijri Calendar system',
      'Opened Iraq, Greater Syria, Egypt, Persia, and issued Jerusalem\'s treaty',
      'Created early community policing models and night patrols'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'hunayn', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['عثمان بن عفان', 'علي بن أبي طالب', 'عبد الله بن عمر', 'عبد الله بن مسعود', 'الحسن بن علي'],
    famousHadiths: [
      {
        quoteAr: 'سمعتُ رسولَ اللهِ ﷺ يقولُ: «إنَّما الأعْمالُ بالنِّيَّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى...»',
        quoteEn: 'I heard the Messenger of Allah ﷺ saying, "Actions are judged by intentions, and every person will get what he intended..."',
        reference: 'Sahih al-Bukhari 1'
      }
    ],
    sources: ['صحيح البخاري', 'ابن سعد - الطبقات الكبرى', 'الذهبي - سير أعلام النبلاء', 'تاريخ الطبري'],
    library: ['عبقرية عمر للكاتب عباس محمود العقاد', 'الفاروق عمر للدكتور شبلي النعماني'],
    historicalSignificanceAr: 'يعد واضع الهيكل المؤسسي والحضاري للدولة الإسلامية الفتية، وجسّد أعلى معايير العدالة الإنسانية وسيادة القانون.',
    historicalSignificanceEn: 'The primary architect of the civil, legal, and operational infrastructure of Islamic civilization, setting historic templates for legal justice.',
    confidenceLevel: 'High'
  },
  {
    id: 'uthman_bin_affan',
    nameAr: 'عثمان بن عفان',
    nameEn: 'Uthman ibn Affan',
    kunyaAr: 'أبو عبد الله',
    kunyaEn: 'Abu Abdullah',
    lineageAr: 'عثمان بن عفان بن أبي العاص بن أمية القرشي',
    lineageEn: 'Uthman ibn Affan ibn Abi al-Aas al-Umawi al-Qurashi',
    titlesAr: ['ذو النورين', 'صاحب الهجرتين'],
    titlesEn: ['Dhun-Noorayn (Owner of Two Lights)', 'Sahib al-Hijratayn (The Veteran of Two Migrations)'],
    tribeAr: 'بنو أمية (قريش)',
    tribeEn: 'Banu Umayyah (Quraish)',
    birthYearAH: -47, // 47 BH
    deathYearAH: 35,
    ageAtDeath: 82,
    category: 'Khulafa_Rashidun',
    cityAr: 'مكة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 146,
    shortBioAr: 'الخليفة الثالث للمسلمين، ذو الكرم الأسطوري والحياء الوفر، وجامع القرآن الكريم في رسم عثماني موحد.',
    shortBioEn: 'The third Caliph of Islam, celebrated for his peerless generosity, deep modesty, and codifying the Quran into the singular standardized script that exists to this day.',
    longBioAr: `هو عثمان بن عفان الأموي القرشي، ولد في الطائف بعد عام الفيل بست سنوات تقريباً. كان غنياً، واسع الثراء، شريفاً، متواضعاً، وشديد الحياء لدرجة أن النبي ﷺ صرّح: «ألا أستحي من رجل تستحي منه الملائكة».

**إسلامه وهجرته:**
أسلم في المراحل المبكرة جداً على يد أبي بكر الصديق. هاجر الهجرتين؛ الأولى إلى الحبشة فاراً بدينه برفقة زوجته رقية بنت رسول الله ﷺ، ثم هاجر بعد ذلك مع المسلمين إلى المدينة المنورة.

**ذو النورين:**
سُمّي بـ "ذي النورين" لأنه تزوج ابنتي المصطفى ﷺ؛ رقية رضي الله عنها، وبعد وفاتها زوّجه النبي من أختها أم كلثوم رضي الله عنها.

**سخاؤه الأسطوري:**
بذل عثمان تجارته وأمواله في سبيل الله دون حساب:
- اشترى بئر "رومة" بالمدينة وجعلها وقفاً مجانياً للمسلمين عندما شح الماء.
- اشترى الأرض وجدّد توسعة المسجد النبوي الشريف في عهد النبي ﷺ.
- جهّز ثلث جيش العسرة في غزوة تبوك بماله وأسلحته وخيله الكثيرة.

**الخلافة وجمع القرآن:**
تولى الخلافة بعد وفاة عمر. وقام بأعظم عمل تاريخي للأمة وهو نسخ المصاحف وتوحيد كتابة القرآن الكريم على لهجة واحدة (قريش) ليقطع الفتن واختلاف القراءات، وأرسل النسخ للأمصار وهو ما يعرف بـ "الرسم العثماني". كما بنى أول أسطول بحري حربي للمسلمين لفتح قبرص وحماية السواحل من البيزنطيين.`,
    longBioEn: `He is Uthman ibn Affan al-Umawi al-Qurashi, born in Taif approx. 6 years after the Year of the Elephant. A wealthy merchant, esteemed nobleman, and iconic gentleman famed for his modesty, such that the Prophet ﷺ remarked: "Shall I not feel bashful before a man whom the angels feel bashful?"

**His Islam and Hijri Veteran status:**
Ears of public call, he joined early via Abu Bakr's invite. He performed both migrations: first escaping religious torture with his wife Ruqayyah (the Prophet\'s daughter) to Abyssinia (Ethiopia), and then later to Medina.

**The Bearer of Two Lights:**
Given this title because he achieved the distinction of marrying two daughters of the Prophet ﷺ; marrying Ruqayyah, and after she passed away, being given her sister Umm Kulthum.

**Modesty and Ultimate Charity:**
His private treasury sponsored historic Waqf (endowment) foundations:
- Bought the Well of Roomah from a non-Muslim merchant and endowed it completely for public access.
- Bought the land adjacent to expand the Prophet's Mosque.
- Personally funded a third of the vast Army of Hardship (Al-Usrah) to Tabuk.

**Caliphate and Unified Quran Script:**
Elected Caliph after Umar. He executed the momentous task of compiling the official, final orthographic codex of the Holy Quran, preventing future splits and creating the standardized spelling system called the 'Uthmanic Script'. He also facilitated the early naval squadrons of Islam to secure maritime frontiers.`,
    conversionAr: 'أسلم مبكراً في مكة بتوجيه ودعوة أبي بكر الصديق، متحملاً عداء عشيرته الكبيرة بني أمية.',
    conversionEn: 'Embraced Islam in its fragile opening phase via the invite of Abu Bakr al-Siddiq, remaining steady despite immense friction from his powerful clan.',
    achievementsAr: [
      'تجهيز جيش العسرة (غزوة تبوك) بالكامل من ماله الخاص',
      'شراء بئر رومة بالمدينة وجعله وقفاً مجانياً للمسلمين',
      'توسعة المسجد النبوي والمسجد الحرام',
      'إدارة الفتوحات ونشر الدعوة في أذربيجان وإفريقية',
      'جمع كتابة وقراءة القرآن الكريم في مصحف إمام وتعميمه للبلاد',
      'تأسيس أول أسطول بحري حربي للمسلمين'
    ],
    achievementsEn: [
      'Individually funded the massive Army of Hardship (Battle of Tabuk)',
      'Purchased the Well of Roomah as a permanent public trust',
      'Financed historic expansions of both the Medina and Mecca sanctuaries',
      'Oversaw expansion of boundaries to northern borders of Azerbaijan and Africa',
      'Standardized spelling of the Holy Quran into copies still used globally',
      'Founded the first military navy division of the Muslim state'
    ],
    battles: ['uhud', 'khandaq', 'khaybar', 'hunayn', 'tabuk'], // note: absent in Badr as he stayed to nurse Prophet's sick daughter Ruqayyah by Prophet's explicit order
    teachers: ['الرسول محمد ﷺ'],
    students: ['علي بن أبي طالب', 'ابن عباس', 'الحسن البصري', 'أبو هريرة', 'عبد الله بن الزبير'],
    famousHadiths: [
      {
        quoteAr: 'قَالَ النَّبِيُّ ﷺ: «خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ»',
        quoteEn: 'The Prophet ﷺ said, "The best of you are those who learn the Quran and teach it."',
        reference: 'Sahih al-Bukhari 5027'
      }
    ],
    sources: ['صحيح البخاري', 'ابن كثير - البداية والنهاية', 'ابن الجوزي - صفة الصفوة'],
    library: ['تيسير الكريم المنان في سيرة عثمان بن عفان ل علي الصلابي', 'ذو النورين عثمان بن عفان لمحمد رضا'],
    historicalSignificanceAr: 'وحّد قراءة القرآن الكريم لجميع الأجيال اللاحقة، وأنشأ القوة البحرية التي أمّنت موانئ العالم الإسلامي ضد قوى الروم الكبرى.',
    historicalSignificanceEn: 'Unified the textual presentation of the holy text for all generations, and laid the foundations for naval defense protecting the young empire\'s coastal assets.',
    confidenceLevel: 'High'
  },
  {
    id: 'ali_bin_abi_talib',
    nameAr: 'علي بن أبي طالب',
    nameEn: 'Ali ibn Abi Talib',
    kunyaAr: 'أبو الحسن',
    kunyaEn: 'Abu al-Hasan',
    lineageAr: 'علي بن أبي طالب بن عبد المطلب بن هاشم القرشي',
    lineageEn: 'Ali ibn Abi Talib ibn Abd al-Muttalib ibn Hashim al-Qurashi',
    titlesAr: ['باب العلم', 'أبو تراب', 'أسد الله الغالب', 'كرم الله وجهه'],
    titlesEn: ['Bab al-Ilm (Gate of Knowledge)', 'Abu Turab (Father of Dust)', 'Asadullah (Lion of Allah)', 'Karam Allah Wajhah'],
    tribeAr: 'بنو هاشم (قريش)',
    tribeEn: 'Banu Hashim (Quraish)',
    birthYearAH: -23, // 23 BH
    deathYearAH: 40,
    ageAtDeath: 63,
    category: 'Khulafa_Rashidun',
    cityAr: 'مكة / المدينة / الكوفة',
    cityEn: 'Mecca / Medina / Kufa',
    hadithCount: 586,
    shortBioAr: 'الخليفة الرابع للمسلمين، وابن عم النبي وصهره، وبطل الفداء يوم الهجرة وفارس غزوات الإسلام قاطبة.',
    shortBioEn: 'The fourth Caliph of Islam, the cousin and son-in-law of the Prophet ﷺ, the young champion who slept in the Prophet\'s bed on the night of Hijra, and the elite knight who participated in nearly every major duel.',
    longBioAr: `هو علي بن أبي طالب الهاشمي القرشي، ابن عم الرسول ﷺ، نشأ وصار في حماية ورعاية بيت النبي الكريم فتأثر بأدق تعاملاته وتلقى النور منذ الصغر.

**أول من أسلم من الفتيان:**
كان أول الناس إيماناً من الصبيان والشباب وهو في العاشرة من عمره.

**الفداء الشجاع:**
يوم هجرة النبي ﷺ من مكة، نام علي بن أبي طالب في فراش الرسول للتمويه على المتآمرين المترقبين من قريش لقتله، معرضاً نفسه لخطر حتمي، وثم رد الأمانات والودائع لزعماء قريش طيلة ثلاثة أيام قبل أن يهاجر مشياً على الأقدام ليلحق به بالمدينة.

**صهره العظيم:**
تزوّج أحب بنات رسول الله ﷺ؛ فاطمة الزهراء سيدة نساء العالمين، ورزق منها بسيدي شباب أهل الجنة: الحسن والحسين رضي الله عنهما.

**الفروسية والعلم:**
أظهر بطولات منقطعة النظير في المبارزات وشتى الغزوات، كحمل راية فتح حصون خيبر المنيعة، والنزول للمبارزات الفردية في بدر وأحد والخندق وقتل فرسان العرب المشاهير كعمرو بن عبد ود العامري. وكان يُستفتى في أعقد المسائل القضائية لحدة ذهنه وعلمه الشامل حتى قال عمر: «لولا علي لهلك عمر».

**الخلافة:**
بويع رابع خليفة للمسلمين بعد استشهاد عثمان، وقاد دفة الإصلاح ونقل مقر الخلافة إلى الكوفة لإحكام السيطرة، وجاهد لحفظ جمع المسلمين واستتباب الأمن حتى استشهد غدراً على يد الخوارج.`,
    longBioEn: `He is Ali ibn Abi Talib al-Hashimi al-Qurashi, first cousin of the Prophet ﷺ. Raised directly within the Prophet's household, forming an exceptionally pure understanding of the faith.

**First Boy to Accept Islam:**
He was the first youth to accept Islam under the public mission, being just ten years old.

**The Ultimate Sacrifice on Hijra Night:**
On the eve of the Migration, Ali famously slept in the Prophet\'s bed to deceive the awaiting Quraish assassins, fully knowing the danger, then stayed behind to return entrusted properties to non-Muslim enemies before migrating on foot.

**The Blessed Alliance:**
He married the beloved daughter of the Prophet, Fatima az-Zahra, parenting Al-Hasan and Al-Husayn, the leaders of the youths of Paradise.

**Heroic Chivalry and Academic Depth:**
The champion of several single-combat duels in Badr, Uhud, and the Trench, where he defeated formidable knights. He famously unlocked the gates of the Khaybar fortresses under heavy resistance. Described as the gate of wisdom due to his comprehensive grasp of jurisprudence, leading Umar to remarks like: "Had it not been for Ali, Umar would have perished."

**The Caliphate:**
Elected the Fourth Caliph after Uthman\'s martyrdom. He navigated massive internal conflicts, relocated the capital city to Kufa to secure governance, and worked tirelessly until his tragic martyrdom.`,
    conversionAr: 'نشأ وتلقى التربية في بيت الرسول ﷺ، وكان أول صبي يؤمن بالنبوة وهو في العاشرة من عمره بذكاء وفهم.',
    conversionEn: 'Brought up directly in the Prophet\'s home, he was the first minor to embrace Islam at the age of ten with complete loyalty.',
    achievementsAr: [
      'أول من أسلم من الصبيان والشباب',
      'الفداء بالنوم في فراش النبي ليلة الهجرة',
      'إعادة الأمانات والودائع لأهل مكة برغم عداوتهم',
      'بطل فتح حصون خيبر وقتل الفارس عمرو بن ود الخندقي',
      'الخليفة الرابع للمسلمين وصاحب المنهج القضائي الأكثر دقة',
      'نقل مركز وعاصمة الخلافة إلى مدينة الكوفة لتنظيم الدولة'
    ],
    achievementsEn: [
      'First youth of Mecca to embrace the guidance',
      'Heroic deception by sleeping in the Prophet\'s bed during emigration',
      'Successfully returned properties to non-Muslims amidst state emergency',
      'Conquered the strongholds of Khaybar, and dispatched top hostile duelists',
      'Fourth Rightly Guided Caliph and standard-bearer of Islamic legal reasoning',
      'Shifted the geopolitical center and administrative capital to Kufa'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'hunayn'], // note: left behind as governor of Medina during Tabuk, comforting him with the words "Are you not pleased that you are to me like Aaron was to Moses?"
    teachers: ['الرسول محمد ﷺ'],
    students: ['الحسن بن علي', 'الحسين بن علي', 'ابن عباس', 'ابن مسعود', 'كميل بن زياد'],
    famousHadiths: [
      {
        quoteAr: 'قَالَ رَسولُ الله ﷺ لعَلِيٍّ يَومَ خَيْبَرَ: «لَأُعْطِيَنَّ الرَّايَةَ غَدًا رَجُلًا يُفْتَحُ علَى يَدَيْهِ، يُحِبُّ اللَّهَ ورَسولَهُ، ويُحِبُّهُ اللَّهُ ورَسولُهُ»',
        quoteEn: 'On the day of Khaybar, the Prophet ﷺ asserted: "I will definitely give this banner tomorrow to a man through whose hands victory will be granted, who loves Allah and His Messenger, and whom Allah and His Messenger love."',
        reference: 'Sahih al-Bukhari 3701'
      }
    ],
    sources: ['صحيح البخاري', 'صحيح مسلم', 'ابن الأثير - أسد الغابة', 'تاريخ الطبري'],
    library: ['علي بن أبي طالب للدكتور علي محمد الصلابي', 'نهج البلاغة (دراسات وشروح)'],
    historicalSignificanceAr: 'يعتبر المرجعية الكبرى في القضاء وتطبيق الشريعة والفصاحة العربية، وحافظ على جوهر الكلمة في أصعب حقب النزاع.',
    historicalSignificanceEn: 'Represented the apex of judicial verdicts, Quranic exegesis, Arabic eloquence, and kept the spiritual core of Islam whole during its most testing political splits.',
    confidenceLevel: 'High'
  },
  {
    id: 'khadijah_bint_khuwaylid',
    nameAr: 'خديجة بنت خويّلد',
    nameEn: 'Khadijah bint Khuwaylid',
    kunyaAr: 'أم هند',
    kunyaEn: 'Umm Hind',
    lineageAr: 'خديجة بنت خويلد بن أسد بن عبد العزى الأسدية القرشية',
    lineageEn: 'Khadijah bint Khuwaylid ibn Asad al-Asadiyyah al-Qurashiyyah',
    titlesAr: ['الطاهرة', 'أم المؤمنين', 'سيدة نساء العالمين'],
    titlesEn: ['Al-Tahirah (The Pure)', 'Umm al-Mu\'minin (Mother of the Believers)', 'Sayyidat Nisa al-Alamīn (Leader of the Women of the World)'],
    tribeAr: 'بنو أسد (قريش)',
    tribeEn: 'Banu Asad (Quraish)',
    birthYearAH: -68, // 68 BH
    deathYearAH: -3,  // 3 BH (Year of Sorrow)
    ageAtDeath: 65,
    category: 'Wives',
    cityAr: 'مكة المكرمة',
    cityEn: 'Mecca',
    hadithCount: 0,
    shortBioAr: 'أم المؤمنين، وزوجة النبي ﷺ الأولى، وأول من آمن بالله ورسوله من البشر على الإطلاق، ونعم السند والمواسي له.',
    shortBioEn: 'The first wife of the Prophet ﷺ, the very first human to embrace the divine message, and the peerless companion who stabilized and supported him during the chaotic early revelations.',
    longBioAr: `هي خديجة بنت خويلد الأسدية القرشية. ولدت في مكة ونشأت في بيت شرف ووجاهة وتجارة، وعرفت برجاحة عقلها وعفتها الشديدة فلقبت بـ "الطاهرة".

**علاقتها بالنبي ﷺ:**
استأجرت النبي ﷺ ليخرج بتجارتها للشام لأمانته وصدقه، ولما عادت ميمونة بالأخبار المعجزة عن بركته وصدق معاملاته، رغبت بالزواج منه، فكان زواجاً ميموناً مباركاً شكل أساساً لنشوء بيت النبوة. ولدت له القاسم، زينب، رقية، أم كلثوم، فاطمة، وعبد الله.

**رائدة الإيمان والسند الحصين:**
عند نزول الوحي لأول مرة على رسول الله ﷺ في غار حراء ورجوعه خائفاً يرجف فؤاده قائلاً: «زملوني زملوني»، طمأنته بعبارات ذهبية خالدة مبرهنة على عمق بصيرتها السياسية والأخلاقية فقالت: «كلا والله ما يخزيك الله أبداً، إنك لتصل الرحم، وتحمل الكل، وتكسب المعدوم، وتقري الضيف، وتعين على نوائب الحق».

ثم ذهبت به إلى ورقة بن نوفل لتطمئن قلبه. بذلت خديجة كل ثروتها الهائلة لدعم الدعوة الإسلامية وفك الحصار في شعب أبي طالب، وصبرت صبراً جميلاً حتى اختارتها المنية قبل الهجرة بثلاث سنوات في "عام الحزن" متأثرة بآثار الحصار المر الطويل.`,
    longBioEn: `She is Khadijah bint Khuwaylid al-Asadiyyah al-Qurashiyyah, born in Mecca to a prominent and wealthy merchant line. She managed her own commercial enterprise, widely designated in pre-Islamic times as "Al-Tahirah" (The Pure) due to her refinement.

**Marriage to the Prophet ﷺ:**
Having hired Muhammad ﷺ to manage her caravans to Syria, she was profoundly inspired by his trustworthiness (Al-Amin) and honesty. She proposed, initiating a historic family blessed with children: Al-Qasim, Zainab, Ruqayyah, Umm Kulthum, Fatima, and Abdullah.

**The First Believer and Iron Sanctuary:**
When the first revelation shocked the Prophet ﷺ in Cave Hira, leaving him shivering and saying, "Cover me! Cover me!", she instantly steadied his heart with words of historic wisdom: "Never! By Allah, He will never disgrace you. You keep good relations with relatives, help the poor, serve the guests, and assist during emergencies."

She hosted him at Waraqah ibn Nufal\'s, proving to be the anchor of early Islam. She dedicated her entire fortune to support the Muslims during the punishing 3-year social blockade in Abu Talib\'s enclave, passing away shortly after its lifting in the "Year of Sorrow".`,
    conversionAr: 'آمنت بالرسول ﷺ في اللحظات الأولى لنزول الوحي بغار حراء، وكانت أول مسلمة على وجه الأرض دون تردد.',
    conversionEn: 'Embraced the Prophet\'s message the very instant he returned from the Cave of Hira, becoming the absolute first person to enter Islam on Earth.',
    achievementsAr: [
      'أول شخص آمن بالإسلام على وجه الأرض قاطبة من بني البشر',
      'أول من ثبت وبشّر النبي وواسى حزنه عند نزول الوحي الأول',
      'بذل ثروتها الكبيرة وحيازة شرف فك وطأة الحصار الاقتصادي لعدة سنوات',
      'بشّرها جبريل عليه السلام ببيت في الجنة من قصب لا صخب فيه ولا نصب',
      'الأم لجميع أبناء النبي ﷺ عدا إبراهيم'
    ],
    achievementsEn: [
      'The first human being to embrace Islam on the planet',
      'First to validate, comfort, and steady the Prophet ﷺ during first contact',
      'Expended her vast merchant wealth to sustain the early Muslim community',
      'Received greetings from Gabriel with tidings of a palace made of pearls in Paradise',
      'The mother of all the Prophet\'s children except Ibrahim'
    ],
    battles: [], // Passed away before public military era
    teachers: ['الرسول محمد ﷺ'],
    students: [],
    famousHadiths: [
      {
        quoteAr: 'قَالَ رَسولُ الله ﷺ عَنْ خَدِيجَةَ: «آمَنَتْ بِي إِذْ كَفَرَ بِيَ النَّاسُ، وَصَدَّقَتْنِي إِذْ كَذَّبَنِي النَّاسُ، وَوَاسَتْنِي بِمَالِهَا إِذْ حَرَمَنِي النَّاسُ»',
        quoteEn: 'The Prophet ﷺ proclaimed regarding Khadijah: "She believed in me when people rejected me, she verified my message when people called me a liar, and she sustained me with her wealth when people deprived me."',
        reference: 'Musnad Ahmad 24864'
      }
    ],
    sources: ['صحيح البخاري', 'ابن إسحاق - السيرة النبوية', 'ابن سعد - الطبقات الكبرى', 'الألباني - فقه السيرة'],
    library: ['أم المؤمنين خديجة بنت خويلد لعبد الحميد جودة السحار', 'السيدة خديجة رضي الله عنها لإبراهيم محمد حسن الجمل'],
    historicalSignificanceAr: 'مثّلت الدرع الاجتماعي والنفسي والمادي الذي التف حول النبي ﷺ في أصعب لحظات الدعوة سريةً وضيقاً.',
    historicalSignificanceEn: 'Represented the psychological, financial, and maternal fortress that preserved and insulated the Prophet ﷺ during the most fragile dawn of the mission.',
    confidenceLevel: 'High'
  },
  {
    id: 'aisha_bint_abi_bakr',
    nameAr: 'عائشة بنت أبي بكر',
    nameEn: 'Aisha bint Abi Bakr',
    kunyaAr: 'أم عبد الله',
    kunyaEn: 'Umm Abdullah',
    lineageAr: 'عائشة بنت أبي بكر الصديق بن أبي قحافة التيمية القرشية',
    lineageEn: 'Aisha bint Abi Bakr al-Siddiq ibn Abi Quhafah al-Taymiyyah al-Qurashiyyah',
    titlesAr: ['الصديقة بنت الصديق', 'أم المؤمنين', 'الحميراء'],
    titlesEn: ['The Truthful daughter of the Truthful', 'Umm al-Mu\'minin (Mother of the Believers)', 'Al-Humayra'],
    tribeAr: 'بنو تيم (قريش)',
    tribeEn: 'Banu Taym (Quraish)',
    birthYearAH: -9, // 9 BH
    deathYearAH: 58,
    ageAtDeath: 67,
    category: 'Wives',
    cityAr: 'مكة المكرمة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 2210,
    shortBioAr: 'أم المؤمنين، وأحب زوجات النبي ﷺ إليه بعد خديجة، والفقيهة العالمة التي نشرت سنته ونقلت أحكام الفقه والحديث.',
    shortBioEn: 'Mother of the Believers, one of the most beloved wives of the Prophet ﷺ, and a master jurist who transmitted a massive corpus of legal rulings and Prophetic traditions.',
    longBioAr: `هي عائشة بنت أبي بكر الصديق رضي الله عنهما. ولدت في الإسلام في مكة ونشأت في بيت الصدق والتوحيد الطاهر.

**مقام العلم المرموق:**
كانت من أذكى نساء الأمة، حادة الذهن والذاكرة، بارعة في الشعر والأدب، والأنساب، ومطببة خبيرة. عقب زواجها من النبي ﷺ بالمدينة، عاينت الوحي وتلقت آداب النبوة بأعلى مستويات التدريب.

**فقيهة الصحابة:**
كان الصحابة بمختلف مراتبهم العلمية يرجعون إليها في أدق غوامض الفتوى وحقائق الإرث والفرائض، وفسرت معاني آيات القرآن الكريم فكانت أحد المراجع الأربعة الكبار الفقهية بالمدينة.

روى عنها الصحابة والتابعون ما يربو على ٢٢١٠ أحاديث نبوية شريفة، مما جعلها رابع أكثر شخص يروي الأحاديث في الإسلام على الإطلاق، والمرجع الأول في وصف بيت النبي ﷺ وتفاصيل عباداته وسلوكياته المعيشية.

شهدت الحقب السياسية الكبرى وسعت للإصلاح في معركة الجمل العصيبة، وتفرغت للتعليم وماتت بالمدينة ودفنت في البقيع.`,
    longBioEn: `She is Aisha, the daughter of Abu Bakr al-Siddiq, born into a Muslim household in Mecca. Raised in an environment of purity, truthfulness, and faith.

**The Pinnacle of Islamic Intellect:**
Renowned for her extraordinary intelligence, eloquent vocabulary, and encyclopedic memory. She was an expert in medicine, Arabic poetry, history, and genealogical lines. In Medina, she lived in the immediate presence of revelation, cataloging the daily habits of the Prophet ﷺ.

**A Master Jurist of Medina:**
Senior companions routinely visited her quarters to consult on difficult inheritance trials, jurisprudence, and Quranic interpretation. She resolved complex queries, serving as a principal reference.

With 2,210 recorded narrations, she stands as the fourth largest contributor of Hadith in Islamic history, and the primary witness to the domestic and spiritual habits of the Prophet ﷺ.

She participated actively in reform efforts during the trial of the Camel battle, devoting her later life to systematic teaching before passing away in Medina.`,
    conversionAr: 'ولدت في عهد الإسلام ونشأت بين أبوين مسلمين، فتربّت على التوحيد الخالص منذ مطلع طفولتها.',
    conversionEn: 'Born in Islam and raised by two dedicated Muslim parents, she absorbed the faith organically and grew up in its core light.',
    achievementsAr: [
      'رابع أكثر رواة الحديث النبوي في التاريخ وأكثر النساء رواية على الإطلاق',
      'مرجعية الفتوى الكبرى لكبار الصحابة والتابعين بالمدينة المنورة',
      'نزول آيات سورة النور بتبرئتها التاريخية من فوق سبع سموات',
      'توفّي النبي ﷺ في حجرتها وبين سحرها ونحرها ودفن فيها'
    ],
    achievementsEn: [
      'Fourth most prolific narrator of Hadith and the largest female narrator',
      'Supreme judicial advisor consulted by senior companions in Medina',
      'Vindicated from false accusations directly through verses of Surah an-Noor',
      'The Prophet ﷺ passed away in her chamber, and was buried there'
    ],
    battles: ['uhud', 'khandaq'], // Supported water supply and nurse aid
    teachers: ['الرسول محمد ﷺ'],
    students: ['عروة بن الزبير', 'القاسم بن محمد', 'عمرة بنت عبد الرحمن', 'مسروق بن الأجدع', 'أبو سلمة'],
    famousHadiths: [
      {
        quoteAr: 'قَالَتْ: كانَ رَسولُ اللَّهِ ﷺ يقولُ: «يا عَائِشُ، هذا جِبْرِيلُ يُقْرِئُكِ السَّلَامَ.. فَقُلتُ: وعلَيْهِ السَّلَامُ ورَحْمَةُ اللَّهِ وبَرَكَاتُهُ»',
        quoteEn: 'She narrated: The Prophet ﷺ proposed, "O Aisha, here is Gabriel offering greetings of peace to you." I responded, "And upon him be peace and the mercy of Allah and His blessings."',
        reference: 'Sahih al-Bukhari 3217'
      }
    ],
    sources: ['صحيح البخاري', 'صحيح مسلم', 'الذهبي - سير أعلام النبلاء', 'ابن حجر - الإصابة في تمييز الصحابة'],
    library: ['عائشة أم المؤمنين للكاتب العقاد', 'مسند أم المؤمنين عائشة رضي الله عنها ومكانتها العلمية'],
    historicalSignificanceAr: 'ساهمت في حفظ ونقل شطر عظيم من السنة الفقهية والأسرية التي لا يمكن معرفتها إلا من داخل بيت النبوة.',
    historicalSignificanceEn: 'Saved and transmitted half of the domestic jurisprudence, prophetic etiquette, and family ethics of early Islam that were inaccessible outside the Prophet\'s private chambers.',
    confidenceLevel: 'High'
  },
  {
    id: 'bilal_bin_rabah',
    nameAr: 'بلال بن رباح',
    nameEn: 'Bilal ibn Rabah',
    kunyaAr: 'أبو عبد الله',
    kunyaEn: 'Abu Abdullah',
    lineageAr: 'بلال بن رباح الحبشي القرشي الكناني (بالولاء)',
    lineageEn: 'Bilal ibn Rabah al-Habashi al-Qurashi',
    titlesAr: ['مؤذن الرسول', 'سيدنا'],
    titlesEn: ['Muadhin al-Rasul (Muezzin of the Prophet)', 'Sayyiduna (Our Master)'],
    tribeAr: 'الحبشة (بالولاء لبني جمح)',
    tribeEn: 'Abyssinian (via alliance to Jumah)',
    birthYearAH: -43, // 43 BH
    deathYearAH: 20,
    ageAtDeath: 63,
    category: 'Muhajirun',
    cityAr: 'مكة / المدينة / دمشق',
    cityEn: 'Mecca / Medina / Damascus',
    hadithCount: 44,
    shortBioAr: 'مؤذن الإسلام الأول، الصابر تحت شمس الصحراء الحارقة صائحاً «أحد أحد»، ورمز المساواة والحرية في الإسلام.',
    shortBioEn: 'The first Muezzin of Islam, legendary for his iron endurance under torturous desert rocks, whispering his defiant statement: "Ahad! Ahad!" (One! One!), symbolizing racial equality.',
    longBioAr: `هو بلال بن رباح الحبشي، ولد في مكة عبداً مستضعفاً ليتيم من بني جمح وهو مية بن خلف.

**الصبر تحت العذاب:**
أعلن إسلامه سراً فتعرض لأبشع أنواع التعذيب في بطحاء مكة، حيث كان أمية بن خلف يخرجه في حر الظهيرة ويضع الصخرة العظيمة على صدره ليترك دينه، فما يزيده العذاب إلا ثباتاً وهو يردد كلمته الخالدة: «أحَدٌ.. أحَدٌ».

رآه أبو بكر الصديق فاشتراه من أمية بمال وفير وأعتقه في سبيل الله، حتى قال عمر بن الخطاب مقولته الشهيرة: «أبو بكر سيدنا وأعتق سيدنا (يعني بلالاً)».

**صوت التوحيد الخالد:**
عند تشريع الأذان بالمدينة، اختاره النبي ﷺ ليكون المؤذن الأول والوحيد للإسلام لجمال صوته وقوة إيمانه. ويوم فتح مكة العظيم، أمره النبي بالصعود فوق الكعبة المشرفة ورفع الأذان أمام آلاف مشركي مكة المذهولين، معلناً سقوط عهد التفرقة والطبقية الجاهلية.

بعد وفاة النبي ﷺ، شق على بلال أن يؤذن في نفس الأماكن، فخرج مجاهداً مرابطاً في ثغور الشام واستقر في دمشق حتى وفاته.`,
    longBioEn: `He is Bilal ibn Rabah al-Habashi, born in Mecca as a slave to Umayyah ibn Khalaf.

**Indomitable Perseverance:**
Upon quietly shifting to Islam, he was targeted with gruesome torture. Umayyah ibn Khalaf pinned him under massive hot boulders on the scorching Meccan sands in the peak of summer, ordering him to recant. Bilal defiantly chanted his legendary phrase: "Ahadun... Ahad!" (The One God... The One!).

Witnessing this, Abu Bakr purchased him for an immense sum and freed him in the name of Allah. This prompted Umar\'s historic remark: "Abu Bakr is our master, and he emancipated our master (meaning Bilal)."

**The Eternal Voice of Monotheism:**
When the Call to Prayer (Adhan) was legislated in Medina, the Prophet ﷺ selected Bilal as the first official Muezzin due to his heart-stirring voice. During the Conquest of Mecca, he was instructed to climb the roof of the Kaaba and chant the Adhan, symbolizing the destruction of systemic tribalism and racism.

Following the Prophet\'s passing, Bilal found it too heartbreaking to call Adhan in Medina, and relocated to Syria, serving on defense frontiers until his death in Damascus.`,
    conversionAr: 'أسلم في بداية الدعوة سراً في مكة وهو عبد مملوك، فعرّضه سيده أمية لأشد أنواع العذاب.',
    conversionEn: 'Embraced Islam in its highly dangerous inception while an enslaved youth, facing near-fatal abuse from his master.',
    achievementsAr: [
      'أول مؤذن في الإسلام وصاحب أول نداء توحيد بالمدينة المنورة',
      'الجهر بـ «أحد أحد» تحت وطأة التعذيب الشديد والصخور الملتهبة',
      'الصعود فوق ظهر الكعبة ورفع الأذان يوم فتح مكة التاريخي',
      'مشاركة النبي ﷺ جميع المشاهد والغزوات'
    ],
    achievementsEn: [
      'First Muezzin of Islam calling the historical first call to prayer',
      'Defiant chanting of "Ahad, Ahad!" under torture of heavy desert stones',
      'Ascended the Kaaba\'s roof to call the Adhan on the day of Mecca\'s fall',
      'Attended every single battle alongside the Prophet ﷺ'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'hunayn', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['عبد الله بن عمر', 'طارق بن شهاب', 'أبو عثمان النهدي'],
    famousHadiths: [
      {
        quoteAr: 'قَالَ رَسولُ الله ﷺ لِبلالٍ: «يا بلالُ حَدِّثْنِي بأَرْجَى عَمَلٍ عَمِلْتَهُ.. قال: ما عَمِلْتُ عَمَلًا أَرْجَى عِنْدِي أَنِّي لَمْ أَتَطَهَّرْ طُهُورًا.. إلَّا صَلَّيْتُ بذلكَ الطُّهُورِ ما كُتِبَ لي أَنْ أُصَلِّيَ»',
        quoteEn: 'The Prophet ﷺ asked Bilal: "O Bilal, tell me of the most hopeful action you performed..." Bilal said: "I have not done anything more hopeful than that whenever I perform ablution day or night, I pray after it what is written for me to pray."',
        reference: 'Sahih al-Bukhari 1149'
      }
    ],
    sources: ['صحيح البخاري', 'ابن الأثير - أسد الغابة', 'الذهبي - سير أعلام النبلاء'],
    library: ['بلال بن رباح للكاتب العقاد', 'قصة بلال مؤذن الرسول لعبد الحميد جودة السحار'],
    historicalSignificanceAr: 'مثّل انتصار كرامة الإنسان وحرية العقيدة ضد العبودية والتعصب العرقي، وهو قدوة الصابرين على الحق.',
    historicalSignificanceEn: 'Represented the monumental triumph of human dignity over enslavement, serving as a beacon of racial equality in global history.',
    confidenceLevel: 'High'
  },
  {
    id: 'khalid_bin_al_walid',
    nameAr: 'خالد بن الوليد',
    nameEn: 'Khalid ibn al-Walid',
    kunyaAr: 'أبو سليمان',
    kunyaEn: 'Abu Sulayman',
    lineageAr: 'خالد بن الوليد بن المغيرة المخزومي القرشي',
    lineageEn: 'Khalid ibn al-Walid ibn al-Mughirah al-Makhzumi al-Qurashi',
    titlesAr: ['سيف الله المسلول'],
    titlesEn: ['Sayf Allah al-Maslool (The Drawn Sword of Allah)'],
    tribeAr: 'بنو مخزوم (قريش)',
    tribeEn: 'Banu Makhzum (Quraish)',
    birthYearAH: -30, // 30 BH
    deathYearAH: 21,
    ageAtDeath: 58,
    category: 'Military',
    cityAr: 'مكة / المدينة / حمص',
    cityEn: 'Mecca / Medina / Homs',
    hadithCount: 18,
    shortBioAr: 'القائد العسكري العبقري والصحابي الفاتح الذي خاض أكثر من مئة معركة دون أن يتجرع هزيمة واحدة.',
    shortBioEn: 'The unmatched military genius of Islamic history who fought over a hundred battles, remaining completely undefeated throughout his career.',
    longBioAr: `هو خالد بن الوليد بن المغيرة المخزومي القرشي. ولد في مكة وتلقى فروسية النخبة من قبيلته بني مخزوم، أحد أبرز بيوتات قريش العسكرية والقيادية.

**إسلامه:**
أسلم خالد متأخراً في العام الثامن الهجري قبيل فتح مكة بصحبة عمرو بن العاص وعثمان بن طلحة، وحين قدم للمدينة رحّب به النبي ﷺ ترحيباً حاراً قائلاً: «قد كنت أرى لك عقلاً رجوت ألا يسلمك إلا إلى خير».

**سيف الله المسلول:**
في أولى معاركه في الإسلام، معركة مؤتة الشجاعة، تساقط القادة الثلاثة وعمّت الفوضى الجيش البالغة أعداده ٣ آلاف مقابل حشود الروم؛ فتقدم خالد وحمل الراية ونظم انسحاباً عبقرياً وتكتيكاً خارقاً حفظ به بقية جيش المسلمين. حينئذ أطلق عليه النبي ﷺ لقبه الخالد بـ "سيف الله المسلول".

**الفتوحات الكبرى:**
قاد المعارك ضد الفرس والروم بإيعاز من أبي بكر وعمر:
- أخمد الردة بانتصارات حاسمة في معركة اليمامة ضد مسيلمة الكذاب.
- فتح الحيرة وأغلب أراضي العراق وسحق الجيوش الفارسية.
- عبر صحراء السماوة القاحلة في مسيرة لوجستية أسطورية لينقذ الشام.
- قاد معركة اليرموك الشامخة التي دمرت جيش الروم لينهي وجودهم في الشام.

مات خالد على فراشه في حمص باكياً أنه لم يستشهد في ساحة غى، وجسمه مطرز بآثار السيوف والرماح.`,
    longBioEn: `He is Khalid ibn al-Walid ibn al-Mughirah al-Makhzumi al-Qurashi, born to the elite Banu Makhzum clan—the military backbone of Quraish.

**His Islam:**
He embraced Islam in 8 AH alongside Amr ibn al-Aas. The Prophet welcomed him warmly, expressing: "I always knew you possessed an intellect that would ultimately guide you to goodness."

**The Drawn Sword of Allah:**
In his first test at the Battle of Mu\'tah, following the deaths of three supreme commanders, Khalid assumed control under desperate odds (3,000 against a massive Roman force). He executed a series of psychological deceptions and a brilliant withdrawal, rescuing the army. Thus, the Prophet ﷺ designated him "The Sword of Allah".

**The Grand Openings:**
Earmarked by Abu Bakr and Umar to direct global campaigns:
- Crushed the Ridda forces in the Battle of Yamama.
- Penetrated Iraq, capturing Hira and outmaneuvering Sassanid defenses in rapid successions.
- Led the legendary military march across the waterless desert of Samawah to reinforce Levant.
- Masterminded the Battle of Yarmouk, breaking the back of the Byzantine armies in the region.

He passed away on his bed in Homs, weeping that he did not fall on the battlefield despite his body being covered in scars from sword wounds.`,
    conversionAr: 'أسلم في صفر سنة ٨ هـ قبيل فتح مكة، ودخل المدينة معلناً الطاعة واضعاً خبرته العسكرية الفائقة في خدمة الأمة.',
    conversionEn: 'Embraced Islam in 8 AH prior to Mecca\'s conquest, offering his peerless stratagems and sword to the service of the state.',
    achievementsAr: [
      'لم يهزم في أي معركة عسكرية خاضها طوال حياته (شملت أكثر من ١٠٠ معركة)',
      'تأمين معاوضة العبور والانسحاب العبقري بجيش مؤتة وحماية المسلمين',
      'تلقيبه بـ «سيف الله المسلول» من لسان الصادق المصدوق ﷺ',
      'قيادة الفتوحات ومحير الروم والفرس في اليرموك وأجنادين واليمامة وحلب'
    ],
    achievementsEn: [
      'Fought over 100 battles in his lifetime, remaining completely undefeated',
      'Successfully salvaged the army at Mu\'tah through deep tactical withdrawal',
      'Awarded the honorable nickname "The Sword of Allah" by the Prophet ﷺ',
      'Eradicated hostile confederacies, defeating massive empires at Yarmouk and Yamama'
    ],
    battles: ['mutah', 'hunayn', 'tabuk'], // converted after Khaybar
    teachers: ['الرسول محمد ﷺ'],
    students: ['أبو هريرة', 'ابن عباس', 'عبد الله بن عمر', 'شرحبيل بن حسنة'],
    famousHadiths: [
      {
        quoteAr: 'قَالَ خَالِدٌ: «لَقَدْ انْدَقَّتْ فِي يَدِي يَوْمَ مُؤْتَةَ تِسْعَةُ أَسْيَافٍ، فَمَا بَقِيَ فِي يَدِي إِلَّا صَفِيحَةٌ يَمَانِيَّةٌ»',
        quoteEn: 'Khalid narrated: "On the day of Mutah, nine swords broke in my hand, and nothing remained in my possession except a single Yemeni blade."',
        reference: 'Sahih al-Bukhari 4265'
      }
    ],
    sources: ['صحيح البخاري', 'ابن كثير - البداية والنهاية', 'الواقدي - فتوح الشام'],
    library: ['سيف الله خالد بن الوليد للجنرال أكرم', 'خالد بن الوليد العسكري العبقري لصادق عرجون'],
    historicalSignificanceAr: 'يعتبر من أعظم العباقرة والتكتيكيين العسكريين في تاريخ البشرية، وهو ممهد دحر الطوق الإمبراطوري عن الجزيرة العربية.',
    historicalSignificanceEn: 'Widely regarded as one of history\'s greatest cavalry combat commanders, opening the Near East to Islamic civilization.',
    confidenceLevel: 'High'
  },
  {
    id: 'fatima_bint_muhammad',
    nameAr: 'فاطمة الزهراء',
    nameEn: 'Fatima bint Muhammad',
    kunyaAr: 'أم الحسن',
    kunyaEn: 'Umm al-Hasan',
    lineageAr: 'فاطمة بنت محمد بن عبد الله الهاشمية القرشية',
    lineageEn: 'Fatima bint Muhammad ibn Abdullah al-Hashimiyyah al-Qurashiyyah',
    titlesAr: ['الزهراء', 'البتول', 'سيدة نساء أهل الجنة'],
    titlesEn: ['Al-Zahra (The Radiant)', 'Al-Batool (The Ascetic)', 'Sayyidat Nisa al-Jannah (Leader of the Women of Paradise)'],
    tribeAr: 'بنو هاشم (قريش)',
    tribeEn: 'Banu Hashim (Quraish)',
    birthYearAH: -18, // 18 BH
    deathYearAH: 11,
    ageAtDeath: 29,
    category: 'Ahl_al_Bayt',
    cityAr: 'مكة المكرمة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 18,
    shortBioAr: 'بنت رسول الله ﷺ، وأحب أهله إليه، وزوجة علي بن أبي طالب، وأم الحسن والحسين سيدي شباب أهل الجنة.',
    shortBioEn: 'The beloved daughter of the Prophet ﷺ, wife of Ali ibn Abi Talib, and mother of Al-Hasan and Al-Husayn—the leaders of the youths of Paradise.',
    longBioAr: `هي فاطمة الزهراء بنت محمد رسول الله ﷺ، وأمها خديجة بنت خويلد. ولدت في مكة قبيل البعثة بقليل.

**حب النبي لها:**
كانت أقرب الناس شبهاً بأبيها ﷺ في مشيتها، ونطقها، وسمتها وهيبتها. وكان النبي ﷺ إذا دخلت عليه قام إليها، وقبلها، وأجلسها في مجلسه، وقال عنها: «فاطمة بَضْعَةٌ مني، فمن أغضبها فقد أغضبني».

**الصبر والوفاء:**
عاشت طفولة صعبة في مكة مساندة لأبيها ومتحملة الحصار والاضطهاد. تزوجت علي بن أبي طالب في المدينة بعد غزوة بدر، وعاشت حياة زهد وقناعة وعمل يدوي دؤوب.

أنجبت الحسن والحسين سيدي شباب أهل الجنة، وزينب وأم كلثوم رضي الله عنهم أجمعين.

**الوفاة:**
كانت أول من لحق بالنبي ﷺ من أهل بيته بعد وفاته، حيث توفيت بعده بستة أشهر فقط في رمضان سنة ١١ هـ ودفنت ب البقيع.`,
    longBioEn: `She is Fatima al-Zahra, daughter of the Messenger of Allah ﷺ and Khadijah bint Khuwaylid. Born in Mecca shortly before Prophetic mission.

**The Beloved of the Prophet:**
She bore a striking resemblance to her father ﷺ in her gait, speech, manners, and grace. Whenever she entered, the Prophet ﷺ would stand up, kiss her hand, and seat her in his place, once remarking: "Fatima is a part of me; whoever angers her, angers me."

**Purity and Modesty:**
She weathered a demanding childhood in Mecca defending her father against bullies. She married Ali ibn Abi Talib after Badr, leading a life of immense contentment, humility, and daily handiwork.

She parented Al-Hasan, Al-Husayn, Zainab, and Umm Kulthum.

**Her Passing:**
She was the very first from the Prophet's family to join him after his passing, leaving this world exactly six months later in Ramadan, 11 AH, buried in Jannat al-Baqi.`,
    conversionAr: 'ولدت في مهد التوحيد، ونشأت في كنف رسول الله ﷺ ورعاية سيدة نساء الأرض خديجة.',
    conversionEn: 'Born during the opening light of the mission, raised directly by the Prophet ﷺ and Khadijah.',
    achievementsAr: [
      'نيل لقب سيدة نساء أهل الجنة من كلام المصطفى ﷺ',
      'حفظ النسل الطاهر الممتد من عترة النبي ﷺ عبر ولديها الحسن والحسين',
      'الصمود والمؤازرة لوالدها في أحلك أيام مكة وتضميد جراحه بغزوة أحد'
    ],
    achievementsEn: [
      'Designated the Leader of the Women of Paradise by the Prophet ﷺ',
      'Preserved the pure lineage of the Prophet through Al-Hasan and Al-Husayn',
      'Supported her father against early Meccan persecutions and nursed his wounds at Uhud'
    ],
    battles: ['uhud'], // Nursed and washed battlefield wounds of the Prophet
    teachers: ['الرسول محمد ﷺ'],
    students: ['الحسن بن علي', 'الحسين بن علي', 'أم كلثوم بنت علي', 'زينب بنت علي'],
    famousHadiths: [
      {
        quoteAr: 'عَنْ فَاطِمَةَ بِنْتِ النَّبِيِّ ﷺ قَالَتْ: «كَانَ رَسُولُ اللَّهِ ﷺ إِذَا دَخَلَ الْمَسْجِدَ يَقُولُ: بِسْمِ اللَّهِ، وَالسَّلامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ»',
        quoteEn: 'Fatima narrated: "Whenever the Prophet ﷺ entered the mosque, he would say: In the name of Allah, and peace be upon the Messenger of Allah. O Allah, forgive my sins and open the gates of Your mercy for me."',
        reference: 'Sunan Ibn Majah 771'
      }
    ],
    sources: ['صحيح مسلم', 'ابن الأثير - أسد الغابة', 'الذهبي - سير أعلام النبلاء'],
    library: ['فاطمة الزهراء بنت رسول الله لعلي محيي الدين', 'بضعة الرسول فاطمة الزهراء لعبد العزيز الشناوي'],
    historicalSignificanceAr: 'تمثل النموذج الأرقى للمرأة المسلمة في الزهد، والأدب، وبر الوالدين، وركيزة آل البيت الأطهار.',
    historicalSignificanceEn: 'The gold standard of piety, asceticism, and filial support in Islamic history, serving as the central anchor of the Prophet\'s lineage.',
    confidenceLevel: 'High'
  },
  {
    id: 'abu_hurayrah',
    nameAr: 'أبو هريرة',
    nameEn: 'Abu Hurayrah',
    kunyaAr: 'أبو هريرة',
    kunyaEn: 'Abu Hurayrah',
    lineageAr: 'عبد الرحمن بن صخر الدوسي الأزدي',
    lineageEn: 'Abd al-Rahman ibn Sakhr al-Dusi al-Azdi',
    titlesAr: ['راوية الإسلام', 'سيد الحفاظ'],
    titlesEn: ['Rawiyat al-Islam (The Narrator of Islam)', 'Sayyid al-Huffadh (Master of Preservers)'],
    tribeAr: 'دوس (من الأزد)',
    tribeEn: 'Daws (from Azd)',
    birthYearAH: -21, // 21 BH
    deathYearAH: 59,
    ageAtDeath: 80,
    category: 'Hadith_Narrators',
    cityAr: 'اليمن / المدينة المنورة',
    cityEn: 'Yemen / Medina',
    hadithCount: 5374,
    shortBioAr: 'الصحابي الجليل والحافظ الأكبر لحديث رسول الله ﷺ، لازم النبي ملازمة تامة لخدمته وحفظ سنّته.',
    shortBioEn: 'The most prolific narrator of Hadith in Islamic history, dedicating his entire life with single-minded focus to retaining the details of the Prophetic tradition.',
    longBioAr: `هو عبد الرحمن بن صخر الدوسي، ولد في اليمن في بلاد زهران لقسم من قبائل الأزد اليمانية.

**إسلامه وملازمته:**
قدم المدينة مسلماً سنة ٧ هـ في خيبر، وكان فقيراً لا دار له، فلزم صفة المسجد النبوي الشريف (أحد أهل الصفة) متجافياً عن الدنيا والتجارة والأسواق لغرض واحد: ملازمة المصطفى ﷺ وحفظ كلامه وأفعاله.

**معجزة الحفظ:**
شكى للنبي ﷺ نسياناً يعتريه، فبسط النبي رداءه ودعا له ثم أمره بضمه لصدره، فلم ينسَ أبو هريرة حديثاً سمعه بعد ذلك أبداً. روى أكثر من ٥٣٧٤ حديثاً مسنداً معززاً للأمة شروح الفقه والمعاملات.

شغل منصب والي المدينة لفترات في عهد معاوية، ومات بالمدينة ودفن بالبقيع.`,
    longBioEn: `He is Abd al-Rahman ibn Sakhr al-Dusi, born in Yemen into the noble Azd tribe.

**The Life of Al-Suffah:**
He arrived in Medina in 7 AH during the Battle of Khaybar, fully embracing Islam. Homeless and impoverished, he chose to dwell in the Suffah area of the Prophet's Mosque, renouncing all wealth and commercial distraction to accomplish a single goal: documenting the words and deeds of the Prophet ﷺ.

**The Miracle of Memory:**
Having complained of forgetfulness, the Prophet ﷺ spread his cloak, made supplication, and instructed him to press the cloak to his chest. Abu Hurayrah never forgot a single word he heard thereafter. He preserved over 5,374 prophetic traditions.

He served as Governor of Medina at intervals under early Ummayads, and was laid to rest in al-Baqi.`,
    conversionAr: 'أسلم في اليمن على يد الطفيل بن عمرو الدوسي، ثم هاجر للمدينة سنة ٧ هـ ليلقى النبي ويلازمه.',
    conversionEn: 'Embraced Islam in Yemen via the calling of Tufayl ibn Amr al-Dusi, then migrated to Medina in 7 AH to devote himself to the Prophet.',
    achievementsAr: [
      'الحافظ الأكبر لحديث رسول الله ﷺ على الإطلاق (٥٣٧٤ حديثاً)',
      'سيد وعميد مدرسة الصفة لفقراء ومفرغي العلم بالمسجد النبوي',
      'دعاء النبي الكريم بمباركة حافظته وعدم النسيان'
    ],
    achievementsEn: [
      'The single most prolific narrator of Hadith in history (5,374 traditions)',
      'Senior resident and mentor of the Suffah sanctuary school for scholars',
      'Recipient of the Prophet\'s special prayer resulting in infallible retention'
    ],
    battles: ['khaybar', 'hunayn', 'tabuk'], // joined in 7 AH
    teachers: ['الرسول محمد ﷺ'],
    students: ['ابن عباس', 'ابن عمر', 'أنس بن مالك', 'سعيد بن المسيب', 'أبو سلمة'],
    famousHadiths: [
      {
        quoteAr: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: «قِيلَ يَا رَسُولَ اللَّهِ مَنْ أَسْعَدُ النَّاسِ بِشَفَاعَتِكَ يَوْمَ الْقِيَامَةِ؟ فَقَالَ: لَقَدْ ظَنَنْتُ أَنْ لَا يَسْأَلَنِي عَنْ هَذَا الْحَدِيثِ أَحَدٌ أَوَّلُ مِنْكَ لِمَا رَأَيْتُ مِنْ حِرْصِكَ عَلَى الْحَدِيثِ.. أَسْعَدُ النَّاسِ بِشَفَاعَتِي يَوْمَ الْقِيَامَةِ مَنْ قَالَ لَا إِلَهَ إِلَّا اللَّهُ خَالِصًا مِنْ قَلْبِهِ»',
        quoteEn: 'I offered, "O Messenger of Allah, who will be the happiest person with your intercession?" The Prophet said, "I thought that none would ask this before you, seeing your extreme eagerness to learn Hadiths. The happiest with my intercession will be the one who says \'La ilaha illa Allah\' sincerely from his heart."',
        reference: 'Sahih al-Bukhari 99'
      }
    ],
    sources: ['صحيح البخاري', 'صحيح مسلم', 'الذهبي - سير أعلام النبلاء', 'ابن حجر - التقريب'],
    library: ['أبو هريرة راوية الإسلام للدكتور عبد المنعم العلي', 'دفاع عن أبي هريرة للشيخ محمد عبد الرزاق حمزة'],
    historicalSignificanceAr: 'الشريان الروائي والتعليمي الأكبر الذي عبرت منه السنن القولية النبوية وصور المعيشة الشريفة لمصنفات الحديث الكبرى.',
    historicalSignificanceEn: 'The primary archival pipeline through which the verbal legacy and daily behavior of the Prophet was detailed and compiled into the core books of Islam.',
    confidenceLevel: 'High'
  },
  {
    id: 'salman_al_farsi',
    nameAr: 'سلمان الفارسي',
    nameEn: 'Salman al-Farsi',
    kunyaAr: 'أبو عبد الله',
    kunyaEn: 'Abu Abdullah',
    lineageAr: 'سلمان بن إسلام الفارسي (روزبه سابقاً)',
    lineageEn: 'Salman ibn al-Islam al-Farsi (formerly Rouzbeh)',
    titlesAr: ['الباحث عن الحقيقة', 'سلمان الخير', 'سلمان منا أهل البيت'],
    titlesEn: ['The Seeker of Truth', 'Salman of the Good', 'Salman is from us - the Ahl al-Bayt'],
    tribeAr: 'فارس (أصبهان)',
    tribeEn: 'Persian (Isfahan)',
    birthYearAH: -80, // Very long life
    deathYearAH: 36,
    ageAtDeath: 110, // approximate according to Dhahabi
    category: 'Scholars',
    cityAr: 'أصبهان / المدينة / المدائن',
    cityEn: 'Isfahan / Medina / Al-Mada\'in',
    hadithCount: 60,
    shortBioAr: 'الباحث المغامر عن الحقيقة، والمهندس العسكري صاحب مشورة حفر الخندق لحماية المدينة المنورة.',
    shortBioEn: 'The epic seeker of truth who traversed empires from Persia to Syria in search of the pure monotheism, famously masterminding the defensive trench at Medina.',
    longBioAr: `هو سلمان الفارسي رضي الله عنه، ولد في أصفهان بفارس لعائلة مجوسية ثرية من المزارعين وادعي "روزبه".

**رحلة البحث اللانهائية عن الدين:**
أبى عبادة النار وخرج باحثاً عن الحق، فاعتنق المسيحية وهجر بيته وتنقّل بين الرهبان من الموصل إلى نصيبين ثم عمورية، متتبعاً لعلامات نبي آخر الزمان. في رحلته تعرض للخيانة والبيع ليدور بين مالكين حتى استقر به الحال كعبد يعمل بنخيل المدينة المنورة لمالك يهودي.

**اللقاء المرتقب:**
عاين علامات النبوة الثلاث بالمدينة في النبي ﷺ (قبول الهدية، عدم أكل الصدقة، خاتم النبوة بين كتفيه)، فخر مستسلماً باكياً معلناً إسلامه. كاتبه النبي ﷺ بمال وغرس له المسلمون مئات النخلات ليعتق من الرق.

**عبقرية الخندق:**
في غزوة الأحزاب، أشرف المسلمون على الإبادة بحشد قريش وحلفائهم؛ فطرح سلمان خطة هندسية لم يعهدها العرب: «يا رسول الله، كنا بفارس إذا حوصرنا خندقنا علينا»، فحفر المسلمون خندقاً شل حركة العدو وفرض واقعاً عسكرياً مذهلاً أسس لنصر المسلمين، حتى تشاحن الأنسار والمهاجرون فيه حباً قائلين: «سلمان منا» فحسم النبي النزاع معلياً مقامه: «سلمان منا أهل البيت».

تولى لاحقاً إمارة المدائن في عهد عمر وتوفي بها فقيراً زاهداً ينسج الخوص بيده.`,
    longBioEn: `He is Salman al-Farsi, born in Isfahan, Persia, as "Rouzbeh" to a wealthy Zoroastrian priest.

**The Seeker of Truth:**
Rejecting fire-worship, he escaped home in search of pure faith. He adopted Christianity, studying under anchorites in Mosul, Nusaybin, and Amorium. Sold into slavery by treacherous guides, he was purchased by a Medinan merchant and worked in the date orchards.

**The Grand Meeting:**
He tested the Prophet ﷺ on three core marks of prophethood he had learned from his Christian teachers (refusing charity, accepting gifts, and the physical seal of prophethood on his back). Proclaiming his faith, the Prophet and companions financially sponsored his contracts of freedom.

**Genius of the Trench:**
During the siege of Medina (Al-Ahzab), 10,000 allied soldiers advanced. Salman formulated a Persian military defense: "O Messenger of Allah, in Persia, when we feared cavalry, we dug trenches." This strategic trench paralyzed the hostile forces, triggering their retreat. His esteemed position prompted the Prophet to declare: "Salman is one of us, the Ahl al-Bayt (the Household of the Prophet)."

He served as Governor of Ctesiphon (Al-Mada'in) under Umar, living an intensely ascetic life of manual labor until his passing.`,
    conversionAr: 'تتبع علامات النبوة حتى وجدها في شخص الرسول ﷺ بالمدينة المنورة، فأسلم وعمل النبي والصحابة على فك رقّه.',
    conversionEn: 'Systematically verified the marks of prophethood upon meeting the Prophet ﷺ in Medina, bought out of slavery through a collaborative effort of Medina.',
    achievementsAr: [
      'وضع الخطة الهندسية لحفر خندق المدينة وإنقاذ الكيان الإسلامي بالكامل',
      'حيازة شرف الانتساب ل آل البيت بشهادة النبي الكريم',
      'ترجمة أجزاء من القرآن للغة الفارسية كأول جهد ترجمة تاريخي للإسلام',
      'نشر الإسلام بالمدائن والعيش زاهداً براتب الصدقة مرتدياً ثوباً بسيطاً'
    ],
    achievementsEn: [
      'Drafted the military blueprints for digging the trench around Medina, saving the city',
      'Inducted into the honorary family of the "Ahl al-Bayt" by the Prophet ﷺ',
      'Translated parts of the Holy Quran into Persian, pioneering native translation',
      'Governed the ancient Persian capital Ctesiphon with absolute ascetic simplicity'
    ],
    battles: ['khandaq', 'khaybar', 'hunayn', 'tabuk'], // was a slave during Badr and Uhud
    teachers: ['الرسول محمد ﷺ'],
    students: ['ابن عباس', 'أنس بن مالك', 'أبو الطفيل', 'الحسن البصري'],
    famousHadiths: [
      {
        quoteAr: 'مَشَى سَلْمَانُ معَ رَجُلٍ فَوَجَدَ جُوعاً فَقَالَ: «صَلِّ بكَ فَإِنَّ فِي الصَّلاَةِ شِفَاءً»',
        quoteEn: 'Salman said, "Give priority to your prayer, for indeed, in prayer there lies cure and spiritual healing."',
        reference: 'Musannaf Ibn Abi Shaybah 3450'
      }
    ],
    sources: ['صحيح البخاري', 'ابن سعد - الطبقات الكبرى', 'أبو نعيم - حلية الأولياء'],
    library: ['سلمان الفارسي الباحث عن الحقيقة لعبد الحميد جودة السحار', 'سيرة سلمان الخير للندوي'],
    historicalSignificanceAr: 'رمز عالمية الرسالة الإسلامية وتلاقح الخبرات العسكرية والحضارية بين الشرق وفارس وبلاد العرب.',
    historicalSignificanceEn: 'The definitive symbol of the global, non-racial appeal of Islam, fusing advanced military science and Persian concepts with Arab defense structures.',
    confidenceLevel: 'High'
  },
  {
    id: 'anas_bin_malik',
    nameAr: 'أنس بن مالك',
    nameEn: 'Anas ibn Malik',
    kunyaAr: 'أبو حمزة',
    kunyaEn: 'Abu Hamza',
    lineageAr: 'أنس بن مالك بن النضر الخزرجي الأنصاري',
    lineageEn: 'Anas ibn Malik ibn al-Nadr al-Khazraji al-Ansari',
    titlesAr: ['خادم رسول الله'],
    titlesEn: ['Khadim Rasul Allah (Servant of the Messenger of Allah)'],
    tribeAr: 'بنو النجار - الخزرج (الأنصار)',
    tribeEn: 'Banu al-Najjar - Khazraj (Ansar)',
    birthYearAH: -10, // 10 BH
    deathYearAH: 93,
    ageAtDeath: 103, // Blessed with long life
    category: 'Ansar',
    cityAr: 'المدينة المنورة / البصرة',
    cityEn: 'Medina / Basra',
    hadithCount: 2286,
    shortBioAr: 'خادم الرسول المقرب طيلة عشر سنوات بالمدينة، والمحدث الحافظ صاحب البركة والنسل الوفير بدعاء النبي له.',
    shortBioEn: 'The personal companion and domestic aide of the Prophet ﷺ for ten continuous years in Medina, and the third most prolific narrator of Hadith.',
    longBioAr: `هو أنس بن مالك الخزرجي الأنصاري. عندما وصل النبي ﷺ إلى المدينة مسلماً، أخذته أمه أم سليم رضي الله عنها إليه وهو ابن عشر سنين فقالت: «يا رسول الله، هذا أنس غلامك يخدمك، فادعُ له».

**الخدمة الشريفة:**
خدم النبي ﷺ عشر سنين كاملة، وعومِل بمنتهى العطف والأدب الشريف، حيث قال أنس واصفاً نبل أخلاق النبي: «خدمتُ رسولَ اللهِ ﷺ عشرَ سنينَ، واللهِ ما قال لي: أُفٍّ قطُّ، ولا قال لي لشيءٍ صنعتُه: لِمَ صنعتَه؟ ولا لشيءٍ تركتُه: لِمَ تركتَه؟».

**بركة الدعاء النبوي:**
دعا له النبي ﷺ بالبركة الشاملة قائلاً: «اللَّهُمَّ أَكْثِرْ مَالَهُ، وَوَلَدَهُ، وَبَارِكْ لَهُ فِيمَا أَعْطَيْتَهُ»، فكان رضي الله عنه أثرى الأنصار مالاً، وأكثرهم ولداً وأطولهم عمراً، ومات وله مئات الأولاد والأحفاد.

عقب وفاة الرسول بقرن كامل، استقر بالبصرة لتعليم الناس شؤون دينهم، فكان آخر من مات بالبصرة من الصحابة الكرام.`,
    longBioEn: `He is Anas ibn Malik al-Khazraji al-Ansari. Following the Prophet\'s migration to Medina, his mother Umm Sulaym presented her 10-year-old son, offering: "O Messenger of Allah, this is Anas, your servant; please make supplication for him."

**Deeds of Sublime Compassion:**
He attended to the Prophet\'s domestic needs for ten uninterrupted years, treated with incredible gentleness, inspiring Anas to observe: "I served the Prophet ﷺ for ten years. By Allah, he never once expressed impatience (Uff) to me, nor did he criticize anything I did or left undone."

**The Prophetic Supplication:**
The Prophet prayed: "O Allah, increase his wealth and children, and bless whatever you bestow upon him." Consequently, Anas became exceptionally wealthy, had over a hundred children and grandchildren, and lived a highly blessed life.

He later relocated to Basra, Iraq, to lecture on Jurisprudence and Hadith, passing away as the last surviving companion in the region.`,
    conversionAr: 'أسلم صبياً بالمدينة المنورة فور هجرة المصطفى ﷺ وقدمته والدته أم سليم لخدمة النبي.',
    conversionEn: 'Embraced Islam as a child in Medina immediately after the Hijra, presented by his dedicated mother Umm Sulaym.',
    achievementsAr: [
      'ملازمة وخدمة النبي ﷺ عشر سنوات كاملة وفهم تفاصيل أخلاقه البيتية',
      'ثالث أكثر رواة الحديث النبوي الشريف في تاريخ الأمة (٢٢٨٦ حديثاً)',
      'نيل البركة في العمر والمال والنسل بدعاء مخصص من النبي ﷺ',
      'مفتي ومحدث البصرة الأكبر كآخر صحابي يتوفى فيها'
    ],
    achievementsEn: [
      'Personally served the Prophet ﷺ for ten historic years, recording domestic details',
      'Third most prolific narrator of Hadith in Islamic history (2,286 traditions)',
      'Recipient of miraculous longevity and offspring via dedicated Prophetic prayer',
      'The foundational teacher and last surviving companion of Basra'
    ],
    battles: ['badr', 'khandaq', 'khaybar', 'hunayn'], // as a boy transport water in Badr
    teachers: ['الرسول محمد ﷺ'],
    students: ['الحسن البصري', 'ابن سيرين', 'قتادة', 'ثابت البناني', 'الزهري'],
    famousHadiths: [
      {
        quoteAr: 'قَالَ رَسولُ اللَّهِ ﷺ: «لا يُؤْمِنُ أحَدُكُمْ، حتَّى أكونَ أحَبَّ إلَيْهِ من والِدِهِ ووَلَدِهِ والنَّاسِ أجْمَعِينَ»',
        quoteEn: 'The Messenger of Allah ﷺ asserted, "None of you will believe until I am more beloved to him than his father, his children, and all of mankind."',
        reference: 'Sahih al-Bukhari 15'
      }
    ],
    sources: ['صحيح البخاري', 'صحيح مسلم', 'الذهبي - سير أعلام النبلاء'],
    library: ['مسند أنس بن مالك رضي الله عنه', 'أنس بن مالك خادم الرسول لعبد الحميد جودة السحار'],
    historicalSignificanceAr: 'يمثّل المرجع الفقهي والبيتي الأول في نقل أخلاقيات النبي ومثاليته التربوية في التعامل مع الأطفال والأسر.',
    historicalSignificanceEn: 'Standard reference on the household practices, child pedagogical methods, and daily ethics of the Prophet.',
    confidenceLevel: 'High'
  },
  {
    id: 'hamza_bin_abd_al_muttalib',
    nameAr: 'حمزة بن عبد المطلب',
    nameEn: 'Hamza ibn Abd al-Muttalib',
    kunyaAr: 'أبو عمارة',
    kunyaEn: 'Abu Umarah',
    lineageAr: 'حمزة بن عبد المطلب بن هاشم الهاشمي القرشي',
    lineageEn: 'Hamza ibn Abd al-Muttalib ibn Hashim al-Hashimi al-Qurashi',
    titlesAr: ['أسد الله', 'سيد الشهداء'],
    titlesEn: ['Asadullah (Lion of Allah)', 'Sayyid al-Shuhada (Master of Martyrs)'],
    tribeAr: 'بنو هاشم (قريش)',
    tribeEn: 'Banu Hashim (Quraish)',
    birthYearAH: -53, // 53 BH
    deathYearAH: 3,   // Martyred in Uhud
    ageAtDeath: 56,
    category: 'Ahl_al_Bayt',
    cityAr: 'مكة المكرمة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 0,
    shortBioAr: 'عم النبي ﷺ وأخوه من الرضاعة، البطل المغوار والدرع المدافع عن الرسول وأول حامل لراية سرية عسكرية.',
    shortBioEn: 'The paternal uncle and foster brother of the Prophet ﷺ, a legendary Quraishi warrior whose conversion fortified the early Muslims, martyred at Uhud.',
    longBioAr: `هو حمزة بن عبد المطلب الهاشمي القرشي، عم رسول الله ﷺ وأخوه من الرضاعة وصديق طفولته. كان بطلاً، شجاعاً، صياداً مهاباً للأسود، وأحد أعز فرسان قريش عزةً وكرامة.

**إسلامه الحاسم:**
أسلم في السنة السادسة من البعثة دافعاً عن ابن أخيه ﷺ؛ حين بلغه أن أبا جهل سبّ النبي وآذاه، ذهب حمزة لأبي جهل في ملأ من قريش وشج رأسه بقوسه قائلاً بكل حزم: «أتشتمه وأنا على دينه أقول ما يقول؟ فرد ذلك علي إن استطعت»، فلم يجرؤ أحد على الحراك. شكل إسلامه رفقة عمر نقطة تحول كبحت جماح قريش عن أذية الرسول.

**الجهاد والاستشهاد:**
هاجر للمدينة، وكان أول من عقد له النبي ﷺ لواء لسرية عسكرية (سرية سيف البحر). دمر فرسان المشركين في صفوف معركة بدر الكبرى كبطل مغوار وصاحب راية النصر.

**يوم أحد:**
في غزوة أحد تتبعته عيون قريش ثأراً لأشرافهم، فوظف جبير بن مطعم غلامه الحبشي "وحشي بن حرب" الماهر بالرماية لقتله مقابل عتقه. استهدفه وحشي بحربة غادرة وهو يصول ويجول في الميدان فمات شهيداً بطلاً، ومثّلت هند بنت عتبة بجثمانه الشريف في مشهد أحزن النبي والمصحة حزناً غامراً، فلقبه النبي بـ "سيد الشهداء".`,
    longBioEn: `He is Hamza ibn Abd al-Muttalib al-Hashimi al-Qurashi, the uncle of the Prophet ﷺ, his foster brother, and childhood companion. A famous huntsman of lions, renowned for his strength and pride.

**The Decisive Conversion:**
In 6 BH, upon hearing that Abu Jahl had verbally assaulted the Prophet, Hamza confronted Abu Jahl in the Kaaba assembly, striking him with his bow and declaring: "Do you insult him when I follow his religion? Oppose me if you dare!" None stood to challenge him. His conversion, combined with Umar\'s, provided a protective screen for the early community.

**Hero of Badr and Martyr of Uhud:**
He migrated to Medina and commanded the early maritime expedition of Seif al-Bahr. In the Battle of Badr, he spearheaded the combat lines.

During the Battle of Uhud, the Quraish targeted him to avenge their dead. They hired "Wahshi ibn Harb", an Abyssinian slave skilled in javelin throws, offering him freedom. Wahshi ambushed Hamza mid-combat with a fatal throw. His body was afterward mutilated, drawing tears from his nephew, the Prophet ﷺ, who named him "The Master of Martyrs".`,
    conversionAr: 'أسلم حمزة في السنة السادسة من البعثة غضباً ودفاعاً عن رسول الله ﷺ بعد أذية أبي جهل له، فصار عزا للإسلام.',
    conversionEn: 'Embraced Islam in 6 BH, defending the Prophet from Abu Jahl\'s public insults, significantly shifting power dynamics.',
    achievementsAr: [
      'زلزلة قريش بإعلان إسلامه وتوفير الأمان النسبي للمستضعفين بمكة',
      'حمل أول لواء عسكري يعقده النبي ﷺ في الإسلام (سرية سيف البحر)',
      'التبسيل وقتل المشركين في حومة معركة بدر الكبرى',
      'نيل وسام «سيد الشهداء» و «أسد الله ورسوله» غداة استشهاده بأحد'
    ],
    achievementsEn: [
      'Fortified the early mission in Mecca via his high-profile conversion',
      'Carried the first military standard commissioned by the Prophet ﷺ',
      'Played a pivotal offensive role in the historic victory of Badr',
      'Honored with the titles "Lion of Allah" and "Master of Martyrs" after Uhud'
    ],
    battles: ['badr', 'uhud'],
    teachers: ['الرسول محمد ﷺ'],
    students: [],
    famousHadiths: [
      {
        quoteAr: 'قَالَ رَسولُ اللَّهِ ﷺ لَمَّا وَقَفَ عَلَى جُثْمَانِ حَمْزَةَ: «رَحْمَةُ اللَّهِ عَلَيْكَ، لَقَدْ كُنْتَ وَصُولًا لِلرَّحِمِ، فَعُولًا لِلْخَيْرَاتِ»',
        quoteEn: 'Standing over Hamza\'s martyrdom site, the Prophet ﷺ wept: "May Allah have mercy upon you, for indeed you kept ties of kinship and were always active in doing good deeds."',
        reference: 'Tabaqat Ibn Sa\'d 3/12'
      }
    ],
    sources: ['صحيح البخاري', 'ابن الأثير - أسد الغابة', 'ابن هشام - السيرة النبوية'],
    library: ['أسد الله حمزة بن عبد المطلب لعبد الحميد السحار', 'سيد الشهداء حمزة بن عبد المطلب لعبد العزيز الشناوي'],
    historicalSignificanceAr: 'شكّل إسلامه الضمان والدرع القيادي لبني هاشم، ومثلت شهادته الملحمة التضحوية الكبرى لغزوة أحد.',
    historicalSignificanceEn: 'His prestige established a defensive shield for the early mission in Mecca, and his demise became the defining tragedy of Uhud.',
    confidenceLevel: 'High'
  },
  {
    id: 'abu_ubaydah_bin_al_jarrah',
    nameAr: 'أبو عبيدة بن الجراح',
    nameEn: 'Abu Ubaydah ibn al-Jarrah',
    kunyaAr: 'أبو عبيدة',
    kunyaEn: 'Abu Ubaydah',
    lineageAr: 'عامر بن عبد الله بن الجراح الحارثي الفهري القرشي',
    lineageEn: 'Aamir ibn Abdullah ibn al-Jarrah al-Fihri al-Qurashi',
    titlesAr: ['أمين الأمة', 'من العشرة المبشرين بالجنة'],
    titlesEn: ['Amin al-Ummah (The Trustworthy of the Nation)', 'One of the Ten Promised Paradise'],
    tribeAr: 'بنو الحارث بن فهر (قريش)',
    tribeEn: 'Banu al-Harith ibn Fihr (Quraish)',
    birthYearAH: -40,
    deathYearAH: 18,
    ageAtDeath: 58,
    category: 'Military',
    cityAr: 'مكة / المدينة المنورة / الشام',
    cityEn: 'Mecca / Medina / Levant',
    hadithCount: 15,
    shortBioAr: 'أمين الأمة الإسلامية، وفاتح الديار الشامية، وأحد العشرة المبشرين بالجنة، وصاحب الزهد والورع العظيم.',
    shortBioEn: 'The "Trustworthy of this Ummah", conqueror of the Levant, one of the ten promised Paradise, known for extreme asceticism and devotion.',
    longBioAr: `هو عامر بن عبد الله بن الجراح الفهري القرشي، المشهور بـ أبا عبيدة. ولد في مكة المكرمة في بيت شريف ونبيل. أسلم مبكراً في الأيام الأولى على يد أبي بكر الصديق.
    كان من المهاجرين الأوائل وثبت مع رسول الله ﷺ في أشد المواقف كغزوة أحد حيث سحب بصلابة الحلقتين المغروستين في وجنته الشريفة ﷺ بأسنانه حتى سقطت ثناياه.
    عينه عمر بن الخطاب رضي الله عنه قائداً عاماً لجيوش الشام في الفتوحات بدلاً من خالد بن الوليد، وهو ما قبله خالد بصدر رحب وأثنى عليه، وقسم أبو عبيدة الشام ولايات آمنة وعاش زاهداً رافضاً لرفاه الملوك حتى توفي غارقاً في دموع أصحابه إثر إصابته بطاعون عمواس بالشام.`,
    longBioEn: `He is Aamir ibn Abdullah ibn al-Jarrah al-Fihri al-Qurashi, famously known as Abu Ubaydah. Born to a respected and reputable Quraishi lineage, he responded to Abu Bakr's early call.
    Being an early veteran who migrated to Abyssinia and Medina, he distinguished himself in combat at Badr and Uhud. At Uhud, he used his own teeth to pluck out the helmet links deeply wedged into the Prophet's cheeks.
    Caliph Umar appointed him supreme commander of all Syrian invasion sectors, succeeding Khalid ibn al-Walid. This transfer was accepted gracefully by both heroes. Abu Ubaydah set early operational paradigms of religious tolerance, living with minimal properties until he succumbed to the Plague of Amwas.`,
    conversionAr: 'أسلم في الأيام الأولى للدعوة على يد أبي بكر الصديق، وهاجر للحبشة ثم للمدينة وعاش مدافعاً عن التوحيد.',
    conversionEn: 'Embraced Islam in its earliest days through Abu Bakr al-Siddiq, and migrated to Abyssinia and then Medina.',
    achievementsAr: [
      'تولي القيادة العامة لفتوحات الشام في عهد الفاروق عمر وعصم دماء المحتمين',
      'الحصول على وسام الأمانة من فم رسول الله ﷺ كأمين هذه الأمة',
      'إظهار الزهد والنزاهة المطلقة بتفضيل العيش البسيط وخدمة رعايا الشام'
    ],
    achievementsEn: [
      'Served as the supreme commander of Syrian forces under Caliph Umar',
      'Honored with the exclusive title "Trustworthy of this Nation" by the Prophet',
      'Demonstrated supreme asceticism, prioritizing public welfare and active duty'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['عمر بن الخطاب', 'عبد الله بن عباس', 'جابر بن عبد الله'],
    famousHadiths: [
      {
        quoteAr: 'قال رسول الله ﷺ: «إنَّ لِكُلِّ أُمَّةٍ أَمِينًا، وَأَمِينُ هذِه الأُمَّةِ أَبُو عُبَيْدَةَ بنُ الجَرَّاحِ»',
        quoteEn: 'The Prophet ﷺ said: "Every nation has a trustworthy guardian, and the trustworthy guardian of this nation is Abu Ubaydah ibn al-Jarrah."',
        reference: 'Sahih al-Bukhari 3744'
      }
    ],
    sources: ['صحيح البخاري', 'ابن سعد - الطبقات الكبرى', 'الذهبي - سير أعلام النبلاء'],
    library: ['أمين الأمة أبو عبيدة بن الجراح لمحمد رضا', 'سير أعلام النبلاء للذهبي'],
    historicalSignificanceAr: 'قاد قوات الفتح الإسلامي بالشام وأرسى دعائم العدالة والمواساة العظمى ببلاد الشام حتى وافته المنية في طاعون عمواس.',
    historicalSignificanceEn: 'Led the Islamic conquests of Syria, establishing governance structures of justice until his death during the Plague of Amwas.',
    confidenceLevel: 'High'
  },
  {
    id: 'abdur_rahman_bin_awf',
    nameAr: 'عبد الرحمن بن عوف',
    nameEn: 'Abdur-Rahman ibn Awf',
    kunyaAr: 'أبو محمد',
    kunyaEn: 'Abu Muhammad',
    lineageAr: 'عبد الرحمن بن عوف بن عبد عوف الزهري القرشي',
    lineageEn: 'Abdur-Rahman ibn Awf ibn Abd Awf al-Zuhri al-Qurashi',
    titlesAr: ['من العشرة المبشرين بالجنة', 'أحد الستة أصحاب الشورى'],
    titlesEn: ['One of the Ten Promised Paradise', 'One of the Six Members of Umar\'s Shura Council'],
    tribeAr: 'بنو زهرة (قريش)',
    tribeEn: 'Banu Zuhrah (Quraish)',
    birthYearAH: -43,
    deathYearAH: 32,
    ageAtDeath: 75,
    category: 'Muhajirun',
    cityAr: 'مكة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 65,
    shortBioAr: 'التاجر الصدوق الصابر، وأحد العشرة المبشرين بالجنة، الذي بدأ تجارته بالمدينة من الصفر ووزع ثروته في سبيل الله.',
    shortBioEn: 'A phenomenally successful merchant-philanthropist, one of the ten promised Paradise, who built his business in Medina from scratch and donated major parts of his wealth.',
    longBioAr: `هو عبد الرحمن بن عوف الزهري ولد في مكة بعد عام الفيل بعشر سنين. كان تاجراً ذكياً لبيباً، يتميز بالأمانة والخلق الرفيع والشرف والصدق.
    أسلم في وقت مبكر جداً على يد الصديق، وعانى من ويلات قريش حتى هاجر هجرتين. ولما وصل للمدينة المنورة فخيراً بين تقاسم مال أخيه من الأنصار سعد بن الربيع، شكره قائلاً بحكمة وثقة: «دلوني على السوق».
    فانطلق وتاجر وبنى إمبراطورية تجارية ضخمة جعلها سبيلاً لخدمة الفقراء وعامة الناس ودعم الغزوات، وتصدق بنصف ماله مراراً وجهز قوافل عملاقة لتأمين المدينة، واختتم حياته المباركة بتفضيل التنحي وإدارة الشورى لاختيار عثمان كطرف محايد وموثوق.`,
    longBioEn: `He is Abdur-Rahman ibn Awf al-Zuhri, born in Mecca 10 years after the Year of the Elephant. A gifted merchant and visionary who built his commerce on honesty.
    An early adopter of Islam via Abu Bakr, he migrated first to Abyssinia, then Medina. When proposed a total wealth partition by his Ansar brother Saad ibn al-Rabi, he politely declined with his iconic words: "Just direct me to the marketplace."
    He built a mercantile empire, utilizing his vast profits for social care, funding expeditions, and setting up massive supply caravans. He steered the critical post-Umar executive vacuum, voluntarily foregoing his own nomination to impartially lead the Shura choosing Uthman.`,
    conversionAr: 'كان من أول ثمانية دخلوا الإسلام على يد أبي بكر الصديق، معلناً ولاءه لله والرسول الكريم بشكل عظيم.',
    conversionEn: 'Was among the first eight people to embrace Islam through Abu Bakr al-Siddiq.',
    achievementsAr: [
      'تمويل غزوات وجيوش الإسلام وتجهيز قوافل الدعم الكبرى بالكامل من ماله',
      'عتق مئات العبيد والمستضعفين لتوحيد الله وتأسيس الأوقاف المالية والغذائية',
      'تولي لجنة الشورى لاختيار الخليفة الثالث بعد استشهاد عمر بن الخطاب بنجاح ونزاهة وسرية'
    ],
    achievementsEn: [
      'Funded military expeditions and equipped major relief caravans',
      'Emancipated hundreds of slaves and founded financial trusts for charity support',
      'Successfully facilitated the Shura council to select the third Caliph with absolute neutrality and wisdom'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['ابن مسعود', 'ابن عباس', 'ابن عمر', 'أنس بن مالك'],
    famousHadiths: [
      {
        quoteAr: 'سمعت رسول الله ﷺ يقول: «أَبُو بَكْرٍ فِي الْجَنَّةِ، وَعُمَرُ فِي الْجَنَّةِ، وَعُثْمَانُ فِي الْجَنَّةِ، وَعَلِيٌّ فِي الْجَنَّةِ، وَطَلْحَةُ فِي الْجَنَّةِ، وَالزُّبَيْرُ فِي الْجَنَّةِ، وَعَبْدُ الرَّحْمَنِ بْنُ عَوْفٍ فِي الْجَنَّةِ...»',
        quoteEn: 'I heard the Prophet ﷺ saying: "Abu Bakr is in Paradise, Umar is in Paradise, Uthman is in Paradise, Ali is in Paradise, Talha is in Paradise, Zubayr is in Paradise, Abdur-Rahman ibn Awf is in Paradise..."',
        reference: 'Jami` at-Tirmidhi 3747'
      }
    ],
    sources: ['صحيح البخاري', 'ابن كثير - البداية والنهاية', 'ابن سعد - الطبقات الكبرى'],
    library: ['عبد الرحمن بن عوف لأحمد خليل جمعة', 'سير أعلام النبلاء للذهبي'],
    historicalSignificanceAr: 'مثّل نموذجاً إسلامياً رائداً في الاقتصاد والتجارة الأخلاقية، وكان وسيط الاستقرار في اختيار الخليفة العثماني.',
    historicalSignificanceEn: 'Represented a pioneered Islamic model in ethical trade, and served as the key mediator of stability in appointing the third Caliph.',
    confidenceLevel: 'High'
  },
  {
    id: 'saad_bin_abi_waqqas',
    nameAr: 'سعد بن أبي وقاص',
    nameEn: 'Saad ibn Abi Waqqas',
    kunyaAr: 'أبو إسحاق',
    kunyaEn: 'Abu Ishaq',
    lineageAr: 'سعد بن مالك بن وهيب بن عبد مناف الزهري القرشي',
    lineageEn: 'Saad ibn Malik ibn Wuhayb al-Zuhri al-Qurashi',
    titlesAr: ['مستجاب الدعوة', 'فارس القادسية', 'خال النبي ﷺ'],
    titlesEn: ['The One whose Prayers are Answered', 'Knight of al-Qadisiyyah', 'Maternal Uncle of the Prophet'],
    tribeAr: 'بنو زهرة (قريش)',
    tribeEn: 'Banu Zuhrah (Quraish)',
    birthYearAH: -23,
    deathYearAH: 55,
    ageAtDeath: 78,
    category: 'Military',
    cityAr: 'مكة / المدينة المنورة / الكوفة',
    cityEn: 'Mecca / Medina / Kufa',
    hadithCount: 271,
    shortBioAr: 'بطل معركة القادسية، وفاتح بلاد فارس والعراق، وأحد العشرة المبشرين بالجنة، وأول من رمى بسهم في سبيل الله.',
    shortBioEn: 'The champion of the Battle of al-Qadisiyyah, conqueror of Persia and Iraq, one of the ten promised Paradise, and the first to fire an arrow for the sake of Islam.',
    longBioAr: `هو سعد بن مالك بن أهيب الزهري، ولد في مكة ونشأ يتدرب على الرماية وصنع القسي والصيد. كان شجاعاً فخوراً كونه خالاً لرسول الله ﷺ، حتى أن النبي ﷺ كان يداعبه بكل فخر قائلاً: «هذا خالي فليرني امرؤ خاله».
    أسلم في السابعة عشرة من عمره، وكان يمتلك ميزة عظيمة وهي استجابة دعائه ببركة دعوة النبي ﷺ له: «اللهم سدد رميته، وأجب دعوته».
    قاد المعركة التاريخية الفاصلة "معركة القادسية" ضد جيش الفرس بقيادة رستم، وحسم النصر للمسلمين، وافتتح المدائن وبنى الكوفة كعاصمة لإقليم الفرات والعراق، وتوفي في قصره بالعقيق كآخر من مات من المهاجرين الشرفاء.`,
    longBioEn: `He is Saad ibn Malik (Abi Waqqas) al-Zuhri, born in Mecca. He mastered bow-making and hunting during youth. The Prophet ﷺ held him in high esteem, famously boasting: "This is my maternal uncle, let any man show me his maternal uncle!"
    He converted at seventeen. Due to a specific Prophetic blessing ("O Allah, steady his aim and answer his prayers"), his dues were legendary.
    He orchestrated the colossal clash of al-Qadisiyyah against Rustum, putting an end to the Sassanid hegemony in Iraq. He went on to build Kufa, passing away near Medina as the last of the Muhajirun in 55 AH.`,
    conversionAr: 'أسلم وهو شاب في السابعة عشرة من عمره كأحد السابقين للإسلام بروح فتية متوقدة.',
    conversionEn: 'Embraced Islam as a youth of seventeen, becoming one of the earliest believers.',
    achievementsAr: [
      'قيادة جيش المسلمين في معركة القادسية الخالدة وإسقاط الإمبراطورية الساسانية بجدارة وقوة وبصيرة',
      'تأسيس وبناء مَصر ومدينة الكوفة بالعراق لتكون مركز إشعاع فكري وحضاري وهندسي متقدم',
      'أول من أراق دماً وأول من رمى بسهم دفاعاً عن بيضة الإسلام بمكة المكرمة في أولى مراحل الضيق'
    ],
    achievementsEn: [
      'Commanded the Muslim forces at the decisive Battle of al-Qadisiyyah, overrunning the Sassanid armies',
      'Founded and built the hub city of Kufa in Iraq under instructions from Caliph Umar',
      'First to shed blood and fire an arrow defensively for the Muslim mission in Mecca'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['ابن عباس', 'ابن عمر', 'عائشة بنت أبي بكر', 'سعيد بن المسيب'],
    famousHadiths: [
      {
        quoteAr: 'عن النبي ﷺ قال يوم أُحُدٍ لِسَعْدٍ: «ارْمِ سَعْدُ فِدَاكَ أَبِي وَأُمِّي»',
        quoteEn: 'On the day of Uhud, the Prophet ﷺ urged him: "Shoot, O Saad! May my father and mother be sacrificed for you!"',
        reference: 'Sahih al-Bukhari 2901'
      }
    ],
    sources: ['صحيح البخاري', 'تاريخ الطبري', 'ابن كثير - البداية والنهاية'],
    library: ['سعد بن أبي وقاص بطل القادسية للدكتور الصلابي', 'أسد الغابة في معرفة الصحابة لابن الأثير'],
    historicalSignificanceAr: 'أنهى النفوذ العسكري والسياسي للإمبراطورية الفارسية الكبرى بالشرق، وبنى صروحاً حضارية كمدينة الكوفة ومساجدها الشريفة.',
    historicalSignificanceEn: 'Terminated the military power of the Persian Empire, and built Islamic civilization centers such as Kufa.',
    confidenceLevel: 'High'
  },
  {
    id: 'muadh_bin_jabal',
    nameAr: 'معاذ بن جبل',
    nameEn: 'Muadh ibn Jabal',
    kunyaAr: 'أبو عبد الرحمن',
    kunyaEn: 'Abu Abd al-Rahman',
    lineageAr: 'معاذ بن جبل بن عمرو بن أوس الخزرجي الأنصاري',
    lineageEn: 'Muadh ibn Jabal ibn Amr ibn Aws al-Khazraji al-Ansari',
    titlesAr: ['أعلم الأمة بالحلال والحرام', 'إمام العلماء يوم القيامة'],
    titlesEn: ['The Most Knowledgeable of Halal & Haram', 'The Leader of Scholars on Judgement Day'],
    tribeAr: 'بنو خزرج (الأنصار)',
    tribeEn: 'Banu Khazraj (Ansar)',
    birthYearAH: -18,
    deathYearAH: 18,
    ageAtDeath: 36,
    category: 'Scholars',
    cityAr: 'المدينة المنورة / اليمن / الشام',
    cityEn: 'Medina / Yemen / Levant',
    hadithCount: 157,
    shortBioAr: 'سيد علم الفقه والاجتهاد، الذي أرسله النبي ﷺ قاضياً ومعلماً لليمن، ووصفه بأنه أعلم من في الأمة بالحلال والحرام.',
    shortBioEn: 'A master jurist of Islam who was sent by the Prophet ﷺ to Yemen as a judge and teacher. Described by the Prophet as the best in the Ummah in knowing Halal and Haram.',
    longBioAr: `هو معاذ بن جبل الأنصاري الخزرجي، ولد في المدينة المنورة وأسلم وهو ابن ثماني عشرة سنة. كان جميلاً، وضيء الوجه، واسع العينين، وإذا تكلم دهش السامعين بعميق فقهه وعقله المتقد وأدبه السامي.
    بايع النبي في بيعة العقبة الثانية، وشهد المشاهد كلها بثبات وبلاء باهر. تميز بفهمه الدقيق لمقاصد الدين والترغيب والترهيب، فوصفه النبي ﷺ بأنه أعلم الأمة بالحلال والحرام.
    أرسله النبي ﷺ إلى اليمن كأول مبعوث ومعلم وموجه ديني وقاضٍ، ورسم معه قواعد الاجتهاد القضائي. ثم وجهه أمير المؤمنين عمر إلى الشام فقهاً ومعلماً حتى مات شهيد الطاعون بعمواس وهو شاب في ريعان العطاء والشباب.`,
    longBioEn: `He is Muadh ibn Jabal al-Khazraji, born in Medina. Converting at eighteen, he was known for physical grace and mesmerizing eloquence.
    He attested to the Second Aqabah pledge and survived every major battle. Possessing unique interpretative logic, the Prophet designated him as the ultimate yardstick of lawful (Halal) and forbidden (Haram) actions.
    The Prophet ﷺ commissioned him to Yemen as chief diplomat, educator, and state representative, endorsing his template of judicial reasoning. Under Caliph Umar, he moved to Syria to supervise education, dying of the plague at thirty-six.`,
    conversionAr: 'شهد بيعة العقبة الثانية وهو فتى يافع واسلم على يد مصعب بن عمير بالمدينة المنورة المباركة.',
    conversionEn: 'Participated in the Second Treaty of Aqabah as a youth and accepted Islam through Mus\'ab ibn Umayr.',
    achievementsAr: [
      'إرساله كأول مبعوث قضائي وقائد ديني لملوك وقبائل اليمن لتعليم الناس ونشر الإسلام الحنيف وسد فجوات الفتوى',
      'المشاركة في حفظ وتفسير القرآن الكريم في عهد النبي ﷺ وعرضه على المقرئين بالمدينة المنورة وحل الإشكالات',
      'إرساء معايير القياس الفقهي والاجتهاد العقلي في غياب النص المباشر بموافقة ودعاء وتزكية الرسول ﷺ'
    ],
    achievementsEn: [
      'Commissioned as the first judicial, economic, and educational diplomat to Yemen to instruct tribes',
      'Helped compile, read, and explain the Quran during the Prophet\'s lifetime in Medina',
      'Formulated the crucial basis of analogical reasoning (Ijtihad) with the explicit approval and pleasure of the Prophet'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['عبد الله بن عباس', 'عبد الله بن عمر', 'أبو موسى الأشعري', 'عبد الرحمن بن غنم'],
    famousHadiths: [
      {
        quoteAr: 'قال رسول الله ﷺ: «أَعْلَمُ أُمَّتِي بِالْحَلَالِ وَالْحَرَامِ مُعَاذُ بْنُ جَبَلٍ»',
        quoteEn: 'The Prophet ﷺ said: "The most knowledgeable of my nation concerning the lawful and the prohibited is Muadh ibn Jabal."',
        reference: 'Jami` at-Tirmidhi 3790'
      }
    ],
    sources: ['صحيح مسلم', 'الذهبي - سير أعلام النبلاء', 'ابن سعد - الطبقات الكبرى'],
    library: ['معاذ بن جبل إمام العلماء لأحمد خليل جمعة', 'تراجم رجال السيرة لدار الحديث والمؤلفات التاريخية'],
    historicalSignificanceAr: 'أرسى أصول البحث والاجتهاد والقياس الفقهي في رسالته القضائية باليمن، واستشهد في طاعون الشام شاباً.',
    historicalSignificanceEn: 'Laid the early methodology of legal reasoning (Ijtihad) in his judicial manual in Yemen, dying young during the plague in Syria.',
    confidenceLevel: 'High'
  },
  {
    id: 'abdullah_bin_masood',
    nameAr: 'عبد الله بن مسعود',
    nameEn: 'Abdullah ibn Masood',
    kunyaAr: 'أبو عبد الرحمن',
    kunyaEn: 'Abu Abd al-Rahman',
    lineageAr: 'عبد الله بن مسعود بن غافل الهذلي',
    lineageEn: 'Abdullah ibn Masood ibn Ghafil al-Hudhali',
    titlesAr: ['صاحب السواد والنعلين', 'فقيه الأمة الكبرى', 'أول من جهر بالقرآن بمكة'],
    titlesEn: ['Keeper of the Secret & Shoes', 'The Grand Sage of the Nation', 'First to Recite Quran Openly in Mecca'],
    tribeAr: 'بنو هذيل (حليف قريش)',
    tribeEn: 'Banu Hudhayl (Allied with Quraish)',
    birthYearAH: -38,
    deathYearAH: 32,
    ageAtDeath: 70,
    category: 'Scholars',
    cityAr: 'مكة / المدينة المنورة / الكوفة',
    cityEn: 'Mecca / Medina / Kufa',
    hadithCount: 848,
    shortBioAr: 'الفقيه المفسر وأحد مراجع قراءة القرآن الكريم، وصاحب النعلين والأسرار وصاحب أول مدرسة فقهية كبرى بالكوفة.',
    shortBioEn: 'A master Quranic authority and jurist, close attendant of the Prophet ﷺ who kept his secrecy, and founded the influential School of Law in Kufa.',
    longBioAr: `هو عبد الله بن مسعود بن غافل الهذلي، ولد في مكة وكان يرعى الغنم لبعض سادات قريش كعقبة بن أبي معيط. أسلم قديماً بمكة عقب رؤيته معجزة الحليب وحلب الشاة غير الحلوب على يد رسول الله ﷺ.
    كان من الملازمين الأوفياء للنبي كظله، يلبسه نعليه، ويحمل له سواكه وماء طهوره وأسراره اللصيقة حتى ظنه الناس في البداية من آل البيت لكثرة ملازمته ودخوله.
    كان أول مسلم يسير لوسط القوم بالمسجد الحرام عند مقام إبراهيم ويصدع بقراءة سورة الرحمن جهاراً، فضربته قريش حتى أدمت وجهه الشريف. هاجر الهجرتين وشهد المشاهد. عينه عمر بن الخطاب مشرفاً وقاضياً ومعلماً لأهل الكوفة بالعراق، حيث بنى أعظم منارة فقهية ومدرسة عقلية انتسب إليها كبار الأئمة وفقه الوفاق الحنفي.`,
    longBioEn: `He is Abdullah ibn Masood al-Hudhali, born in Mecca, spending his early life shepherding of Quraishi noble flocks. He embraced Islam upon witnessing the Prophet draw milk miraculously from a barren sheep.
    He became an inseparable domestic companion to the Prophet, serving as his personal assistant carrying his sandals, toothpick, and water.
    Ibn Masood was the first to publicly recite the Quran near the Kaaba, defying Quraishi physical retaliation. He completed migrations to both Abyssinia and Medina, fighting at Badr (where he slew Abu Jahl). Caliph Umar deployed him to Kufa to act as supreme civil authority and educational head, framing the legal methodologies of Iraq.`,
    conversionAr: 'أسلم بمكة مبكراً وهو سادس رجل يدخل المعشر الإسلامي حباً ووفاء للرسالة السامية الطاهرة.',
    conversionEn: 'Accepted Islam early in Mecca as the sixth individual to embrace the faith.',
    achievementsAr: [
      'أول صحابي يصدع ويجهر بقراءة القرآن الكريم علانية أمام غطرسة وجبروت قريش الكافرة بمكة عند الكعبة المكرمة',
      'تأسيس وبناء مدرسة الحديث والتفسير بالكوفة وتخريج أجيال عظام تفردت بفقه الرأي والقياس كعلقمة والنخعي والأسود وعلقمة وبذل الجهد',
      'نيل شهادة التزكية والبركة من فم النبي ﷺ بقراءة القرآن عذباً ورسولاً كما نزل وملازمته المعتمدة التامة'
    ],
    achievementsEn: [
      'First companion to loudly and publicly recite the Quran before the pagan councils at the Kaaba',
      'Organized the early juristic school of Kufa, educating prime legal minds of Iraq',
      'Praised directly by the Prophet ﷺ for his meticulous, authentic transmission and deep recitation'
    ],
    battles: ['badr', 'uhud', 'khandaq', 'khaybar', 'tabuk'],
    teachers: ['الرسول محمد ﷺ'],
    students: ['الحسن البصري', 'علقمة النخعي', 'مسروق بن الأجدع', 'الأسود بن يزيد'],
    famousHadiths: [
      {
        quoteAr: 'سمعت رسول الله ﷺ يقول: «مَنْ سَرَّهُ أَنْ يَقْرَأَ الْقُرْآنَ رَطْبًا كَمَا أُنْزِلَ، فَلْيَقْرَأْهُ عَلَى قِرَاءَةِ ابْنِ أُمِّ عَبْدٍ»',
        quoteEn: 'The Prophet ﷺ said: "Whoever loves to read the Quran fresh as it was revealed, let him read it according to the recitation of Ibn Umm Abd (Abdullah ibn Masood)."',
        reference: 'Musnad Ahmad 175'
      }
    ],
    sources: ['صحيح البخاري', 'ابن سعد - الطبقات الكبرى', 'الذهبي - سير أعلام النبلاء'],
    library: ['عبد الله بن مسعود عميد مدرسة الكوفة للدكتور عبد الرازق', 'البداية والنهاية لابن كثير من الشروح القديمة'],
    historicalSignificanceAr: 'وضعت تعاليمه ومروياته بذرة فقه أهل الرأي والمناهج الأثرية الكبرى لمدارس العراق والتبعية الحنفية اللاحقة.',
    historicalSignificanceEn: 'His detailed teachings and reports became the foundation of modern Islamic jurisprudence of Kufa and Hanifi legal schools.',
    confidenceLevel: 'High'
  },
  {
    id: 'abdullah_bin_abbas',
    nameAr: 'عبد الله بن عباس',
    nameEn: 'Abdullah ibn Abbas',
    kunyaAr: 'أبو العباس',
    kunyaEn: 'Abu al-Abbas',
    lineageAr: 'عبد الله بن عباس بن عبد المطلب بن هاشم الهاشمي القرشي',
    lineageEn: 'Abdullah ibn Abbas ibn Abd al-Muttalib al-Hashimi al-Qurashi',
    titlesAr: ['ترجمان القرآن', 'حبر الأمة', 'البحر الزاخر'],
    titlesEn: ['Translator of the Quran', 'The Scholar of the Nation', 'The Vast Ocean of Knowledge'],
    tribeAr: 'بنو هاشم (قريش)',
    tribeEn: 'Banu Hashim (Quraish)',
    birthYearAH: -3,
    deathYearAH: 68,
    ageAtDeath: 71,
    category: 'Scholars',
    cityAr: 'مكة / المدينة المنورة / الطائف',
    cityEn: 'Mecca / Medina / Taif',
    hadithCount: 1660,
    shortBioAr: 'ابن عم رسول الله ﷺ، تُرجمان القرآن الكريم وحَبر هذه الأمة الذي نال بركة دعاء المصطفى له بالحكمة والتاويل والفقاهة.',
    shortBioEn: 'The cousin of the Prophet ﷺ, master commentator of the Quran, and "The Sage of this Ummah" who received the Prophet\'s special prayer for wisdom and exegesis.',
    longBioAr: `هو عبد الله بن عباس بن عبد المطلب الهاشمي القرشي، ولد في مكة المكرمة في شعب أبي طالب قبل الهجرة بثلاث سنوات. وكان صبياً ذكياً فصيحاً لا يفارق مجالس النبي ﷺ متمسكاً بأهدابه العطرة.
    دعا له النبي ﷺ بالدعوة التاريخية المباركة الفاصلة: «اللهم فقهه في الدين، وعلمه التأويل»، فصارت مفتاح جعبته المعرفية الزاخرة الفريدة.
    برغم حداثة سنه عند وفاة النبي الشريف، سعى ابن عباس بنهم شديد وراء كبار الصحابة يجمع السنن والأخبار المنقولة، ويفسر كلام الله بالأشعار العربية وتراكيب اللغة حتى قصده طلاب العلم من الأرض قاطبة وسماه معاصروه بـ "الحبر" و "البحر" لغزارة فقهه وتوفي بالطائف في سلام تام.`,
    longBioEn: `He is Abdullah ibn Abbas al-Hashimi, cousin of the Prophet, born during the social siege of Banu Hashim. A young boy when the Prophet passed, he devoted himself to absolute scholarship.
    The Prophet ﷺ embraced him and supplicated: "O Allah, grant him deep comprehension inside religion, and teach him interpretation." This prophetic blessing unlocked an unmatched career in exegesis.
    He sought out older Companions, querying them on precise Sunnah details and combining this with Arabic poetry and linguistics to parse the legal text. His classes in Mecca drew thousands, earning him titles like 'The Ocean' and 'The Sage'. He died in Taif in 68 AH.`,
    conversionAr: 'ولد في شعب أبي طالب قبل الهجرة بثلاث سنين ونشأ في طليعة الإيمان والتوحيد مع أهله بني هاشم الكرام وعائلته السامية.',
    conversionEn: 'Born during the social boycott in Mecca, and grew up in the light of the prophetical household.',
    achievementsAr: [
      'تأصيل علوم التفسير واستنباط الأحكام اللغوية والشرعية لآيات القرآن الكريم بدقة لا تضاهى ولا تقارن',
      'تأسيس مدرسة تفسير القرآن والفقه الكبرى في مكة المكرمة وتخريج التابعين الأجلاء كمجاهد وجبير وعكرمة والقادة الفكريين',
      'تولي مهام المستشار الفكري والخارجي للفاروق عمر الذي كان يدخله في مجالس الشيوخ وكبار الرواة برغم حداثة سنه وشبابه'
    ],
    achievementsEn: [
      'Formulated the systematic steps of Quranic interpretation (Tafsir) and legal-linguistic derivations',
      'Founded the premier Quranic studies institute of Mecca, generating leading scholars of the sub-generation',
      'Served as a key policy advisor to Caliph Umar, who invited him to the senior Shura panels despite his youth'
    ],
    battles: ['hunayn'],
    teachers: ['الرسول محمد ﷺ', 'أبو بكر الصديق', 'عمر بن الخطاب', 'علي بن أبي طالب'],
    students: ['مجاهد بن جبر', 'سعيد بن جبير', 'عكرمة مولى ابن عباس', 'طاووس بن كيسان'],
    famousHadiths: [
      {
        quoteAr: 'أنَّ النبيَّ ﷺ مَسَحَ رأسَهُ وقالَ: «اللَّهُمَّ فَقِّهْهُ في الدِّينِ، وعَلِّمْهُ التَّأْوِيلَ»',
        quoteEn: 'The Prophet ﷺ stroked his head and prayed: "O Allah, grant him deep understanding in religion, and teach him the commentary/interpretation (of the Quran)."',
        reference: 'Sahih al-Bukhari 143'
      }
    ],
    sources: ['صحيح البخاري', 'مستدرك الحاكم', 'الذهبي - سير أعلام النبلاء'],
    library: ['عبد الله بن عباس حبر الأمة لحلمي الخولي', 'تفسير ابن عباس المأثور ومسنده الفقهي المعرب'],
    historicalSignificanceAr: 'يمثل المرجعية الأولى والتأسيسية لعلوم القرآن والتقصي اللغوي لآيات القرآن في تاريخ العلوم الإسلامية الممتدة.',
    historicalSignificanceEn: 'Serves as the foundational reference for Quranic exegesis (Tafsir) and Arabic lexicography in Islamic intellectual history.',
    confidenceLevel: 'High'
  },
  {
    id: 'abdullah_bin_umar',
    nameAr: 'عبد الله بن عمر',
    nameEn: 'Abdullah ibn Umar',
    kunyaAr: 'أبو عبد الرحمن',
    kunyaEn: 'Abu Abd al-Rahman',
    lineageAr: 'عبد الله بن عمر بن الخطاب بن نفيل العدوي القرشي',
    lineageEn: 'Abdullah ibn Umar ibn al-Khattab al-Adawi al-Qurashi',
    titlesAr: ['الناسك المتبع', 'صاحب الأثر الشديد', 'راوي الأمة العالي'],
    titlesEn: ['The Devout Adherent of Sunnah', 'Extremely Meticulous Follower of Prophetic Steps', 'Great Reporter of Medina'],
    tribeAr: 'بنو عدي (قريش)',
    tribeEn: 'Banu Adi (Quraish)',
    birthYearAH: -10,
    deathYearAH: 73,
    ageAtDeath: 84,
    category: 'Hadith_Narrators',
    cityAr: 'مكة / المدينة المنورة',
    cityEn: 'Mecca / Medina',
    hadithCount: 2630,
    shortBioAr: 'ابن الخليفة الثاني عمر بن الخطاب، والراوي الثاني للأحاديث النبوية، والفقيه الحريص جداً على تتبع خطى وأفعال النبي ﷺ.',
    shortBioEn: 'The son of Caliph Umar, the second most prolific narrator of Hadith, and a master jurist of Medina recognized for his unmatched adherence to the personal footsteps of the Prophet ﷺ.',
    longBioAr: `هو عبد الله بن عمر بن الخطاب العدوي القرشي، ولد في مكة وهاجر مع أبيه الفاروق إلى المدينة وهو طفل يافع. نشأ والتوحيد ينضج في قلبه، وبدأت صلته وعشقه للقرآن وسنّة رسول الله منذ الطفولة الباكرة الشريفة.
    منعه النبي ﷺ من المشاركة في بدْر وأُحُد لصغر سنه وحرصاً عليه، وسمح له يوم الخندق وهو ابن خمس عشرة سنة. اشتهر بورعه الشديد ودقته الأسطورية في محاكاة أفعال وتفاصيل المصطفى ﷺ، حتى كان يركب دابته وينزل تحت الشجرة التي نزل تحتها النبي ويصلي في المواضع نفسها بدقة متناهية.
    تفرغ بعد وفاة عمر للفتيا والتعليم بالمدينة لأكثر من ستين عاماً، وكان يتجنب المناصب السياسية والقضائية تحرجاً وتورعاً، فظل مرجعاً نقياً ودفن بالمدينة المنورة في سلام تام.`,
    longBioEn: `He is Abdullah ibn Umar ibn al-Khattab, born in Mecca. He migrated to Medina with his father Umar at a very young age. This upbringing crafted a lifelong pursuit of the Prophetic traditions.
    The Prophet disallowed him at Badr and Uhud, commissioning him at the Trench at fifteen. He gained universal fame for his extreme, unmatched literal mimicry of the Prophet's physical behavior: traveling where the Prophet traveled, praying exactly under the same branches.
    Post-Umar, he consecrated over 60 years to teaching in Medina. He steadfastly avoided executive positions or siding in civil strifes, preserving an unblemished traditional jurisprudence that directly influenced future giants.`,
    conversionAr: 'هاجر مع أبيه الفاروق عمر وغرس الإيمان بقلبه باكراً في كنف عائلة الصدق والتوحيد الخالص الصافي.',
    conversionEn: 'Migrated to Medina with his father Umar as a young boy and embraced Islam in his early childhood.',
    achievementsAr: [
      'ثاني أكثر الصحابة رواية للحديث النبوي الشريف في التاريخ بـ ٢٦٣٠ حديثاً مسجلاً ومدققاً بكل مروية وأمر',
      'المحافظة على الروح الأثرية لمدينة الرسول ﷺ وتقديم منهج تعليمي امتد لستين عاماً متصلة كمرجع أعلى وهدية علمية',
      'تأسيس منظومة الفقه الأثرية بالمدينة التي استند عليها الإمام مالك بن أنس في تأسيس وموطأ أهل المدينة النبوي والمناهج الأثرية'
    ],
    achievementsEn: [
      'The second most prolific narrator of Prophetic traditions in history (2,630 authentic narrations)',
      'Preserved the traditional and instructional legacy of Medina for over sixty years without disruption',
      'Established the rigorous scriptural framework of Medina which became the core of Imam Malik\'s legal codex'
    ],
    battles: ['khandaq', 'khaybar', 'tabuk'],
    teachers: ['الرسول محمد ﷺ', 'أبو بكر الصديق', 'عمر بن الخطاب', 'عائشة بنت أبي بكر'],
    students: ['نافع مولى ابن عمر', 'سعيد بن المسيب', 'سالم بن عبد الله بن عمر', 'عروة بن الزبير'],
    famousHadiths: [
      {
        quoteAr: 'سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ»',
        quoteEn: 'I heard the Messenger of Allah ﷺ saying: "Islam is built upon five pillars: Testifying that none has the right to be worshipped but Allah and that Muhammad is His Messenger, establishing prayer, giving Zakat, performing Hajj, and fasting Ramadan."',
        reference: 'Sahih al-Bukhari 8'
      }
    ],
    sources: ['صحيح البخاري', 'ابن سعد - الطبقات الكبرى', 'الذهبي - سير أعلام النبلاء'],
    library: ['عبد الله بن عمر رائد تتبع السلوك النبوي لمحمد الحسيناوي', 'فتح الباري شرح صحيح البخاري للأئمة'],
    historicalSignificanceAr: 'مثّل الركن الأقوى للفقه الأثري بالمدينة المنورة وتأثر به كبار أئمة الإسلام كمالك بن أنس والطبقات اللاحقة.',
    historicalSignificanceEn: 'Represented the absolute pillars of traditional jurisprudence in Medina, directly influencing great Imams like Malik ibn Anas.',
    confidenceLevel: 'High'
  }
];

export const DEFAULT_RELATIONSHIPS: Relationship[] = [
  // Abu Bakr relationships
  {
    id: 'rel_ab_um',
    sourceId: 'abu_bakr',
    targetId: 'umar_bin_al_khattab',
    type: 'friendship',
    labelAr: 'صداقة وثيقة ومشاورة عظمى',
    labelEn: 'Intimate companion and co-shura counselor',
    descriptionAr: 'كانا الوزيرين الأساسيين للنبي ﷺ وأعمدة قيام الدولة الإسلامية.',
    descriptionEn: 'The two chief advisors to the Prophet ﷺ and key pillars of the early state.'
  },
  {
    id: 'rel_ab_ai',
    sourceId: 'abu_bakr',
    targetId: 'aisha_bint_abi_bakr',
    type: 'family',
    labelAr: 'أبوها',
    labelEn: 'Father',
    descriptionAr: 'عائشة هي ابنة أبي بكر الصديق رضي الله عنهما، وأحب بناته إليه.',
    descriptionEn: 'Aisha is the beloved daughter of Abu Bakr al-Siddiq.'
  },
  {
    id: 'rel_ab_bi',
    sourceId: 'abu_bakr',
    targetId: 'bilal_bin_rabah',
    type: 'friendship',
    labelAr: 'مُعتقُ بلال ومسديه الخلاص',
    labelEn: 'Emancipator of Bilal from slavery',
    descriptionAr: 'اشتراه أبو بكر الصديق وأعتقه تخلصاً من عذاب الكفر بمكة.',
    descriptionEn: 'Abu Bakr purchased Bilal from Umayyah and freed him in Mecca.'
  },

  // Umar relationships
  {
    id: 'rel_um_ut',
    sourceId: 'umar_bin_al_khattab',
    targetId: 'uthman_bin_affan',
    type: 'political',
    labelAr: 'شورى وتوافق قيادي',
    labelEn: 'Shura and governance alliance',
    descriptionAr: 'عثمان كان أميناً وسنداً إدارياً لعمر في تسيير الدواوين وتعيين القضاة.',
    descriptionEn: 'Uthman served as an administrative anchor during Umar\'s tenure.'
  },
  {
    id: 'rel_um_al',
    sourceId: 'umar_bin_al_khattab',
    targetId: 'ali_bin_abi_talib',
    type: 'political',
    labelAr: 'مستشاره القضائي الأول',
    labelEn: 'Supreme Judicial Counsel',
    descriptionAr: 'كان علي المستشار والمرجع الأكبر لعمر في الفتيا والقضاء المدني.',
    descriptionEn: 'Ali served as the chief judicial authority consulted by Umar.'
  },

  // Ali relationships
  {
    id: 'rel_al_fa',
    sourceId: 'ali_bin_abi_talib',
    targetId: 'fatima_bint_muhammad',
    type: 'marriage',
    labelAr: 'زوجها',
    labelEn: 'Husband',
    descriptionAr: 'تزوجها بعد معركة بدر وأنجبا الحسن والحسين رضي الله عنهما.',
    descriptionEn: 'Ali married Fatima after the Battle of Badr.'
  },
  {
    id: 'rel_al_ha',
    sourceId: 'ali_bin_abi_talib',
    targetId: 'hamza_bin_abd_al_muttalib',
    type: 'family',
    labelAr: 'ابن أخيه وشقيقه بالمعارك',
    labelEn: 'Nephew and battlefield brother',
    descriptionAr: 'برزا مبارزين معاً في صفوف معركة بدر الكبرى الأولى.',
    descriptionEn: 'The two family heroes who spearheaded the initial duels of Badr.'
  },

  // Aisha relationships
  {
    id: 'rel_ai_an',
    sourceId: 'aisha_bint_abi_bakr',
    targetId: 'anas_bin_malik',
    type: 'hadith_transmission',
    labelAr: 'مدرسة فقهية متبادلة',
    labelEn: 'Hadith transmission and legal peerage',
    descriptionAr: 'كلاهما تفرد ملازماً لبيت وحركات النبي وحدثا الأمة بشطر كبير من العلم.',
    descriptionEn: 'Fascinating intellectual references of Medina who preserved domestic actions.'
  },
  {
    id: 'rel_ai_ah',
    sourceId: 'aisha_bint_abi_bakr',
    targetId: 'abu_hurayrah',
    type: 'hadith_transmission',
    labelAr: 'أقران مرويات الأثر والدراية',
    labelEn: 'Prophetic transmission and exegesis',
    descriptionAr: 'دراسة وتوثيق مشتركة لأحاديث النبي والتحليل المعرفي لها.',
    descriptionEn: 'Highly technical review and preservation of Medinan narrations.'
  },

  // Bilal relationships
  {
    id: 'rel_bi_kh',
    sourceId: 'bilal_bin_rabah',
    targetId: 'khalid_bin_al_walid',
    type: 'battle_comrade',
    labelAr: 'رفقاء الرايات والحروب',
    labelEn: 'Battlefield comrades',
    descriptionAr: 'رافقه بلال مؤذناً وحارس ثغر في معارك الشام التاريخية بقريش واليرموك.',
    descriptionEn: 'Bilal joined Khalid ibn al-Walid in the defense frontiers of Syria.'
  },

  // Salman al-Farsi relationships
  {
    id: 'rel_sa_al',
    sourceId: 'salman_al_farsi',
    targetId: 'ali_bin_abi_talib',
    type: 'friendship',
    labelAr: 'رفقاء المنهج والعلم الزاخر',
    labelEn: 'Companions of wisdom and deep asceticism',
    descriptionAr: 'كان علي شديد المحبة والتبجيل لسلمان ويصفه بلقمان الحكيم.',
    descriptionEn: 'Ali loved Salman, comparing his profound intellect to Luqman the Wise.'
  },
  {
    id: 'rel_sa_pr',
    sourceId: 'salman_al_farsi',
    targetId: 'abu_bakr',
    type: 'hijra_partner', // representation for medina defense links
    labelAr: 'مشاور دفاعي لحماية العاصمة',
    labelEn: 'Medina Defense Consultation',
    descriptionAr: 'علاقة وثيقة لدعم صمود المدينة ورص الصف في اليرموك واليرد.',
    descriptionEn: 'High level strategies to construct the trench securing Medina.'
  },
  {
    id: 'rel_su_al',
    sourceId: 'saad_bin_abi_waqqas',
    targetId: 'ali_bin_abi_talib',
    type: 'battle_comrade',
    labelAr: 'رفقاء الكفاح الأباة',
    labelEn: 'Battlefield brothers',
    descriptionAr: 'برزا معاً ككبار الفرسان المدافعين والمقاتلين الصادقين في صفوف معركة بدر وأحد الكبرى.',
    descriptionEn: 'Fought shoulder-to-shoulder as elite warriors in early defensive campaigns of Islam.'
  },
  {
    id: 'rel_ol_au',
    sourceId: 'umar_bin_al_khattab',
    targetId: 'abu_ubaydah_bin_al_jarrah',
    type: 'political',
    labelAr: 'قيادة فتوحات وحملة الشام',
    labelEn: 'Syrian governance & command',
    descriptionAr: 'عينه عمر رضي الله عنه معتمداً وقائداً عاماً لبلاد الشام لورعه البالغ وعقله الحكيم لتثبيت العدل.',
    descriptionEn: 'Umar appointed him as supreme commander of Syria due to his extreme administrative trustworthiness and wisdom.'
  },
  {
    id: 'rel_um_ar',
    sourceId: 'umar_bin_al_khattab',
    targetId: 'abdur_rahman_bin_awf',
    type: 'political',
    labelAr: 'رئيس الشورى والمستشار الأساسي',
    labelEn: 'Supreme Shura Consultations',
    descriptionAr: 'كان أحد الستة الذين أوكل إليهم عمر فقه واختيار من يليه وأدار العملية بنزاهة منقطعة النظير وحكمة بالغة.',
    descriptionEn: 'Umar appointed him as a lead advisor, placing his confidence in him to run the succession Shura with absolute neutrality.'
  },
  {
    id: 'rel_al_as',
    sourceId: 'ali_bin_abi_talib',
    targetId: 'abdullah_bin_abbas',
    type: 'family',
    labelAr: 'ابن عمه وتلميذه الروحي الوفير',
    labelEn: 'Cousin & close theological pupil',
    descriptionAr: 'ابن عباس كان يحب علياً ويلازمه ويتعلم منه دقة القضاء والتحليل والتفسير ويعينه في الكوفة وإدارة البصرة.',
    descriptionEn: 'Ibn Abbas was highly devoted to studying under Ali, acquiring his legal techniques and supporting him during his governance.'
  },
  {
    id: 'rel_um_ub',
    sourceId: 'umar_bin_al_khattab',
    targetId: 'abdullah_bin_umar',
    type: 'family',
    labelAr: 'ابنه النبيل والناسك المتبع للأثر',
    labelEn: 'His beloved son & scholar',
    descriptionAr: 'عبد الله هو ابن عمر بن الخطاب، وتربى في مدرسته الفاروقية ذات المهابة والصدق والسامية والالتزام المتناهي.',
    descriptionEn: 'Abdullah is the eminent son of Caliph Umar, raised in his strict, high-principled household.'
  },
  {
    id: 'rel_as_mu',
    sourceId: 'abdullah_bin_abbas',
    targetId: 'muadh_bin_jabal',
    type: 'teacher_student',
    labelAr: 'علوم معاذ والاجتهاد الأثري',
    labelEn: 'Theological consultation links',
    descriptionAr: 'كان ابن عباس يثني على معاذ ويسأله عن تفاصيل الفتيا ومقاصد الوحي باليمن والمدينة المنورة.',
    descriptionEn: 'Ibn Abbas consulted Muadh frequently, praising his unprecedented expertise in Halal and Haram.'
  },
  {
    id: 'rel_um_am',
    sourceId: 'umar_bin_al_khattab',
    targetId: 'abdullah_bin_masood',
    type: 'political',
    labelAr: 'ناصح الخلافة ومعلم أهل الكوفة الأكبر',
    labelEn: 'Kufa delegate & top legal counsel',
    descriptionAr: 'أرسله عمر ليكون قاضياً ومعلماً ووزيراً معتمداً للكوفة كاتباً لأهلها: لقد آثرتكم به على نفسي.',
    descriptionEn: 'Umar sent him as standard-bearer of learning to Kufa, stating: "I have prioritized you over myself by sending him."'
  }
];
