/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Companion, CompanionCategory, RelationshipType } from '../types';

export type LanguageCode = 'fr' | 'ar' | 'en';

export interface QCMQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number;
  question: Record<LanguageCode, string>;
  choices: Record<LanguageCode, string[]>;
  correctIndex: number;
  explanation: Record<LanguageCode, string>;
}

// Translations dictionary for core UI elements
export const UI_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  appName: {
    fr: 'Le Fleuve des Compagnons ﷺ',
    ar: 'نهر الصحابة والتابعين ﷺ',
    en: 'The Companion Stream ﷺ'
  },
  appSub: {
    fr: 'Encyclopédie interactive retraçant les généalogies et biographies des fidèles Compagnons',
    ar: 'موسوعة تفاعلية مصورة للعلاقات التاريخية والقصص الكبرى لجيل الصحابة الطيبين',
    en: 'Interactive encyclopedia tracing lineages, relationships and biographies of the Prophetic companions'
  },
  explorerView: {
    fr: 'Explorateur Visuel',
    ar: 'المستكشف المرئي',
    en: 'Interactive Graph'
  },
  adminView: {
    fr: 'Console Administrateur',
    ar: 'المشرف والمراجعة',
    en: 'Admin Console'
  },
  login: {
    fr: 'Connexion',
    ar: 'دخول',
    en: 'Login'
  },
  searchPlaceholder: {
    fr: 'Rechercher rapidement un compagnon...',
    ar: 'بحث سريع باسم الصحابي المشرّف...',
    en: 'Search sahaba instantly by name...'
  },
  advancedSearch: {
    fr: 'Critères de Recherche Avancés',
    ar: 'خيارات الفرز والبحث المتقدم',
    en: 'Advanced Search Criteria'
  },
  resetBtn: {
    fr: 'Réinitialiser',
    ar: 'إعادة تعيين الفلاتر',
    en: 'Reset'
  },
  loadingData: {
    fr: 'Chargement des biographies historiques et généalogies...',
    ar: 'يُحمّل سجلاّت التاريخ والفضائل العطرة...',
    en: 'Retrieving prestigious companions histories...'
  },
  noResults: {
    fr: 'Aucun compagnon ne correspond aux critères de recherche actuels.',
    ar: 'عذراً، لم نجد صحابة يتوافقون مع شروط البحث والفلترة المطبقة.',
    en: 'No companions match your current search/filtering selection.'
  },
  displayLayout: {
    fr: 'Mode d\'affichage :',
    ar: 'طريقة العرض المعتمدة:',
    en: 'Explorer Display Layout:'
  },
  simpleCards: {
    fr: 'Cartes épurées',
    ar: 'بطاقات مبسطة',
    en: 'Simple Cards'
  },
  relationshipMap: {
    fr: 'Réseau relationnel',
    ar: 'مخطط العلاقات',
    en: 'Relationship Map'
  },
  narrations: {
    fr: 'hadiths transmis',
    ar: 'حديث مروي',
    en: 'narrations'
  },
  viewDetails: {
    fr: 'Consulter la Sîrah',
    ar: 'عرض التفاصيل والنسب',
    en: 'View Seerah'
  },
  pathfinderTitle: {
    fr: 'Traceur de relations et généalogies',
    ar: 'تقصي خطوط ومسارات النسب والصلة',
    en: 'Relationship Path Finder'
  },
  pathfinderDesc: {
    fr: 'Sélectionnez deux compagnons pour retracer la chaîne directe de leurs alliances ou relations familiales :',
    ar: 'حدد صحابيين شريفين لمعرفة سلسلة الروابط والعلاقات المباشرة والمركبة التي تجمع بينهما:',
    en: 'Choose two companions of the Prophet ﷺ to trace their mutual lineage or historic alliance chain:'
  },
  startComp: {
    fr: 'Compagnon de départ',
    ar: 'الصحابي الأول (البداية)',
    en: 'Start Companion'
  },
  endComp: {
    fr: 'Compagnon de destination',
    ar: 'الصحابي الثاني (الهدف)',
    en: 'Target Companion'
  },
  selectStart: {
    fr: 'Sélectionner le départ',
    ar: 'اختر البداية',
    en: 'Select Start Node'
  },
  selectEnd: {
    fr: 'Sélectionner la destination',
    ar: 'اختر الهدف',
    en: 'Select Target Node'
  },
  traceBtn: {
    fr: 'Tracer la connexion',
    ar: 'كشف خط الاتصال',
    en: 'Trace Connection Path'
  },
  clearBtn: {
    fr: 'Effacer',
    ar: 'مسح',
    en: 'Clear'
  },
  hopsDiscovered: {
    fr: 'Chemin de relation découvert :',
    ar: 'مسار الوصل التاريخي المكتشف',
    en: 'Discovered Historic Hops:'
  },
  nodeDetailBanner: {
    fr: 'COMPAGNON SÉLECTIONNÉ',
    ar: 'الصحابي المحدد',
    en: 'SELECTED COMPANION'
  },
  openCompleteSeerah: {
    fr: 'Découvrir la Sîrah complète',
    ar: 'فتح السيرة والتفاصيل الكاملة',
    en: 'View Complete Seerah & Legacy'
  },
  sidebarPlaceholder: {
    fr: 'Cliquez sur un compagnon pour explorer sa vie et sa généalogie.',
    ar: 'انقر على أحد الصحابة في المخطط لقراءة خط النسب والسيرة العطرة الكبرى.',
    en: 'Click any companion node inside the relationship map to read their timeline.'
  },
  insufficientPermissions: {
    fr: 'Privilèges insuffisants',
    ar: 'صلاحيات غير كافية',
    en: 'Restricted Admin Console Access'
  },
  adminRestrictedDesc: {
    fr: 'Votre compte ne dispose pas des privilèges d\'administrateur. Veuillez utiliser l\'explorateur visuel.',
    ar: 'عذراً، بروفايل حسابك الحالي لا يمتلك صلاحيات المشرفين. للقيام بعمليات الإدخال والمراجعة، تفضل بالانتقال للمستكشف المرئي أو تسجيل الدخول بحساب مشرف معتمد.',
    en: 'Sorry, your registered account profile is not appointed with administrator privileges. Go back to browse the interactive graph explorer or authenticate with an authorized credentials.'
  },
  signOut: {
    fr: 'Déconnexion',
    ar: 'تسجيل الخروج والتبديل',
    en: 'Sign Out and Switch'
  },
  propheticQuote: {
    fr: '« Mes compagnons sont semblables à des étoiles : peu importe celui que vous suivez, vous serez bien guidés. »',
    ar: 'قال رسول الله ﷺ: «أَصْحَابِي كَالنُّجُومِ بِأَيِّهِمُ اقْتَدَيْتُمُ اهْتَدَيْتُمْ» - روايات الأثر الشريف هادية لطريق التوحيد والصفاء.',
    en: '"My companions are like stars; whichever of them you follow, you will be rightly guided." — Prophetic tradition regarding the prestigious companions.'
  },
  copyright: {
    fr: '© Fleuve des Compagnons - Plateforme Éducative Interactive',
    ar: '© نهر الصحابة - موسوعة تعليمية تفاعلية',
    en: '© Sahaba Explorer - Interactive Educational Platform'
  },
  craftedWithPrecision: {
    fr: 'Conçu avec une grande précision historique',
    ar: 'صُنع بدقة وإخلاص لدعاة المعرفة والهدى',
    en: 'Crafted with absolute historical precision'
  },
  years: {
    fr: 'ans',
    ar: 'عاماً',
    en: 'yrs'
  },
  backToMap: {
    fr: '← Retour au Mouvement',
    ar: '← العودة للمخطط',
    en: '← Back to Map'
  },
  studyNotesTab: {
    fr: 'Notes de Recherche',
    ar: 'حقيبة الملاحظات والفوائد',
    en: 'Study Notes'
  },
  browseHistoryTab: {
    fr: 'Historique de Navigation',
    ar: 'سجل القراءة والتصفح',
    en: 'Browse History'
  },
  profileTab: {
    fr: 'Informations de Profil',
    ar: 'بيانات الحساب الشخصي',
    en: 'Personal Profile Info'
  },
  quizTab: {
    fr: 'Quiz Historique QCM',
    ar: 'مسابقة الصحابة QCM',
    en: 'Sahaba Quiz Contest'
  },
  quizTabDesc: {
    fr: 'Répondez à des questions aléatoires et accumulez des points d\'érudition !',
    ar: 'أجب على الأسئلة العشوائية حول الصحابة وسجل نقاط علمية متميزة!',
    en: 'Answer random history questions and accumulate erudition points!'
  },
  scoreMultiplier: {
    fr: 'Points acquis :',
    ar: 'نقاط الإيراد الحالية:',
    en: 'Accumulated Scholar Score:'
  },
  starterScore: {
    fr: 'Score de Savoir',
    ar: 'رصيد العلم والمعرفة',
    en: 'Savoir Score'
  },
  correctAnswerScore: {
    fr: 'Bonne réponse : de +5 à +20 pts (selon la difficulté)',
    ar: 'الإجابة الصحيحة تضيف من 5 إلى 20 نقطة حسب صعوبة السؤال',
    en: 'Correct answer: +5 to +20 pts based on difficulty'
  },
  wrongAnswerScore: {
    fr: 'Mauvaise réponse : -5 pts systématiquement',
    ar: 'الإجابة الخاطئة تخصم 5 نقاط تلقائياً',
    en: 'Incorrect answer: -5 points systematically'
  },
  nextQuestionBtn: {
    fr: 'Question Suivante',
    ar: 'السؤال التالي',
    en: 'Next Question'
  },
  validateAnswerBtn: {
    fr: 'Vérifier la réponse',
    ar: 'التحقق من الإجابة',
    en: 'Verify Answer'
  },
  correctNotice: {
    fr: 'Macha Allah ! Bonne réponse !',
    ar: 'ما شاء الله! إجابة صحيحة موفقة!',
    en: 'Masha Allah! Correct Answer!'
  },
  wrongNotice: {
    fr: 'Oups ! Mauvaise réponse.',
    ar: 'للأسف! إجابة غير دقيقة.',
    en: 'Oops! Incorrect answer.'
  },
  difficultyLabel: {
    fr: 'Difficulté',
    ar: 'الصعوبة',
    en: 'Difficulty'
  },
  pointsPotential: {
    fr: 'Gains potentiels',
    ar: 'النقاط المستهدفة',
    en: 'Potential Points'
  },
  sourceLabel: {
    fr: 'Source classique',
    ar: 'المصدر التراثي',
    en: 'Classical Source'
  },
  startQuizBtn: {
    fr: 'Commencer un Quiz',
    ar: 'بدء المسابقة التفاعلية',
    en: 'Begin Interactive Quiz'
  },
  easy: {
    fr: 'Facile',
    ar: 'سهل',
    en: 'Easy'
  },
  medium: {
    fr: 'Moyen',
    ar: 'متوسط',
    en: 'Medium'
  },
  hard: {
    fr: 'Difficile',
    ar: 'صعب',
    en: 'Hard'
  },
  expert: {
    fr: 'Expert',
    ar: 'خبير',
    en: 'Expert'
  }
};

