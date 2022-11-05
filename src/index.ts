import config from "./config";
import * as knex from "knex";
import {MongoClient} from "mongodb";
import {KKuTuWord, KKuTuWordData, KKuTuWordValue, TTuKuWord, TTuKuWordClass} from "./types";
import fs from "fs";
import path from "path";

const mongoClient = new MongoClient(config.TTuKu);

const convert = async () => {
  console.info("트꾸 데이터베이스에 연결하는 중...")
  await mongoClient.connect()

  console.info("트꾸 데이터베이스에서 단어를 가져오는 중...")
  const tWords = await mongoClient.db().collection('words').find().toArray() as unknown as TTuKuWord[]

  console.info(`트꾸 단어 ${tWords.length.toLocaleString()}개를 불러왔습니다.`)
  console.info("끄투 단어로 변환 시작...")
  const kWords = TTuKuToKKuTu(tWords)

  console.info(`끄투 단어 ${kWords.length.toLocaleString()}개를 생성했습니다.`)

  const kWordsToExport = kWords.map((w) => {
    return {
      _id: w._id,
      type: w.type.join(","),
      mean: w.mean,
      hit: w.hit,
      flag: w.flag,
      theme: w.theme.join(",")
    }})

  console.info("save json file...")
  fs.writeFileSync(
    path.join(__dirname, "result.json"),
    JSON.stringify(kWordsToExport, null, 2)
  )

  console.info("save complete!")

  console.info("Start to connect to SQL Database");
  const pgClient = knex.default({
    client: 'pg',
    connection: config.KKuTu,
  });

  console.info("Reset Database");
  await pgClient("kkutu_ko").del();

  console.info("Inserting words to SQL Database");
  try {
    await pgClient.batchInsert('kkutu_ko', kWordsToExport, 1000);
  } catch (e) {
    console.warn((e as Error).message.slice(0, 300));
    console.warn((e as Error).message.slice((e as Error).message.length - 500));
  }

  console.info("End");
};

const TTuKuToKKuTu = (words: TTuKuWord[]): KKuTuWord[] => {
  const kWords = {} as KKuTuWordData;

  let index = 0;

  for(const word of words) {
    index++
    if(index % 100000 === 0) {
      console.info(`${index.toLocaleString()}개의 단어를 변환했습니다. ${JSON.stringify(word)}`)
    }

    // 속담과 관용구는 추가하지 않음
    if(word.wordClass === TTuKuWordClass.Proverb || (word.wordClass === TTuKuWordClass.Idiom)) continue;

    const name = convertName(word.name);

    // 트꾸는 단어 하나 당 여러 개의 주제를 가질 수 있지만 끄투는 불가능하므로, 복제해서 여러 개 추가해야 함
    // 트꾸 단어 하나를 몇 개의 끄투 단어로 추가할 것인지 값
    const wordDupNum = word.tags.length || 1

    const w = kWords[name]

    // 단어가 없는 경우 생성
    if(!w) {
      kWords[name] = {
        type: repeatArray(word.wordClass, wordDupNum),
        mean: "＂1＂［1］（1）" + word.definition,
        hit: 0,
        flag: 0,
        theme: word.tags.length ? word.tags : ["0"]
      } as KKuTuWordValue
      continue
    }

    // 단어가 이미 존재하는 경우
    w.type.push(...repeatArray(word.wordClass, wordDupNum))
    w.mean += ("＂1＂［1］（1）" + word.definition).repeat(wordDupNum)
    w.theme.push(...(word.tags.length ? word.tags : ["0"]))

  }

  const kWordsArr = [] as KKuTuWord[];

  for (const name in kWords) {
    kWordsArr.push({
      _id: name,
      ...kWords[name]
    })
  }

  return kWordsArr
}

const convertName = (name: string) => name.replace(/[\s-^ㆍ]/g, "").replace(/(\(.*\))/g, "")

const repeatArray = (element: any, count: number) => {
  const arr = [] as any[];
  for (let i = 0; i < count; i++) {
    arr.push(element);
  }
  return arr;
}

convert().then()
