// <script /> を作成
const script = document.createElement("script");

// 実行したいファイルを設定する
script.setAttribute("src", chrome.extension.getURL("contents_main.js"));

// サイトの `<head />` を取得する
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

// `<script />` を挿入する
head.insertBefore(script, head.lastChild);

// <link />を作成
const link = document.createElement("link");

// 適用したいスタイルファイルを設定する
link.setAttribute("href", chrome.extension.getURL("contents.css"));
link.setAttribute("type", "text/css");
link.setAttribute("rel", "stylesheet");

// `<link />` を挿入する
head.insertBefore(link, head.lastChild);