// Beautiful translations mapping for category labels
export const CATEGORY_TRANSLATIONS: Record<CompanionCategory, Record<LanguageCode, string>> = {
  Khulafa_Rashidun: {
    fr: 'Califes Bien Guidés',
    ar: 'الخلفاء الراشدون',
    en: 'Khulafa al-Rashidun'
  },
  Ahl_al_Bayt: {
    fr: 'Maison Divine (Ahl al-Bayt)',
    ar: 'آل البيت الأطهار',
    en: 'Ahl al-Bayt'
  },
  Muhajirun: {
    fr: 'Les Émigrés (Muhâjirûn)',
    ar: 'المهاجرون',
    en: 'Muhajirun'
  },
  Ansar: {
    fr: 'Les Auxiliaires (Anṣâr)',
    ar: 'الأنصار',
    en: 'Ansar'
  },
  Wives: {
    fr: 'Mères des croyants (Épouses)',
    ar: 'أمهات المؤمنين',
    en: 'Wives of the Prophet ﷺ'
  },
  Hadith_Narrators: {
    fr: 'Narrateurs de Hadiths',
    ar: 'رواة الحديث الحفاظ',
    en: 'Hadith Narrators'
  },
  Military: {
    fr: 'Chefs Militaires',
    ar: 'القادة الفاتحون',
    en: 'Military Commanders'
  },
  Scholars: {
    fr: 'Savants et Juristes',
    ar: 'العلماء والفقهاء',
    en: 'Scholars'
  },
  Other: {
    fr: 'Autres Compagnons nobles',
    ar: 'صحابة آخرون',
    en: 'Other Sahaba'
  }
};

