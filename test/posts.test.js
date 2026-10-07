const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const posts = JSON.parse(fs.readFileSync(path.join(root, "data", "posts.json"), "utf8"));
const html = fs.readFileSync(path.join(root, "docs", "index.html"), "utf8");

test("架空の投稿案が7件そろう", () => {
  assert.equal(posts.length, 7);
});

test("投稿案を評価の高い順に並べる", () => {
  const scores = posts.map((p) => p.score);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

test("各投稿案に媒体・本文・評価理由・予約日時・状態が入る", () => {
  for (const p of posts) {
    assert.ok(["X", "Instagram"].includes(p.platform), p.id);
    assert.ok(p.body.length > 0, p.id);
    assert.ok(p.reason_match.length > 0, p.id);
    assert.ok(p.reason_gap.length > 0, p.id);
    assert.ok(p.scheduled_at.length > 0, p.id);
    assert.ok(["承認済み", "要確認"].includes(p.status), p.id);
  }
});

test("理由文が一致点と不足点の両方に触れる", () => {
  for (const p of posts) {
    assert.match(p.reason_match, /一致/);
    assert.match(p.reason_gap, /不足/);
  }
});

test("効果を断定する投稿案を予約対象から外す", () => {
  const ng = posts.filter((p) => p.checks.ng_ok === false);
  assert.ok(ng.length >= 1);
  for (const p of ng) {
    assert.equal(p.status, "要確認");
  }
});

test("画面を開いた直後に全投稿案の本文が見える", () => {
  for (const p of posts) {
    assert.ok(html.includes(p.body.slice(0, 12)), p.id);
  }
  assert.ok(html.includes("予約キュー") || html.includes("POSTS"));
});

test("画面と説明文に内部用語や実在固有名詞を入れない", () => {
  for (const word of ["スタブ", "代用", "TODO"]) {
    assert.ok(!html.includes(word), word);
  }
});
