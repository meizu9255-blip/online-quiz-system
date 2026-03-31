export const quizzes = [
  {
    id: 1, title: "HTML негіздері", description: "HTML тілінің негізгі тегтері мен құрылымы бойынша тест",
    icon: "HTML", bannerClass: "banner-blue", timeLimit: 300, questionsCount: 10, difficulty: "Оңай", category: "Web",
    questions: [
      { id: 1, question: "HTML аббревиатурасы нені білдіреді?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctAnswer: 0 },
      { id: 2, question: "HTML құжатының құрылымын бастайтын тег қайсы?", options: ["body", "head", "DOCTYPE html", "html"], correctAnswer: 2 },
      { id: 3, question: "Тақырып жасау үшін қандай тег қолданылады?", options: ["h6 тегі", "h1 тегі", "title тегі", "heading тегі"], correctAnswer: 1 },
      { id: 4, question: "Гиперсілтеме жасау үшін қандай тег қолданылады?", options: ["link тегі", "href тегі", "a тегі", "url тегі"], correctAnswer: 2 },
      { id: 5, question: "Сурет қою үшін қандай тег қолданылады?", options: ["image тегі", "pic тегі", "photo тегі", "img тегі"], correctAnswer: 3 },
      { id: 6, question: "Нөмірленбеген тізім жасау үшін қандай тег қолданылады?", options: ["ol тегі", "list тегі", "ul тегі", "dl тегі"], correctAnswer: 2 },
      { id: 7, question: "HTML-де комментарий жазу синтаксисі қандай?", options: ["// comment", "/* comment */", "!-- comment --", "# comment"], correctAnswer: 2 },
      { id: 8, question: "Кесте жасау үшін қандай тег қолданылады?", options: ["tab тегі", "table тегі", "grid тегі", "tbl тегі"], correctAnswer: 1 },
      { id: 9, question: "Форма жасау үшін қандай тег қолданылады?", options: ["input тегі", "form тегі", "field тегі", "submit тегі"], correctAnswer: 1 },
      { id: 10, question: "HTML5-те видео қою үшін қандай тег қолданылады?", options: ["media тегі", "movie тегі", "video тегі", "film тегі"], correctAnswer: 2 }
    ]
  },
  {
    id: 2, title: "CSS негіздері", description: "CSS стильдері мен дизайн бойынша білімді тексеру тесті",
    icon: "CSS", bannerClass: "banner-green", timeLimit: 300, questionsCount: 10, difficulty: "Оңай", category: "Web",
    questions: [
      { id: 1, question: "CSS аббревиатурасы нені білдіреді?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correctAnswer: 1 },
      { id: 2, question: "CSS-ті HTML-ге қосудың қандай тәсілдері бар?", options: ["Тек inline", "Тек external", "Inline, internal, external", "Тек internal"], correctAnswer: 2 },
      { id: 3, question: "Элементтің фон түсін өзгерту үшін қандай қасиет қолданылады?", options: ["color", "bg-color", "background-color", "font-color"], correctAnswer: 2 },
      { id: 4, question: "Мәтін түсін өзгерту үшін қандай қасиет қолданылады?", options: ["text-color", "font-color", "color", "foreground"], correctAnswer: 2 },
      { id: 5, question: "ID селекторын CSS-те қалай жазамыз?", options: [".id", "#id", "*id", "@id"], correctAnswer: 1 },
      { id: 6, question: "Class селекторын CSS-те қалай жазамыз?", options: ["#class", ".class", "*class", "&class"], correctAnswer: 1 },
      { id: 7, question: "Flexbox-та элементтерді көлденеңінен ортаға қою үшін не қолданамыз?", options: ["align-items: center", "text-align: center", "justify-content: center", "margin: auto"], correctAnswer: 2 },
      { id: 8, question: "CSS-те padding дегеніміз не?", options: ["Элементтің сыртқы шегіністігі", "Элементтің ішкі шегіністігі", "Элементтің жиегі", "Элементтің ені"], correctAnswer: 1 },
      { id: 9, question: "Media query не үшін қолданылады?", options: ["Анимация жасау", "Адаптивті дизайн жасау", "Сурет қою", "Сілтеме жасау"], correctAnswer: 1 },
      { id: 10, question: "z-index қасиеті не үшін қолданылады?", options: ["Элементтің биіктігін орнату", "Элементтің қабаттасу реттілігін орнату", "Элементтің масштабын орнату", "Элементтің бұрышын орнату"], correctAnswer: 1 }
    ]
  },
  {
    id: 3, title: "JavaScript негіздері", description: "JavaScript программалау тілінің негіздері бойынша тест",
    icon: "JS", bannerClass: "banner-orange", timeLimit: 420, questionsCount: 10, difficulty: "Орташа", category: "Programming",
    questions: [
      { id: 1, question: "JavaScript-те айнымалы жариялау үшін қандай кілт сөздер қолданылады?", options: ["var, let, const", "int, float, string", "dim, set, define", "variable, value, data"], correctAnswer: 0 },
      { id: 2, question: "console.log() не үшін қолданылады?", options: ["Экранға хабарлама шығару", "Консольге деректерді шығару", "Файл жасау", "Айнымалы жариялау"], correctAnswer: 1 },
      { id: 3, question: "JavaScript-те массив жасау синтаксисі қандай?", options: ["var arr = (1,2,3)", "var arr = {1,2,3}", "var arr = [1,2,3]", "var arr = <1,2,3>"], correctAnswer: 2 },
      { id: 4, question: "'===' операторы '==' операторынан қалай ерекшеленеді?", options: ["Ешқандай айырмашылық жоқ", "'===' мән мен типті тексереді", "'==' мән мен типті тексереді", "'===' тек типті тексереді"], correctAnswer: 1 },
      { id: 5, question: "DOM дегеніміз не?", options: ["Data Object Model", "Document Object Model", "Digital Output Module", "Dynamic Object Method"], correctAnswer: 1 },
      { id: 6, question: "getElementById() не үшін қолданылады?", options: ["Жаңа элемент жасау", "Элементті id бойынша табу", "Элементті жою", "Элементтің стилін өзгерту"], correctAnswer: 1 },
      { id: 7, question: "addEventListener() функциясы не істейді?", options: ["Жаңа элемент қосады", "Оқиға тыңдаушысын қосады", "Стиль қосады", "Класс қосады"], correctAnswer: 1 },
      { id: 8, question: "JavaScript-те функция жасаудың қанша тәсілі бар?", options: ["1", "2", "3 және одан көп", "Функция жоқ"], correctAnswer: 2 },
      { id: 9, question: "typeof null нәтижесі не болады?", options: ["'null'", "'undefined'", "'object'", "'boolean'"], correctAnswer: 2 },
      { id: 10, question: "JSON дегеніміз не?", options: ["JavaScript Object Notation", "Java Standard Output Notation", "JavaScript Online Network", "Java Syntax Object Name"], correctAnswer: 0 }
    ]
  },
  {
    id: 4, title: "Компьютерлік желілер", description: "Желілер мен интернет технологиялары бойынша тест",
    icon: "NET", bannerClass: "banner-teal", timeLimit: 360, questionsCount: 10, difficulty: "Орташа", category: "Networks",
    questions: [
      { id: 1, question: "IP мекенжайдың толық формасы қандай?", options: ["Internet Protocol", "Internal Program", "Internet Provider", "Intranet Protocol"], correctAnswer: 0 },
      { id: 2, question: "HTTP протоколы қандай порт нөмірін қолданады?", options: ["21", "25", "80", "443"], correctAnswer: 2 },
      { id: 3, question: "DNS не үшін қолданылады?", options: ["Файл жіберу", "Домен атауларын IP адрестерге айналдыру", "Электрондық пошта жіберу", "Вирустарды жою"], correctAnswer: 1 },
      { id: 4, question: "HTTPS-тегі 'S' нені білдіреді?", options: ["Speed", "Server", "Secure", "Standard"], correctAnswer: 2 },
      { id: 5, question: "TCP/IP моделінде қанша қабат бар?", options: ["3", "4", "5", "7"], correctAnswer: 1 },
      { id: 6, question: "MAC мекенжай қанша байттан тұрады?", options: ["4 байт", "6 байт", "8 байт", "12 байт"], correctAnswer: 1 },
      { id: 7, question: "Қай құрылғы желідегі деректерді маршруттайды?", options: ["Хаб", "Свитч", "Роутер", "Модем"], correctAnswer: 2 },
      { id: 8, question: "FTP протоколы не үшін қолданылады?", options: ["Электрондық пошта жіберу", "Файл жіберу", "Веб-бет ашу", "Видео көру"], correctAnswer: 1 },
      { id: 9, question: "IPv4 мекенжай қанша биттен тұрады?", options: ["16 бит", "32 бит", "64 бит", "128 бит"], correctAnswer: 1 },
      { id: 10, question: "VPN не үшін қолданылады?", options: ["Вирустарды жою", "Қауіпсіз байланыс жасау", "Интернет жылдамдығын арттыру", "Файлдарды қысу"], correctAnswer: 1 }
    ]
  },
  {
    id: 5, title: "Ақпараттық қауіпсіздік", description: "Киберқауіпсіздік негіздері бойынша тест",
    icon: "SEC", bannerClass: "banner-red", timeLimit: 300, questionsCount: 10, difficulty: "Қиын", category: "Security",
    questions: [
      { id: 1, question: "Фишинг дегеніміз не?", options: ["Вирус түрі", "Жалған сайттар арқылы деректерді ұрлау", "Файлдарды шифрлау", "Желіні бұзу"], correctAnswer: 1 },
      { id: 2, question: "Күшті парольдің минималды ұзындығы қанша?", options: ["4 таңба", "6 таңба", "8 таңба", "12 таңба"], correctAnswer: 2 },
      { id: 3, question: "Firewall не үшін қолданылады?", options: ["Вирустарды жою", "Желілік трафикті бақылау және сүзу", "Файлдарды шифрлау", "Парольдерді сақтау"], correctAnswer: 1 },
      { id: 4, question: "DDoS шабуылы дегеніміз не?", options: ["Деректерді ұрлау", "Серверді көп сұраумен бітіру", "Парольді бұзу", "Вирус жіберу"], correctAnswer: 1 },
      { id: 5, question: "SSL сертификаты не үшін керек?", options: ["Сайтты жылдамдату", "Деректерді шифрлау", "Сайтты әдемілеу", "Рекламаны блоктау"], correctAnswer: 1 },
      { id: 6, question: "Қай шифрлау типі ашық және жабық кілт қолданады?", options: ["Симметриялық", "Асимметриялық", "Хэштеу", "Кодтау"], correctAnswer: 1 },
      { id: 7, question: "Malware дегеніміз не?", options: ["Пайдалы бағдарлама", "Зиянды бағдарлама", "Антивирус", "Операциялық жүйе"], correctAnswer: 1 },
      { id: 8, question: "Екі факторлы аутентификация (2FA) не үшін керек?", options: ["Жылдамдықты арттыру", "Қосымша қауіпсіздік қабатын қосу", "Парольді ұмытпау", "Интернетке қосылу"], correctAnswer: 1 },
      { id: 9, question: "SQL Injection шабуылы не істейді?", options: ["CSS-ті өзгертеді", "Дерекқорға зиянды сұрау жібереді", "JavaScript-ті өшіреді", "Суреттерді жояды"], correctAnswer: 1 },
      { id: 10, question: "VPN қосылғанда не болады?", options: ["Интернет жылдамдайды", "Трафик шифрланады", "Вирустар жойылады", "Компьютер жылдамдайды"], correctAnswer: 1 }
    ]
  }
];  