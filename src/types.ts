
export interface TTuKuWord {
  name: string
  simpleName: string
  wordClass: TTuKuWordClass
  definition: string
  tags: string[]
  reference: string
  origin?: string
  pronunciation?: string
}

export type KKuTuWordData = Record<string, KKuTuWordValue>

export interface KKuTuWordValue {
  type: TTuKuWordClass[]
  mean: string
  hit: number
  flag: number
  theme: string[] // 넣기 전에 string으로 변환해야 함
}

export interface KKuTuWord {
  _id: string
  type: TTuKuWordClass[]
  mean: string
  hit: number
  flag: number
  theme: string[] // 넣기 전에 string으로 변환해야 함
}

export enum KKuTuFlag {
  Loanword = 1,
  Injeong,
  Spaced =4,
  Saturi = 8,
  Old=16,
  Munhwa=32
}

// 품사
export enum TTuKuWordClass {
  Noun, // 명사
  Pronoun, // 대명사
  Numeral, // 수사
  Postposition, // 조사
  Verb, // 동사
  Adjective, // 형용사
  Determiner, // 관형사
  Adverb, // 부사
  Interjection, // 감탄사
  Affix, // 접사
  DependentNoun, // 의존 명사
  AuxiliaryVerb, // 보조 동사
  AuxiliaryAdjective, // 보조 형용사
  Ending, // 어미
  DeterminerNoun, // 관형사·명사
  NumeralDeterminer, // 수사·관형사
  NounAdverb, // 명사·부사
  InterjectionNoun, // 감탄사·명사
  PronounAdverb, // 대명사·부사
  PronounInterjection, // 대명사·감탄사
  VerbAdjective, // 동사·형용사
  DeterminerInterjection, // 관형사·감탄사
  AdverbInterjection, // 부사·감탄사
  DependentNounPostposition, // 의존명사·조사
  NumeralDeterminerNoun, // 수사·관형사·명사
  PronounDeterminer, // 대명사·관형사
  None, // 품사 없음
  Phrase = 30, // 구
  Idiom, // 관용구
  Proverb, // 속담
}
