import { test, expect, request } from "@playwright/test";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

let env = process.env.NODE_ENV?.toUpperCase() || "PROD";
if (env === "PRODUCTION") env = "PROD";
const WS_BASE_URL = process.env[`${env}_WEB_LOGIN_URL`];

const Env = {
  WS_BASE_URL: WS_BASE_URL,
  K6_DURATION: "10s",
  K6_VUS: 1,
};

function sha256Hash(text: string) {
  return crypto.createHash("sha256").update(text).digest();
}

function base64Stringify(buffer: Buffer) {
  return buffer.toString("base64");
}

function generateSignStr(
  acntNo: string,      // Số tài khoản
  subAcntNo: string,   // Số tài khoản phụ
  symbol: string,      // Mã chứng khoán/symbol
  ordrQty: string,     // Số lượng đặt lệnh
  ordrUntprc: string,  // Giá đặt lệnh
  ordrTrdTp: string,   // Loại giao dịch
  buySelTp: string,    // Loại mua/bán
  oddOrdrYn: string,   // Có phải lệnh lẻ không
  uuid: string,        // ID duy nhất
  privateKey: string   // Khóa bí mật
) {
  // Nối tất cả tham số thành một chuỗi
  const text = acntNo + subAcntNo + symbol + ordrQty + ordrUntprc + ordrTrdTp + buySelTp + oddOrdrYn + uuid + privateKey;

  // Tạo hash SHA-256
  const hash = sha256Hash(text);

  // Chuyển đổi sang Base64
  const signStr = base64Stringify(hash);

  return signStr;
}


test("Playwright API test - NewOrder flow", async ({ request }) => {
  const loginUrl = `${Env.WS_BASE_URL}/loginAdv`;
  const authUrl = `${Env.WS_BASE_URL}/CoreServlet.pt`;

  const loginPayload = {
    user: "010C000433",
    pass: "jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=",
    fcmToken: "010C000433",
  };

  const loginRes = await request.post(loginUrl, {
    data: loginPayload,
    headers: {
      "Content-Type": "application/json",
    },
  });

  expect(loginRes.status()).toBe(200);
  const loginData = await loginRes.json();

  if (!loginData.error) {
    const session = loginData.data.session;
    const cif = loginData.data.cif;
    const user = loginPayload.user;
    const acntInfo =
      loginData.data.custInfo?.normal?.find((a: any) =>
        a.subAcntNo.startsWith("N")
      ) || {};
    const acntNo = acntInfo.acntNo;
    const subAcntNo = acntInfo.subAcntNo;

    const rqId = uuidv4();

    const authPayload = {
      group: "CORE",
      cmd: "generateAUTH",
      channel: "WTS",
      user: user,
      session: session,
      data: {
        trdType: "1",
        authType: "2",
        positionNo: "3",
      },
    };

    const authRes = await request.post(authUrl, {
      data: authPayload,
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(authRes.status()).toBe(200);

    const getTokenPayload = {
      group: "CORE",
      user: user,
      session: session,
      cmd: "getToken",
      rqId: rqId,
      channel: "WTS",
      data: {
        cif: cif,
        type: "3",
        value: "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4=",
      },
    };

    const getTokenRes = await request.post(authUrl, {
      data: getTokenPayload,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        Connection: "keep-alive",
      },
    });

    expect(getTokenRes.status()).toBe(200);

    // Prepare NewOrder
    const symbol = "VPB";
    const ordrQty = "100";
    const ordrUntprc = "16800";
    const ordrTrdTp = "01";
    const buySelTp = "1";
    const oddOrdrYn = "N";
    const privateKey = "a06ab782-118c-4819-a3c5-7b958ba85f7e";

    const signStr = generateSignStr(
      acntNo,
      subAcntNo,
      symbol,
      ordrQty,
      ordrUntprc,
      ordrTrdTp,
      buySelTp,
      oddOrdrYn,
      rqId,
      privateKey
    );

    const newOrderPayload = {
      group: "CORE",
      user: user,
      session: session,
      cmd: "NewOrder",
      rqId: rqId,
      channel: "WTS",
      type: "3",
      token: "9uCh4qxBlFqap/+KiqoM68EqO8yYGpKa1c+BCgkOEa4=",
      data: {
        acntNo,
        subAcntNo,
        symbol,
        ordrQty,
        ordrUntprc,
        ordrTrdTp,
        buySelTp,
        oddOrdrYn,
        signStr,
      },
    };

    const newOrderRes = await request.post(authUrl, {
      data: newOrderPayload,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    if (newOrderRes.status() !== 200) {
      console.error("❌ NewOrder failed:", await newOrderRes.text());
    } else {
      console.log("✅ NewOrder success:", await newOrderRes.text());
    }

    expect(newOrderRes.status()).toBe(200);

    const listRes = await request.get(`${Env.WS_BASE_URL}/getlistallstock`);
    expect(listRes.status()).toBe(200);
  } else {
    console.error("Login failed:", loginData.error);
  }
});
