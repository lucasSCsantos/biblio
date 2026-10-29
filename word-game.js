// Respostas revisadas: palavras comuns com significado próprio, sem conectivos.
const wordGame = (() => {
  const answers = new Set(
    `AGUAS ALTAR AMIGO ANJOS ATRIO BARCO BRACO CAMPO CARNE
    CARTA CEDRO CEIFA CERVO CHAMA CHUVA COURO DENTE DORES FESTA FILHA FILHO
    FOLHA FORCA FORNO FRUTO GRACA HONRA JUSTO LABIO LANCA LEITE LEPRA LETRA
    LIVRO LUGAR MADRE MANTO MONTE MORTE MUROS NUVEM OBRAS OLHOS OMBRO OSSOS
    PEDRA PEIXE PEITO PODER PORTA POVOS PRAGA PRATA PRECO RAMOS REINO ROCHA
    ROSTO SABER SABIO SANTO SINAL SONHO SORTE SURDO TARDE TERRA TIGRE TORRE
    TRIGO TRONO UNCAO VALOR VARAO VASOS VELHO VENTO VERDE VIDAS VINHA VINHO
    VIVER VOZES`.split(/\s+/),
  );
  let vocabulary = new Set();

  function normalize(word) {
    return word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  function mask(text, secret) {
    return text.replace(/\p{L}+/gu, (word) =>
      normalize(word) === secret ? "_____" : word,
    );
  }

  async function challenge(reference, hash) {
    const response = await fetch("./bible.json");
    if (!response.ok) throw new Error("Texto bíblico indisponível");
    const corpus = await response.json();
    const candidates = new Map();
    vocabulary = new Set();
    for (const book of corpus) {
      book.chapters.forEach((verses, chapterIndex) => {
        verses.forEach((text, verseIndex) => {
          const words = text.match(/\p{L}+/gu) || [];
          for (const word of words) {
            const normalized = normalize(word);
            if (/^[A-Z]{5}$/.test(normalized)) vocabulary.add(normalized);
          }
          if (
            book.abbrev === reference.book &&
            chapterIndex + 1 === reference.chapter &&
            verseIndex + 1 === reference.verse
          )
            return;
          const uniqueAnswers = new Set(
            words.map(normalize).filter((word) => answers.has(word)),
          );
          for (const secret of uniqueAnswers) {
            if (!candidates.has(secret)) candidates.set(secret, []);
            candidates.get(secret).push({
              secret: secret.split(""),
              versicle: text,
              maskedVersicle: mask(text, secret),
              reference: `${book.name} ${chapterIndex + 1}:${verseIndex + 1}`,
              answerWord: words.find((word) => normalize(word) === secret),
            });
          }
        });
      });
    }
    const words = [...candidates.keys()].sort();
    if (!words.length) throw new Error("Nenhuma palavra disponível");
    const secret = words[parseInt(hash.slice(0, 8), 16) % words.length];
    const verses = candidates.get(secret);
    return verses[parseInt(hash.slice(8, 16), 16) % verses.length];
  }

  return {
    normalize,
    challenge,
    accepts: (word) => vocabulary.has(normalize(word)),
  };
})();