// Relationship Type translations for French
export const RELATIONSHIP_TRANSLATIONS: Record<RelationshipType, Record<LanguageCode, string>> = {
  family: {
    fr: 'Famille et Parenté',
    ar: 'نسب وقرابة',
    en: 'Family relationship'
  },
  marriage: {
    fr: 'Mariage et Alliance',
    ar: 'مصاهرة',
    en: 'Marriage connection'
  },
  teacher_student: {
    fr: 'Transmission et Savoir',
    ar: 'رواية وعلم',
    en: 'Teacher & Student'
  },
  friendship: {
    fr: 'Fraternité et Amitié',
    ar: 'مؤاخاة وصحبة',
    en: 'Brotherhood & Companionship'
  },
  hijra_partner: {
    fr: 'Compagnonnage d\'Hégire',
    ar: 'رفقة الهجرة',
    en: 'Hijra Partner'
  },
  battle_comrade: {
    fr: 'Fratrie de Bataille',
    ar: 'رفقة الجهاد',
    en: 'Battle Comrade'
  },
  political: {
    fr: 'Alliance politique / Shoura',
    ar: 'شورى وبيعة',
    en: 'Alliance / Shura'
  },
  hadith_transmission: {
    fr: 'Transmission de Hadith',
    ar: 'إسناد ونقل',
    en: 'Hadith Transmission'
  }
};

