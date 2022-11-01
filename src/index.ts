import exp from "constants";
import { Dirent, readdirSync } from "fs";

const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const datsourceDir = 'datasource/';
const articleTypeGoogleIME: IME = {
  'anthroponym': '人名',
  'songTitle': '名詞',
  'others': '名詞'
}

function main(): void {
  const dictionaryFilePaths = getDictionaryFileNames(datsourceDir);
  let dictionary: Dictionary = [];
  dictionaryFilePaths.forEach(dictonaryFilePath => {
    dictionary = dictionary.concat(yaml.load(fs.readFileSync(dictonaryFilePath, 'utf8')) as Dictionary);
  });

  const googleIMEDics = generateGoogleIMEDics(flattenDictionaries(dictionary)).join('\n');
  const macIMEDics = generateMacIMEDics(flattenDictionaries(dictionary)).join('\n');

  fs.writeFileSync("datadist/googleIME.txt", googleIMEDics);
  fs.writeFileSync("datadist/macIME.plist", macIMEDics);
}

function generateGoogleIMEDics(flattenArticles: Array<FlattenDictionary>): Array<string> {
  const rows: Array<string> = [];
  flattenArticles.forEach(article => {
    rows.push(`${article.phrase}\t${article.shortcut}\t${articleTypeGoogleIME[article.type]}`);
  });
  return rows;
}

function generateMacIMEDics(flattenArticles: Array<FlattenDictionary>): Array<string> {
  let rows: Array<string> = [];
  rows = rows.concat(preambleForMac());
  flattenArticles.forEach(articles => {
    rows = rows.concat(dictForMac(articles.phrase, articles.shortcut));
  });
  rows = rows.concat(postambleForMac());
  return rows;
}

function preambleForMac(): Array<string> {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<array>'
  ];
}

function dictForMac(phrase: string, shortcut: string): Array<string> {
  return [
    '\t<dict>',
    '\t\t<key>phrase</key>',
    `\t\t<string>${phrase}</string>`,
    '\t\t<key>shortcut</key>',
    `\t\t<string>${shortcut}</string>`,
    '\t</dict>'
  ]
}

function postambleForMac(): Array<string> {
  return [
    '</array>',
    '</plist>'
  ];
}

function getDictionaryFileNames(sourceDir: string): Array<string> {
  const dictionaryFiles: string[] = readdirSync(sourceDir, {
    withFileTypes: true
  }).filter(dirent => dirent.isFile())
    .filter(dirent => dirent.name != 'example.yml')
    .filter(dirent => path.extname(dirent.name) === '.yml')
    .map(dirent => `${sourceDir}${dirent.name}`);
  return dictionaryFiles;
}

function flattenDictionaries(datasource: Dictionary): Array<FlattenDictionary> {
  let flattenDictionary: Array<FlattenDictionary> = [];
  datasource.forEach(categories => {
    categories.dics.forEach(article => {
      flattenDictionary = flattenDictionary.concat(flattenArticles(article, categories.type));
    });
  });
  return flattenDictionary;
}

function flattenArticles(article: Article, type: string): Array<FlattenDictionary> {
  const flattenDictionaries: Array<FlattenDictionary> = [];
  article.headwords.forEach(headword => {
    article.expressions.forEach(expression => {
      flattenDictionaries.push({
        phrase: headword,
        shortcut: expression,
        type: type,
      });
    });
  });
  return flattenDictionaries;
}

main();

type Dictionary = Array<category>;

type category = {
  type: string
  dics: Array<Article>
};

type Article = {
  headwords: Array<string>
  expressions: Array<string>
};

type FlattenDictionary = {
  phrase: string
  shortcut: string
  type: string
}

interface IME {
  [key: string]: string;
}
