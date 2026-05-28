#!/usr/bin/env node
// ECPay CheckMacValue verification tool.
// Reproduces the algorithm independently and checks: (1) sign→verify round-trips,
// (2) output is deterministic for fixed input, (3) tampering is rejected.
//
// NOTE: This proves internal correctness of the algorithm. Final validation must
// be one real transaction against ECPay's stage environment, since the exact
// CheckMacValue is only authoritative when ECPay's server agrees.
//
//   node scripts/ecpay-checkmac-test.mjs

import crypto from "crypto";

function ecpayUrlEncode(value) {
  return encodeURIComponent(value).replace(/%20/g, "+").toLowerCase();
}

function makeCheckMacValue(params, hashKey, hashIV) {
  const keys = Object.keys(params).sort((a, b) =>
    a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0,
  );
  const joined = keys.map((k) => `${k}=${params[k]}`).join("&");
  const raw = `HashKey=${hashKey}&${joined}&HashIV=${hashIV}`;
  return crypto.createHash("sha256").update(ecpayUrlEncode(raw)).digest("hex").toUpperCase();
}

const HASH_KEY = "5294y06JbISpM5x9";
const HASH_IV = "v77hoKGq4kWxNNIS";

const sample = {
  MerchantID: "2000132",
  MerchantTradeNo: "Test1234567",
  MerchantTradeDate: "2013/03/12 15:30:23",
  PaymentType: "aio",
  TotalAmount: "300",
  TradeDesc: "test",
  ItemName: "test",
  ReturnURL: "http://us.ecpay.com.tw/receive.php",
  ChoosePayment: "ALL",
};

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}: ${name}`);
  if (!cond) failures++;
};

const mac1 = makeCheckMacValue(sample, HASH_KEY, HASH_IV);
const mac2 = makeCheckMacValue({ ...sample }, HASH_KEY, HASH_IV);
console.log(`computed CheckMacValue = ${mac1}`);

check("deterministic for identical input", mac1 === mac2);
check("is 64-char uppercase hex (SHA256)", /^[0-9A-F]{64}$/.test(mac1));

// round-trip verify
const signed = { ...sample, CheckMacValue: mac1 };
const { CheckMacValue, ...rest } = signed;
check("sign → verify round-trips", makeCheckMacValue(rest, HASH_KEY, HASH_IV) === CheckMacValue);

// tamper detection
const tampered = { ...rest, TotalAmount: "1" };
check("rejects tampered amount", makeCheckMacValue(tampered, HASH_KEY, HASH_IV) !== CheckMacValue);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