// Premium Curated Multi-Language QCM questions catalog (sourced from classical literature)
export const SEERAH_QCM_QUESTIONS: QCMQuestion[] = [
  {
    id: 'q1',
    difficulty: 'easy',
    points: 5,
    question: {
      fr: 'Quel compagnon de confiance fut honoré du titre suprême de « Al-Siddiq » (le véridique) ?',
      ar: 'أي الصحابة الأجلاء لُقّب باللقب الشريف «الصديق» لتصديقه المطلق للوحي في ليلة الإسراء؟',
      en: 'Which esteemed companion was honored with the noble title "Al-Siddiq" (The Truthful)?'
    },
    choices: {
      fr: ['Umar ibn al-Khattâb', 'Abou Bakr As-Siddiq', 'Outhman ibn Affan', 'Ali ibn Abi Talib'],
      ar: ['عمر بن الخطاب', 'أبو بكر الصديق', 'عثمان بن عفان', 'علي بن أبي طالب'],
      en: ['Umar ibn al-Khattab', 'Abu Bakr al-Siddiq', 'Uthman ibn Affan', 'Ali ibn Abi Talib']
    },
    correctIndex: 1,
    explanation: {
      fr: 'Abou Bakr fut surnommé « Al-Siddiq » par le Prophète ﷺ en raison de sa foi totale et de son acceptation immédiate de l\'Isra et du Miraj sans aucune hésitation.',
      ar: 'أطلق الرسول ﷺ لقب «الصديق» على رفيقه أبي بكر رضي الله عنه لتصديقه له بغير تردد في ليلة الإسراء والمعراج.',
      en: 'Abu Bakr was given the title "Al-Siddiq" by the Prophet ﷺ because he immediately verified the journey of Al-Isra and Al-Mi\'raj'
    }
  },
  {
    id: 'q2',
    difficulty: 'easy',
    points: 5,
    question: {
      fr: 'Pourquoi Outhman ibn Affan était-il surnommé « Dhun-Noorayn » (L\'homme aux deux lumières) ?',
      ar: 'لماذا لُقِّب الخليفة الثالث عثمان بن عفان رضي الله عنه بلقب «ذو النورين»؟',
      en: 'Why was the third Caliph Uthman ibn Affan called "Dhun-Noorayn" (Owner of Two Lights)?'
    },
    choices: {
      fr: [
        'Pour sa piété immense éclairant ses prières nocturnes',
        'Parce qu\'il a financé à lui seul deux expéditions majeures',
        'Pour avoir eu l\'honneur d\'épouser successivement deux filles du Prophète ﷺ (Ruqayyah puis Umm Kulthum)',
        'Car il a supervisé la double compilation écrite du Coran'
      ],
      ar: [
        'لكثرة تهجده وقيامه بالليل حتى أنار الله وجهه',
        'لأنه جهّز جيش العسرة في تبوك واشترى بئر رومة',
        'لأنه تشرّف بالزواج من ابنتي رسول الله ﷺ (رقية ثم أم كلثوم بعد وفاتها)',
        'لأشرافه على النسختين الأصليتين لجمع المصحف الشريف'
      ],
      en: [
        'Due to his bright nightly prayers and immense piety',
        'Because he individually financed two major military expeditions',
        'Because he married two daughters of the Prophet ﷺ (Ruqayyah, then Umm Kulthum after her passing)',
        'Because he coordinated two historic compilations of the Holy Quran'
      ]
    },
    correctIndex: 2,
    explanation: {
      fr: 'Outhman a été surnommé « Dhun-Noorayn » suite à son union avec deux filles du Prophète ﷺ : Ruqayyah, et après le rappel à Dieu de celle-ci, Umm Kulthum.',
      ar: 'نال هذا اللقب العظيم رضي الله عنه لأنه تزوج ابنتي المصطفى ﷺ؛ رقية، ثم تزوج أختها أم كلثوم بعد وفاة الأولى.',
      en: 'Uthman married the Prophet\'s daughter Ruqayyah, and upon her passing, married her sister Umm Kulthum.'
    }
  },
  {
    id: 'q3',
    difficulty: 'easy',
    points: 5,
    question: {
      fr: 'Quel compagnon génial a proposé de creuser le fossé défensif (Khandaq) pour préserver Médine contre la coalition des clans ?',
      ar: 'من هو الصحابي الملهم صاحب فكرة حفر الخندق لحماية المدينة المنورة في غزوة الأحزاب؟',
      en: 'Which brilliant companion suggested digging the protective trench around Medina during the Battle of Al-Khandaq?'
    },
    choices: {
      fr: ['Bilal ibn Rabah', 'Abou Houraïra', 'Salman al-Farsi', 'Saâd ibn Abi Waqqâs'],
      ar: ['بلال بن رباح', 'أبو هريرة', 'سلمان الفارسي', 'سعد بن أبي وقاص'],
      en: ['Bilal bin Rabah', 'Abu Hurayrah', 'Salman al-Farsi', 'Saad bin Abi Waqqas']
    },
    correctIndex: 2,
    explanation: {
      fr: 'Salman al-Farsi s\'est inspiré des techniques défensives de l\'empire perse pour suggérer de barrer le passage nord de Médine par un profond fossé, déjouant tout assaut.',
      ar: 'سلمان الفارسي رضي الله عنه هو من أشار بذلك مستفيداً من خبرات الحروب في بلاد فارس لحماية حدود المدينة المكشوفة.',
      en: 'Salman al-Farsi proposed using Persian military defensive trench strategies to prevent the confederate cavalry from crossing.'
    }
  },
  {
    id: 'q4',
    difficulty: 'medium',
    points: 10,
    question: {
      fr: 'Quelle noble dame fut désignée comme « Al-Tahirah » (La Pure) dès l\'époque pré-islamique pour sa vertu immense ?',
      ar: 'من هي سيدة بيت النبوة التي عُرِفت في قريش قبل نزول الوحي بلقب «الطاهرة» لعفتها ومقام شرفها؟',
      en: 'Which noble lady of house of Prophethood was designated with the title "Al-Tahirah" (The Pure) even in pre-Islamic times?'
    },
    choices: {
      fr: ['Aïcha bint Abi Bakr', 'Khadija bint Khuwaylid', 'Fatima bint Muhammad', 'Umm Salama'],
      ar: ['عائشة بنت أبي بكر', 'خديجة بنت خويلد', 'فاطمة بنت محمد', 'أم سلمة'],
      en: ['Aisha bint Abi Bakr', 'Khadijah bint Khuwaylid', 'Fatima bint Muhammad', 'Umm Salama']
    },
    correctIndex: 1,
    explanation: {
      fr: 'Khadija bint Khuwaylid était une femme d\'affaires fortunée et influente, surnommée « Al-Tahirah » par les Mecquois en hommage à ses principes éthiques et sa vertu légendaire.',
      ar: 'عُرِفت أم المؤمنين خديجة بنت خويلد رضي الله عنها في الجاهلية بلقب «الطاهرة» لعفتها البالغة ورجاحة عقلها ومقامها الكريم.',
      en: 'Khadijah bint Khuwaylid was widely called "Al-Tahirah" in Mecca due to her stellar ethics and exceptional background.'
    }
  },
  {
    id: 'q5',
    difficulty: 'medium',
    points: 10,
    question: {
      fr: 'Qui slept courageusement dans le lit du Prophète ﷺ la nuit de l\'Hégire pour duper les assassins de l\'aristocratie de Qoreych ?',
      ar: 'من هو الفدائي الشاب الذي نام في فراش رسول الله ﷺ ليلة الهجرة الشريفة ليموه قريش المتربصة؟',
      en: 'Which courageous youth slept in the Prophet\'s ﷺ bed on the night of Hijrah to deceive the Quraish assassins?'
    },
    choices: {
      fr: ['Zayd ibn Hârithah', 'Ali ibn Abi Talib', 'Abdoullah ibn Abbas', 'Abdoullah ibn Mass\'oud'],
      ar: ['زيد بن حارثة', 'علي بن أبي طالب', 'عبد الله بن عباس', 'عبد الله بن مسعود'],
      en: ['Zayd ibn Harithah', 'Ali ibn Abi Talib', 'Abdullah ibn Abbas', 'Abdullah ibn Masood']
    },
    correctIndex: 1,
    explanation: {
      fr: 'À l\'âge de dix-neuf ans seulement, Ali ibn Abi Talib a bravé la mort en restant à la Mecque pour retarder la poursuite criminelle, puis a restitué sereinement les dépôts de confiance s\'y rattachant.',
      ar: 'نام علي بن أبي طالب رضي الله عنه في فراش المصطفى ﷺ وافتداه بنفسه تمويهاً للمشركين، ورداً للودائع إلى أهليها بمكة.',
      en: 'Ali ibn Abi Talib slept in the Prophet\'s bed on the night of migration and returned the trusts of Meccans before departing.'
    }
  },
  {
    id: 'q6',
    difficulty: 'medium',
    points: 10,
    question: {
      fr: 'Quel juriste d\'une érudition immense fut envoyé au Yémen par le Messager de Dieu ﷺ pour y enseigner la jurisprudence et présider le domaine judiciaire ?',
      ar: 'من هو الصحابي القاضي والفقيه الذي بعثه النبي ﷺ إلى اليمن مرشداً وقاضياً، ولقبه بأنه أعلم الأمة بالحلال والحرام؟',
      en: 'Which jurist of exceptional knowledge was dispatched to Yemen by the Prophet ﷺ as a teacher of Halal/Haram and Chief Judge?'
    },
    choices: {
      fr: ['Mou\'adh ibn Jabal', 'Abdoullah ibn Mass\'oud', 'Saâd ibn Abi Waqqâs', 'Anas ibn Mâlik'],
      ar: ['معاذ بن جبل', 'عبد الله بن مسعود', 'سعد بن أبي وقاص', 'أنس بن مالك'],
      en: ['Muadh bin Jabal', 'Abdullah ibn Masood', 'Saad bin Abi Waqqas', 'Anas bin Malik']
    },
    correctIndex: 0,
    explanation: {
      fr: 'Mou\'adh ibn Jabal était considéré comme l\'homme le plus instruit de la communauté concernant le licite et l\'illicite. Le Prophète ﷺ le tint en haute estime.',
      ar: 'معاذ بن جبل رضي الله عنه قال عنه المصطفى ﷺ: «أعلمُ أمتي بالحلالِ والحرامِ معاذُ بنُ جبلٍ» وأرسله لتعليم وتعليم أهل اليمن الحكمة الشريفة.',
      en: 'The Prophet ﷺ called Muadh bin Jabal "The most knowledgeable of my nation on matters of Halal and Haram" before sending him to guide Yemen.'
    }
  },
  {
    id: 'q7',
    difficulty: 'hard',
    points: 15,
    question: {
      fr: 'Quelle grande œuvre biographique de référence, éditée par Ibn Hajar al-Asqalani, répertorie méticuleusement plus de 12 050 compagnons ?',
      ar: 'ما هو الكتاب الموسوعي الهام للإمام ابن حجر العسقلاني والذي يعد المرجع الأول لتراجم الصحابة وتحقيق تاريخهم؟',
      en: 'Which massive reference work compiled by Ibn Hajar al-Asqalani serves as an primary ledger cataloging over 12,050 Sahaba?'
    },
    choices: {
      fr: ['Siyar A\'lam al-Nubala (Al-Dhahabi)', 'Tabaqat al-Kubra (Ibn Saâd)', 'Al-Isabah fi Tamyiz as-Sahabah', 'Usd al-Ghabah (Ibn Al-Athir)'],
      ar: ['سير أعلام النبلاء للذهبي', 'الطبقات الكبرى لابن سعد', 'الإصابة في تمييز الصحابة لابن حجر', 'أسد الغابة في معرفة الصحابة لابن الأثير'],
      en: [
        'Siyar A\'lam al-Nubala (by Al-Dhahabi)',
        'Tabaqat al-Kubra (by Ibn Saad)',
        'Al-Isabah fi Tamyiz as-Sahabah (by Ibn Hajar)',
        'Usd al-Ghabah fi Ma\'rifat as-Sahabah (by Ibn Al-Athir)'
      ]
    },
    correctIndex: 2,
    explanation: {
      fr: '« Al-Isabah fi Tamyiz as-Sahabah » d\'Ibn Hajar al-Asqalani représente le sommet de la science biografique islamique classique, vérifiant rigoureusement le statut de compagnon.',
      ar: 'كتاب «الإصابة في تمييز الصحابة» للحافظ ابن حجر العسقلاني يمثل ذروة الإنتاج التراجمي والمصنف الأكبر للتميز بين طبقات الصحابة.',
      en: '"Al-Isabah fi Tamyiz as-Sahabah" by Ibn Hajar is the most exhaustive, critically analyzed dictionary verifying the status of each companion.'
    }
  },
  {
    id: 'q8',
    difficulty: 'hard',
    points: 15,
    question: {
      fr: 'Quel scribe éminent et intime du Messager de Dieu ﷺ supervisa à la fois sous Abou Bakr puis sous Outhman le comité de rédaction et d\'unification du Saint Coran ?',
      ar: 'من هو كاتب الوحي وحافظ الأنصار ذو الأمانة العليا الذي قاد أول جمع وتدوين للقرآن الكريم في عهد أبي بكر ثم وحد المصاحف لعثمان؟',
      en: 'Which eminent scribe of the Prophet ﷺ presided over the official committee that compiled and standardized the Holy Quran?'
    },
    choices: {
      fr: ['Zayd ibn Thâbit', 'Abdoullah ibn Abbas', 'Abou Bakr As-Siddiq', 'Mouawiya ibn Abi Soufyan'],
      ar: ['زيد بن ثابت', 'عبد الله بن عباس', 'أبو بكر الصديق', 'معاوية بن أبي سفيان'],
      en: ['Zayd bin Thabit', 'Abdullah ibn Abbas', 'Abu Bakr al-Siddiq', 'Muawiyah bin Abi Sufyan']
    },
    correctIndex: 0,
    explanation: {
      fr: 'Zayd ibn Thâbit fut désigné par Abou Bakr car il était jeune, intègre, brillant et mémorisait avec précision l\'entièreté de la révélation divine directement auprès du Messager ﷺ.',
      ar: 'اختار الصديق الفاروق زيد بن ثابت رضي الله عنه لجمع القرآن الشريف لقول أبي بكر له: «إنك رجل شاب عاقل لا نتهمك، وقد كنت تكتب الوحي لرسول الله ﷺ فتتبع القرآن فاجمعه».',
      en: 'Zayd bin Thabit was chosen by Abu Bakr because he was a young, sharp, and highly integral scribe who recorded revelations firsthand.'
    }
  },
  {
    id: 'q9',
    difficulty: 'expert',
    points: 20,
    question: {
      fr: 'Qui est l\'auteur de la prestigieuse oeuvre d\'histoire générale et de biographies intitulée « Usd al-Ghabah fi Ma\'rifat as-Sahabah » ?',
      ar: 'من هو الإمام المؤرخ المصنف لكتاب «أسد الغابة في معرفة الصحابة» والذي يترجم لأكثر من ٧٥٠٠ صحابي شريف؟',
      en: 'Who is the author of "Usd al-Ghabah fi Ma\'rifat as-Sahabah", one of the top early encyclopedias of Prophetic companions?'
    },
    choices: {
      fr: ['Al-Tabari', 'Ibn Al-Athir', 'Ibn Kathir', 'Al-Waqidi'],
      ar: ['الطبري', 'ابن الأثير الجزري', 'ابن كثير', 'الواقدي'],
      en: ['Al-Tabari', 'Ibn Al-Athir', 'Ibn Kathir', 'Al-Waqidi']
    },
    correctIndex: 1,
    explanation: {
      fr: 'Ibn Al-Athir (compilateur d\'exception) est l\'auteur d\'« Usd al-Ghabah » (Les Lions de la Forêt), une collection irréprochable de notices biographiques compilée au XIIIe siècle de l\'ère chrétienne.',
      ar: 'مؤلف «أسد الغابة» هو المؤرخ المحدث عز الدين ابن الأثير الجزري رحمه الله المتوفى سنة ٦٣٠ هـ.',
      en: 'Ibn Al-Athir is the renowned historian behind "Usd al-Ghabah", which contains deep entries on over 7,500 companions.'
    }
  },
  {
    id: 'q10',
    difficulty: 'expert',
    points: 20,
    question: {
      fr: 'Dans quelle bataille mémorable le grand compagnon Jaafar ibn Abi Talib fut-il martyrisé, devenant éternellement désigné comme « Dhu al-Janahayn » (L\'homme aux deux ailes aériennes) ?',
      ar: 'في أي معركة بطولية صاعقة استشهد جعفر بن أبي طالب رضي الله عنه حاملاً الراية ليُلقبه المصطفى بـ «ذو الجناحين»؟',
      en: 'During which historic battle was Jaafar ibn Abi Talib martyred while holding the banner, receiving the title "Dhu al-Janahayn"?'
    },
    choices: {
      fr: ['La bataille de Yarmouk', 'La bataille de Badr', 'La bataille de Mu\'tah', 'Le siège de Taïf'],
      ar: ['معركة اليرموك', 'غزوة بدر الكبرى', 'غزوة مؤتة', 'حصار الطائف'],
      en: ['The Battle of Yarmouk', 'The Battle of Badr', 'The Battle of Mu\'tah', 'The Siege of Taif']
    },
    correctIndex: 2,
    explanation: {
      fr: 'À la bataille de Mu\'tah, Jaafar ibn Abi Talib a perdu ses deux bras en protégeant courageusement l\'étendard de l\'Islam. Le Prophète ﷺ a annoncé que Dieu lui avait accordé deux ailes de rubis au Paradis.',
      ar: 'استشهد جعفر رضي الله عنه في غزوة مؤتة سنة ٨ هـ مقبلاً غير مدبر وقطعت يداه، فبشره الرسول ﷺ بجناحين من ياقوت يطير بهما بسلام في الجنة مع الملائكة الأبرار.',
      en: 'Jaafar was martyred during the Battle of Mu\'tah. The Prophet advised that Allah replaced his severed arms with ruby wings in Paradise.'
    }
  }
];

