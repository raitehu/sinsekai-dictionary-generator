# SINSEKAI dictionary generator

Generate dictionary files for macOS and GoogleIME from YAML file.

```bash
docker run --rm -it -v ${current directory}:/app --name sinsekai-dictionary-generator sinsekai-dictionary-generator

# compile
$ yarn tsc

# run
$ node dist/index.js
```

datasourceディレクトリに `.yml` の形式でファイルを追加すると自動で対象になります。
実行するとdatadistディレクトリに各環境用の辞書ファイルが作成されます。
