export const ABOUT_SECTIONS = [
  {
    id: 'who-we-are',
    title: '¿Quiénes somos?',
    icon: 'people-outline',
    accent: '#0AA693',
    background: '#E8F7F2',
    preview:
      'En CresiMotion somos un equipo multidisciplinario que ha creado un enfoque innovador para la sanación emocional y el crecimiento integral.',
    blocks: [
      {
        type: 'paragraph',
        text:
          'En CresiMotion somos un equipo multidisciplinario que ha creado un enfoque innovador para la sanación emocional y el crecimiento integral. Nuestra metodología comienza con una autoevaluación física y emocional, continúa con un cambio de perspectiva sobre la situación personal, y se apoya en herramientas altamente avanzadas que trabajan directamente con la mente inconsciente. A través de recomendaciones oportunas y ejercicios prácticos, acompañamos a cada persona desde una perspectiva cercana, accesible y transformadora.',
      },
      {
        type: 'paragraph',
        text: 'CresiMotion es más que una plataforma: es una comunidad que acompaña tu transformación. Nuestro nombre representa ese camino:',
      },
      {
        type: 'bullets',
        items: [
          'Community – Comunidad para crecer en acompañamiento.',
          'Renewal – Renovación emocional y mental.',
          'Emotional – Centro en las emociones humanas.',
          'Support – Acompañamiento humano y constante.',
          'Intelligent – Estrategias inteligentes y efectivas.',
          'MOTION – Movimiento hacia la mejora y la optimización de tu bienestar.',
        ],
      },
      {
        type: 'paragraph',
        text: 'Acompañamos a las personas a reconectar con su fuerza interior, con herramientas claras, guías prácticas y una comunidad que inspira.',
      },
    ],
  },
  {
    id: 'mission',
    title: 'Misión',
    icon: 'compass-outline',
    accent: '#5B6FA8',
    background: '#EDF1FB',
    preview:
      'Nuestra misión es brindar herramientas de sanación emocional y desarrollo integral accesibles, efectivas y profundamente humanas.',
    blocks: [
      {
        type: 'paragraph',
        text:
          'Nuestra misión es brindar herramientas de sanación emocional y desarrollo integral accesibles, efectivas y profundamente humanas. A través de nuestra plataforma tecnológica, ofrecemos programas diseñados para que cualquier persona, sin importar su contexto, pueda reconectarse consigo misma, entender su estado emocional y avanzar hacia una vida más plena.',
      },
      {
        type: 'paragraph',
        text:
          'Nos enfocamos en crear soluciones inmediatas o de corto plazo que apoyen a quienes atraviesan momentos difíciles, integrando dinámicas de autoevaluación, planes de acción personalizados y acompañamiento continuo.',
      },
      {
        type: 'highlight',
        text: 'Queremos que cada persona pueda responder con claridad a una pregunta esencial: ¿Cómo me siento y qué debo hacer hoy para estar mejor?',
      },
    ],
  },
  {
    id: 'vision',
    title: 'Visión',
    icon: 'eye-outline',
    accent: '#C96E4E',
    background: '#FCEFE8',
    preview:
      'Queremos ser referentes globales en la creación de programas de sanación emocional y crecimiento integral.',
    blocks: [
      {
        type: 'paragraph',
        text:
          'Queremos ser referentes globales en la creación de programas de sanación emocional y crecimiento integral. Soñamos con una comunidad donde miles de personas compartan su proceso de transformación, generando redes de apoyo reales, cercanas y esperanzadoras.',
      },
      {
        type: 'paragraph',
        text: 'Nuestra visión es construir un ecosistema de bienestar basado en tres pilares:',
      },
      {
        type: 'bullets',
        items: [
          'Tecnología al servicio de la conciencia personal.',
          'Comunidad como fuerza para el cambio.',
          'Contenido de alto impacto, con resultados visibles y sostenibles.',
        ],
      },
      {
        type: 'paragraph',
        text: 'En CresiMotion, no solo buscamos que te sientas mejor. Queremos que descubras tu potencial, lo actives y lo pongas en movimiento.',
      },
    ],
  },
  {
    id: 'values',
    title: 'Valores',
    icon: 'heart-outline',
    accent: '#9C6B2F',
    background: '#FFF4E7',
    preview: 'Accesibilidad universal. Creemos que el bienestar emocional debe estar al alcance de todas las personas, sin importar su situación económica, idioma o lugar de residencia.',
    blocks: [
      {
        type: 'bullets',
        items: [
          'Accesibilidad universal. Creemos que el bienestar emocional debe estar al alcance de todas las personas, sin importar su situación económica, idioma o lugar de residencia.',
          'Cuidado consciente. Tratamos cada experiencia emocional con respeto, humanidad y compromiso ético, acompañando sin juzgar.',
          'Transformación integral. Nuestras herramientas están diseñadas para generar sanación emocional real y transformación integral, con un enfoque claro, positivo y útil para la vida diaria.',
          'Autonomía y autoconocimiento. Acompañamos a las personas a conocerse mejor y a construir sus propias respuestas, fortaleciendo su sabiduría interior.',
          'Innovación constante. Evolucionamos cada día con base en la experiencia de quienes usan la plataforma, investigamos y aplicamos enfoques y técnicas de última generación.',
          'Comunidad viva. Fomentamos la creación de espacios compartidos de intercambio, escucha y colaboración, porque creemos que sanar en comunidad es más poderoso que sanar en solitario.',
        ],
      },
    ],
  },
];

export const getAboutSectionById = (sectionId: string) =>
  ABOUT_SECTIONS.find(section => section.id === sectionId) || ABOUT_SECTIONS[0];