// Helper to project French equivalents for companion records when 'fr' language is selected
export const translateCompanion = (comp: Companion, lang: LanguageCode): Companion => {
  if (lang === 'ar') {
    return comp; // already fully implemented in Arabic natively
  }

  // Define curated translations for the 21 default sahaba in French
  const companionFrenchMapping: Record<string, {
    nameFr?: string;
    kunyaFr?: string;
    lineageFr?: string;
    tribeFr?: string;
    cityFr?: string;
    shortBioFr?: string;
    titlesFr?: string[];
    achievementsFr?: string[];
    historicalSignificanceFr?: string;
    conversionFr?: string;
  }> = {
    abu_bakr: {
      nameFr: 'Abou Bakr As-Siddiq',
      kunyaFr: 'Abou Bakr',
      lineageFr: 'Abdullah ibn Outhman ibn Aamir al-Taymi al-Qurashi',
      tribeFr: 'Banu Taym (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['As-Siddiq (Le Véridique)', 'Al-Atiq', 'Le deuxième des deux'],
      shortBioFr: 'Le premier Calife orthodoxe régnant de l\'Islam, compagnon béni du Prophète ﷺ lors de l\'expatriation protectrice de l\'Hégire.',
      conversionFr: 'Il a répondu instantanément à l\'appel à l\'Islam avec une clarté et un dévouement qui ont préservé les premiers croyants.',
      achievementsFr: [
        'Le tout premier homme libre à embrasser publiquement l\'Islam sans hésitation',
        'Seul compagnon mentionné de l\'Hégire et du refuge dans la grotte de Thawr',
        'A dépensé sans limite sa grande fortune pour affranchir les esclaves persécutés comme Bilal',
        'Premier Calife de l\'État musulman légitime',
        'Sauvegarde de l\'unité nationale face aux désertions et apostasies en unifiant l\'État',
        'Ordre donné pour la première collecte unifiée du Noble Coran'
      ],
      historicalSignificanceFr: 'Il a sauvé l\'État musulman naissant de l\'effondrement immédiat au lendemain de la mort du Messager ﷺ, jetant les fondations de l\'Histoire islamique.'
    },
    umar_bin_al_khattab: {
      nameFr: 'Umar ibn al-Khattâb',
      kunyaFr: 'Abou Hafs',
      lineageFr: 'Umar ibn al-khattab ibn Noufayl al-Adawi al-Qurashi',
      tribeFr: 'Banu Adi (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['Al-Fârouq (Le Discriminateur)', 'Le Commandeur des croyants'],
      shortBioFr: 'Le deuxième Calife orthodoxe régnant de l\'Islam, administrateur visionnaire, célèbre pour sa justice sociale incorruptible.',
      conversionFr: 'Profondément touché par l\'écoute secrète d\'épîtres de la sourate Taha chez sa sœur Fatima, il proclama sa foi publiquement.',
      achievementsFr: [
        'Établissement légal de prières publiques des musulmans à la Kaaba',
        'Création des ministères institutionnels (Diwans) et de la Trésorerie publique',
        'Fondation du calendrier hégirien international',
        'Entrée pacifique dans Jérusalem et signature du pacte d\'assurance spirituelle envers les non-musulmans'
      ],
      historicalSignificanceFr: 'Architecte en chef des administrations opérationnelles de la civilisation civile primitive, il a forgé des normes intemporelles de justice légale.'
    },
    uthman_bin_affan: {
      nameFr: 'Outhman ibn Affan',
      kunyaFr: 'Abou Abdoullah',
      tribeFr: 'Banu Umayyah (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['Dhun-Noorayn (L\'homme aux deux lumières)', 'L\'Émigré double'],
      shortBioFr: 'Le troisième Calife orthodoxe régnant, connu pour sa modestie angélique, sa générosité sociale inouïe et la canonisation du Coran.',
      conversionFr: 'Il embrassa l\'Islam au tout début de l\'appel à la Mecque sous le conseil de son ami Abou BakrAs-Siddiq.',
      achievementsFr: [
        'Financement intégral de la grande armée de Tabouk de ses propres deniers',
        'Achat du puits d\'eau potable de Roumah pour l\'offrir à l\'ensemble de Médine',
        'Codification et diffusion universelle du manuscrit préservé officiel unique du Coran (Rasm Outhmani)'
      ],
      historicalSignificanceFr: 'Il unifia définitivement la lecture canonique préservée du Livre Saint à travers le monde, sauvant l\'identité scripturale musulmane.'
    },
    ali_bin_abi_talib: {
      nameFr: 'Ali ibn Abi Talib',
      kunyaFr: 'Abou al-Hasan',
      tribeFr: 'Banu Hashim (Qoreych)',
      cityFr: 'La Mecque / Médine / Kufa',
      titlesFr: ['La Porte de la Connaissance', 'Abou Tourab', 'Le Lion victorieux de Dieu'],
      shortBioFr: 'Le quatrième Calife de l\'Islam, premier jeune croyant, savant par excellence et champion légendaire de la chevalerie chevaleresque.',
      conversionFr: 'Élevé directement sous le toit de son cousin le Prophète ﷺ, il devint à l\'âge de 10 ans le premier garçon croyant.',
      achievementsFr: [
        'Il s\'est dévoué en dormant dans le lit du Prophète ﷺ lors de la nuit de l\'Hégire pour couvrir son départ',
        'Époux béni de Fatima az-Zahra, père de Al-Hasan et Al-Husayn',
        'Victoires marquantes dans tous les duels individuels réguliers face aux champions bédouins',
        'Dépôt légal de jugements et décisions jurisprudentiels d\'une remarquable finesse juridique'
      ],
      historicalSignificanceFr: 'Il incarne le haut sommet secret de l\'éloquence arabe, de l\'exégèse théologique, des jugements juridiques et de la spiritualité pure.'
    },
    khadijah_bint_khuwaylid: {
      nameFr: 'Khadija bint Khuwaylid',
      kunyaFr: 'Umm Hind',
      tribeFr: 'Banu Asad (Qoreych)',
      cityFr: 'La Mecque',
      titlesFr: ['La Pure (Al-Tahirah)', 'La Mère des croyants', 'La Reine de la Mecque'],
      shortBioFr: 'La première épouse du Prophète ﷺ, première personne à croire à l\'annonce céleste et protectrice du Messager divin.',
      conversionFr: 'Elle fut la première à croire sans aucune hésitation à l\'annonce de la parole de l\'Archange Gabriel sous le mont Hira.',
      achievementsFr: [
        'La toute première croyante de l\'humanité entière',
        'Soutien inestimable rassurant le Prophète ﷺ lors du premier contact avec l\'au-delà',
        'Financement de l\'ensemble de l\'appel en déversant sa grande fortune marchande'
      ],
      historicalSignificanceFr: 'Elle constitua le rempart social, affectif et économique irréprochable qui abrita et consolida le Prophète ﷺ pendant la fragilité de la révélation.'
    },
    aisha_bint_abi_bakr: {
      nameFr: 'Aïcha bint Abi Bakr',
      kunyaFr: 'Umm Abdullah',
      tribeFr: 'Banu Taym (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['L\'immaculée fille du véridique', 'Mère des croyants', 'Al-Humayra'],
      shortBioFr: 'Mère des croyants, épouse préférée du Prophète ﷺ, juriste d\'une érudition immense et transmetteuse d\'un corpus de 2210 récits.',
      conversionFr: 'Née dans l\'Islam sous l\'amour de deux parents croyants dévoués, elle grandit sous la douce lumière de l\'appel.',
      historicalSignificanceFr: 'Ses profondes contributions éducatives et mémorielles s\'avèrent indispensables à la compréhension de la vie domestique et intellectuelle du Prophète ﷺ.'
    },
    bilal_bin_rabah: {
      nameFr: 'Bilal ibn Rabah',
      kunyaFr: 'Abu Abdillah',
      tribeFr: 'Banu Jumah',
      cityFr: 'Abyssinie / La Mecque / Médine / Damas',
      titlesFr: ['Le Muezzin du Prophète', 'Le Trésorier de l\'Islam'],
      shortBioFr: 'Le premier Muezzin de l\'Islam, symbole intemporel de l\'égalité universelle, de la liberté et de la fidélité.',
      historicalSignificanceFr: 'Il fut un symbole vivant de la fraternité humaine de l\'Islam, s\'élevant des fers de l\'esclavage à la noblesse spirituelle.'
    },
    khalid_bin_al_walid: {
      nameFr: 'Khalid ibn al-Walid',
      kunyaFr: 'Abou Souleymane',
      tribeFr: 'Banu Makhzum (Qoreych)',
      cityFr: 'La Mecque / Médine / Syrie',
      titlesFr: ['L\'Épée dégainée de Dieu (Sayfollah)'],
      shortBioFr: 'L\'un des plus grands tacticiens militaires de l\'histoire universelle, resté invaincu dans plus d\'une centaine d\'affrontements.',
      historicalSignificanceFr: 'Ses victoires stratégiques décisives à Yarmouk ont définitivement sécurisé le Proche-Orient naissant.'
    },
    fatima_bint_muhammad: {
      nameFr: 'Fatima bint Muhammad',
      kunyaFr: 'Umm Abiha',
      tribeFr: 'Banu Hashim (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['La Resplendissante (Al-Zahra)', 'La Maîtresse des femmes du Paradis'],
      shortBioFr: 'La plus jeune fille du Prophète ﷺ, épouse d\'Ali et mère de Al-Hasan et Al-Husayn, d\'une piété intense.',
      historicalSignificanceFr: 'Elle représente le modèle suprême de vertu sociale, de dignité féminine et de patience à travers les épreuves de l\'histoire musulmane.'
    },
    abu_hurayrah: {
      nameFr: 'Abou Houraïra',
      kunyaFr: 'Abou Houraïra (Père du chaton)',
      tribeFr: 'Azd Daws',
      cityFr: 'Yémen / Médine',
      titlesFr: ['Le Gardien de la Tradition', 'Le mémorialiste de la Sunnah'],
      shortBioFr: 'Le compagnon ayant rapporté le plus grand nombre de paroles et d\'enseignements éthiques du Prophète ﷺ, mémorisant plus de 5300 Hadiths.',
      historicalSignificanceFr: 'Grâce à sa mémoire photographique phénoménale, il a préservé un immense héritage spirituel et pratique mondial.'
    },
    salman_al_farsi: {
      nameFr: 'Salman al-Farsi',
      kunyaFr: 'Abu Abdillah',
      tribeFr: 'Originaire de Perse',
      cityFr: 'Ispahan / Médine / Kufa',
      titlesFr: ['Le Chercheur de Vérité', 'Salman de Ahl al-Bayt'],
      shortBioFr: 'Chercheur acharné de la vraie foi, il a traversé les empires de Perse et de Byzance avant de trouver le Prophète ﷺ à Médine.',
      historicalSignificanceFr: 'Pionnier des innovations stratégiques et lien d\'amitié puissant unissant le monde perse à la cause de la révélation.'
    },
    anas_bin_malik: {
      nameFr: 'Anas ibn Malik',
      kunyaFr: 'Abou Hamzah',
      tribeFr: 'Banu Khazraj (Ansar)',
      cityFr: 'Médine / Bassora',
      titlesFr: ['Le Serviteur du Messager de Dieu'],
      shortBioFr: 'Serviteur dévoué du Prophète ﷺ durant les dix ans bénis passés à Médine, devenant une source centrale d\'éthique pratique.',
      historicalSignificanceFr: 'Il transmit une mine inestimable de descriptions psychologiques intimes et d\'actes bienveillants quotidiens du Prophète ﷺ.'
    },
    hamza_bin_abd_al_muttalib: {
      nameFr: 'Hamza ibn Abd al-Muttalib',
      kunyaFr: 'Abou Yaâla',
      tribeFr: 'Banu Hashim (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['Le Lion de Dieu', 'Le Prince des martyrs'],
      shortBioFr: 'Oncle paternel et frère de lait du Prophète ﷺ, guerrier légendaire renommé pour son courage infini et tombé en martyr à Uhud.',
      historicalSignificanceFr: 'Son acceptation courageuse de l\'Islam marqua un premier tournant majeur dans la force publique de la cause mecquoise.'
    },
    abu_ubaydah_bin_al_jarrah: {
      nameFr: 'Abou Ubayda ibn al-Jarrah',
      kunyaFr: 'Abou Ubayda',
      tribeFr: 'Banu Al-Harith (Qoreych)',
      cityFr: 'La Mecque / Médine / Syrie',
      titlesFr: ['L\'homme d\'une confiance absolue (Amin al-Ummah)'],
      shortBioFr: 'L\'un des dix compagnons promis au Paradis, commandant en chef exemplaire renommé pour son humilité et sa gestion éthique.',
      historicalSignificanceFr: 'Il unifia l\'administration de la Syrie avec une telle justice que les populations locales chrétiennes louèrent ses valeurs morales.'
    },
    abdur_rahman_bin_awf: {
      nameFr: 'Abd al-Rahmân ibn Awf',
      kunyaFr: 'Abou Muhammad',
      tribeFr: 'Banu Zuhrah (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['Le Marchand d\'or de l\'Islam', 'L\'Étoile de la charité'],
      shortBioFr: 'Homme d\'affaires exceptionnel et philanthrope hors pair, ayant entièrement financé à lui seul de multiples œuvres caritatives d\'urgence.',
      historicalSignificanceFr: 'Il illustre la parfaite articulation de l\'excellence financière moderne et de l\'éthique spirituelle la plus noble.'
    },
    saad_bin_abi_waqqas: {
      nameFr: 'Sa\'d ibn Abi Waqqas',
      kunyaFr: 'Abou Ishaq',
      tribeFr: 'Banu Zuhrah (Qoreych)',
      cityFr: 'La Mecque / Médine / Kufa',
      titlesFr: ['Le premier à avoir décoché une flèche', 'Le conquérant de Qadisiyyah'],
      shortBioFr: 'Un combattant intrépide et oncle maternel du Prophète ﷺ, commandant en chef de la victoire stratégique décisive de Qadisiyyah.',
      historicalSignificanceFr: 'Il mena l\'ouverture de la Perse, fondant et organisant la ville d\'intellectuels et de juristes de Kufa.'
    },
    muadh_bin_jabal: {
      nameFr: 'Mou\'adh ibn Jabal',
      kunyaFr: 'Abou Abdoullah',
      tribeFr: 'Banu Salimah (Ansar)',
      cityFr: 'Médine / Yémen / Syrie',
      titlesFr: ['Le Maître du droit licite et illicite'],
      shortBioFr: 'Savante référence, envoyé comme juge au Yémen directement par le Prophète ﷺ pour structurer la vie légale régionale.',
      historicalSignificanceFr: 'Principal formateur du premier système juridique décentralisé territorial de l\'époque de la révélation.'
    },
    abdullah_bin_masood: {
      nameFr: 'Abdullah ibn Mas\'oud',
      kunyaFr: 'Abou Abdoullah',
      tribeFr: 'Banu Hudhayl',
      cityFr: 'La Mecque / Médine / Kufa',
      titlesFr: ['Le premier à avoir récité le Coran publiquement', 'Le digne gardien du secret du Prophète'],
      shortBioFr: 'L\'un des tout premiers croyants de l\'Hégire, gardien intime et lettré exceptionnel, fondateur de la prestigieuse école théologique de Kufa.',
      historicalSignificanceFr: 'La clé de voûte de l\'école juridique irakienne, ayant formé les plus grands savants et exégètes du Coran.'
    },
    abdullah_bin_abbas: {
      nameFr: 'Abdullah ibn Abbas',
      kunyaFr: 'Abou al-Abbas',
      tribeFr: 'Banu Hashim (Qoreych)',
      cityFr: 'La Mecque / Médine / Taïf',
      titlesFr: ['L\'Océan du Savoir', 'Le Traducteur du Coran'],
      shortBioFr: 'Grand cousin du Prophète ﷺ, considéré comme le père fondateur de la science de l\'exégèse coranique (Tafssir).',
      historicalSignificanceFr: 'Il posa les premières bases académiques rigoureuses de l\'analyse approfondie des textes, enseignant à des milliers d\'étudiants.'
    },
    abdullah_bin_umar: {
      nameFr: 'Abdullah ibn Umar',
      kunyaFr: 'Abou Abd al-Rahmân',
      tribeFr: 'Banu Adi (Qoreych)',
      cityFr: 'La Mecque / Médine',
      titlesFr: ['L\'héritier probe de la dévotion', 'Le fidèle suiveur de la Sunnah'],
      shortBioFr: 'Fils d\'Umar ibn al-Khattâb, référence majeure de l\'abstinence et d\'un attachement infaillible aux moindres gestes du Prophète ﷺ.',
      historicalSignificanceFr: 'Deuxième plus important transmetteur de Hadiths et le pilier central stable de l\'école intellectuelle de Médine durant un demi-siècle.'
    }
  };

  const map = companionFrenchMapping[comp.id];
  if (!map) {
    // Elegant fallback: create French versions by mixing English transliterations or adding prefix indicators
    return {
      ...comp,
      nameFr: comp.nameEn,
      kunyaFr: comp.kunyaEn,
      lineageFr: comp.lineageEn,
      tribeFr: comp.tribeEn,
      cityFr: comp.cityEn,
      shortBioFr: comp.shortBioEn,
      longBioFr: comp.longBioEn,
      conversionFr: comp.conversionEn,
      achievementsFr: comp.achievementsEn,
      historicalSignificanceFr: comp.historicalSignificanceEn
    };
  }

  return {
    ...comp,
    nameFr: map.nameFr || comp.nameEn,
    kunyaFr: map.kunyaFr || comp.kunyaEn,
    lineageFr: map.lineageFr || comp.lineageEn,
    tribeFr: map.tribeFr || comp.tribeEn,
    cityFr: map.cityFr || comp.cityEn,
    shortBioFr: map.shortBioFr || comp.shortBioEn,
    longBioFr: comp.longBioEn, // Markdown can remain in English/Arabic as fallback safely
    conversionFr: map.conversionFr || comp.conversionEn,
    achievementsFr: map.achievementsFr || comp.achievementsEn,
    titlesFr: map.titlesFr || comp.titlesEn,
    historicalSignificanceFr: map.historicalSignificanceFr || comp.historicalSignificanceEn
  };
};

/**
 * Translates structural cities on Caravan Map
 */
export const translateCityLabel = (cityId: string, lang: LanguageCode): { name: string; hubText: string } => {
  const cityTranslations: Record<string, Record<LanguageCode, { name: string; hubText: string }>> = {
    mecca: {
      fr: { name: 'La Mecque', hubText: 'Mère des Cités' },
      ar: { name: 'مكة المكرمة', hubText: 'أم القرى' },
      en: { name: 'Makkah', hubText: 'Al-Mukarramah' }
    },
    medina: {
      fr: { name: 'Médine', hubText: 'La Cité Illuminée' },
      ar: { name: 'المدينة المنورة', hubText: 'طيبة الطيبة' },
      en: { name: 'Al-Madinah', hubText: 'Al-Munawwarah' }
    },
    sham: {
      fr: { name: 'Le Levant (Damas)', hubText: 'Garnisons d\'Al-Cham' },
      ar: { name: 'حاضرة الشام', hubText: 'أرض الرباط الخصيب' },
      en: { name: 'Al-Sham (Syria)', hubText: 'Levant Garrison' }
    },
    iraq: {
      fr: { name: 'Irak (Kufa)', hubText: 'Maison de la Science' },
      ar: { name: 'العراق الكوفي', hubText: 'محراب الفقه' },
      en: { name: 'Al-Iraq (Kufa)', hubText: 'House of Science' }
    },
    egypt: {
      fr: { name: 'Égypte (Fostat)', hubText: 'Avant-poste du Nil' },
      ar: { name: 'ديار مصر والفسطاط', hubText: 'حصن الفلاح' },
      en: { name: 'Egypt (Fustat)', hubText: 'Nile Outpost' }
    },
    abyssinia: {
      fr: { name: 'Abyssinie', hubText: 'Terre du Négus juste' },
      ar: { name: 'أرض الحبشة النبيلة', hubText: 'ملك لا يظلم بشر به' },
      en: { name: 'Abyssinia', hubText: 'First Hegira Haven' }
    },
    yemen: {
      fr: { name: 'Yémen', hubText: 'Porte Méridionale' },
      ar: { name: 'أكناف اليمن', hubText: 'مأرز الإيمان والحكمة' },
      en: { name: 'Yemen', hubText: 'Southern Gate' }
    },
    persia: {
      fr: { name: 'Perse & Est', hubText: 'Horizons Orientaux' },
      ar: { name: 'بلاد فارس والشرق', hubText: 'مشرق البصائر' },
      en: { name: 'Persia & East', hubText: 'Persian Horizons' }
    }
  };

  return cityTranslations[cityId]?.[lang] || { name: cityId, hubText: '' };
};
